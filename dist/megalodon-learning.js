import {Chess} from './vendor/chess.js';

// Store results by position and move, not by move number, so either color can learn.
export function positionKey(fen){return fen.split(' ').slice(0,4).join(' ')}
export function learnGame(previous,record){
  if(!['win','loss','draw'].includes(record.result)||!Array.isArray(record.moves))return previous||{positions:{},games:0};
  const data=structuredClone(previous||{positions:{},games:0});data.positions||={};
  const c=record.fen?new Chess(record.fen):new Chess();
  try{for(const san of record.moves.slice(0,120)){
    const key=positionKey(c.fen()),color=c.turn(),move=c.move(san),code=move.from+move.to+(move.promotion||'');
    const score=record.result==='draw'?0:(record.result==='win'?(color==='w'?1:-1):(color==='b'?1:-1));
    const bucket=data.positions[key]||(data.positions[key]={});const stat=bucket[code]||(bucket[code]={count:0,score:0});
    stat.count=Math.min(1000,stat.count+1);stat.score=Math.max(-1000,Math.min(1000,stat.score+score));
  }}catch{return previous||{positions:{},games:0}}
  const keys=Object.keys(data.positions);for(const key of keys.slice(0,Math.max(0,keys.length-4000)))delete data.positions[key];
  data.games=(Number(data.games)||0)+1;return data;
}
export function learnPgn(previous,pgn){
  const c=new Chess();c.loadPgn(pgn);const headers=c.getHeaders(),result=headers.Result;
  if(!['1-0','0-1','1/2-1/2'].includes(result))throw new Error('Choose a finished game with a result.');
  const moves=c.history(),initialFen=headers.FEN;if(!moves.length)throw new Error('The game has no moves.');
  return learnGame(previous,{moves,fen:initialFen,result:result==='1-0'?'win':result==='0-1'?'loss':'draw'});
}
