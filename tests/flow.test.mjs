import fs from 'node:fs';import {test} from 'node:test';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const harness=src.slice(0,src.indexOf("$$('nav button').forEach(b=>b.onclick"))+`\nrender=()=>{};save=()=>true;flushTime=()=>{};export function resignationFlow(){state=normalize(null);state.match={moves:['e4'],level:2,paused:true,clock:{w:600,b:600},turn:'b'};resignGame();resignGame();return state;}export function challengeFlow(puzzles){state=normalize(null);state.coach=newCoach(800);state.profile={goal:1500};bank=puzzles;puzzleMap=new Map(bank.map(p=>[p.id,p]));toast=()=>{};adjustChallenge(100);const target=trainingCoach().target;const choices=Object.keys(SKILLS).map(k=>chooseTrainingPuzzle(k));selectedSkill='checkmates';beginSession();let p=puzzleMap.get(state.active.puzzle.id);for(let i=0;i<p.moves.length;i+=2){submitMove(uci(p.moves[i]));if(state.active.puzzle.done)break;}return {target,choices,next:trainingCoach().target};}export function run(p,moves=p.moves){state=normalize(null);state.coach=newCoach(800);puzzleMap=new Map([[p.id,p]]);state.active={skill:p.skill,results:[],puzzle:{id:p.id,cursor:0,seconds:10,mistakes:[],hints:0,done:false,moves:[],targetBefore:950}};for(let i=0;i<moves.length;i+=2){submitMove(uci(moves[i]));if(state.active.puzzle.done)break;}return state.active;}export function practiceQueenEndgame(moves){state=normalize(null);endgameDemo={id:'finish-outside-passer',phase:'try',attempt:[]};for(const move of moves){endgameTrySquare(move.slice(0,2));endgameTrySquare(move.slice(2,4));}return {demo:endgameDemo,checkmate:endgamePracticeBoard().isCheckmate(),completed:state.endgamesDone};}\n`;
// A temporary sibling module exercises the actual application move handler.
const file=new URL('../dist/.flow-harness.mjs',import.meta.url);fs.writeFileSync(file,harness);globalThis.document={addEventListener:()=>{},querySelector:()=>null,querySelectorAll:()=>[]};globalThis.localStorage={getItem:()=>null};const {run,challengeFlow,resignationFlow,practiceQueenEndgame}=await import(file.href);fs.unlinkSync(file);
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

test('Queen and king teamwork accepts a different mate in three in practice',()=>{
  const moves=['g6g7','e3f4','g7h8'];
  const result=practiceQueenEndgame(moves);
  assert.equal(result.demo.phase,'complete');
  assert.equal(result.checkmate,true);
  assert.deepEqual(result.completed,['finish-outside-passer']);
  assert.deepEqual(result.demo.attempt,['g6g7','h4h5','e3f4','h5h4','g7h8']);
});
