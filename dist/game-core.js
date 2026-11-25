import {Chess} from './vendor/chess.js';
export const LEVELS={8:{name:'Auto',description:'Automatically adjusts to your level',depth:12,budget:1600,delay:300},1:{name:'Deadfish',depth:2,budget:220,delay:350},2:{name:'Little Fish',depth:2,budget:350,delay:1450},3:{name:'Big Fish',depth:4,budget:900,delay:550},4:{name:'Razor Teeth',depth:9,budget:2200,delay:350,elo:1800},5:{name:'Cyber Tank',depth:16,budget:6000,delay:0,elo:2000},6:{name:'Hyper Bullet Bot 2.0',depth:12,budget:250,delay:0},7:{name:'Bullet Bot 3.0 Ultra',depth:20,budget:800,delay:0},9:{name:'Minnow',depth:2,budget:250,delay:1400},10:{name:'Barracuda',depth:6,budget:1600,delay:220,elo:1400},17:{name:'Reef Stalker',depth:10,budget:2400,delay:350,elo:1840,engine:'stockfish'},18:{name:'Chromejaw',depth:12,budget:3000,delay:150,elo:1880,engine:'stockfish'},15:{name:'Hammerhead',depth:20,budget:500,delay:0,elo:2380,engine:'stockfish'},16:{name:'Kraken',depth:24,budget:500,delay:0,elo:2600,engine:'stockfish'},11:{name:'Leviathan',depth:30,budget:5000,delay:0,engine:'stockfish'},12:{name:'Megalodon',depth:30,budget:20000,delay:0},13:{name:'Megalodon',depth:30,budget:20000,delay:0},14:{name:'Megalodon',depth:30,budget:20000,delay:0}};
export const CONTROLS={'30s':{name:'30 seconds · Hyperbullet',seconds:30,increment:0},'1':{name:'1 minute',seconds:60,increment:0},'0':{name:'Untimed',seconds:0,increment:0},'5':{name:'5 minutes',seconds:300,increment:0},'10':{name:'10 minutes',seconds:600,increment:0},'15+10':{name:'15 minutes + 10 seconds',seconds:900,increment:10},'30':{name:'30 minutes',seconds:1800,increment:0}};
export const ENDGAMES=[
  {
    "id": "back-rank-mate",
    "name": "Back-rank checkmate",
    "fen": "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
    "tip": "The black king is trapped behind its own pawns. Bring your rook to the eighth rank and check that every escape square is covered.",
    "difficulty": "Beginner"
  },
  {
    "id": "finish-queen-box",
    "name": "Finish a queen checkmate",
    "fen": "6k1/4Q3/5K2/8/8/8/8/8 w - - 2 2",
    "tip": "Use the king and your remaining pieces to finish this position. Use your queen to shrink the king’s space. Bring your king closer, then give mate. Leave a legal move if you are not giving check.",
    "difficulty": "Beginner"
  },
  {
    "id": "finish-rook-box",
    "name": "Finish a rook checkmate",
    "fen": "6k1/8/6K1/8/8/8/8/R7 w - - 2 2",
    "tip": "Use the king and your remaining pieces to finish this position. Use your rook to cut off a rank or file. Bring your king close enough to cover escape squares, then check along the edge.",
    "difficulty": "Beginner"
  },
  {
    "id": "finish-two-rooks",
    "name": "Finish a ladder checkmate",
    "fen": "8/7k/8/8/8/4K3/R7/6R1 w - - 2 2",
    "tip": "Use the king and your remaining pieces to finish this position. Use the rooks together to cut off ranks or files, gradually pushing the king to the edge.",
    "difficulty": "Beginner"
  },
  {
    "id": "finish-two-bishops",
    "name": "Finish a bishop checkmate",
    "fen": "6k1/6B1/6K1/8/4B3/8/8/8 w - - 6 4",
    "tip": "Use the king and your remaining pieces to finish this position. Use the bishops together to push the king toward a corner. Bring your king close to take away escape squares, then deliver mate.",
    "difficulty": "Beginner"
  },
  {
    "id": "finish-queen-vs-pawn",
    "name": "Find the final queen check",
    "fen": "7k/3Q4/5K2/8/8/6p1/8/8 w - - 0 6",
    "tip": "Use the king and your remaining pieces to finish this position. Stop the pawn from promoting while bringing your king closer. Watch for checks and stalemate.",
    "difficulty": "Easy"
  },
  {
    "id": "finish-outside-passer",
    "name": "Queen and king teamwork",
    "fen": "8/8/6Q1/8/7k/4K3/8/8 w - - 9 8",
    "tip": "Use your queen to keep the opposing king on the edge. Bring your king close enough to cover the escape squares.",
    "difficulty": "Easy"
  },
  {
    "id": "finish-connected-pawns",
    "name": "Finish after promotion",
    "fen": "8/1Q1P4/4K3/8/8/8/k7/8 w - - 1 13",
    "tip": "Use the king and your remaining pieces to finish this position. Keep your king close enough to protect both connected pawns. Advance them together so the enemy king cannot stop both.",
    "difficulty": "Easy"
  },
  {
    "id": "finish-pawn-race",
    "name": "Rook after promotion",
    "fen": "3R4/7k/5K2/8/8/8/8/8 w - - 1 4",
    "tip": "Use the king and your remaining pieces to finish this position. Keep your king in front of the pawn when it needs protection. Reach the last rank, promote, then finish with checkmate.",
    "difficulty": "Easy"
  },
  {
    "id": "finish-rook-and-pawn",
    "name": "Promote with rook support",
    "fen": "6k1/4R3/3P4/8/4K3/8/8/8 w - - 1 4",
    "tip": "Use the king and your remaining pieces to finish this position. Use your rook to cut off the enemy king, and bring your king forward to support the pawn.",
    "difficulty": "Easy"
  },
  {
    "id": "queen-box",
    "name": "King & queen",
    "fen": "7k/8/5K2/8/4Q3/8/8/8 w - - 0 1",
    "tip": "Use your queen to shrink the king’s space. Bring your king closer, then give mate. Leave a legal move if you are not giving check.",
    "difficulty": "Intermediate"
  },
  {
    "id": "two-rooks",
    "name": "Mate with two rooks",
    "fen": "7k/8/8/8/8/4K3/8/R5R1 w - - 0 1",
    "tip": "Use the rooks together to cut off ranks or files, gradually pushing the king to the edge.",
    "difficulty": "Intermediate"
  },
  {
    "id": "rook-box",
    "name": "King & rook",
    "fen": "7k/8/5K2/8/8/8/8/R7 w - - 0 1",
    "tip": "Use your rook to cut off a rank or file. Bring your king close enough to cover escape squares, then check along the edge.",
    "difficulty": "Intermediate"
  },
  {
    "id": "outside-passer",
    "name": "Race an outside passer",
    "fen": "8/8/7k/P7/3K4/8/8/8 w - - 0 1",
    "tip": "Use your king to keep the opposing king away, then advance the outside pawn. Promote safely before going for checkmate.",
    "difficulty": "Intermediate"
  },
  {
    "id": "pawn-race",
    "name": "Promote a pawn",
    "fen": "6k1/8/3PK3/8/8/8/8/8 w - - 0 1",
    "tip": "Keep your king in front of the pawn when it needs protection. Reach the last rank, promote, then finish with checkmate.",
    "difficulty": "Intermediate"
  },
  {
    "id": "rook-and-pawn",
    "name": "Rook and passed pawn",
    "fen": "7k/8/8/3P4/4K3/8/8/R7 w - - 0 1",
    "tip": "Use your rook to cut off the enemy king, and bring your king forward to support the pawn.",
    "difficulty": "Advanced"
  },
  {
    "id": "queen-vs-pawn",
    "name": "Queen against a pawn",
    "fen": "7k/8/6p1/8/8/3K4/8/3Q4 w - - 0 1",
    "tip": "Stop the pawn from promoting while bringing your king closer. Watch for checks and stalemate.",
    "difficulty": "Advanced"
  },
  {
    "id": "connected-pawns",
    "name": "Advance connected passers",
    "fen": "8/4k3/8/2PP4/3K4/8/8/8 w - - 0 1",
    "tip": "Keep your king close enough to protect both connected pawns. Advance them together so the enemy king cannot stop both.",
    "difficulty": "Advanced"
  },
  {
    "id": "pawn-opposition",
    "name": "King and pawn opposition",
    "fen": "8/8/4k3/8/4K3/4P3/8/8 w - - 0 1",
    "tip": "Use your king to claim key squares ahead of the pawn. Look for a way to gain the opposition.",
    "difficulty": "Advanced"
  },
  {
    "id": "two-bishops",
    "name": "Mate with two bishops",
    "fen": "7k/8/5K2/8/4B3/8/8/2B5 w - - 0 1",
    "tip": "Use the bishops together to push the king toward a corner. Bring your king close to take away escape squares, then deliver mate.",
    "difficulty": "Expert"
  },
  {
    "id": "queenside-majority",
    "name": "Create a queenside passer",
    "fen": "8/1p3pk1/p3p1pp/P3P3/1P1K1P2/6P1/7P/8 w - - 0 1",
    "tip": "Bring your king toward your queenside majority. Calculate Black\u2019s kingside pawn breaks before committing to a pawn race.",
    "difficulty": "Advanced"
  },
  {
    "id": "rook-active-passer",
    "name": "Rook and a distant passed pawn",
    "fen": "4r1k1/5pp1/7p/P7/4P3/5KP1/5P1P/R7 w - - 0 1",
    "tip": "Use the a-pawn to tie down Black\u2019s rook. Calculate when to push it and when to bring your king and other pawns forward.",
    "difficulty": "Advanced"
  },
  {
    "id": "rook-bishop-passer",
    "name": "Rook and bishop with a pawn majority",
    "fen": "4r1k1/5pp1/2b4p/P7/2B1P3/5KP1/5P1P/R7 w - - 0 1",
    "tip": "Look for a favorable bishop exchange. Calculate how a second passed pawn can overload Black\u2019s rook.",
    "difficulty": "Expert"
  },
  {
    "id": "knight-versus-bishop",
    "name": "Knight versus bishop and pawns",
    "fen": "8/2b2pkp/1p4p1/p7/P2NP3/1P3KP1/5P1P/8 w - - 0 1",
    "tip": "Centralize your king and knight before opening the position. Watch Black\u2019s kingside pawn breaks and look for a way to create a passed pawn.",
    "difficulty": "Expert"
  },
  {
    "id": "promotion-race",
    "name": "Count the pawn race",
    "fen": "8/5pp1/4k2p/P7/1P1K1PP1/7P/8/8 w - - 0 1",
    "tip": "Count both sides\u2019 moves to promotion. Then check what your new queen can do about Black\u2019s passers.",
    "difficulty": "Beginner"
  },
  {
    "id": "king-entry",
    "name": "Find a king entry square",
    "fen": "8/8/4k3/p6p/P6P/4K3/4P3/8 w - - 0 1",
    "tip": "Use the e-pawn to distract the king. Look for a way into the kingside to free the h-pawn.",
    "difficulty": "Beginner"
  },
  {
    "id": "active-king",
    "name": "Win pawns with an active king",
    "fen": "8/1p3pk1/6pp/p7/P2KP3/1P3PP1/7P/8 w - - 0 1",
    "tip": "Compare the kings’ routes to the queenside. Watch for Black’s kingside pawn breaks while you pick up the queenside pawns.",
    "difficulty": "Intermediate"
  },
  {
    "id": "bishop-pawn-break",
    "name": "Play a pawn break with bishops",
    "fen": "8/5p1k/1p4p1/p1bP4/P3P3/1P1B1KP1/5P1P/8 w - - 0 1",
    "tip": "Calculate the central pawn break, then use your king and bishop to support the d-pawn.",
    "difficulty": "Advanced"
  },
  {
    "id": "rook-trade-calculation",
    "name": "Calculate the rook trade",
    "fen": "8/5pk1/p3r1pp/1p6/1P1P4/P3RKP1/5P1P/8 w - - 0 1",
    "tip": "Before trading rooks, work out whose king gets to the queenside and how fast Black can push on the other wing.",
    "difficulty": "Intermediate"
  },
  {
    "id": "knight-defense",
    "name": "Hold a balanced knight ending",
    "fen": "8/1p3pkp/p1np2p1/4p3/4P3/1PNP1KP1/P4P1P/8 w - - 0 1",
    "tip": "Keep your knight active and look for checks. Secure a draw if neither side can safely make progress.",
    "difficulty": "Expert"
  }
];
export const PRACTICAL_ENDGAMES = [
  'promotion-race',
  'king-entry',
  'active-king',
  'rook-trade-calculation',
  'queenside-majority',
  'rook-active-passer',
  'bishop-pawn-break',
  'rook-bishop-passer',
  'knight-versus-bishop',
  'knight-defense',
].map(id=>ENDGAMES.find(exercise=>exercise.id===id));
export function gameFrom(record,limit=record.moves.length){const c=record.fen?new Chess(record.fen):new Chess();for(const m of record.moves.slice(0,limit))c.move(m);return c}
export function settleClock(m,now=Date.now()){if(!m||!m.clock||m.paused||m.result||!m.runningSince)return false;const side=m.turn||'w';m.clock[side]=Math.max(0,m.clock[side]-(now-m.runningSince)/1000);m.runningSince=now;if(m.clock[side]===0){const c=gameFrom(m);const winner=side==='w'?'b':'w';const bareKing=c.board().flat().filter(Boolean).filter(p=>p.color===winner).every(p=>p.type==='k');m.result=bareKing?'draw':side==='w'?'loss':'win';m.reason=bareKing?'Time expired; opponent has only a king':'Time expired';return true}return false}
export function commitMove(m,move,now=Date.now()){if(settleClock(m,now)||m.result||m.paused)return null;const c=gameFrom(m),side=c.turn(),played=c.move(move);m.moves=c.history();if(m.clock)m.clock[side]+=m.increment||0;m.turn=c.turn();m.runningSince=now;if(c.isGameOver()){m.result=c.isCheckmate()?(c.turn()==='b'?'win':'loss'):'draw';m.reason=c.isCheckmate()?'Checkmate':c.isStalemate()?'Stalemate':c.isThreefoldRepetition()?'Threefold repetition':c.isInsufficientMaterial()?'Insufficient material':'Draw'}return played}
const worth={p:1,n:3,b:3,r:5,q:9,k:0};
export function moveNotes(record){const c=record.fen?new Chess(record.fen):new Chess(),rows=[];for(const san of record.moves){const before=c.fen(),m=c.move(san);let text=m.color==='w'?'You moved':'Computer moved';text+=' '+({p:'the pawn',n:'the knight',b:'the bishop',r:'the rook',q:'the queen',k:'the king'}[m.piece])+' from '+m.from+' to '+m.to+'.';if(m.captured)text+=' Captured a '+({p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen'}[m.captured])+'.';if(c.isCheckmate())text+=' Checkmate: there is no legal escape.';else if(c.isStalemate())text+=' Stalemate: no legal moves, but the king is not in check.';else if(c.inCheck())text+=' The next move must answer the check.';if(m.isKingsideCastle()||m.isQueensideCastle())text+=' Castling moves the king and rook together.';if(m.promotion)text+=' The pawn promoted.';const exposed=c.board().flat().filter(p=>p&&p.color===m.color&&p.type!=='k'&&c.isAttacked(p.square,m.color==='w'?'b':'w')&&!c.isAttacked(p.square,m.color)).map(p=>p.square);if(exposed.length)text+=' Check these attacked, undefended pieces: '+exposed.join(', ')+'.';rows.push({san:m.san,color:m.color,before,fen:c.fen(),text,exposed,captured:m.captured||null,points:worth[m.captured]||0,from:m.from,to:m.to,promotion:m.promotion||null});}return rows}
export function gameSummary(record){const rows=moveNotes(record),white=rows.filter(r=>r.color==='w');return {checks:white.filter(r=>/[+#]/.test(r.san)).length,captured:white.reduce((n,r)=>n+r.points,0),lost:rows.filter(r=>r.color==='b').reduce((n,r)=>n+r.points,0),exposed:white.filter(r=>r.exposed.length).length,castled:white.some(r=>r.san.startsWith('O-O')),rows};}

export function botTiming(level,clock,increment=0,openingPly=Infinity){const config=LEVELS[level]||LEVELS[2];if(Number(level)===11){const seconds=clock?Math.max(0,Number(clock.b)||0):Infinity;return {budget:clock?Math.max(50,Math.min(config.budget,Math.floor(seconds*1000*.08))):config.budget,delay:0}}if([12,13,14].includes(Number(level))){
 const seconds=clock?Math.max(0,Number(clock.b)||0):Infinity;
 let phaseCap=config.budget;
 if(openingPly<8)phaseCap=3000;
 else if(openingPly<16)phaseCap=6000;
 else if(openingPly<32)phaseCap=12000;
 return {budget:Math.max(50,Math.min(phaseCap,Math.floor(seconds*1000*.08))),delay:0};
}if(Number(level)===9&&clock){const seconds=Math.max(0,Number(clock.b)||0);if(seconds<=60)return {budget:seconds<=3?Math.max(10,Math.floor(seconds*20)):seconds<=30?80:config.budget,delay:seconds<=30?0:600}}if(Number(level)===7){const seconds=clock?Math.max(0,clock.b):60;return {budget:seconds>30?Math.min(800,Math.floor(seconds*12)):seconds>15?Math.floor(seconds*8):Math.max(5,Math.min(35,Math.floor(seconds*3))),delay:0}}if(Number(level)===8&&clock){const remaining=Math.max(0,Number(clock.b)||0);if(remaining<=60)return {budget:remaining<=3?Math.max(10,Math.floor(remaining*10)):remaining<=10?80:remaining<=20?180:remaining<=30?350:650,delay:0}}if(!clock)return {budget:config.budget,delay:config.delay};const seconds=Math.max(0,clock.b),fraction=Math.min(1,seconds/60);const delay=seconds<=10?Math.min(config.delay,150,seconds*10):Math.round(config.delay*fraction);const budget=seconds<=10?Math.max(10,Math.min(100,seconds*10)):Math.max(50,Math.min(config.budget,seconds*1000/40+Math.min(increment*300,seconds*10)));return {budget:Math.floor(budget),delay:Math.floor(delay)}}
export function resultMessage(m){const title=m.result==='win'?'You won!':m.result==='loss'?'Computer won':'Draw';let explanation=m.reason||'The game has ended.';if(m.reason==='Time expired')explanation=m.result==='win'?'The computer ran out of time.':m.result==='loss'?'You ran out of time.':'Time ran out.';else if(m.reason==='Checkmate')explanation=m.result==='win'?'You checkmated the computer.':'The computer checkmated your king.';else if(m.reason==='Stalemate')explanation='Stalemate: the player to move has no legal moves, but their king is not in check.';else if(m.reason==='Threefold repetition')explanation='The same position occurred three times.';else if(m.reason==='Insufficient material')explanation='Neither side has enough material to give checkmate.';else if(m.reason==='Time expired; opponent has only a king')explanation='Time ran out, but the opponent has only a king, so the game is drawn.';return {title,explanation}}

export function pendingPremoves(m){return m?.premove?[m.premove,...(m.premoves||[])]:[]}
export function clearPremoves(m){delete m.premove;delete m.premoves}
export function queuePremove(m,move){if(m.premove){m.premoves||=[];m.premoves.push(move)}else m.premove=move}
export function premoveBoard(m){const c=gameFrom(m);if(c.turn()!=='b')return c;for(const move of pendingPremoves(m)){const piece=c.get(move.from);if(!piece||piece.color!=='w')break;c.remove(move.from);c.remove(move.to);c.put({type:piece.type==='p'&&move.to[1]==='8'?(move.promotion||'q'):piece.type,color:'w'},move.to)}return c}
export function executePremove(m,now=Date.now()){const move=m.premove;if(!move||m.result||m.paused)return false;if(gameFrom(m).turn()!=='w')return false;try{const played=commitMove(m,move,now);if(!played){clearPremoves(m);return false}m.premove=m.premoves?.shift();if(!m.premove||m.result)clearPremoves(m);return true}catch{clearPremoves(m);return false}}
