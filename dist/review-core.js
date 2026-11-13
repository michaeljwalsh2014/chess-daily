const supported = analysis => analysis && ['search', 'stockfish'].includes(analysis.engine);

export function moveGrade(analysis, played) {
  if (!supported(analysis)) return { label: 'Analyzing…', kind: 'pending' };
  if (analysis.bestCode === played) return { label: 'Best move', kind: 'best' };
  const loss = Math.max(0, Number(analysis.loss) || 0);
  return loss <= 35 ? { label: 'Good move', kind: 'good' }
    : loss <= 90 ? { label: 'Decent move', kind: 'decent' }
      : loss < 250 ? { label: 'Mistake', kind: 'mistake' }
        : { label: 'Blunder', kind: 'blunder' };
}

export function evaluation(analysis, color) {
  if (!supported(analysis)) return { text: '—', white: 50, description: 'Evaluation pending' };
  const sign = color === 'w' ? 1 : -1;
  const cp = (Number(analysis.actualScore) || 0) * sign;
  const mate = analysis.actualMate == null ? null : analysis.actualMate * sign;
  const white = Math.max(3, Math.min(97, 50 + 45 * Math.tanh(cp / 500)));
  return {
    text: mate != null ? `${mate > 0 ? '+' : '−'}M${Math.abs(mate)}` : `${cp >= 0 ? '+' : ''}${(cp / 100).toFixed(1)}`,
    white,
    description: mate != null ? `${mate > 0 ? 'White' : 'Black'} has a forced mate`
      : Math.abs(cp) < 30 ? 'Roughly equal' : `${cp > 0 ? 'White' : 'Black'} is ahead`,
  };
}

export function whiteScore(analysis, color) {
  if (!supported(analysis)) return null;
  return (Number(analysis.actualScore) || 0) * (color === 'w' ? 1 : -1);
}

export function moveInsight(analysis, played, san, previousWhiteScore = null, playedColor = 'w') {
  if (!supported(analysis)) return 'The local engine is still analyzing this position.';
  const depth = Number(analysis.depth) || 0;
  const prefix = depth ? `Searched ${depth} half-moves. ` : '';
  let choice;
  if (analysis.bestCode === played) choice = `The engine’s top choice agrees with ${san || 'your move'}.`;
  else if (analysis.best) choice = `The engine preferred ${analysis.best}${san ? ` over ${san}` : ''}.`;
  else choice = 'The engine compared this move with its other legal choices.';
  const loss = Math.max(0, Number(analysis.loss) || 0);
  let impact = '';
  if (analysis.bestCode !== played && loss >= 35) {
    impact = `Its search estimates the missed alternative was about ${(loss / 100).toFixed(1)} pawn${loss >= 200 ? 's' : ''} better.`;
  } else if (analysis.bestCode !== played) {
    impact = 'The estimated difference from its top choice is small.';
  }
  const current = whiteScore(analysis, playedColor);
  let swing = '';
  if (previousWhiteScore != null && current != null) {
    const delta = current - previousWhiteScore;
    if (Math.abs(delta) >= 45) {
      const side = delta > 0 ? 'White' : 'Black';
      swing = ` The position shifted about ${(Math.abs(delta) / 100).toFixed(1)} pawns toward ${side}.`;
    }
  }
  return `${prefix}${choice}${impact ? ` ${impact}` : ''}${swing} This is a local search estimate, so long-term plans can be missed.`;
}
