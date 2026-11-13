import { Chess } from './vendor/chess.js';
import { LEVELS } from './game-core.js?v=20261113-9';

const pieceValue = { p: 100, n: 325, b: 335, r: 500, q: 950, k: 0 };
const mateScore = 100000;
const maxTableEntries = 120000;

function squareTerms(piece, square, endgame) {
  const file = 'abcdefgh'.indexOf(square[0]);
  const rank = Number(square[1]) - 1;
  const relativeRank = piece.color === 'w' ? rank : 7 - rank;
  const center = 7 - Math.abs(3.5 - file) - Math.abs(3.5 - rank);
  if (piece.type === 'p') return relativeRank * 8 + center * 4;
  if (piece.type === 'n') return center * 13;
  if (piece.type === 'b') return center * 7;
  if (piece.type === 'r') return relativeRank === 6 ? 24 : center * 2;
  if (piece.type === 'q') return center * 3;
  return endgame ? center * 12 : -center * 5;
}

function evaluate(chess) {
  if (chess.isCheckmate()) return -mateScore;
  if (chess.isDraw()) return 0;

  const board = chess.board();
  let whiteScore = 0;
  let phase = 0;
  let whiteBishops = 0;
  let blackBishops = 0;
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      if (piece.type === 'q') phase += 4;
      else if (piece.type === 'r') phase += 2;
      else if (piece.type === 'b' || piece.type === 'n') phase += 1;
      if (piece.type === 'b') {
        if (piece.color === 'w') whiteBishops++;
        else blackBishops++;
      }
    }
  }
  const endgame = phase <= 6;
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const sign = piece.color === 'w' ? 1 : -1;
      whiteScore += sign * (pieceValue[piece.type] + squareTerms(piece, piece.square, endgame));
    }
  }
  if (whiteBishops > 1) whiteScore += 28;
  if (blackBishops > 1) whiteScore -= 28;
  return chess.turn() === 'w' ? whiteScore : -whiteScore;
}

function moveCode(move) {
  return `${move.from}${move.to}${move.promotion || ''}`;
}

function isCapture(move) {
  return Boolean(move.captured || move.flags.includes('e'));
}

