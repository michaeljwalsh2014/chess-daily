import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Chess} from '../dist/vendor/chess.js';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const ctx=vm.createContext({Chess});vm.runInContext(source.slice(source.indexOf('function reviewSuggestion('),source.indexOf('function reviewDrawingKey(')),ctx);
test('a suggestion belongs to the displayed position and leaves the board unchanged',()=>{const c=new Chess(),fen=c.fen();ctx.c=c;ctx.analysis={move:{from:'e2',to:'e4'}};const result=vm.runInContext('reviewSuggestion(c,analysis)',ctx);assert.equal(result.san,'e4');assert.equal(c.fen(),fen);c.move('e4');assert.equal(vm.runInContext('reviewSuggestion(c,analysis)',ctx),null)});
test('missing or illegal engine moves produce no arrow',()=>{ctx.c=new Chess();for(const analysis of [undefined,{move:null},{move:{from:'a1',to:'a8'}}]){ctx.analysis=analysis;assert.equal(vm.runInContext('reviewSuggestion(c,analysis)',ctx),null)}});
