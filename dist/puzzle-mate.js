// Return a forced mate line. The defender chooses the reply that delays mate longest.
export function forcedMateLine(game,attacker,maxPlies){
 let positions=0;
 function search(plies){
  if(++positions>3000)return null;
  const attacking=game.turn()===attacker;
  const moves=game.moves();
  if(!moves.length)return !attacking&&game.inCheck()?[]:null;
  if(!plies||game.isDraw())return null;
  if(attacking){
   const mate=moves.find(move=>move.endsWith('#'));
   if(mate)return [mate];
   if(plies===1)return null;
  }
  let best=null;
  for(const move of moves){
   game.move(move);
   const continuation=search(plies-1);
   game.undo();
   if(!continuation){
    if(!attacking)return null;
    if(positions>3000)return best;
    continue;
   }
   const line=[move,...continuation];
   if(!best||(attacking?line.length<best.length:line.length>best.length))best=line;
   if(attacking&&best.length===3)return best;
  }
  return best;
 }
 const line=search(maxPlies);
 if(!line)return null;
 const codes=line.map(san=>{
  const move=game.move(san);
  return move.from+move.to+(move.promotion||'');
 });
 for(let i=0;i<codes.length;i++)game.undo();
 return codes;
}
