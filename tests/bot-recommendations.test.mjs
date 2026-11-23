import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendedBotKeys} from '../dist/bot-recommendations.js';

test('recommendations start near the entered rating and only offer available bots',()=>{
  assert.deepEqual(recommendedBotKeys(['9','1','2','3','10','8'],700,[]),['2','1','3','8']);
  assert.equal(recommendedBotKeys(['3','10','4','8'],1600,[])[0],'4');
});

test('wins and losses move recommendations in opposite directions',()=>{
  const keys=['9','1','2','3','10','12','4','8'];
  const games=result=>Array.from({length:8},()=>({level:3,result}));
  assert.equal(recommendedBotKeys(keys,1000,games('win'))[0],'10');
  assert.equal(recommendedBotKeys(keys,1000,games('loss'))[0],'2');
});
