export const recommendationRatings = {
  9: 300, 1: 500, 2: 700, 3: 1000, 10: 1250,
  17: 1675, 12: 1600, 18: 1820, 4: 1700, 5: 1750, 19: 1935, 15: 2000, 16: 2400, 11: 3200,
};

export function recommendedBotKeys(available, currentRating, games) {
  let estimate = Number(currentRating) || 1000;
  const baseline = estimate;
  const recentOpponents = [];
  for (const game of games.slice(-12)) {
    const opponent = recommendationRatings[game.level] ?? ({6:1700,7:2000,13:1600,14:1600})[game.level]
      ?? (Number(game.level) === 8 ? Number(game.autoState?.playerRating) : null);
    if (!Number.isFinite(opponent) || opponent <= 0) continue;
    recentOpponents.push(opponent);
    const score = game.result === 'win' ? 1 : game.result === 'loss' ? 0 : 0.5;
    const expected = 1 / (1 + 10 ** ((opponent - estimate) / 400));
    estimate = Math.min(3500, Math.max(100, estimate + 64 * (score - expected)));
  }

  estimate = Math.max(baseline - 225, Math.min(baseline + 225, estimate));
  const closest = available.filter(key => key in recommendationRatings)
    .sort((a, b) => Math.abs(recommendationRatings[a] - estimate)
      - Math.abs(recommendationRatings[b] - estimate));
  const picks = closest.slice(0, 3);
  if (games.length && picks.length) {
    const practiced = recentOpponents.slice(-5).sort((a,b)=>a-b);
    const target = Math.max(estimate + 300, practiced[Math.floor(practiced.length / 2)] || 0);
    const strongest = Math.max(...picks.map(key => recommendationRatings[key]));
    const stretch = closest.filter(key => recommendationRatings[key] > strongest)
      .sort((a,b)=>Math.abs(recommendationRatings[a]-target)-Math.abs(recommendationRatings[b]-target))[0];
    if (stretch) picks.push(stretch);
  }
  return [...picks, ...available.filter(key => key === '8')];
}
