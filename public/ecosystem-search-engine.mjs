/*
 * Fail / File: public/ecosystem-search-engine.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil.
 * EN: Matches user queries to products and tools with stable ranking.
 */
// Zrain Search: deterministic multilingual intent fallback, no external requests.
// AI model embeddings are opt-in via ecosystem-ai-worker.mjs, not simulated here.
import { getActiveInventory } from './ecosystem-catalog.mjs';

// BM: normalize: Menukar atau mengesahkan input tanpa melangkau sempadan data yang selamat. Tujuan modul: memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil.
// EN: normalize: Transforms or validates input without bypassing safe data boundaries. Module purpose: matches user queries to products and tools with stable ranking.
export const normalize = input => String(input ?? '').normalize('NFKD').toLowerCase()
  .replace(/\p{M}/gu,'').replace(/[\p{P}\p{S}]+/gu,' ').replace(/\s+/g,' ').trim();

const ACTIONS = [
  ['merge-pdf','pdf','gabung|gabungkan|cantum|satukan|combine|merge|join|unir|juntar|fusionner|zusammenfugen|دمج|الجمع|合并|合併|結合|結并|एक साथ|இணை'],
  ['split-pdf','pdf','pecah|pisahkan|separate|split|divide|separar|dividir|diviser|teilen|تقسيم|فصل|拆分|分割|ஒவ்வொரு'],
  ['crop-pdf','pdf','crop|trim|margin|buang margin|potong|cortar|recortar|rogner|قص|裁剪|余白'],
  ['rotate-pdf','pdf','rotate|pusing|putar|rotation|girar|tourner|تدوير|旋转|回転'],
  ['remove-pdf-pages','pdf','buang muka surat|delete page|remove page|padam halaman|hapus halaman|eliminar pagina|supprimer page|حذف صفحة|删除页面|ページ削除'],
  ['extract-pdf-pages','pdf','ambil halaman|ambil muka surat|extract page|select page|take page|extraer pagina|extraire page|استخراج صفحات|提取页面'],
  ['pdf-to-text','pdf','pdf to text|ambil teks|extract text|copy text|baca tulisan|texto pdf|extraire texte|استخراج النص|提取文字|文字を抽出'],
  ['pdf-to-image','pdf','pdf to image|pdf to jpg|pdf to png|page into image|pdf jadi gambar|pdf ke gambar|转换图片|صورة من pdf'],
  ['jpg-to-pdf','image','image to pdf|jpg to pdf|png to pdf|gambar jadi pdf|gambar ke pdf|foto a pdf|图片转pdf|صورة الى pdf'],
  ['pdf-page-numbers','pdf','page number|nombor halaman|nombor muka surat|pagination|numeracion|رقم الصفحة|页码'],
  ['image-compressor','image','compress image|compress photo|kecilkan gambar|kurangkan saiz gambar|reduce photo size|small image|comprimir imagen|压缩图片|ضغط الصورة|缩小图片'],
  ['image-resizer','image','resize image|resize photo|ubah saiz gambar|change dimensions|pixels|dimensiones imagen|redimensionner|تغيير حجم الصورة|调整图片大小'],
  ['image-converter','image','convert image|convert photo|webp|avif|png jpg|jpg png|tukar format gambar|转换图片格式|تحويل الصورة'],
  ['background-remover','image','remove background|buang background|padam latar|remove backdrop|transparent background|quitar fondo|supprimer fond|去背景|背景消除|إزالة الخلفية'],
  ['image-inspector','image','image metadata|exif|photo details|maklumat gambar|camera gps data|metadatos|元数据|بيانات الصورة'],
  ['text-extractor','image','ocr|read image text|ambil tulisan gambar|scan tulisan gambar|tulisan dalam gambar|texto imagen|识别图片文字|استخراج نص صورة'],
  ['qr-generator','any','qr code|qr|kod qr|buat qr|create qr|generate qr|二维码|二維碼|رمز qr|رمز الاستجابة|コード qr|código qr'],
  ['zrain-links','any','short url|short link|link pendek|pendekkan link|shorten link|create short link|缩短链接|اختصار الرابط|acortar enlace'],
  ['zrain-monitor','any','uptime|monitor website|check website down|website offline|server alert|pantau website|服务器监控|مراقبة الموقع'],
  ['invoice-generator','any','invoice|invois|bil pelanggan|bill client|factura|facture|发票|فاتورة|請求書'],
  ['teleprompter','any','teleprompter|script scroll|baca skrip|ucapan|autocue|apuntador|提词器|آلة قراءة النص'],
  ['focus-timer','any','timer|pomodoro|focus time|masa belajar|study session|fokus|集中计时|مؤقت الدراسة'],
  ['json-studio','any','json|format json|validate json|json beautify|json syntax|格式化json|تحقق json'],
  ['jwt-decoder','any','jwt|decode token|inspect token|jwt payload|json web token|jwt 解码|فك jwt'],
  ['uuid-generator','any','uuid|random identifier|unique id|id rawak|guid|唯一标识符'],
  ['hash-generator','any','sha256|sha 256|checksum|hash text|hash generator|散列|تجزئة'],
  ['base64-tool','any','base64|encode decode|pengekodan base64|编码 base64|ترميز base64'],
  ['password-generator','any','password|kata laluan|secure password|contraseña|mot de passe|密码|كلمة مرور'],
  ['csv-cleaner','any','csv|clean table|duplicate rows|buang data pendua|csv temizle|清理csv|تنظيف csv'],
  ['memory-rush','any','memory game|permainan memori|ingat nombor|memory rush|记忆游戏|لعبة الذاكرة'],
  ['guess-the-flag','any','flag game|teka bendera|guess flag|country flags|tebak bendera|猜国旗|علم الدولة'],
];

