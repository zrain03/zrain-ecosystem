/*
 * Fail / File: scripts/benchmark-real-models.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-06
 * Dikemas kini / Last updated: 2026-11-06
 * BM: Bandingkan model ONNX sebenar, bukan carian kata kunci atau keputusan palsu.
 * EN: Benchmark actual ONNX models, not keyword search or fabricated results.
 */
import { writeFile } from 'node:fs/promises';
import { INVENTORY } from '../public/ecosystem-inventory.mjs';
import { searchCatalog } from '../public/ecosystem-search-engine.mjs';

const cases = [
 ['saya nak membuang beberapa halaman pdf','remove-pdf-pages','ms',1],
 ['Saya ada 50 muka surat, halaman tujuh hingga dua belas tidak diperlukan dalam PDF','remove-pdf-pages','ms',1],
 ['buang muka surat yang tak diperlukan dari fail PDF','remove-pdf-pages','ms',1],
 ['remove unwanted pages from a PDF','remove-pdf-pages','en',1],
 ['Delete pages 7 to 12 but keep the rest of my PDF','remove-pdf-pages','en',1],
 ['gabungkan beberapa PDF menjadi satu fail','merge-pdf','ms'],
 ['cantumkan dua dokumen pdf tanpa hilang halaman','merge-pdf','ms'],
 ['combine several PDF files into one','merge-pdf','en'],
 ['pisahkan PDF besar kepada fail berasingan','split-pdf','ms'],
 ['split one document into separate PDF files','split-pdf','en'],
 ['susun semula urutan muka surat PDF','pdf-organizer','ms'],
 ['reorder pages in a PDF','pdf-organizer','en'],
 ['potong ruang putih di tepi helaian pdf','crop-pdf','ms'],
 ['trim white margins around PDF pages','crop-pdf','en'],
 ['fail gambar terlalu besar untuk dihantar','image-compressor','ms',1],
 ['reduce photo file size for email attachment','image-compressor','en',1],
 ['ubah ukuran gambar jadi 800 x 600 piksel','image-resizer','ms'],
 ['make my picture 800 pixels wide','image-resizer','en'],
 ['buang latar belakang foto supaya transparent','background-remover','ms'],
 ['remove the background from my product image','background-remover','en'],
 ['ambil tulisan dalam gambar menjadi teks','text-extractor','ms'],
 ['extract text from a screenshot','text-extractor','en'],
 ['nak buat qr code untuk laman web','qr-generator','ms'],
 ['generate a scannable QR code from URL','qr-generator','en'],
 ['saya nak pendekkan pautan laman web','zrain-links','ms'],
 ['shorten a very long URL','zrain-links','en'],
 ['semak sama ada laman web saya masih hidup','zrain-monitor','ms'],
 ['monitor downtime of my website','zrain-monitor','en'],
 ['buat invois untuk pelanggan saya','invoice-generator','ms'],
 ['make a printable bill for a client','invoice-generator','en'],
 ['nak kira jumlah perkataan dalam karangan','text-counter','ms'],
 ['count the words and characters in a paragraph','text-counter','en'],
 ['convert gambar jpg kepada pdf','jpg-to-pdf','mix'],
 ['nak compress gambar before hantar email','image-compressor','mix'],
 ['scan tulisan dalam photo and copy text','text-extractor','mix'],
 ['remove muka surat yang salah dari PDF','remove-pdf-pages','mix',1]
];
const models = [
 {id:'minilm-baseline',model:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',multi:false,e5:false},
 {id:'minilm-v4',model:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',multi:true,e5:false},
 {id:'e5-task-views',model:'Xenova/multilingual-e5-small',multi:true,e5:true},
 {id:'e5-baseline',model:'Xenova/multilingual-e5-small',multi:false,e5:true},
 {id:'minilm-descriptions',model:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',multi:'description',e5:false},
 {id:'minilm-name-description',model:'Xenova/paraphrase-multilingual-MiniLM-L12-v2',revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',multi:'name-description',e5:false},
 {id:'e5-descriptions',model:'Xenova/multilingual-e5-small',multi:'description',e5:true}
];
function views(item,multi){
 const name=String(item.name||'').trim();
 const desc=String(item.description||'').trim();
 const keywords=String(item.keywords||'').trim();
 if(multi==='description')return [desc||name];
 if(multi==='name-description')return [[name,desc].filter(Boolean).join('. ')];
 if(!multi)return [[name,desc,keywords].filter(Boolean).join('. ')];
 return [desc||name,'I need a tool to '+(desc||name).replace(/[.!]+$/,'').replace(/^([A-Z])/,s=>s.toLowerCase())+'.',[name,desc,keywords].filter(Boolean).join('. ')];
}
function unit(raw){
 let norm=0;for(const x of raw)norm+=x*x;
 return Float32Array.from(raw,x=>x/(Math.sqrt(norm)||1));
}
async function encode(extractor,texts){
 const vectors=[];
 for(let i=0;i<texts.length;i+=7){
  const batch=texts.slice(i,i+7);
  const tensor=await extractor(batch,{pooling:'mean',normalize:true});
  const width=tensor.dims?.at(-1);
  if(!Number.isInteger(width)||width<32||tensor.data.length!==batch.length*width)throw Error('Invalid embedding shape');
  for(let j=0;j<batch.length;j++)vectors.push(unit(tensor.data.slice(j*width,(j+1)*width)));
 }
 return vectors;
}
function rank(query,docs,vectors){
 const best=new Map();
 docs.forEach((doc,i)=>{
  let score=0;const vector=vectors[i];
  for(let j=0;j<query.length;j++)score+=query[j]*vector[j];
  if(!best.has(doc.id)||best.get(doc.id)<score)best.set(doc.id,score);
 });
 return [...best].map(([id,score])=>({id,score})).sort((a,b)=>b.score-a.score);
}
function score(rows){
 const sub=lang=>{const x=rows.filter(v=>v.lang===lang);return {n:x.length,top1:x.filter(v=>v.rank===1).length,top3:x.filter(v=>v.rank<=3).length};};
 return {n:rows.length,top1:rows.filter(v=>v.rank===1).length,top3:rows.filter(v=>v.rank<=3).length,criticalTop1:rows.filter(v=>v.critical&&v.rank===1).length,criticalTotal:rows.filter(v=>v.critical).length,ms:sub('ms'),en:sub('en'),mix:sub('mix')};
}
if(INVENTORY.length!==56||INVENTORY.filter(x=>x.kind==='tool').length!==46)throw Error('Unexpected catalog');
const lexical = cases.map(([q,id,lang,critical])=>{
 const ranked=searchCatalog(q,{limit:56,items:INVENTORY});
 return {q,id,lang,critical:Boolean(critical),rank:ranked.findIndex(x=>x.id===id)+1||Infinity,top3:ranked.slice(0,3).map(x=>({id:x.id,score:x.matchScore}))};
});
const lexCorrect=lexical.filter(x=>x.rank===1).length;
console.log('LEXICAL SCORES',JSON.stringify({top1:lexCorrect,top3:lexical.filter(x=>x.rank<=3).length,criticalTop1:lexical.filter(x=>x.critical&&x.rank===1).length}));
console.table(lexical.map(x=>({query:x.q,expected:x.id,rank:x.rank,top:x.top3[0]?.id,score:x.top3[0]?.score,second:x.top3[1]?.score})));

for(const [,id] of cases)if(!INVENTORY.some(item=>item.id===id))throw Error('Unknown expected tool: '+id);
if(process.argv.includes('--self-test')){
 const docs=[{id:'a'},{id:'a'},{id:'b'}];
 const actual=rank(Float32Array.from([1,0]),docs,[Float32Array.from([.2,0]),Float32Array.from([.8,0]),Float32Array.from([.5,0])]);
 if(actual.length!==2||actual[0].id!=='a'||views(INVENTORY[0],true).length!==3)throw Error('Benchmark self test failed');
 console.log('Benchmark self-test passed:',cases.length,'labeled cases.');
 process.exit(0);
}
const {pipeline,env}=await import('@huggingface/transformers');
env.allowRemoteModels=true;
env.allowLocalModels=false;
const output={date:'2026-11-06',catalogCount:INVENTORY.length,models:{}};
for(const configuration of models){
 console.log('Running REAL model:',configuration.id);
 const model=await pipeline('feature-extraction',configuration.model,{dtype:'q8',...(configuration.revision?{revision:configuration.revision}:{})});
 const docs=INVENTORY.flatMap(item=>views(item,configuration.multi).map(text=>({id:item.id,text:(configuration.e5?'passage: ':'')+text})));
 const vectors=await encode(model,docs.map(x=>x.text));
 const rows=[];
 for(const [q,id,lang,critical] of cases){
  const [vector]=await encode(model,[(configuration.e5?'query: ':'')+q]);
  const ranked=rank(vector,docs,vectors);
  const lex=searchCatalog(q,{limit:56,items:INVENTORY});
  const decisive=lex[0]?.matchScore>=100?lex[0].id:null;
  const hybrid=decisive?[{id:decisive,score:1},...ranked.filter(x=>x.id!==decisive)]:ranked;
  rows.push({q,id,lang,critical:Boolean(critical),rank:ranked.findIndex(x=>x.id===id)+1,hybridRank:hybrid.findIndex(x=>x.id===id)+1,decisive,top3:ranked.slice(0,3).map(x=>({id:x.id,score:Number(x.score.toFixed(4))}))});
 }
 const ambiguous=[];
 for(const q of ['memadam','padam','compress','ubah gambar']){
  const [vector]=await encode(model,[(configuration.e5?'query: ':'')+q]);
  ambiguous.push({q,top3:rank(vector,docs,vectors).slice(0,3)});
 }
 output.models[configuration.id]={summary:score(rows),hybridSummary:score(rows.map(r=>({...r,rank:r.hybridRank}))),rows,ambiguous};
 console.log('SCORES',configuration.id,JSON.stringify(output.models[configuration.id].summary));
 console.log('HYBRID SCORES',configuration.id,JSON.stringify(output.models[configuration.id].hybridSummary));
 console.table(rows.filter(x=>x.rank!==1).map(x=>({query:x.q,expected:x.id,rank:x.rank,top:x.top3[0]?.id})));
 await writeFile('zrain-ai-benchmark-results.json',JSON.stringify(output,null,2));
}
console.log('FINAL METRICS',JSON.stringify(Object.fromEntries(Object.entries(output.models).map(([id,x])=>[id,x.summary])),null,2));
