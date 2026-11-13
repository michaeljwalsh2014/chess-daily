import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
import {LEVELS} from '../dist/game-core.js';
import {chooseMove} from '../dist/engine-core.js';
let reply;globalThis.self={postMessage:r=>{reply=r}};
await import('../dist/opponent.js');

test('all five computer levels return legal moves without an external engine',()=>{
  for(const level of [1,2,3,4,5]){
    const c=new Chess();c.move('e4');
    self.onmessage({data:{fen:c.fen(),level,id:level,budget:250}});
    assert.equal(reply.id,level);assert.equal(reply.engine,'search');assert.ok(c.move(reply.move));
  }
});

test('Razor Teeth keeps its deeper search within a quicker response budget',()=>{
  assert.deepEqual([LEVELS[1].name,LEVELS[2].name,LEVELS[3].name,LEVELS[4].name],['Deadfish','Little Fish','Big Fish','Razor Teeth']);
  assert.ok(LEVELS[4].depth>LEVELS[3].depth);
  assert.ok(LEVELS[4].budget<=4000);
  assert.ok(LEVELS[4].delay<=5000);
  assert.equal(LEVELS[4].engine,undefined);
  assert.deepEqual([LEVELS[4].depth,LEVELS[4].budget,LEVELS[4].delay],[8,1600,900]);
  assert.equal(LEVELS[5].name,'Cyber Tank');
  assert.ok(LEVELS[5].depth>LEVELS[4].depth);
  assert.ok(LEVELS[5].budget>LEVELS[4].budget);
});

test('the deep search sees mate and flags a missed forced mate',()=>{
  const fen='7k/8/5KQ1/8/8/8/8/8 w - - 0 1';
  const result=chooseMove(fen,4,'Qf7',500);
  assert.equal(result.san,'Qg7#');
  assert.equal(result.actualMate,null);
  assert.ok(result.loss>90000);
});

test('finished positions return no move',()=>{
  const c=new Chess();for(const m of ['f3','e5','g4','Qh4#'])c.move(m);
  self.onmessage({data:{fen:c.fen(),level:4,id:9,budget:250}});
  assert.equal(reply.move,null);
});
