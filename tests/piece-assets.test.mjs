import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pieceURL,preloadPieces} from '../dist/piece-assets.js';

test('a full set waits for all twelve images to decode and stays cached',async()=>{
 const images=[];let release;const gate=new Promise(resolve=>release=resolve);
 class Image{constructor(){images.push(this)}set src(value){this.url=value;queueMicrotask(()=>this.onload())}async decode(){await gate;this.decoded=true}}
 const ready=preloadPieces('glass',Image);let complete=false;ready.then(()=>complete=true);
 await new Promise(resolve=>setTimeout(resolve,0));assert.equal(complete,false);assert.equal(images.length,12);
 assert.equal(new Set(images.map(image=>image.url)).size,12);
 release();assert.ok((await ready).every(image=>image.decoded));
 assert.equal(preloadPieces('glass',Image),ready);assert.equal(images.length,12);
});
test('failed sets can be retried rather than keeping a failed cache entry',async()=>{
 class Broken{set src(value){queueMicrotask(()=>this.onerror())}}
 await assert.rejects(preloadPieces('wood',Broken));
 class Loaded{set src(value){queueMicrotask(()=>this.onload())}async decode(){}}
 assert.equal((await preloadPieces('wood',Loaded)).length,12);
});
test('all piece asset URLs exist, including promotion pieces',async()=>{
 const {access}=await import('node:fs/promises');
 for(const theme of ['classic','wood','tournament','glass','marble','castle'])for(const color of ['w','b'])for(const type of 'pnbrqk'){
  const url=pieceURL(theme,color,type);await access(new URL('../dist/'+url.split('?')[0],import.meta.url));
 }
});
