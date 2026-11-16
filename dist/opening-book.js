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
export function standardOpening(data){
 if(data.review||data.initialFen||data.chosenSan!=null||data.chosen!=null||data.chosenUci!=null)return null;
 const history=data.history||[];if(history.length>=10)return null;
 const c=new Chess();try{for(const san of history)c.move(san)}catch{return null}
 if(c.fen()!==data.fen||c.inCheck())return null;
 let hash=Number(data.seed)>>>0;hash=Math.imul(hash^0x9e3779b9,0x45d9f3b)>>>0;hash^=hash>>>16;
 // Give Big Fish and the top Stockfish opponent a sound, consistent opening.
 // Other bots occasionally leave book to keep their play varied.
 if(![3,11,12].includes(Number(data.level))&&(hash>>>0)%12===0)return null;
 const choices=[...new Set(OPENING_LINES.filter(line=>line.length>history.length&&history.every((san,i)=>san===line[i])).map(line=>line[history.length]))];
 if(!choices.length)return null;
 const san=choices[(hash>>>0)%choices.length];
 try{const m=c.move(san);return {move:{from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})},san:m.san,engine:'opening-book',...(data.autoState?{autoState:data.autoState}:{})}}catch{return null}
}
