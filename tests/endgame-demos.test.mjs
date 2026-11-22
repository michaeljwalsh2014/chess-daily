import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
import {ENDGAMES,PRACTICAL_ENDGAMES} from '../dist/game-core.js';
import {ENDGAME_DEMOS} from '../dist/endgame-demos.js';

test('every endgame demonstration plays legal moves through its stated result',()=>{
  for(const e of ENDGAMES){
    const demo=ENDGAME_DEMOS[e.id];
    assert.ok(demo, e.name);
    const c=new Chess(e.fen);
    for(const code of demo.moves) assert.ok(c.move({from:code.slice(0,2),to:code.slice(2,4),promotion:code[4]||'q'}), `${e.name}: ${code}`);
    assert.ok(c.isGameOver(),e.name);
    assert.equal(c.isCheckmate()?'checkmate':'draw',demo.result,e.name);
  }
});

test('the opposition demo does not revisit a position and demonstrates Kd6',()=>{
  const {fen}=ENDGAMES.find(exercise=>exercise.id==='pawn-opposition');
  const {moves}=ENDGAME_DEMOS['pawn-opposition'];
  const c=new Chess(fen);
  const position=()=>c.fen().split(' ').slice(0,4).join(' ');
  const seen=new Set([position()]);
  for(const code of moves){
    c.move({from:code.slice(0,2),to:code.slice(2,4)});
    const fen=position();
    assert.ok(!seen.has(fen),fen);
    seen.add(fen);
  }
  assert.ok(moves.includes('d5d6'));
  assert.ok(c.isStalemate());
});


test('the practice catalog starts in multi-piece positions and every demo has coaching',()=>{
  for(const exercise of PRACTICAL_ENDGAMES){
    const game=new Chess(exercise.fen);
    const demo=ENDGAME_DEMOS[exercise.id];
    assert.ok(game.board().flat().filter(Boolean).length>=5,exercise.name);
    assert.ok(demo.moves.length>=19,exercise.name);
    assert.ok(Object.keys(demo.notes).length>=3,exercise.name);
    assert.ok(Object.keys(demo.notes).every(step=>Number(step)<=demo.moves.length),exercise.name);
  }
  assert.equal(new Set(PRACTICAL_ENDGAMES.map(exercise=>exercise.id)).size,PRACTICAL_ENDGAMES.length);
});
