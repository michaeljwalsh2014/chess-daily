import {Chess} from './vendor/chess.js';
import {stockfishMove} from './strong-engine.js?v=20261114-30';

export function adaptAuto(previous, loss, autoAdvantage = 0) {
  const strength = Math.max(0, Math.min(1, Number(previous?.strength ?? 0.15)));
  const samples = Math.max(0, Number(previous?.samples) || 0);
  if (!Number.isFinite(loss)) return {strength, samples};
  // Smooth recent move quality; one blunder never changes the whole personality.
  const quality = Math.max(0, Math.min(1, 1 - Math.max(0, loss) / 220));
  const average = samples ? (Number.isFinite(previous.average)?previous.average:quality) * 0.55 + quality * 0.45 : quality;
  // Stockfish scores from the side to move: a positive after-score means Auto
  // is ahead. Ease off when winning; defend more accurately when behind.
  const baseline = Math.max(.05,Math.min(.9,Number(previous?.baseline ?? .2)));
  const qualityTarget = Math.max(.05,Math.min(.95,average*.9));
  const balance = Math.tanh(autoAdvantage/220);
  const target = Math.max(.03,Math.min(.97,baseline*.4+qualityTarget*.6-balance*.38));
  return {...previous,strength: strength + Math.max(-.1, Math.min(.1, (target-strength)*.65)), baseline, average, samples:samples+1};
}

export async function autoMove(data, run = stockfishMove) {
  const total = Math.max(5, Number(data.budget) || 1200);
  let adaptive = data.autoState || {strength:0.15,samples:0};
  const history = data.history || [];
  let spent = 0;
  if (history.length && total >= 500) {
    const replay = data.initialFen ? new Chess(data.initialFen) : new Chess();
    try {
      for (const move of history) replay.move(move);
      if (replay.fen() === data.fen) {
        replay.undo();
        const slice = Math.floor(total * 0.2);
        const before = await run({...data,fen:replay.fen(),history:history.slice(0,-1),review:true,budget:slice});
        const after = await run({...data,review:true,budget:slice});
        // Scores are from opposite sides to move: add to get the player's loss.
        adaptive = adaptAuto(adaptive, Math.max(0,before.score + after.score), after.score);
        spent = slice * 2;
      }
    } catch { /* Keep the previous level if a legacy history cannot be replayed. */ }
  }
  const result = await run({...data,review:false,autoStrength:adaptive.strength,budget:Math.max(5,total-spent)});
  return {...result,autoState:adaptive};
}
