/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Editor visual sentuh/tetikus bagi crop dan watermark, dengan input angka yang sentiasa selaras.
 * EN: Touch/mouse visual editors for cropping and watermarking with synchronized numeric controls.
 */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const html=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const coords=(event,el)=>{const r=el.getBoundingClientRect();return {x:clamp((event.clientX-r.left)/r.width,0,1),y:clamp((event.clientY-r.top)/r.height,0,1)};};

// BM: Kotak crop berinteraksi pada koordinat pecahan, bukan piksel susun atur CSS.
// EN: Crop rectangles use fractional image coordinates, independent of CSS display pixels.
export function cropSelection(stage, source, change){
  stage.replaceChildren();stage.classList.add('visual-stage');
  const img=document.createElement('img');img.className='visual-source';img.src=source;img.alt='Original image, drag the crop edges to select a region';img.draggable=false;img.addEventListener('load',()=>{stage.style.maxWidth=Math.floor(Math.min(780,innerHeight*.68*img.naturalWidth/img.naturalHeight))+'px';});
  const box=document.createElement('div');box.className='crop-selection';box.setAttribute('aria-label','Crop area. Drag to move. Drag a corner to resize.');
  for(const handle of ['nw','ne','sw','se']){const grip=document.createElement('span');grip.className='crop-grip '+handle;grip.dataset.edge=handle;box.append(grip)}
  stage.append(img,box);let rectangle={x:0,y:0,w:1,h:1},drag=null;
  function paint(){box.style.left=rectangle.x*100+'%';box.style.top=rectangle.y*100+'%';box.style.width=rectangle.w*100+'%';box.style.height=rectangle.h*100+'%';}
  function set(r,emit=true){let {x,y,w,h}=r;x=clamp(x,0,.999);y=clamp(y,0,.999);w=clamp(w,.001,1-x);h=clamp(h,.001,1-y);rectangle={x,y,w,h};paint();if(emit)change({...rectangle});}
  box.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();const start=coords(e,stage);drag={start,rect:{...rectangle},edge:e.target.dataset.edge||'move'};box.setPointerCapture?.(e.pointerId)});
  box.addEventListener('pointermove',e=>{if(!drag)return;const p=coords(e,stage),dx=p.x-drag.start.x,dy=p.y-drag.start.y,{rect,edge}=drag;let left=rect.x,top=rect.y,right=rect.x+rect.w,bottom=rect.y+rect.h;
    if(edge==='move'){left=clamp(rect.x+dx,0,1-rect.w);top=clamp(rect.y+dy,0,1-rect.h);right=left+rect.w;bottom=top+rect.h;}
    else{if(edge.includes('w'))left=clamp(rect.x+dx,0,right-.02);if(edge.includes('e'))right=clamp(rect.x+rect.w+dx,left+.02,1);if(edge.includes('n'))top=clamp(rect.y+dy,0,bottom-.02);if(edge.includes('s'))bottom=clamp(rect.y+rect.h+dy,top+.02,1);}
    set({x:left,y:top,w:right-left,h:bottom-top});});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])box.addEventListener(event,()=>{drag=null});
  // BM: Klik di luar kotak membuka pilihan crop baharu secara intuitif.
  // EN: Clicking outside the selection starts a sensible new rectangle.
  stage.addEventListener('pointerdown',e=>{if(e.target!==stage)return;const p=coords(e,stage),w=Math.min(.45,1-p.x),h=Math.min(.45,1-p.y);set({x:p.x,y:p.y,w,h});});
  paint();return {set,get:()=>({...rectangle})};
}

export function watermarkSelection(stage,source,{read,change}){
  stage.replaceChildren();stage.classList.add('visual-stage');
  const img=document.createElement('img');img.src=source;img.className='visual-source';img.alt='Original image with editable watermark';img.draggable=false;img.addEventListener('load',()=>{stage.style.maxWidth=Math.floor(Math.min(780,innerHeight*.68*img.naturalWidth/img.naturalHeight))+'px';paint();});
  const mark=document.createElement('div');mark.className='watermark-selection';mark.innerHTML='<span class="watermark-caption"></span><span class="watermark-grip" title="Drag to resize" aria-label="Drag to resize watermark">↘</span>';
  stage.append(img,mark);let position={x:.5,y:.5,size:6},drag=null;
  const paint=()=>{mark.style.left=position.x*100+'%';mark.style.top=position.y*100+'%';mark.style.fontSize=Math.max(8,stage.clientWidth*position.size/100)+'px';mark.style.opacity=String(clamp(Number(read().opacity)/100,.05,1));mark.style.color=/^#[a-f\d]{6}$/i.test(read().color||'')?read().color:'#ffffff';mark.querySelector('.watermark-caption').textContent=read().mark||'Watermark';};
  const set=(next,emit=true)=>{position={x:clamp(next.x,.01,.99),y:clamp(next.y,.01,.99),size:clamp(next.size,1,40)};paint();if(emit)change({...position});};
  mark.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();drag={start:coords(e,stage),position:{...position},resize:e.target.classList.contains('watermark-grip')};mark.setPointerCapture?.(e.pointerId)});
  mark.addEventListener('pointermove',e=>{if(!drag)return;const p=coords(e,stage),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
    if(drag.resize)set({...drag.position,size:drag.position.size+dx*35+dy*20});else set({...drag.position,x:drag.position.x+dx,y:drag.position.y+dy});});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])mark.addEventListener(event,()=>{drag=null});
  mark.addEventListener('keydown',e=>{const step=e.shiftKey?.025:.01;let p={...position};if(e.key==='ArrowLeft')p.x-=step;else if(e.key==='ArrowRight')p.x+=step;else if(e.key==='ArrowUp')p.y-=step;else if(e.key==='ArrowDown')p.y+=step;else return;e.preventDefault();set(p)});
  mark.tabIndex=0;paint();return {set,get:()=>({...position}),paint};
}

// BM: Lukisan output berkongsi dimensi imej asal, termasuk kelegapan dan penjajaran watermark.
// EN: Output drawing preserves source dimensions and matches the watermark editor values.
export function drawImageWatermark(image,position,{mark,opacity},makeCanvas){const c=makeCanvas(image.naturalWidth,image.naturalHeight),ctx=c.getContext('2d');ctx.drawImage(image,0,0);
  const size=Math.max(12,Math.round(c.width*position.size/100)),x=position.x*c.width,y=position.y*c.height;
  ctx.font=`700 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,size/14);
  ctx.strokeStyle=`rgba(17,24,39,${opacity/180})`;ctx.fillStyle=`rgba(255,255,255,${opacity/100})`;
  ctx.strokeText(mark||'Watermark',x,y,c.width*.92);ctx.fillText(mark||'Watermark',x,y,c.width*.92);return c;}

export const visualField=(label,id,value,min,max)=>`<div class="field"><label for="${id}">${html(label)}</label><input type="number" id="${id}" value="${value}" min="${min}" max="${max}" step="1"/></div>`;
