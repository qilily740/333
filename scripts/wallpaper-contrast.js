(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisWallpaperContrast=api})(typeof globalThis==='object'?globalThis:null,function(env){
 'use strict';
 const variables=['ink','glass','border','active-glass','active-ink','field-ink'],states=new WeakMap(),images=new Map();
 const linear=value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4};
 const luminance=rgb=>.2126*linear(rgb[0])+.7152*linear(rgb[1])+.0722*linear(rgb[2]);
 function palette(pixels){
  let r=0,g=0,b=0,n=0;
  for(let i=0;i+3<pixels.length;i+=4){const alpha=pixels[i+3]/255;r+=pixels[i]*alpha+255*(1-alpha);g+=pixels[i+1]*alpha+255*(1-alpha);b+=pixels[i+2]*alpha+255*(1-alpha);n++}
  const rgb=n?[r/n,g/n,b/n]:[255,255,255],dark=luminance(rgb)<.32;
  const tint=rgb.map(value=>Math.round(dark?value*.32+12:value*.12+224));
  const ink=dark?'#ffffff':'#26313f';
  return{ink,glass:`rgba(${tint.join(',')},${dark?'.42':'.48'})`,border:dark?'rgba(255,255,255,.38)':'rgba(255,255,255,.78)','active-glass':dark?'rgba(255,255,255,.18)':'rgba(38,49,63,.09)','active-ink':ink,'field-ink':ink};
 }
 function coverRegion(iw,ih,vw,vh){const scale=Math.max(vw/iw,vh/ih),width=vw/scale,height=vh/scale;return[(iw-width)/2,(ih-height)/2+height*.72,width,height*.28]}
 function image(source){
  if(images.has(source)){const cached=images.get(source);images.delete(source);images.set(source,cached);return cached}
  const task=new Promise((resolve,reject)=>{const item=new env.Image();let timer;const finish=(error)=>{env.clearTimeout(timer);item.onload=item.onerror=null;error?reject(error):resolve(item)};item.crossOrigin='anonymous';item.onload=()=>finish();item.onerror=()=>finish(Error('Wallpaper unavailable'));timer=env.setTimeout(()=>finish(Error('Wallpaper timeout')),10000);item.src=source});
  images.set(source,task);while(images.size>8)images.delete(images.keys().next().value);task.catch(()=>{if(images.get(source)===task)images.delete(source)});return task;
 }
 function paint(element,colors){for(const name of variables)element.style.setProperty('--imessage-'+name,colors[name])}
 function clear(element){const state=states.get(element);state?.observer?.disconnect();states.delete(element);for(const name of variables)element.style.removeProperty('--imessage-'+name)}
 async function sync(element,source,enabled=true){
  if(!element)return false;if(!enabled){clear(element);return false}
  const width=element.clientWidth||360,height=element.clientHeight||800,key=`${width}:${height}`;
  let state=states.get(element);if(state?.key===key&&state.source===source)return state.task;
  if(!state){state={};states.set(element,state);if(env.ResizeObserver){state.observer=new env.ResizeObserver(()=>{if(states.get(element)===state)void sync(element,state.source,true)});state.observer.observe(element)}}
  state.key=key;state.source=source;paint(element,palette([]));
  state.task=(async()=>{if(!source)return true;try{
   const bitmap=await image(source);if(states.get(element)!==state||state.key!==key||state.source!==source||!element.isConnected)return false;
   const canvas=env.document.createElement('canvas');canvas.width=64;canvas.height=24;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return false;
   const crop=coverRegion(bitmap.naturalWidth,bitmap.naturalHeight,width,height);context.drawImage(bitmap,...crop,0,0,64,24);
   const colors=palette(context.getImageData(0,0,64,24).data);if(states.get(element)!==state||state.key!==key||state.source!==source)return false;paint(element,colors);return true;
  }catch{return false}})();return state.task;
 }
 return{palette,coverRegion,sync,clear};
});
