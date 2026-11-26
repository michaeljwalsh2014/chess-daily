import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalize,validBackup} from '../dist/core.js';
import {LEVELS} from '../dist/game-core.js';

const ids=new Set();
const record=level=>({level,moves:['e4','e5'],paused:true});

test('every registered bot can be restored in game history and as the current game',()=>{
  for(const level of Object.keys(LEVELS).map(Number)){
    const game=record(level);
    assert(validBackup({...normalize(null),games:[game]},ids),LEVELS[level].name);
    assert(validBackup({...normalize(null),match:game},ids),LEVELS[level].name);
  }
});

test('backup validation rejects a nonnumeric or unknown bot ID and illegal moves',()=>{
  for(const game of [record('19'),record(999),record('constructor'),{...record(19),moves:['e5']}]){
    assert.equal(validBackup({...normalize(null),games:[game]},ids),false);
    assert.equal(validBackup({...normalize(null),match:game},ids),false);
  }
});


test('restore does not replace or announce success before storage accepts the backup',async()=>{
  const old={...normalize(null),games:[record(12)]};
  const backup={...normalize(null),games:[record(17),record(18),record(19)],match:record(19)};
  let stored=JSON.stringify(old),fail=false,confirmed=true,messages=[];
  globalThis.document={addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[]};
  globalThis.localStorage={getItem:key=>key==='chess-daily'?stored:null,setItem(key,value){
    assert.equal(key,'chess-daily');
    if(fail)throw new Error('No space');
    stored=value;
  }};
  globalThis.confirm=()=>confirmed;
  const src=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const file=new URL('../dist/.backup-harness.mjs',import.meta.url);
  fs.writeFileSync(file,src.slice(0,src.indexOf("$$('nav button').forEach(b=>b.onclick"))+
    `
export async function restore(raw,announce){
      toast=announce;go=()=>{};
      const target={files:[{size:100,text:async()=>JSON.stringify(raw)}],value:'backup.json'};
      await importData({target});
      return {state,input:target.value};
    }
`);
  try{
    const {restore}=await import(file.href);
    const run=()=>restore(backup,message=>messages.push(message));
    confirmed=false;
    assert.deepEqual(await run(),{state:old,input:''});
    assert.deepEqual(JSON.parse(stored),old);
    assert.deepEqual(messages,[]);
    confirmed=true;fail=true;
    assert.deepEqual(await run(),{state:old,input:''});
    assert.deepEqual(JSON.parse(stored),old);
    assert.deepEqual(messages,['Your browser could not save the backup. Your current records were not replaced.']);
    fail=false;messages=[];
    assert.deepEqual(await run(),{state:backup,input:''});
    assert.deepEqual(JSON.parse(stored),backup);
    assert.deepEqual(messages,['Your backup has been restored.']);
  }finally{fs.unlinkSync(file)}
});
