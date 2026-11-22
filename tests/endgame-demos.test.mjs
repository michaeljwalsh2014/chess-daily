import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
import {ENDGAMES} from '../dist/game-core.js';
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
