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
