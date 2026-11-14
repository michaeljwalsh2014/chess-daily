import {test} from 'node:test';
import assert from 'node:assert/strict';
import {autoStartingState} from '../dist/auto-profile.js';
test('Auto starts from the entered rating and responds to saved game results',()=>{
 const base=autoStartingState(1000);
 assert.ok(autoStartingState(1800).strength>base.strength);
 const records=result=>Array.from({length:8},()=>({level:3,result,kind:'game'}));
 assert.ok(autoStartingState(1000,records('win')).strength>base.strength);
 assert.ok(autoStartingState(1000,records('loss')).strength<base.strength);
 assert.deepEqual(autoStartingState(1000,[{level:3,result:'ended'},{level:3,result:'win',kind:'endgame'}]),base);
 assert.ok(Number.isFinite(autoStartingState(null).strength));
});
