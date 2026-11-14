import {Chess} from './vendor/chess.js';
import {stockfishMove} from './strong-engine.js?v=20261114-4';

export function adaptAuto(previous, loss, autoAdvantage = 0) {
  const strength = Math.max(0, Math.min(1, Number(previous?.strength) || 0.4));
  const samples = Math.max(0, Number(previous?.samples) || 0);
  if (!Number.isFinite(loss)) return {strength, samples};
  // Smooth recent move quality; one blunder never changes the whole personality.
  const quality = Math.max(0, Math.min(1, 1 - Math.max(0, loss) / 220));
  const average = samples ? previous.average * 0.75 + quality * 0.25 : quality;
  // Stockfish scores from the side to move: a positive after-score means Auto
  // is ahead. Ease off when winning; defend more accurately when behind.
  const balanceTarget = Math.max(0.08, Math.min(0.92, 0.48 - Math.tanh(autoAdvantage / 300) * 0.4));
  const moveQualityTarget = Math.max(0.08, Math.min(0.92, average * 0.9));
  const target = balanceTarget * 0.8 + moveQualityTarget * 0.2;
  return {strength: strength + Math.max(-0.1, Math.min(0.1, (target-strength)*0.35)), average, samples:samples+1};
}

export async function autoMove(data, run = stockfishMove) {
  const total = Math.max(5, Number(data.budget) || 1200);
  let adaptive = data.autoState || {strength:0.4,samples:0};
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
