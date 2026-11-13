import {chooseMove} from './engine-core.js';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,...chooseMove(data.fen,Number(data.level),data.chosen)})}catch{self.postMessage({id:data.id,error:true})}};
