import { stockfishMove } from './strong-engine.js?v=20261114-2';
import { chooseMove } from './engine-core.js?v=20261114-2';

self.onmessage = ({ data }) => {
  try {
    if ([4, 5, 7].includes(Number(data.level)) && data.chosenSan == null && data.chosen == null && data.chosenUci == null) {
      stockfishMove(data).then(result => self.postMessage({ id: data.id, ...result })).catch(error => self.postMessage({ id: data.id, error: true, message: error.message }));
      return;
    }
    const chosen = data.chosenSan ?? data.chosen ?? data.chosenUci ?? null;
    const budget = data.budget ?? data.thinkMs ?? null;
    self.postMessage({ id: data.id, ...chooseMove(data.fen, Number(data.level) || 2, chosen, budget, { history: data.history || [], initialFen: data.initialFen, variety: data.variety, seed: data.seed }) });
  } catch (error) {
    self.postMessage({ id: data.id, error: true, message: String(error?.message || 'Search failed.') });
  }
};
