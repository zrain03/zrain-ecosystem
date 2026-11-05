/*
 * Fail / File: public/ecosystem-ai-worker.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengasingkan kod pekerja carian AI pilihan supaya ia hanya dimuatkan apabila pengguna meminta.
 * EN: Isolates optional AI-search worker code so it loads only on explicit user request.
 */
/* Optional real multilingual AI embeddings, no LLM backend.
 * Loaded only when a user clicks Enable. Needs >100 MB of model downloads.
 * The browser processes queries locally after loading the model files.
 * This is beta: browsers with little memory or unavailable CDN can fall back.
 */
let encoder=null;
let documents=[];
let vectors=[];
// BM: report: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengasingkan kod pekerja carian AI pilihan supaya ia hanya dimuatkan apabila pengguna meminta.
// EN: report: Isolates one operation so it can be reviewed and tested. Module purpose: isolates optional AI-search worker code so it loads only on explicit user request.
const report=message=>postMessage({type:'progress',message});

function unitVector(raw){const input=Float32Array.from(raw);let norm=0;for(const x of input)norm+=x*x;norm=Math.sqrt(norm)||1;return Float32Array.from(input,x=>x/norm);}
function cosine(a,b){let sum=0;const n=Math.min(a.length,b.length);for(let i=0;i<n;i++)sum+=a[i]*b[i];return sum;}
async function encode(texts){
  const tensor=await encoder(texts,{pooling:'mean',normalize:true});
  const shape=tensor.dims||[];
  const width=shape[shape.length-1];
  const raw=tensor.data;
  if(!Number.isInteger(width)||width<32)throw Error('Unexpected embedding shape');
  const result=[];
  for(let i=0;i<texts.length;i++)result.push(unitVector(raw.slice(i*width,(i+1)*width)));
  return result;
}
self.onmessage=async event=>{
  const data=event.data||{};
  if(data.type==='init'){
    if(encoder)return;
    try{
      report('Downloading multilingual AI runtime (first use)...');
      // ESM CDN runtime is only loaded on opt-in, never by ordinary visitors.
      const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      const {pipeline,env}=lib;
      env.allowLocalModels=false;
      env.allowRemoteModels=true;
      report('Downloading multilingual AI model (large initial download)...');
      encoder=await pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{
        dtype:'q8',
        revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',
        progress_callback:progress=>{
          if(progress?.status==='progress') report('AI model download: '+Math.round(progress.progress||0)+'%');
        }
      });
      documents=Array.isArray(data.items)?data.items.filter(x=>x.id&&x.text):[];
      report('Building local semantic index...');
      // Chunked batches keep memory manageable on average laptops.
      vectors=[];
      for(let i=0;i<documents.length;i+=7){
        const chunk=documents.slice(i,i+7);
        vectors.push(...await encode(chunk.map(x=>x.text)));
        report('Indexing tools '+Math.min(i+chunk.length,documents.length)+'/'+documents.length);
      }
      postMessage({type:'ready'});
    }catch(error){encoder=null;postMessage({type:'error',message:error?.message||String(error)});}
  }
  if(data.type==='reindex'&&encoder){
    try {
      const updated=Array.isArray(data.items)?data.items.filter(x=>x.id&&x.text):[];
      const next=[];
      for(let i=0;i<updated.length;i+=7) {
        const chunk=updated.slice(i,i+7);
        next.push(...await encode(chunk.map(x=>x.text)));
      }
      documents=updated;vectors=next;
      report('Published catalogue synchronized with multilingual AI.');
    } catch { report('AI index refresh unavailable. Fast search stays available.'); }
  }
  if(data.type==='query'&&encoder){
    try{
      const q=(await encode([String(data.query||'')]))[0];
      const ranked=documents.map((doc,i)=>({id:doc.id,score:cosine(q,vectors[i])}))
        .sort((a,b)=>b.score-a.score).slice(0,18);
      postMessage({type:'results',ticket:data.ticket,query:data.query,ranked});
    }catch(error){postMessage({type:'error',message:error?.message||String(error)});}
  }
};
