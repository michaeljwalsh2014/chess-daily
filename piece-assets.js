const sets=new Map();
export function pieceURL(theme,color,type){return `pieces/${theme==='classic'?'':theme+'/'}${color}${type.toUpperCase()}.${theme==='castle'?'png':'svg'}?v=20261114-25`}
// Keep decoded images alive for the session, including pieces not on the board yet.
export function preloadPieces(theme,ImageClass=globalThis.Image){
 if(!ImageClass)return Promise.resolve([]);
 if(sets.has(theme))return sets.get(theme);
 const ready=Promise.all(['w','b'].flatMap(color=>[...'pnbrqk'].map(type=>new Promise((resolve,reject)=>{
  const image=new ImageClass();
  image.onload=async()=>{try{if(image.decode)await image.decode();resolve(image)}catch(error){reject(error)}};
  image.onerror=()=>reject(new Error('Could not load piece set'));
  image.src=pieceURL(theme,color,type);
 }))));
 sets.set(theme,ready);ready.catch(()=>{if(sets.get(theme)===ready)sets.delete(theme)});return ready;
}
