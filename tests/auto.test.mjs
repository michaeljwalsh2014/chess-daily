import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adaptAuto,autoMove} from '../dist/auto-engine.js';
import {Chess} from '../dist/vendor/chess.js';
test('Auto eases when ahead and plays more accurately when behind',()=>{
 let winning,losing;for(let i=0;i<20;i++){winning=adaptAuto(winning,100,500);losing=adaptAuto(losing,100,-500)}
 assert.ok(winning.strength<0.2);assert.ok(losing.strength>winning.strength+0.2);
 const after=adaptAuto(losing,1000,500);assert.ok(losing.strength-after.strength<=0.10001);
});
test('Auto measures the last move in the correct score perspective and saves its adjustment',async()=>{
 const c=new Chess();c.move('e4');let calls=[];
 const result=await autoMove({fen:c.fen(),history:['e4'],budget:1000},async data=>{calls.push(data);return calls.length===1?{score:20}:calls.length===2?{score:280}:{move:{from:'e7',to:'e5'}}});
 assert.equal(calls[0].fen,new Chess().fen());assert.equal(calls[1].fen,c.fen());
 assert.ok(result.autoState.strength<0.15);assert.equal(calls[2].budget,600);
 assert.equal(calls[2].autoStrength,result.autoState.strength);
});
test('Auto skips extra analysis on a short clock',async()=>{
 const c=new Chess();c.move('e4');let count=0;
 await autoMove({fen:c.fen(),history:['e4'],budget:30},async()=>{count++;return {move:{from:'e7',to:'e5'}}});assert.equal(count,1);
});
