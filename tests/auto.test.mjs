import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adaptAuto,autoMove} from '../dist/auto-engine.js';
import {Chess} from '../dist/vendor/chess.js';
test('Auto gradually strengthens for accurate play and eases after repeated mistakes',()=>{
 let strong,weak;for(let i=0;i<20;i++){strong=adaptAuto(strong,0);weak=adaptAuto(weak,300)}
 assert.ok(strong.strength>0.8);assert.ok(weak.strength<0.15);
 const after=adaptAuto(strong,1000);assert.ok(strong.strength-after.strength<=0.06);
});
test('Auto measures the last move in the correct score perspective and saves its adjustment',async()=>{
 const c=new Chess();c.move('e4');let calls=[];
 const result=await autoMove({fen:c.fen(),history:['e4'],budget:1000},async data=>{calls.push(data);return calls.length===1?{score:20}:calls.length===2?{score:280}:{move:{from:'e7',to:'e5'}}});
 assert.equal(calls[0].fen,new Chess().fen());assert.equal(calls[1].fen,c.fen());
 assert.ok(result.autoState.strength<0.4);assert.equal(calls[2].budget,600);
 assert.equal(calls[2].autoStrength,result.autoState.strength);
});
test('Auto skips extra analysis on a short clock',async()=>{
 const c=new Chess();c.move('e4');let count=0;
 await autoMove({fen:c.fen(),history:['e4'],budget:30},async()=>{count++;return {move:{from:'e7',to:'e5'}}});assert.equal(count,1);
});
