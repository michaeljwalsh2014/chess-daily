import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
import {LEVELS} from '../dist/game-core.js';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stockfishMove} from '../dist/strong-engine.js';
import {chooseMove} from '../dist/engine-core.js';
let reply;globalThis.self={postMessage:r=>{reply=r}};
await import('../dist/opponent.js');

test('all five computer levels return legal moves with bundled engines',async()=>{
  for(const level of [1,2,3,4,5]){
    const c=new Chess();c.move('e4');
    if ([4,5].includes(level)) reply={id:level,...await stockfishMove({fen:c.fen(),level,budget:250},nativeWorker)};
    else self.onmessage({data:{fen:c.fen(),level,id:level,budget:250}});
    assert.equal(reply.id,level);assert.equal(reply.engine,[4,5].includes(level)?'stockfish':'search');assert.ok(c.move(reply.move));
  }
});

test('Razor Teeth keeps its deeper search within a quicker response budget',()=>{
  assert.deepEqual([LEVELS[1].name,LEVELS[2].name,LEVELS[3].name,LEVELS[4].name],['Deadfish','Little Fish','Big Fish','Razor Teeth']);
  assert.ok(LEVELS[4].depth>LEVELS[3].depth);
  assert.ok(LEVELS[4].budget<=4000);
  assert.ok(LEVELS[4].delay<=5000);
  assert.equal(LEVELS[4].engine,undefined);
  assert.deepEqual([LEVELS[4].depth,LEVELS[4].budget,LEVELS[4].delay],[9,2200,350]);
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

test('finished positions return no move',async()=>{
  const c=new Chess();for(const m of ['f3','e5','g4','Qh4#'])c.move(m);
  reply=await stockfishMove({fen:c.fen(),level:4,budget:250},nativeWorker);
  assert.equal(reply.move,null);
});

// Run the exact bundled WASM with Node's UCI transport for integration checks.
function nativeWorker(url) {
  const child=spawn(process.execPath,[fileURLToPath(url)],{stdio:['pipe','pipe','pipe']});
  let pending='';
  const worker={postMessage:line=>child.stdin.write(line+'\n'),terminate:()=>child.kill()};
  child.stdout.on('data',chunk=>{pending+=chunk;const lines=pending.split('\n');pending=lines.pop();for(const line of lines)worker.onmessage?.({data:line.trim()});});
  child.on('error',error=>worker.onerror?.(error));
  return worker;
}
test('strong bots finish queen mate immediately even with rating limits',async()=>{
  for(const level of [4,5]){
    const chess=new Chess('7k/8/5KQ1/8/8/8/8/8 w - - 0 1');
    const r=await stockfishMove({fen:chess.fen(),level,budget:200},nativeWorker);
    chess.move(r.move);assert.ok(chess.isCheckmate());
  }
});

test('Cyber Tank converts king and queen against engine defence without wandering',async()=>{
  const chess=new Chess('7k/8/8/8/4Q3/8/8/K7 w - - 0 1');
  const history=[];
  for(let ply=0;ply<32&&!chess.isGameOver();ply++){
    const r=await stockfishMove({fen:chess.fen(),level:5,budget:100,initialFen:'7k/8/8/8/4Q3/8/8/K7 w - - 0 1',history},nativeWorker);
    history.push(chess.move(r.move).san);
  }
  assert.ok(chess.isCheckmate(),history.join(' '));
});

test('unrestricted review sees the forced loss before the opponent delivers it',async()=>{
 const c=new Chess();for(const move of ['f3','e5','g4'])c.move(move);
 const r=await stockfishMove({fen:c.fen(),review:true,budget:500},nativeWorker);
 assert.equal(r.mate,1);assert.ok(-r.score < -90000);
});

test('Auto returns legal moves at forgiving and challenging settings',async()=>{
 for(const autoStrength of [0.1,0.9]){
  const c=new Chess();c.move('e4');
  const r=await stockfishMove({fen:c.fen(),level:8,autoStrength,budget:300},nativeWorker);
  assert.ok(c.move(r.move));
 }
});

test('review ignores incomplete bound scores and keeps the last exact score',async()=>{
  const c=new Chess();
  const makeWorker=()=>{const worker={terminate(){},postMessage(command){
    if(command==='uci')queueMicrotask(()=>worker.onmessage({data:'uciok'}));
    if(command==='isready')queueMicrotask(()=>worker.onmessage({data:'readyok'}));
    if(command.startsWith('go '))queueMicrotask(()=>worker.onmessage({data:'info depth 8 score cp 20 nodes 20 pv e2e4\ninfo depth 9 score cp 700 lowerbound nodes 40 pv e2e4\nbestmove e2e4'}));
  }};return worker};
  const result=await stockfishMove({fen:c.fen(),level:7,review:true,budget:100},makeWorker);
  assert.equal(result.score,20);assert.ok(c.move(result.move));
});
