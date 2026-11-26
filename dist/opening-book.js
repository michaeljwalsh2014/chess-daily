import {Chess} from './vendor/chess.js';
// Only exact, replayed standard starting-position histories enter this book.
export const OPENING_LINES=[
'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7',
'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6',
'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 O-O d6',
'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3 Bb4',
'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5',
'e4 e5 Nc3 Nf6 Bc4 Nc6 d3 Bc5',
'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',
'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 Nc3 Bg7',
'e4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7',
'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5',
'e4 c6 d4 d5 e5 Bf5 Nf3 e6',
'e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7',
'e4 e6 d4 d5 exd5 exd5 Nf3 Nf6',
'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O',
'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6',
'd4 d5 Nf3 Nf6 Bf4 e6 e3 Bd6',
'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O',
'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O',
'd4 Nf6 Nf3 g6 Bf4 Bg7 e3 O-O',
'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5',
'c4 Nf6 Nc3 e6 Nf3 d5 d4 Be7',
'Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7',
'Nf3 Nf6 d4 d5 c4 e6 Nc3 Be7'
].map(line=>line.split(' '));
// Megalodon keeps a deeper book in common, sound main lines before its own
// search takes over. These extend the shared repertoire with well-tested
// branches so it does not have to guess its opening from its evaluation alone.
export const MEGALODON_LINES=[...OPENING_LINES,...[
'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3',
'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8',
'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3 Ba7',
'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3 Bb4 Nxc6 bxc6 Bd3 d5',
'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Be7 O-O O-O c4',
'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O',
'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O',
'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3 b5',
'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 Bd3 Bxd3 Qxd3',
'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7',
'e4 e6 d4 d5 Nd2 Nf6 e5 Nfd7 Bd3 c5 c3 Nc6 Ne2',
'e4 e6 d4 d5 Nd2 Nf6 e5 Nfd7 Bd3 c5 c3 Nc6 Ne2 Be7 O-O O-O',
'e4 e5 f4 exf4 Nf3 d5 exd5 Nf6',
'e4 e5 Nc3 Nf6 Bc4 Nc6 d3 Bc5 Nf3 d6 O-O O-O',
'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6 cxd5 Nxd5',
'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4',
'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6',
'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7',
'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6',
'd4 Nf6 c4 e6 g3 d5 Bg2 Be7 Nf3 O-O O-O c6 Qc2 b6',
'd4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7 O-O O-O Nc3 Ne4',
'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 Bf5 Ngf3 e6',
'c4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 Nf3 Nf6 O-O O-O d3 d6',
'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O Be7'
].map(line=>line.split(' '))];
// Chromejaw favors open Sicilians, the Scotch, and the King's Gambit when available.
const CHROMEJAW_LINES=[
  ...OPENING_LINES.filter(line=>/^(e4 c5 Nf3 (d6|Nc6) d4|e4 e5 Nf3 Nc6 d4) /.test(line.join(' '))),
  'e4 e5 f4 exf4 Nf3 d5 exd5 Nf6'.split(' '),
];
// Ironfin favors the Caro-Kann and solid queen's pawn structures.
const IRONFIN_LINES=OPENING_LINES.filter(line=>/^(e4 c6|d4 d5 c4 (e6|c6)) /.test(line.join(' ')));
export function standardOpening(data){
 if(data.review||data.initialFen||data.chosenSan!=null||data.chosen!=null||data.chosenUci!=null)return null;
 const megalodon=Number(data.level)===12,lines=megalodon?MEGALODON_LINES:OPENING_LINES;
 const history=data.history||[];if(history.length>=(megalodon?18:10))return null;
 const c=new Chess();try{for(const san of history)c.move(san)}catch{return null}
 if(c.fen()!==data.fen||c.inCheck())return null;
 let hash=Number(data.seed)>>>0;hash=Math.imul(hash^0x9e3779b9,0x45d9f3b)>>>0;hash^=hash>>>16;
 // Give Big Fish, Megalodon, and the top Stockfish opponent sound openings.
 // Other bots occasionally leave book to keep their play varied.
 if(![3,11,12].includes(Number(data.level))&&(hash>>>0)%12===0)return null;
 const continuations=line=>line.length>history.length&&history.every((san,i)=>san===line[i]);
 const repertoire={18:CHROMEJAW_LINES,19:IRONFIN_LINES}[data.level];
 const preferred=repertoire?.filter(continuations)??[];
 const choices=[...new Set((preferred.length?preferred:lines.filter(continuations)).map(line=>line[history.length]))];
 if(!choices.length)return null;
 const san=choices[(hash>>>0)%choices.length];
 try{const m=c.move(san);return {move:{from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})},san:m.san,engine:'opening-book',...(data.autoState?{autoState:data.autoState}:{})}}catch{return null}
}
