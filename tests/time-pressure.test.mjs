import {test} from 'node:test';import assert from 'node:assert/strict';import {botTiming,resultMessage} from '../dist/game-core.js';
test('all bots reduce both delay and search as time falls, including with increments',()=>{for(const level of [1,2,3,4,5]){let previous=botTiming(level,{b:120},10);for(const b of [60,30,10,5,1]){const next=botTiming(level,{b},10);assert.ok(next.delay<=previous.delay);assert.ok(next.budget<=previous.budget);previous=next;}assert.ok(botTiming(level,{b:10},10).delay<=150);assert.ok(botTiming(level,{b:10},10).budget<=100);}});
test('wins explain timeout and checkmate distinctly',()=>{assert.deepEqual(resultMessage({result:'win',reason:'Time expired'}),{title:'You won!',explanation:'The computer ran out of time.'});assert.match(resultMessage({result:'win',reason:'Checkmate'}).explanation,/checkmated/);assert.match(resultMessage({result:'loss',reason:'Time expired'}).explanation,/You ran out/);});

test('Cyber Tank uses six seconds with ten minutes and saves time in trouble',()=>{assert.equal(botTiming(5,{b:600}).budget,6000);assert.equal(botTiming(5,{b:600}).delay,0);assert.ok(botTiming(5,{b:30}).budget<1000);assert.ok(botTiming(5,{b:5}).budget<=100);assert.equal(botTiming(4,{b:600}).budget,2200);});

test('Hyper Bullet 3.0 has three speed bands and no artificial delay',()=>{
  let previous=Infinity;
  for(const b of [60,45,31,30,20,16,15,10,5,1,.1]){
    const t=botTiming(7,{b});assert.equal(t.delay,0);assert.ok(t.budget<=previous);previous=t.budget;
  }
  assert.equal(botTiming(7,{b:60}).budget,720);
  assert.equal(botTiming(7,{b:30}).budget,240);
  assert.ok(botTiming(7,{b:15}).budget<=35);
  assert.equal(botTiming(7,{b:10}).budget,30);
});
