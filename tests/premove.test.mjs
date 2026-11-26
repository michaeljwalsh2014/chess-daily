import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {executePremove,commitMove,gameFrom,pendingPremoves,premoveBoard,queuePremove,clearPremoves} from '../dist/game-core.js';
test('queued move waits for the computer reply and then executes once',()=>{const m={moves:['e4'],turn:'b',premove:{from:'g1',to:'f3'}};assert.equal(executePremove(m),false);assert.deepEqual(m.premove,{from:'g1',to:'f3'});commitMove(m,'e5');assert.ok(executePremove(m));assert.deepEqual(m.moves,['e4','e5','Nf3']);assert.equal(executePremove(m),false)});
test('premove is cancelled when its piece was captured',()=>{const m={fen:'4k3/8/8/8/8/8/r7/N3K3 b - - 0 1',moves:[],turn:'b',premove:{from:'a1',to:'b3'}};commitMove(m,'Rxa1+');assert.equal(executePremove(m),false);assert.equal(m.premove,undefined);assert.equal(gameFrom(m).turn(),'w')});
test('a premove can capture a piece that replaced your piece on the destination',()=>{const m={fen:'4kr2/8/8/8/8/5P2/8/4K1N1 b - - 0 1',moves:[],turn:'b',premove:{from:'g1',to:'f3',promotion:'q'}};commitMove(m,'Rxf3');assert.ok(executePremove(m));assert.equal(gameFrom(m).get('f3').type,'n');assert.equal(gameFrom(m).get('f3').color,'w')});
test('a premove is canceled when the opponent puts the king in check',()=>{const m={fen:'4k3/8/8/8/8/8/5r2/R3K3 b Q - 0 1',moves:[],turn:'b',premove:{from:'a1',to:'a2'}};commitMove(m,'Re2+');assert.equal(executePremove(m),false);assert.equal(m.premove,undefined)});
test('multiple premoves execute one per reply and can move the same piece again',async()=>{const {queuePremove,premoveBoard,pendingPremoves}=await import('../dist/game-core.js');const m={moves:['e4'],turn:'b'};queuePremove(m,{from:'g1',to:'f3'});queuePremove(m,{from:'f3',to:'g5'});assert.equal(premoveBoard(m).get('g5').type,'n');assert.equal(gameFrom(m).get('g1').type,'n');commitMove(m,'e5');assert.ok(executePremove(m));assert.equal(pendingPremoves(m).length,1);assert.equal(executePremove(m),false);commitMove(m,'Nc6');assert.ok(executePremove(m));assert.deepEqual(m.moves,['e4','e5','Nf3','Nc6','Ng5']);assert.equal(pendingPremoves(m).length,0)});
test('an illegal next premove cancels the entire remaining sequence',async()=>{const {queuePremove,pendingPremoves}=await import('../dist/game-core.js');const m={fen:'4k3/8/8/8/8/8/r7/N3K3 b - - 0 1',moves:[],turn:'b'};queuePremove(m,{from:'a1',to:'b3'});queuePremove(m,{from:'b3',to:'c5'});commitMove(m,'Rxa1+');assert.equal(executePremove(m),false);assert.equal(pendingPremoves(m).length,0)});

test('queued destinations are highlighted while the knight stays on its current square',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const m={moves:['e4'],turn:'b'};
  const ctx=vm.createContext({
    state:{match:m},match:()=>gameFrom(m),pendingPremoves,premoveBoard,queuePremove,
    liveHistoryStep:null,selectedSquare:null,gameSelection:null,premovesEnabled:true,
    dragDropInProgress:false,settleMatch:()=>false,save(){},render(){},renderGameBoardSelection(){},
    esc:String,names:{n:'knight'},pieceTheme:'classic',pieceURL:(_,color,type)=>color+type+'.svg',
  });
  vm.runInContext(source.slice(source.indexOf('function boardHTML('),source.indexOf('function sessionHeader(')),ctx);
  vm.runInContext(source.slice(source.indexOf('function premoveSource('),source.indexOf('function bindGameBoard(')),ctx);
  const board=()=>vm.runInContext('boardHTML(match(),{interactive:true,premoves:pendingPremoves(state.match)})',ctx);
  const square=(html,name)=>html.match(new RegExp('<button[^>]+data-square="'+name+'"[^>]*>.*?</button>'))?.[0];
  vm.runInContext("handleGameSquare('g1');handleGameSquare('f3');handleGameSquare('g1');handleGameSquare('g5');",ctx);
  assert.deepEqual(pendingPremoves(m).map(({from,to})=>from+to),['g1f3','f3g5']);
  const queued=board();
  assert.match(square(queued,'g1'),/White knight.*wn\.svg/);
  assert.match(square(queued,'f3'),/empty, premove destination/);
  assert.match(square(queued,'g5'),/empty, premove destination/);
  clearPremoves(m);
  const canceled=board();
  assert.match(square(canceled,'g1'),/White knight.*wn\.svg/);
  assert.doesNotMatch(square(canceled,'f3'),/premove/);
});

