import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Chess} from '../dist/vendor/chess.js';
import {stockfishMove} from '../dist/strong-engine.js';
import {chooseMove} from '../dist/engine-core.js';
import {botTiming} from '../dist/game-core.js';
function nativeWorker(url) {
  const child=spawn(process.execPath,[fileURLToPath(url)],{stdio:['pipe','pipe','pipe']});
  let pending='';
  const worker={postMessage:line=>child.stdin.write(line+'\n'),terminate:()=>child.kill()};
  child.stdout.on('data',chunk=>{pending+=chunk;const lines=pending.split('\n');pending=lines.pop();for(const line of lines)worker.onmessage?.({data:line.trim()});});
  child.on('error',error=>worker.onerror?.(error));
  return worker;
}

for(const seconds of [10,60])for(const strongColor of ['w','b']){
 const c=new Chess(),clock={w:seconds,b:seconds},history=[];let winner=null,reason='ply limit';
 for(let ply=0;ply<160&&!c.isGameOver();ply++){
  const side=c.turn(),level=side===strongColor?7:6,budget=botTiming(level,{b:clock[side]}).budget,start=performance.now();
  const data={fen:c.fen(),level,budget,history};
  const r=level===7?await stockfishMove(data,nativeWorker):chooseMove(c.fen(),6,null,budget,{history});
  clock[side]-=(performance.now()-start)/1000;
  if(clock[side]<=0){winner=side==='w'?'b':'w';reason='time';break;}
  history.push(c.move(r.move).san);
  if(c.isCheckmate()){winner=side;reason='mate';}else if(c.isDraw())reason='draw';
 }
 console.log(JSON.stringify({seconds,strongColor,winner,reason,moves:history.length,clock}));
}
