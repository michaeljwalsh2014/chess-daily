import { chooseMove } from './engine-core.js?v=20261113-11';

self.onmessage = ({ data }) => {
  try {
    const chosen = data.chosenSan ?? data.chosen ?? data.chosenUci ?? null;
    const budget = data.budget ?? data.thinkMs ?? null;
    self.postMessage({ id: data.id, ...chooseMove(data.fen, Number(data.level) || 2, chosen, budget, { history: data.history || [], arena: data.arena, seed: data.seed }) });
  } catch (error) {
    self.postMessage({ id: data.id, error: true, message: String(error?.message || 'Search failed.') });
  }
};
