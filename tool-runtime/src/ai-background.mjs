/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: U²-Netp (Apache-2.0) mengasingkan subjek pada peranti pengguna; tiada gambar dimuat naik.
 * EN: Apache-2.0 U²-Netp separates subjects locally, without uploading user images.
 * Model: edgetools/u2netp (mirror rembg), first-use download ~4.6 MB. ONNX Runtime Web via pinned CDN.
 */
const MODEL_URL='https://huggingface.co/edgetools/u2netp/resolve/25dee37ab19c5b6ad64ba6578eba63f1ae07720c/u2netp.onnx';
const RUNTIME='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
let loading=null;
async function engine(){
 if(loading)return loading;
 loading=(async()=>{
  if(!window.ort){await new Promise((resolve,reject)=>{const tag=document.createElement('script');tag.src=RUNTIME+'ort.min.js';tag.onload=resolve;tag.onerror=()=>reject(new Error('AI engine unavailable. Check network access.'));document.head.append(tag);});}
  if(!window.ort)throw new Error('AI engine could not initialize.');
  window.ort.env.wasm.wasmPaths=RUNTIME;window.ort.env.wasm.numThreads=1;
  const session=await window.ort.InferenceSession.create(MODEL_URL,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  return {session,ort:window.ort};
 })();loading.catch(()=>{loading=null});return loading;
}
export const alphaFromPredictions=(values,width,height)=>{
 let min=Infinity,max=-Infinity;for(const x of values){if(x<min)min=x;if(x>max)max=x;}
 const result=new Uint8ClampedArray(width*height),scale=max-min>1e-7?255/(max-min):0;
 for(let i=0;i<result.length;i++)result[i]=Math.max(0,Math.min(255,Math.round((values[i]-min)*scale)));
 return result;
};
export async function removeImageBackground(image,{status=()=>{}}={}){
  const w=image.naturalWidth,h=image.naturalHeight;
  if(!w||!h||w*h>16000000)throw Error('Choose an image with up to 16 megapixels for this local AI tool.');
  status('Preparing local AI model. The first run downloads model files.');const {session,ort}=await engine();
  const side=320,small=document.createElement('canvas');small.width=side;small.height=side;
  const smallCtx=small.getContext('2d',{willReadFrequently:true});smallCtx.drawImage(image,0,0,side,side);
  const rgba=smallCtx.getImageData(0,0,side,side).data;
  const mean=[.485,.456,.406],std=[.229,.224,.225],floats=new Float32Array(3*side*side);
  // BM: U²-Netp mengharapkan normalisasi kepada nilai maksimum gambar lalu ImageNet mean/std.
  // EN: U²-Netp expects scaling by the image's maximum value before ImageNet normalization.
  let maxPixel=0;for(let i=0;i<rgba.length;i+=4)for(let ch=0;ch<3;ch++)maxPixel=Math.max(maxPixel,rgba[i+ch]/255);
  maxPixel=Math.max(1e-6,maxPixel);
  for(let i=0;i<side*side;i++)for(let ch=0;ch<3;ch++)floats[ch*side*side+i]=((rgba[4*i+ch]/255/maxPixel)-mean[ch])/std[ch];
  status('Removing background locally…');
  const input=new ort.Tensor('float32',floats,[1,3,side,side]);
  const results=await session.run({[session.inputNames[0]]:input});
  const prediction=results[session.outputNames[0]]?.data;
  if(!prediction||prediction.length<side*side)throw new Error('AI model returned an unexpected mask.');
  const mask=alphaFromPredictions(prediction,side,side),maskCanvas=document.createElement('canvas');maskCanvas.width=side;maskCanvas.height=side;
  const mctx=maskCanvas.getContext('2d'),maskImg=mctx.createImageData(side,side);
  for(let i=0;i<mask.length;i++){maskImg.data[4*i]=255;maskImg.data[4*i+1]=255;maskImg.data[4*i+2]=255;maskImg.data[4*i+3]=mask[i];}
  mctx.putImageData(maskImg,0,0);
  const full=document.createElement('canvas');full.width=w;full.height=h;
  const x=full.getContext('2d');x.drawImage(image,0,0,w,h);
  // BM: Gunakan destination-in supaya tepi separa lutsinar dipelihara ketika mask dibesarkan.
  // EN: Destination-in preserves semi-transparent edges as the mask is upscaled.
  x.globalCompositeOperation='destination-in';x.drawImage(maskCanvas,0,0,w,h);x.globalCompositeOperation='source-over';
  status('Background removed. Choose transparent or a new background.');return full;
}