const OBJECTS = {
  pdf: /pdf|document|dokumen|file|fail|documento|fichier|文件|文档|ملف|ファイル|கோப்பு/iu,
  image: /image|images|picture|photo|foto|gambar|jpeg|jpg|png|webp|heic|تصوير|صورة|图片|照片|写真|படம்/iu,
};

// BM: intentMatches: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil. Input: query.
// EN: intentMatches: Isolates one operation so it can be reviewed and tested. Module purpose: matches user queries to products and tools with stable ranking. Inputs: query.
function intentMatches(query) {
  const found = new Map();
  for (const [id,object,raw] of ACTIONS) {
    const hasObject = object === 'any' || OBJECTS[object].test(query);
    if (!hasObject) continue;
    const terms = raw.split('|').map(term => normalize(term));
    for (const term of terms) {
      if (term && query.includes(term)) {
        const length = term.length;
        found.set(id, Math.max(found.get(id) || 0, 170 + Math.min(length,30)*2));
      }
    }
  }
  // Explicitly avoid turning unrelated generic "compress" into the wrong format.
  return found;
}

// BM: score: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil. Input: item,query,termList,intents.
// EN: score: Isolates one operation so it can be reviewed and tested. Module purpose: matches user queries to products and tools with stable ranking. Inputs: item,query,termList,intents.
function score(item,query,termList,intents) {
  const name=normalize(item.name),description=normalize(item.description),tags=normalize(item.keywords),id=normalize(item.id.replaceAll('-',' '));
  let s = intents.get(item.id) || 0;
  if (!query) return item.kind==='project'?5:0;
  if (name===query || id===query) s+=450;
  else if (name.startsWith(query))s+=210;
  else if (name.includes(query) || id.includes(query))s+=130;
  if (tags.includes(query))s+=85;
  if (description.includes(query))s+=60;
  const tokens = termList.filter(t=>t.length>1);
  if (tokens.length) {
    const hits=tokens.filter(t=>name.includes(t)||tags.includes(t)||description.includes(t));
    if(hits.length===tokens.length) s+=55;
    for(const t of hits) s+=name.includes(t)?20:8;
  }
  return s;
}

// BM: searchCatalog: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil. Input: query,{category='all',kind='all',limit=20,items=getActiveInventory(.
// EN: searchCatalog: Isolates one operation so it can be reviewed and tested. Module purpose: matches user queries to products and tools with stable ranking. Inputs: query,{category='all',kind='all',limit=20,items=getActiveInventory(.
export function searchCatalog(query,{category='all',kind='all',limit=20,items=getActiveInventory()}={}) {
  const q=normalize(query),intent=intentMatches(q);
  const tokens=q.split(' ').filter(Boolean);
  const out=items.filter(x=>(category==='all'||x.category===category)&&(kind==='all'||x.kind===kind))
    .map(item=>({item,score:score(item,q,tokens,intent)}))
    .filter(x=>!q||x.score>0)
    .sort((a,b)=>b.score-a.score||a.item.name.localeCompare(b.item.name));
  return out.slice(0,Math.max(1,Math.min(500,limit))).map(x=>({...x.item,matchScore:x.score}));
}

// BM: suggestionsFor: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memadankan pertanyaan pengguna dengan produk dan tools menggunakan ranking yang stabil. Input: query.
// EN: suggestionsFor: Isolates one operation so it can be reviewed and tested. Module purpose: matches user queries to products and tools with stable ranking. Inputs: query.
export function suggestionsFor(query) {
  return searchCatalog(query,{limit:5});
}
