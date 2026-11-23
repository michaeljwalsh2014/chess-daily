export const recommendationRatings = {
  9: 300, 1: 500, 2: 700, 3: 1000, 10: 1250,
  12: 1600, 4: 1700, 5: 1750, 11: 3200,
};

export function recommendedBotKeys(available, startingRating, games) {
  let estimate = Number(startingRating) || 1000;
  for (const game of games) {
    const opponent = recommendationRatings[game.level]
      ?? (Number(game.level) === 8 ? Number(game.autoState?.playerRating) : null);
    if (!opponent) continue;
    const score = game.result === 'win' ? 1 : game.result === 'loss' ? 0 : 0.5;
    const expected = 1 / (1 + 10 ** ((opponent - estimate) / 400));
    estimate = Math.min(3500, Math.max(100, estimate + 96 * (score - expected)));
  }

  const closest = available.filter(key => key in recommendationRatings)
    .sort((a, b) => Math.abs(recommendationRatings[a] - estimate)
      - Math.abs(recommendationRatings[b] - estimate));
  return [...closest.slice(0, 3), ...available.filter(key => key === '8')];
}
