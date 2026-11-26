import {standardOpening} from './opening-book.js?v=20261126-ironfin';
import {chooseMove as chooseMegalodonV3Move} from './megalodon-v3-engine.js?v=1';
import {autoMove} from './auto-engine.js?v=20261114-auto-bullet-variety';
import { LEVELS } from './game-core.js?v=20261126-ironfin';
import { stockfishMove } from './strong-engine.js?v=20261126-ironfin';
import { chooseMove } from './engine-core.js?v=20261122-big-fish-1000';

self.onmessage = ({ data }) => {
  try {
    const opening=[12,13,14].includes(Number(data.level))?null:standardOpening(data);if(opening){self.postMessage({id:data.id,...opening});return}
    if (Number(data.level) === 8 && !data.review) {
      autoMove(data).then(result=>self.postMessage({id:data.id,...result})).catch(error=>self.postMessage({id:data.id,error:true,message:error.message}));
      return;
    }
    if (data.review) {
      stockfishMove(data, undefined, result=>self.postMessage({id:data.id,...result,actualScore:-result.score,actualMate:result.mate==null?null:-result.mate,reviewVersion:3})).then(result => self.postMessage({ id: data.id, ...result, actualScore: -result.score, actualMate: result.mate == null ? null : -result.mate, reviewVersion: 3 })).catch(error => self.postMessage({ id: data.id, error: true, message: error.message }));
      return;
    }
    if (([4, 5, 7].includes(Number(data.level)) || LEVELS[data.level]?.engine === 'stockfish') && data.chosenSan == null && data.chosen == null && data.chosenUci == null) {
      stockfishMove(data).then(result => self.postMessage({ id: data.id, ...result })).catch(error => self.postMessage({ id: data.id, error: true, message: error.message }));
      return;
    }
    const chosen = data.chosenSan ?? data.chosen ?? data.chosenUci ?? null;
    const budget = data.budget ?? data.thinkMs ?? null;
    self.postMessage({ id: data.id, ...([12,13,14].includes(Number(data.level))?chooseMegalodonV3Move:chooseMove)(data.fen, Number(data.level) || 2, chosen, budget, { history: data.history || [], initialFen: data.initialFen, variety: data.variety, seed: data.seed, learning: data.learning }) });
  } catch (error) {
    self.postMessage({ id: data.id, error: true, message: String(error?.message || 'Search failed.') });
  }
};
