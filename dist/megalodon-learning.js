import {Chess} from './vendor/chess.js';

// Store results by position and move, not by move number, so either color can learn.
export function positionKey(fen){return fen.split(' ').slice(0,4).join(' ')}
export function learnGame(previous,record){
  if(!['win','loss','draw'].includes(record.result)||!Array.isArray(record.moves))return previous||{positions:{},games:0};
  const data=structuredClone(previous||{positions:{},games:0});data.positions||={};
  const c=record.fen?new Chess(record.fen):new Chess();
  try{for(const san of record.moves.slice(0,120)){
    const key=positionKey(c.fen()),color=c.turn(),move=c.move(san),code=move.from+move.to+(move.promotion||'');
    if(record.side&&record.side!=='both'&&color!==record.side)continue;
    const score=record.side&&record.side!=='both'?(record.result==='win'?1:record.result==='loss'?-1:0):(record.result==='draw'?0:(record.result==='win'?(color==='w'?1:-1):(color==='b'?1:-1)));
    const bucket=data.positions[key]||(data.positions[key]={});const stat=bucket[code]||(bucket[code]={count:0,score:0});
    stat.count=Math.min(1000,stat.count+1);stat.score=Math.max(-1000,Math.min(1000,stat.score+score));
  }}catch{return previous||{positions:{},games:0}}
  const keys=Object.keys(data.positions);for(const key of keys.slice(0,Math.max(0,keys.length-4000)))delete data.positions[key];
  data.games=(Number(data.games)||0)+1;return data;
}

// Master-game moves are used as cautious tie-break hints. The search remains
// in charge; it can only follow a learned move when its own evaluation agrees.
export function learnMasterPgn(previous,pgn,gameId=''){
  const data=structuredClone(previous||{positions:{},games:0});data.positions||={};data.masterGameIds||=[];
  if(gameId&&data.masterGameIds.includes(gameId))return previous||data;
  const parsed=new Chess();parsed.loadPgn(pgn);const headers=parsed.getHeaders(),sans=parsed.history();
  if(!sans.length)throw new Error('The master game has no moves.');
  const c=headers.FEN?new Chess(headers.FEN):new Chess();
  for(const san of sans){const key=positionKey(c.fen()),move=c.move(san),code=move.from+move.to+(move.promotion||'');const bucket=data.positions[key]||(data.positions[key]={}),stat=bucket[code]||(bucket[code]={count:0,score:0});stat.count=Math.min(1000,stat.count+1);stat.score=Math.min(1000,stat.score+1);stat.master=true}
  data.masterGames=(Number(data.masterGames)||0)+1;data.games=(Number(data.games)||0)+1;
  if(gameId){data.masterGameIds.push(gameId);data.masterGameIds=data.masterGameIds.slice(-100)}
  const keys=Object.keys(data.positions);for(const key of keys.slice(0,Math.max(0,keys.length-4000)))delete data.positions[key];
  return data;
}

// Pull a small batch of high-rated games from Lichess's public Masters
// Opening Explorer. This runs only when requested by the user or once on the
// first visit; failures are harmless and can be retried later.
export async function trainFromMasterGames(previous,fetcher=globalThis.fetch){
  if(typeof fetcher!=='function')throw new Error('Master games are unavailable while offline.');
  const params=new URLSearchParams({fen:new Chess().fen(),topGames:'15'});
  const index=await fetcher(`https://explorer.lichess.ovh/masters?${params}`,{headers:{Accept:'application/json'}});
  if(!index.ok)throw new Error('Could not load the master-game list.');
  const payload=await index.json(),known=new Set(previous?.masterGameIds||[]);
  const games=(payload.topGames||[]).filter(game=>game.id&&!known.has(game.id)&&Math.min(game.white?.rating||0,game.black?.rating||0)>=2600).slice(0,8);
  if(!games.length)return {learning:previous||{positions:{},games:0},imported:0};
  const loaded=await Promise.allSettled(games.map(async game=>{
    const response=await fetcher(`https://explorer.lichess.ovh/masters/pgn/${encodeURIComponent(game.id)}`,{headers:{Accept:'application/x-chess-pgn'}});
    if(!response.ok)throw new Error('Game unavailable');
    return {id:game.id,pgn:await response.text()};
  }));
  let learning=previous||{positions:{},games:0},imported=0;
  for(const result of loaded){if(result.status!=='fulfilled')continue;try{learning=learnMasterPgn(learning,result.value.pgn,result.value.id);imported++}catch{}}
  if(!imported)throw new Error('No master games could be added.');
  return {learning,imported};
}
export function learnPgn(previous,pgn){
  const c=new Chess();c.loadPgn(pgn);const headers=c.getHeaders(),result=headers.Result;
  if(!['1-0','0-1','1/2-1/2'].includes(result))throw new Error('Choose a finished game with a result.');
  const moves=c.history(),initialFen=headers.FEN;if(!moves.length)throw new Error('The game has no moves.');
  return learnGame(previous,{moves,fen:initialFen,result:result==='1-0'?'win':result==='0-1'?'loss':'draw'});
}
