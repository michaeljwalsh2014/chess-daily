const values={p:1,n:3,b:3,r:5,q:9,k:0};
export function materialSummary(game){
 const captured={w:[],b:[]};
 for(const move of game.history({verbose:true}))if(move.captured)captured[move.color].push(move.captured);
 for(const side of ['w','b'])captured[side].sort((a,b)=>values[b]-values[a]);
 const remaining={w:0,b:0};
 for(const row of game.board())for(const piece of row)if(piece)remaining[piece.color]+=values[piece.type];
 return {captured,difference:remaining.w-remaining.b};
}
