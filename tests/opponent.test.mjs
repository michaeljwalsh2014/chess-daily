import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chess} from '../dist/vendor/chess.js';
let reply;globalThis.self={postMessage:r=>{reply=r}};
await import('../dist/opponent.js');
test('every computer level returns legal moves and handles a finished game',()=>{for(const level of [1,2,3]){const c=new Chess();c.move('e4');self.onmessage({data:{fen:c.fen(),level,id:level}});assert.equal(reply.id,level);assert.ok(c.move(reply.move));}const c=new Chess();for(const m of ['f3','e5','g4','Qh4#'])c.move(m);self.onmessage({data:{fen:c.fen(),level:3,id:4}});assert.equal(reply.move,undefined);});