function seededFraction(seed, position) {
  let hash = (Number(seed) >>> 0) || 2166136261;
  for (const char of position) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

export function chooseMove(fen, level = 2, chosen = null, budgetOverride = null, options = {}) {
  const historyMoves = options.history || [];
  let chess = new Chess(fen);
  if (historyMoves.length) {
    try {
      const withHistory = new Chess();
      for (const move of historyMoves) withHistory.move(move);
      if (withHistory.fen() === fen) chess = withHistory;
    } catch { /* Keep the supplied FEN if the move history cannot be restored. */ }
  }
  const config = LEVELS[level] || LEVELS[2];
  const budget = Math.max(50, Number(budgetOverride) || config.budget);
  const deadline = Date.now() + budget;
  const arena = options.arena === true;
  const seed = options.seed;
  const table = new Map();
  const killers = Array.from({ length: 64 }, () => []);
  const history = new Map();
  let nodes = 0;
  let stopped = false;

  function timeCheck() {
    if ((nodes & 255) === 0 && Date.now() >= deadline) {
      stopped = true;
      throw new Error('Search budget reached');
    }
  }

  function key() {
    return chess.fen();
  }

  function orderMoves(moves, ttMove, ply) {
    return moves.sort((a, b) => {
      const score = move => {
        const code = moveCode(move);
        let value = code === ttMove ? 1000000 : 0;
        if (move.promotion) value += 80000 + pieceValue[move.promotion];
        if (isCapture(move)) value += 50000 + (pieceValue[move.captured] || 0) * 10 - pieceValue[move.piece];
        if (!isCapture(move) && !move.promotion) {
          const killer = killers[ply] || [];
          if (killer[0] === code) value += 30000;
          else if (killer[1] === code) value += 20000;
          value += history.get(`${chess.turn()}${code}`) || 0;
        }
        return value;
      };
      return score(b) - score(a);
    });
  }

  function quiescence(alpha, beta, ply, qDepth = 0) {
    nodes++;
    timeCheck();
    if (chess.isDraw()) return 0;
    const inCheck = chess.isCheck();
    let standPat = -Infinity;
    if (!inCheck) {
      standPat = evaluate(chess);
      if (standPat >= beta) return beta;
      alpha = Math.max(alpha, standPat);
      if (qDepth >= 8) return alpha;
    } else if (qDepth >= 10) {
      return evaluate(chess);
    }

    let moves = chess.moves({ verbose: true });
    if (!inCheck) moves = moves.filter(move => isCapture(move) || move.promotion);
    if (!moves.length) return inCheck ? -mateScore + ply : standPat;
    moves = orderMoves(moves, null, ply);
    for (const move of moves) {
      chess.move(move);
      let score;
      try {
        score = -quiescence(-beta, -alpha, ply + 1, qDepth + 1);
      } finally {
        chess.undo();
      }
      if (score >= beta) return beta;
      alpha = Math.max(alpha, score);
    }
    return alpha;
  }

  function search(depth, alpha, beta, ply) {
    nodes++;
    timeCheck();
    if (chess.isDraw()) return 0;
    if (depth <= 0) return quiescence(alpha, beta, ply);

    const positionKey = key();
    const alphaOriginal = alpha;
    const cached = table.get(positionKey);
    if (cached && cached.depth >= depth) {
      if (cached.flag === 'exact') return cached.score;
      if (cached.flag === 'lower') alpha = Math.max(alpha, cached.score);
      else if (cached.flag === 'upper') beta = Math.min(beta, cached.score);
      if (alpha >= beta) return cached.score;
    }

    const inCheck = chess.isCheck();
    const moves = orderMoves(chess.moves({ verbose: true }), cached?.move, ply);
    if (!moves.length) return inCheck ? -mateScore + ply : 0;
    let bestScore = -Infinity;
    let bestMove = null;
    for (const move of moves) {
      const code = moveCode(move);
      chess.move(move);
      let score;
      try {
        score = -search(depth - 1, -beta, -alpha, ply + 1);
      } finally {
        chess.undo();
      }
      if (score > bestScore) {
        bestScore = score;
        bestMove = code;
      }
      alpha = Math.max(alpha, score);
      if (alpha >= beta) {
        if (!isCapture(move) && !move.promotion && killers[ply]) {
          killers[ply].unshift(code);
          killers[ply].length = Math.min(2, killers[ply].length);
          const historyKey = `${chess.turn()}${code}`;
          history.set(historyKey, Math.min(20000, (history.get(historyKey) || 0) + depth * depth));
        }
        break;
      }
    }

    if (table.size >= maxTableEntries) table.clear();
    table.set(positionKey, {
      depth,
      score: bestScore,
      move: bestMove,
      flag: bestScore <= alphaOriginal ? 'upper' : bestScore >= beta ? 'lower' : 'exact',
    });
    return bestScore;
  }

  let roots = chess.moves({ verbose: true }).map(move => ({
    move: { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) },
    san: move.san,
    code: moveCode(move),
    score: 0,
  }));
  if (!roots.length) return { move: null, depth: 0, nodes, engine: 'search' };
  roots = orderMoves(chess.moves({ verbose: true }), null, 0).map(move => ({
    move: { from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) },
    san: move.san,
    code: moveCode(move),
    score: 0,
  }));

  let completedRoots = roots;
  let completedDepth = 0;
  for (let depth = 1; depth <= config.depth; depth++) {
    const round = [];
    let alpha = -Infinity;
    try {
      for (const root of roots) {
        if (Date.now() >= deadline) throw new Error('Search budget reached');
        chess.move(root.move);
        let score;
        try {
          score = -search(depth - 1, -Infinity, -alpha, 1);
        } finally {
          chess.undo();
        }
        round.push({ ...root, score });
        alpha = Math.max(alpha, score);
      }
      completedRoots = round.sort((a, b) => b.score - a.score);
      roots = completedRoots;
      completedDepth = depth;
      if (Math.abs(completedRoots[0].score) >= mateScore - 64) break;
    } catch {
      stopped = true;
      break;
    }
  }

  const best = completedRoots[0];
  let candidateRoots = completedRoots;
  if (level === 6 && historyMoves.length) {
    const withoutRepetition = completedRoots.filter(root => {
      chess.move(root.move);
      const repeats = chess.isThreefoldRepetition();
      chess.undo();
      return !repeats;
    });
    if (withoutRepetition.length) candidateRoots = withoutRepetition;
  }
  let pool = candidateRoots;
  if (level === 1) {
    pool = candidateRoots.filter(root => candidateRoots[0].score - root.score <= 80).slice(0, 3);
  }
  let selected = level === 1 ? pool[Math.floor(Math.random() * pool.length)] : candidateRoots[0];
  if (arena && historyMoves.length < 16) {
    const tolerance = ({ 1: 120, 2: 90, 3: 70, 4: 45, 5: 30, 6: 20 })[level] || 50;
    const openingChoices = candidateRoots.filter(root => candidateRoots[0].score - root.score <= tolerance).slice(0, 5);
    if (openingChoices.length > 1) {
      selected = openingChoices[Math.floor(seededFraction(seed, fen) * openingChoices.length)];
    }
  }
  const chosenRoot = chosen == null ? null : completedRoots.find(root => root.san === chosen || root.code === chosen);
  const actualScore = chosenRoot?.score ?? best.score;
  const actualMate = Math.abs(actualScore) >= mateScore - 64
    ? Math.sign(actualScore) * (mateScore - Math.abs(actualScore))
    : null;
  return {
    move: selected.move,
    san: selected.san,
    score: best.score,
    depth: completedDepth,
    nodes,
    engine: 'search',
    best: best.san,
    bestCode: best.code,
    actualScore,
    actualMate,
    loss: Math.max(0, best.score - actualScore),
    stopped,
  };
}
