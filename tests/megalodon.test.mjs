import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
import {chooseMove} from '../dist/megalodon-engine.js';
import {botTiming,LEVELS} from '../dist/game-core.js';
import fs from 'node:fs';
import vm from 'node:vm';

test('Megalodon finds immediate checkmate and returns legal moves',()=>{
  const c=new Chess('7k/8/5KQ1/8/8/8/8/8 w - - 0 1');
  const result=chooseMove(c.fen(),12,null,600);
  assert.equal(result.engine,'search');
  assert.ok(c.move(result.move));
  assert.ok(c.isCheckmate());
});

test('Megalodon speeds up when low on time',()=>{
  assert.equal(LEVELS[12].name,'Megalodon');
  assert.equal(LEVELS[12].depth,30);
  assert.equal(botTiming(12,{b:600}).budget,20000);
  assert.ok(botTiming(12,{b:10}).budget<botTiming(12,{b:60}).budget);
});

test('Megalodon saves clock time early and allows deeper searches later',()=>{
  for(const level of [12,13,14]){
    const budget=(plies,seconds=600)=>botTiming(level,{b:seconds},0,plies).budget;
    assert.equal(budget(0),3000);
    assert.equal(budget(7),3000);
    assert.equal(budget(8),6000);
    assert.equal(budget(15),6000);
    assert.equal(budget(16),12000);
    assert.equal(budget(31),12000);
    assert.equal(budget(32),20000);
    assert.equal(budget(7,10),800);
    assert.equal(budget(40,60),4800);
  }
});

test('Megalodon appears only for ten-minute games',()=>{
  const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const fragment=source.slice(source.indexOf('const eloLabels='),source.indexOf('function refreshBotSelect('));
  const ctx=vm.createContext({botListMode:'master',LEVELS});vm.runInContext(fragment+';this.available=availableBotKeys;',ctx);
  assert.ok(ctx.available('10').includes('12'));
  for(const control of ['0','1','5','15+10','30','30s','custom:600'])assert.ok(!ctx.available(control).includes('12'));
});

test('finished games teach winner moves and reject unfinished data',async()=>{
  const {learnGame,learnPgn,positionKey}=await import('../dist/megalodon-learning.js');
  const data=learnGame(null,{moves:['e4','e5','Nf3'],result:'win'}),c=new Chess();
  assert.deepEqual(data.positions[positionKey(c.fen())].e2e4,{count:1,score:1});
  c.move('e4');assert.deepEqual(data.positions[positionKey(c.fen())].e7e5,{count:1,score:-1});
  assert.equal(learnGame(data,{moves:['d4'],result:'ended'}),data);
  const trained=learnPgn(data,'[Event "Example"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 1-0');
  assert.equal(trained.games,2);assert.equal(trained.positions[positionKey(new Chess().fen())].e2e4.count,2);
  assert.throws(()=>learnPgn(data,'[Result "*"]\n\n1. e4 *'));
});

test('training cannot override a clearly stronger capture',()=>{
  const c=new Chess('4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1');
  const r=chooseMove(c.fen(),12,null,800,{learning:{e1f1:{count:50,score:50}}});
  assert.equal(r.move.from,'e4');assert.equal(r.move.to,'d5');
});
