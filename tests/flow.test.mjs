import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const harness=src.slice(0,src.indexOf("$$('nav button').forEach(b=>b.onclick"))+`\nrender=()=>{};save=()=>true;flushTime=()=>{};export function progressForReviewedWin(level,autoState){
  state=normalize(null);state.profile={startRating:1200};
  state.games=[{id:1,level,autoState,result:'win',moves:['e4','e5','Nf3'],
    startingAnalysis:{reviewVersion:3,move:{from:'e2',to:'e4'}},
    analysis:[{reviewVersion:3},{reviewVersion:3,move:{from:'b1',to:'c3'}},{reviewVersion:3}]}];
  recalculateAutoRating();
  return state.autoRating;
}
export function resignationFlow(){state=normalize(null);state.match={moves:['e4'],level:2,paused:true,clock:{w:600,b:600},turn:'b'};resignGame();resignGame();return state;}export function challengeFlow(puzzles){state=normalize(null);state.coach=newCoach(800);state.profile={goal:1500};bank=puzzles;puzzleMap=new Map(bank.map(p=>[p.id,p]));toast=()=>{};adjustChallenge(100);const target=trainingCoach().target;const choices=Object.keys(SKILLS).map(k=>chooseTrainingPuzzle(k));selectedSkill='checkmates';beginSession();let p=puzzleMap.get(state.active.puzzle.id);for(let i=0;i<p.moves.length;i+=2){submitMove(uci(p.moves[i]));if(state.active.puzzle.done)break;}return {target,choices,next:trainingCoach().target};}export function run(p,moves=p.moves){state=normalize(null);state.coach=newCoach(800);puzzleMap=new Map([[p.id,p]]);state.active={skill:p.skill,results:[],puzzle:{id:p.id,cursor:0,seconds:10,mistakes:[],hints:0,done:false,moves:[],targetBefore:950}};for(let i=0;i<moves.length;i+=2){submitMove(uci(moves[i]));if(state.active.puzzle.done)break;}return state.active;}export function practiceEndgame(id,moves,replies,attempt=[]){
  state=normalize(null);
  endgameDemo={id,phase:'try',attempt:[...attempt]};
  for(const [index,move] of moves.entries()){
    endgameTrySquare(move.slice(0,2));
    endgameTrySquare(move.slice(2,4));
    if(endgameWorker&&replies[index])endgameWorker.onmessage({data:{move:uci(replies[index])}});
  }
  return {demo:endgameDemo,board:endgamePracticeBoard(),completed:state.endgamesDone};
}\n`;
// A temporary sibling module exercises the actual application move handler.
const file=new URL('../dist/.flow-harness.mjs',import.meta.url);fs.writeFileSync(file,harness);globalThis.document={addEventListener:()=>{},querySelector:()=>null,querySelectorAll:()=>[]};globalThis.localStorage={getItem:()=>null};const {run,challengeFlow,resignationFlow,practiceEndgame,progressForReviewedWin}=await import(file.href);fs.unlinkSync(file);
test('every puzzle completes through the actual move handler, exactly once',()=>{const bank=JSON.parse(fs.readFileSync(new URL('../dist/puzzles.json',import.meta.url)));for(const p of bank){const d=run(p);assert.equal(d.puzzle.done,true,p.id);assert.equal(d.results.length,1,p.id);assert.equal(d.results[0].moves.filter((_,i)=>i%2===0).length,Math.ceil(p.moves.length/2),p.id)}});

test("Harder carries across all skills and clean solves still adapt",()=>{const bank=JSON.parse(fs.readFileSync(new URL("../dist/puzzles.json",import.meta.url)));const r=challengeFlow(bank);assert.equal(r.target,1050);for(const p of r.choices)assert.ok(p.rating>=r.target);assert.ok(r.next>r.target);});

test("resigning ends a paused game as a loss and saves it exactly once",()=>{const s=resignationFlow();assert.equal(s.match.result,"loss");assert.equal(s.match.reason,"You resigned");assert.equal(s.match.paused,false);assert.equal(s.games.length,1);assert.equal(s.games[0].result,"loss");assert.deepEqual(s.games[0].moves,["e4"]);});


test('a puzzle accepts a different forced mate in three that rejoins the original line',()=>{
  const puzzle={id:'alternate-mate',skill:'checkmates',fen:'7k/8/5K2/8/4Q3/8/8/8 w - - 0 1',rating:950,
    moves:['e4d5','h8h7','d5b7','h7g8','b7g7']};
  const alternative=['e4c6','h8h7','c6b7','h7g8','b7g7'];
  const result=run(puzzle,alternative);
  assert.equal(result.puzzle.done,true);
  assert.deepEqual(result.results[0].solution,alternative);
  assert.equal(result.results[0].clean,true);
  const stalemate=run(puzzle,['e4g6']);
  assert.equal(stalemate.puzzle.done,false);
  assert.equal(stalemate.puzzle.mistakes.length,1);
});

test('Queen and king teamwork accepts a different line and records actual checkmate',()=>{
  globalThis.Worker=class {postMessage(){} terminate(){}};
  const result=practiceEndgame('finish-outside-passer',['g6g7','e3f4','g7h8'],['h4h5','h5h4']);
  assert.equal(result.demo.phase,'complete');
  assert.equal(result.board.isCheckmate(),true);
  assert.deepEqual(result.completed,['finish-outside-passer']);
  assert.deepEqual(result.demo.attempt,['g6g7','h4h5','e3f4','h5h4','g7h8']);
});

test('the opposition practice accepts d5 to d6 and keeps playing from the resulting board',()=>{
  globalThis.Worker=class {postMessage(){} terminate(){}};
  const setup=['e4d4','e6d6','e3e4','d6e6','e4e5','e6f7','d4d5','f7e7','e5e6','e7e8'];
  const result=practiceEndgame('pawn-opposition',['d5d6'],['e8f8'],setup);
  assert.equal(result.board.get('d6').type,'k');
  assert.equal(result.board.get('f8').type,'k');
  assert.equal(result.board.turn(),'w');
  assert.equal(result.demo.phase,'try');
});

test('Progress uses the picker ratings for Reef Stalker and Chromejaw',()=>{
  for(const [level,expected] of [[17,1219],[18,1220]]){
    const rating=progressForReviewedWin(level);
    assert.equal(rating.history.at(-1).quality,50);
    assert.equal(rating.gameRating,expected,'reviewed win against bot '+level);
  }
});

test('Progress still uses the saved Auto strength and falls back for unknown opponents',()=>{
  assert.equal(progressForReviewedWin(8,{playerRating:1600}).gameRating,1219);
  assert.equal(progressForReviewedWin(999).gameRating,1210);
});
