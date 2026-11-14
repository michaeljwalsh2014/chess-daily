const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
// A local starting estimate, not a measured Elo rating.
export function autoStartingState(rating,games=[]){
 let estimate=Number.isFinite(rating)?rating:700;
 const opponentRatings={1:500,2:700,3:1000,4:1800,5:2100,6:1700,7:2000};
 for(const game of games){
  if(game.kind==='endgame'||!['win','loss','draw'].includes(game.result))continue;
  const opponent=Number(game.level)===8?(game.autoState?.playerRating??estimate):opponentRatings[game.level];
  if(!Number.isFinite(opponent))continue;
  const expected=1/(1+10**((opponent-estimate)/400));
  estimate+=48*((game.result==='win'?1:game.result==='draw'?.5:0)-expected);
 }
 estimate=clamp(estimate,200,2400);
 const strength=clamp((estimate-400)/1800,.05,.9);
 return {strength,baseline:strength,playerRating:Math.round(estimate),samples:0};
}