test('a quick drop uses the release square even without a pointermove',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const start=source.indexOf("function handleBoardSquare(");
  const end=source.indexOf("document.addEventListener('pointercancel'",start);
  const board={},origin={dataset:{square:'g1'}},drop={dataset:{square:'f3'},closest:()=>board};
  const dragGesture={pointer:1,board,square:origin,from:'g1',x:0,y:0,centerX:0,centerY:0};
  let onRelease,move;
  const ctx=vm.createContext({
    document:{addEventListener(_,handler){onRelease=handler},elementFromPoint:()=>({closest:()=>drop})},
    dragGesture,clearDrag:()=>dragGesture,view:'game',suppressBoardClick:false,dragDropInProgress:false,
    gameSelection:null,setTimeout(){},handleGameSquare(to){move={from:ctx.gameSelection,to}},
  });
  vm.runInContext(source.slice(start,end),ctx);
  onRelease({pointerId:1,clientX:10,clientY:12});
  assert.deepEqual(move,{from:'g1',to:'f3'});
  assert.equal(ctx.suppressBoardClick,true);
});

test('the held piece follows its played premove while capture stays on the original square',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const originalSquare={},dragGesture={from:'g1',piece:'n',square:originalSquare};
  const ctx=vm.createContext({dragGesture,view:'game'});
  vm.runInContext(source.slice(source.indexOf('function followPlayedPremove('),source.indexOf('function renderGameDuringDrag(')),ctx);
  vm.runInContext("followPlayedPremove({from:'g1',to:'f3'},'Nf3')",ctx);
  assert.equal(dragGesture.from,'f3');
  assert.equal(dragGesture.square,originalSquare);
});


test('fast practice drops use the piece center and the correct move handler',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const start=source.indexOf('function handleBoardSquare(');
  const end=source.indexOf("document.addEventListener('pointercancel'",start);
  const board={};
  const square=name=>({dataset:{square:name},closest:()=>board});
  const origin=square('g1'),intended=square('f3'),neighbor=square('g3');
  const dragGesture={pointer:1,board,square:origin,from:'g1',x:68,y:160,centerX:52,centerY:160};
  for(const [view,handler] of [['training','trySquare'],['learn','lessonSquare'],['endgame-demo','endgameTrySquare']]){
    let onRelease,move;
    const ctx=vm.createContext({
      document:{
        addEventListener(_,callback){onRelease=callback},
        elementFromPoint(x){return {closest:()=>x<40?intended:neighbor}},
      },
      dragGesture,clearDrag:()=>dragGesture,view,suppressBoardClick:false,dragDropInProgress:false,
      selectedSquare:null,setTimeout(){},[handler](to){move={from:ctx.selectedSquare,to}},
    });
    vm.runInContext(source.slice(start,end),ctx);
    onRelease({pointerId:1,clientX:48,clientY:80});
    assert.deepEqual(move,{from:'g1',to:'f3'},view);
  }
});

test('a touch release selects a board square without a browser click',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const start=source.indexOf('function handleBoardSquare(');
  const end=source.indexOf("document.addEventListener('pointercancel'",start);
  const board={};
  const square={dataset:{square:'e4'},closest:()=>board};
  let onRelease, selected;
  const ctx=vm.createContext({
    document:{
      addEventListener(_,handler){onRelease=handler},
      elementFromPoint:()=>({closest:()=>square}),
    },
    touchPress:{pointer:1,square,x:20,y:30},
    dragGesture:null,
    view:'training',
    trySquare(to){selected=to},
  });
  vm.runInContext(source.slice(start,end),ctx);
  onRelease({pointerType:'touch',pointerId:1,clientX:20,clientY:30});
  assert.equal(selected,'e4');
  assert.equal(ctx.touchPress,null);
  assert.equal(ctx.handledTouchBoard,board);
});
