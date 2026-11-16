// Patch the live game without detaching the board, captured pointer, or clocks.
export function patchGameView(current,fresh,syncBoard){
 function patch(old,next){
  if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){old.replaceWith(next.cloneNode(true));return}
  if(old.nodeType!==1){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return}
  if(old.classList.contains('board')&&next.classList.contains('board')){syncBoard(old,next);return}
  // Picker contents are built from the current select after patching.
  if((old.classList.contains('bot-picker-list')||old.classList.contains('bot-picker-current'))&&old.className===next.className)return;
  for(const attr of [...old.attributes])if(!next.hasAttribute(attr.name)&&!(old.nodeName==='DETAILS'&&attr.name==='open'))old.removeAttribute(attr.name);
  for(const attr of next.attributes)if(old.getAttribute(attr.name)!==attr.value)old.setAttribute(attr.name,attr.value);
  const previous=[...old.childNodes],following=[...next.childNodes];
  for(let i=0;i<following.length;i++){
   if(previous[i])patch(previous[i],following[i]);else old.append(following[i].cloneNode(true));
  }
  for(let i=following.length;i<previous.length;i++)previous[i].remove();
 }
 patch(current,fresh);
}

export function syncBoard(oldBoard,newBoard){
 // Pool existing decoded images before changing squares, so moves and captures
 // keep their image nodes even when the source square is updated first.
 const images=[...oldBoard.querySelectorAll('img')],used=new Set();
 const unchanged=new Set();
 [...newBoard.children].forEach((fresh,i)=>{const old=oldBoard.children[i];if(old&&old.innerHTML===fresh.innerHTML){unchanged.add(i);const image=old.querySelector('img');if(image)used.add(image)}});
 if(oldBoard.dataset.fen!==newBoard.dataset.fen)for(const image of images)for(const animation of image.getAnimations?.()||[])animation.cancel();
 for(const a of [...oldBoard.attributes])if(!newBoard.hasAttribute(a.name))oldBoard.removeAttribute(a.name);
 for(const a of newBoard.attributes)oldBoard.setAttribute(a.name,a.value);
 [...newBoard.children].forEach((fresh,i)=>{
  const old=oldBoard.children[i];if(!unchanged.has(i))old.style.zIndex='';
  for(const a of [...old.attributes])if(!fresh.hasAttribute(a.name))old.removeAttribute(a.name);
  for(const a of fresh.attributes)old.setAttribute(a.name,a.value);
  if(unchanged.has(i))return;
  const freshImage=fresh.querySelector('img'),src=freshImage?.getAttribute('src');
  const existing=old.querySelector('img');
  const image=src?(existing?.getAttribute('src')===src&&!used.has(existing)?existing:images.find(img=>!used.has(img)&&img.getAttribute('src')===src)):null;
  if(image){used.add(image);freshImage.replaceWith(image)}
  old.replaceChildren(...fresh.childNodes);
 });
}
