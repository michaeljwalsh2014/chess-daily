import { LEVELS } from './game-core.js?v=20261123-new-bots';
import { Chess } from './vendor/chess.js';

let ratingStockfishWorker = null, ratingStockfishReady = false;
function createStockfishWorker(url) { return new Worker(url); }
const captureValue={p:1,n:3,b:3,r:5,q:9,k:0};
function freeMaterialCapture(chess,moveCode){
  if(!moveCode||moveCode==='(none)')return null;
  const legal=chess.moves({verbose:true});
  const free=legal.filter(move=>move.captured&&move.captured!=='k').map(move=>{
    const reply=new Chess(chess.fen());reply.move({from:move.from,to:move.to,...(move.promotion?{promotion:move.promotion}:{})});
    const recaptured=reply.moves({verbose:true}).some(next=>next.to===move.to&&next.captured);
    return {move,recaptured,value:captureValue[move.captured]||0};
  }).filter(candidate=>!candidate.recaptured&&candidate.value>=3);
  return free.sort((a,b)=>b.value-a.value||a.move.san.localeCompare(b.move.san))[0]?.move||null;
}

// A separate classic worker keeps the GPL Stockfish distribution unmodified.
export function stockfishMove(data, createWorker = createStockfishWorker, onProgress = null) {
  return new Promise((resolve, reject) => {
    const chess = new Chess(data.fen);
    if (chess.isGameOver()) return resolve({ move: null, engine: 'stockfish', score: chess.isCheckmate() ? -100000 : 0, mate: chess.isCheckmate() ? 0 : null });
    const workerUrl = new URL('./vendor/stockfish/stockfish-17.1-lite-single-03e3232.js', import.meta.url);
    const pooled = data.review && createWorker === createStockfishWorker;
    const reused = !!(pooled && ratingStockfishWorker && ratingStockfishReady);
    const worker = pooled ? (ratingStockfishWorker ||= createWorker(workerUrl)) : createWorker(workerUrl);
    const budget = Math.max(5, Math.floor(Number(data.budget ?? data.thinkMs) || 2200));
    const timer = setTimeout(() => finish(new Error('Stockfish did not respond. Please retry.')), budget + 15000);
    let depth = 0, nodes = 0, score = 0, mate = null;
    const candidates = new Map();
    const rounds = new Map();
    function finish(error, result) {
      clearTimeout(timer);
      if (error || !pooled) {
        worker.terminate();
        if (worker === ratingStockfishWorker) { ratingStockfishWorker = null; ratingStockfishReady = false; }
      } else { worker.onmessage = null; worker.onerror = null; }
      if (error) reject(error); else resolve(result);
    }
    function configure() {
      worker.postMessage('setoption name Hash value 16');
      const pieces = chess.board().flat().filter(Boolean);
      const bareKing = ['w', 'b'].some(color => pieces.filter(p => p.color === color).every(p => p.type === 'k'));
      worker.postMessage(`setoption name UCI_LimitStrength value ${data.review || bareKing || Number(data.level) === 7 || Number(data.level) === 11 ? 'false' : 'true'}`);
      worker.postMessage(`setoption name UCI_Elo value ${LEVELS[data.level]?.elo ?? (Number(data.level) === 11 ? 2400 : 1800)}`);
      if (data.autoStrength != null) {
        worker.postMessage('setoption name UCI_LimitStrength value false');
        worker.postMessage(`setoption name MultiPV value ${Math.max(2, Math.min(12, Number(data.autoCandidates) || 12))}`);
      }
      worker.postMessage('isready');
    }
    worker.onerror = () => finish(new Error('Stockfish could not load. Please retry.'));
    worker.onmessage = ({ data: output }) => {
      for (const line of String(output).split('\n')) {
        if (line === 'uciok') {
          if (pooled) ratingStockfishReady = true;
          configure();
        } else if (line === 'readyok') {
          // Restore history so the engine sees repetitions and the fifty-move clock.
          let position = `position fen ${data.fen}`;
          try {
            const replay = data.initialFen ? new Chess(data.initialFen) : new Chess();
            const moves = (data.history || []).map(san => {
              const m = replay.move(san);
              return m.from + m.to + (m.promotion || '');
            });
            if (moves.length && replay.fen() === data.fen) position = `position ${data.initialFen ? 'fen ' + data.initialFen : 'startpos'} moves ${moves.join(' ')}`;
          } catch { /* The supplied FEN remains authoritative. */ }
          worker.postMessage(position);
          if(data.infinite)clearTimeout(timer);
          worker.postMessage(data.infinite?'go infinite':`go movetime ${budget}`);
        } else if (line.startsWith('info ')) {
          const candidate = line.match(/\bscore cp (-?\d+).*\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/);
          const rank = Number(line.match(/\bmultipv (\d+)/)?.[1] || 1);
          if (candidate && !/lowerbound|upperbound/.test(line)) {const depthValue=Number(line.match(/\bdepth (\d+)/)?.[1] || 0);const entry={score:Number(candidate[1]),code:candidate[2],depth:depthValue};candidates.set(rank,entry);if(!rounds.has(depthValue))rounds.set(depthValue,new Map());rounds.get(depthValue).set(rank,entry);}
          depth = Number(line.match(/\bdepth (\d+)/)?.[1]) || depth;
          nodes = Number(line.match(/\bnodes (\d+)/)?.[1]) || nodes;
          const cp = line.match(/\bscore cp (-?\d+)/);
          if (cp && rank === 1 && !/lowerbound|upperbound/.test(line)) { score = Number(cp[1]); mate = null; }
          const m = line.match(/\bscore mate (-?\d+)/);
          if (m && rank === 1 && !/lowerbound|upperbound/.test(line)) { mate = Number(m[1]); score = Math.sign(mate || -1) * 100000; }
          if(data.infinite && onProgress && rank===1 && !/lowerbound|upperbound/.test(line)) {
            const pv=line.match(/\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/);
            if(pv && (cp||m))try{const code=pv[1],copy=new Chess(data.fen),move={from:code.slice(0,2),to:code.slice(2,4),...(code[4]?{promotion:code[4]}:{})},played=copy.move(move);onProgress({move,san:played.san,engine:'stockfish',depth,nodes,score,mate,streaming:true})}catch{}
          }
        } else if (line.startsWith('bestmove ')) {
          let code = line.split(/\s+/)[1];
          if(!data.review&&[4,5].includes(Number(data.level))){const capture=freeMaterialCapture(chess,code);if(capture)code=capture.from+capture.to+(capture.promotion||'')}
          if (data.autoStrength != null && candidates.size) {
            const complete=[...rounds.entries()].sort((a,b)=>b[0]-a[0]).find(([,round])=>round.has(1)&&round.size>=Math.min(Math.max(2, Math.min(12, Number(data.autoCandidates) || 12)),chess.moves().length));
            const pool=complete?complete[1]:candidates;
            const best = pool.get(1);
            if (best) {
              const target = 380 * (1 - data.autoStrength) ** 1.5;
              const choices = [...pool.values()].filter(c => c.depth === best.depth && best.score-c.score >= 0 && best.score-c.score <= 400);
              choices.sort((a,b)=>Math.abs(best.score-a.score-target)-Math.abs(best.score-b.score-target));
              if (choices.length) code = choices[0].code;
              // A fresh game seed varies sound opening replies, without
              // changing Auto's adaptive move selection later in the game.
              if (data.variety && !data.initialFen && (data.history || []).length < 12) {
                const opening = [...pool.values()].filter(c => c.depth === best.depth && best.score - c.score >= 0 && best.score - c.score <= 70);
                opening.sort((a,b) => a.code.localeCompare(b.code));
                if (opening.length > 1) {
                  let hash = Number(data.seed) >>> 0;
                  for (const char of data.fen) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
                  hash ^= hash >>> 16; hash = Math.imul(hash, 0x45d9f3b) >>> 0; hash ^= hash >>> 16;
                  code = opening[(hash >>> 0) % opening.length].code;
                }
              }
            }
          }
          try {
            const move = { from: code.slice(0, 2), to: code.slice(2, 4), ...(code.length === 5 ? { promotion: code[4] } : {}) };
            const played = chess.move(move);
            if (!played) throw new Error('Illegal engine move');
            finish(null, { move, san: played.san, engine: 'stockfish', depth, nodes, score, mate });
          } catch { finish(new Error('Stockfish returned an invalid move. Please retry.')); }
        }
      }
    };
    if (reused) configure(); else worker.postMessage('uci');
  });
}
