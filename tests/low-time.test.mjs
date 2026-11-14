import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function updateLowTimeWarning(){'),source.indexOf('function clockHTML(m){'));
function harness(initial,remaining){let sounds=0,low=false;const label={hidden:true};const m={clock:{w:remaining},control:'test'};const ctx=vm.createContext({state:{match:m},view:'game',controlInfo:()=>({seconds:initial}),$:id=>id==='#white-clock'?{closest:()=>({classList:{toggle:(_,value)=>low=value}})}:label,save(){},sound(){sounds++},toast(){}});vm.runInContext(code,ctx);return {m,run:()=>vm.runInContext('updateLowTimeWarning()',ctx),sounds:()=>sounds,low:()=>low,label};}
test('long games warn at sixty seconds, once even after an increment',()=>{const h=harness(600,61);h.run();assert.equal(h.sounds(),0);h.m.clock.w=60;h.run();assert.equal(h.sounds(),1);assert.equal(h.label.hidden,false);h.m.clock.w=70;h.run();assert.equal(h.low(),false);h.m.clock.w=59;h.run();assert.equal(h.sounds(),1)});
test('short games warn at twenty seconds and pauses defer the sound',()=>{const h=harness(60,21);h.run();assert.equal(h.low(),false);h.m.clock.w=20;h.m.paused=true;h.run();assert.equal(h.sounds(),0);h.m.paused=false;h.run();assert.equal(h.sounds(),1);h.m.result='win';h.run();assert.equal(h.low(),false)});
