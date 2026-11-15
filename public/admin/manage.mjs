/*
 * Fail / File: public/admin/manage.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memelihara editor JWT admin dan memetakan kategori baharu kepada enum Worker yang sah.
 * EN: Preserves the JWT admin editor and maps new categories to supported Worker enums.
 */
/**
 * Unified Zrain Admin. Live mode calls the original authenticated Cloudflare
 * Worker API. Preview mode has separate, in-memory demonstration records only.
 * No passwords or JWTs are stored persistently and no public API keys exist.
 */
import { INVENTORY, CATEGORIES } from '../ecosystem-inventory.mjs';
import {setPublishedCatalog, inventoryStats, websiteFor} from '../ecosystem-catalog.mjs';
import {logoFor, sortedByName} from '../ecosystem-links.mjs';
import {categoryFromWorker, categoryToWorker} from './manage-core.mjs';

const API = 'https://zrain-ecosystem-catalog.zrain-dev.workers.dev';
const demo = document.body.dataset.adminMode === 'preview';
const byId = id => document.getElementById(id);
let jwt = null;
let projects = [];
let editingId = null;
const sourceProjects = INVENTORY.filter(item => item.kind === 'project');
const existing = new Map(INVENTORY.map(item => [item.id, item]));
function visibleRecord(row) {
  return row && row.slug !== 'zrain-console' && ['PUBLISHED','DRAFT','ARCHIVED'].includes(row.status);
}

function escapeText(value) { return String(value ?? ''); }
function el(tag, klass, value) {
  const node = document.createElement(tag);
  if (klass) node.className = klass;
  if (value !== undefined) node.textContent = escapeText(value);
  return node;
}
function notice(message, login = false) {
  const area = byId(login ? 'login-notice' : 'dashboard-notice');
  area.textContent = message;
  area.hidden = !message;
}
function validHttps(value, optional = false) {
  if (!value && optional) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.port || value.length > 500)
      return false;
    return url.href;
  } catch { return false; }
}
function slugify(value) {
  return String(value).normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0,80);
}
function sourceProjectFor(row) { return existing.get(row.slug); }
function getSiteUrl(row) {
  return websiteFor(row,sourceProjectFor(row));
}
function repoFor(row) {
  const original = sourceProjectFor(row)?.repoUrl;
  return row.secondaryUrl?.startsWith('https://github.com/') ? row.secondaryUrl :
    row.primaryAction === 'GITHUB' ? row.primaryUrl : original || null;
}
function displayRecords() {
  const rows = projects.filter(visibleRecord);
  return rows.map(row => ({ ...row, uiCategory:categoryFromWorker(row.category, sourceProjectFor(row)?.category) }));
}
function syncInventory() {
  const published = projects.filter(row => row.status === 'PUBLISHED' && visibleRecord(row));
  // BM: Penerbitan admin hanya menyebarkan entri Published, tanpa bypass status Draft.
  // EN: Admin publishes only Published entries; Draft items never leak into the public list.
  // Uses the same published-only reconciliation as the public homepage.
  setPublishedCatalog(published,{managedTools:true});
  return inventoryStats();
}
async function request(path, options = {}) {
  if (demo) throw new Error('Preview mode never sends API requests.');
  const response = await fetch(API + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? {'Content-Type':'application/json'} : {}),
      ...(jwt ? { Authorization: 'Bearer ' + jwt } : {})
    }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { const result=await response.json(); message = result.error || message; } catch {}
    if (response.status === 401 || response.status === 403) {
      if (path !== '/api/admin/auth/login') logout(false);
    }
    throw new Error(message);
  }
  return response.json();
}
function defaultProjects() {
  return sourceProjects.filter(item=>item.id!=='zrain-console').map((item, index) => ({
    id: `demo-${index}`, slug:item.id, name:item.name, description:item.description,
    category:categoryToWorker(item.category), primaryUrl:item.url, primaryAction:'CONSOLE',
    secondaryLabel:item.repoUrl ? 'View on GitHub' : null,
    secondaryUrl:item.repoUrl || null,
    logoUrl:logoFor(item),status:'PUBLISHED'
  }));
}
async function refresh() {
  projects = demo ? projects : await request('/api/admin/products');
  if (!Array.isArray(projects)) throw new Error('Invalid admin catalogue response.');
  syncInventory();
  render();
}
function logout(clearLogin = true) {
  jwt = null;
  editingId = null;
  projects = [];
  byId('admin-list').replaceChildren();
  byId('admin-dashboard').hidden = true;
  document.dispatchEvent(new Event('zrain:workspace-hidden'));
  byId('admin-login').hidden = false;
  if (clearLogin) {byId('login-password').value=''; notice('');}
}
function showDashboard() {
  byId('admin-login').hidden = true;
  byId('admin-dashboard').hidden = false;
  document.dispatchEvent(new Event('zrain:workspace-visible'));
  byId('login-password').value = '';
}

function filterRows() {
  const q = byId('filter-text').value.trim().normalize('NFKD').toLowerCase();
  const category = byId('filter-category').value;
  const kind = byId('filter-kind').value;
  const status = byId('filter-status').value;
  const rows = displayRecords().map(row => ({
    kind:row.kind || existing.get(row.slug)?.kind || 'project', id:row.slug, record:row, name:row.name,
    description:row.description,category:row.uiCategory,status:row.status
  }));
  return sortedByName(rows.filter(item =>
    (category === 'all' || item.category === category) &&
    (kind === 'all' || item.kind === kind) &&
    (status === 'all' || item.status === status) &&
    (!q || [item.name,item.description,item.category,item.id].join(' ').normalize('NFKD').toLowerCase().includes(q))
  ));
}
function render() {
  if (byId('admin-dashboard').hidden && !demo) return;
  const stats = inventoryStats();
  for (const [id,value] of Object.entries({
    'metric-total':stats.total,'metric-projects':stats.projects,
    'metric-tools':stats.tools,'metric-categories':stats.categories,
    'metric-drafts':projects.filter(p=>visibleRecord(p)&&p.status==='DRAFT').length
  })) byId(id).textContent = String(value);

  const filtered = filterRows();
  byId('list-count').textContent = `${filtered.length} visible entries, ${stats.total} public choices`;
  const fragment = document.createDocumentFragment();
  for (const item of filtered) {
    const row = el('article','entry-row');
    const img = el('img');
    img.alt='';img.loading='lazy';img.width=40;img.height=40;
    img.src = item.record.logoUrl === '/zrain-logo.webp' ? '/zrain-mascot.png' : (item.record.logoUrl || '/zrain-mascot.png');
    const copy=el('div','entry-body');copy.append(el('strong','',item.name),el('small','',item.description));
    const tags=el('div','entry-tags');tags.append(el('span','',CATEGORIES.find(c=>c.id===item.category)?.title || item.category));
    tags.append(el('span',item.status==='DRAFT'?'status-draft':item.status==='ARCHIVED'?'status-archived':'',
      item.status==='PUBLISHED'?'Published':item.status==='DRAFT'?'Draft':'Archived'));
    copy.append(tags);
    const buttons=el('div','entry-actions');
    const previewHref = validHttps(getSiteUrl(item.record));
    if (item.status === 'PUBLISHED' && previewHref) {
      const preview=el('a','', 'Web App ↗');preview.href=previewHref;preview.target='_blank';preview.rel='noopener noreferrer';buttons.append(preview);
    }
    const edit=el('button','','Edit');edit.type='button';edit.addEventListener('click',()=>editRow(item.record));buttons.append(edit);
    if(item.record.status !== 'ARCHIVED') {
      const isPublished = item.record.status==='PUBLISHED';
      const toggle=el('button','',isPublished?'Unpublish':'Publish');toggle.type='button';
      toggle.addEventListener('click',()=>updateStatus(item.record,isPublished?'unpublish':'publish'));buttons.append(toggle);
      const archive=el('button','danger','Archive');archive.type='button';
      archive.addEventListener('click',()=>updateStatus(item.record,'archive'));buttons.append(archive);
    }
    row.append(img,copy,buttons);fragment.append(row);
  }
  if(!filtered.length)fragment.append(el('p','hint','No entries match these filters.'));
  byId('admin-list').replaceChildren(fragment);
}
async function updateStatus(row, action) {
  if (action === 'archive' && !confirm(`Archive ${row.name}? This removes it from the public catalogue.`)) return;
  notice('');
  try {
    if(demo) {row.status={publish:'PUBLISHED',unpublish:'DRAFT',archive:'ARCHIVED'}[action];}
    else await request('/api/admin/products/'+encodeURIComponent(row.id)+'/'+action,{method:'POST'});
    if(!demo)await refresh(); else {syncInventory();render();}
    notice(demo?'Preview updated locally. No production data changed.':`${row.name} ${action} successful.`);
  }catch(error){notice(error.message);}
}
function editRow(row) {
  editingId=row.id;
  byId('editor-title').textContent=(row.kind || existing.get(row.slug)?.kind)==='tool' ? 'Edit tool' : 'Edit project';
  byId('field-name').value=row.name;
  byId('field-slug').value=row.slug;
  byId('field-description').value=row.description;
  byId('field-category').value=categoryToWorker(categoryFromWorker(row.category,sourceProjectFor(row)?.category));
  byId('field-url').value=getSiteUrl(row)||'';
  byId('field-github').value=repoFor(row)||'';
  byId('field-playstore').value=row.secondaryUrl?.startsWith('https://play.google.com/')?row.secondaryUrl:'';
  const knownGames={
    '/icons/guess-the-flag.webp':'https://zrain.web.app/icons/guess-the-flag.webp',
    '/icons/memory-rush.webp':'https://zrain.web.app/icons/memory-rush.webp'
  };
  const logo=knownGames[row.logoUrl] || row.logoUrl;
  byId('field-game-logo').value=[
    'https://zrain.web.app/icons/guess-the-flag.webp',
    'https://zrain.web.app/icons/memory-rush.webp'
  ].includes(logo) ? logo : '/zrain-logo.webp';
  updatePreview();
  document.dispatchEvent(new Event('zrain:editor-open'));
  byId('field-name').focus({preventScroll:true});
}
function resetForm() {
  editingId = null;
  byId('project-form').reset();
  byId('editor-title').textContent='Add a project';
  byId('field-category').value='PRODUCTIVITY';
  updatePreview();
}
function updatePreview() {
  const category=byId('field-category').value;
  const isGame=category==='GAMES';
  byId('field-game-logo').disabled=!isGame;
  byId('field-playstore').disabled=!isGame;
  const logo = isGame?byId('field-game-logo').value:null;
  byId('editor-logo').src = logo && logo!=='/zrain-logo.webp'?logo:'/zrain-mascot.png';
  byId('editor-preview-name').textContent=byId('field-name').value.trim()||'Your new project';
  byId('editor-preview-description').textContent=byId('field-description').value.trim()||'Your short description appears here.';
}
function payload() {
  const category=byId('field-category').value;
  const slug=byId('field-slug').value.trim();
  const webUrl=validHttps(byId('field-url').value.trim());
  const repoUrl=validHttps(byId('field-github').value.trim(),true);
  const storeUrl=category==='GAMES'?validHttps(byId('field-playstore').value.trim(),true):null;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Project ID must contain lowercase letters, numbers or hyphens.');
  if(!webUrl)throw new Error('Enter a valid HTTPS Web App URL.');
  if(repoUrl===false||storeUrl===false)throw new Error('An optional URL is invalid.');
  if(repoUrl && !repoUrl.startsWith('https://github.com/'))throw new Error('GitHub link must be hosted on github.com.');
  if(storeUrl && !storeUrl.startsWith('https://play.google.com/store/apps/'))throw new Error('Google Play link must be a real Play Store URL.');
  if (storeUrl && repoUrl && !existing.has(slug)) throw new Error('New games currently support one secondary link. Choose GitHub or Google Play.');
  const secondaryUrl = storeUrl || repoUrl || null;
  return {
    slug,name:byId('field-name').value.trim(),description:byId('field-description').value.trim(),
    category, logoUrl:category==='GAMES'&&byId('field-game-logo').value!=='/zrain-logo.webp'?byId('field-game-logo').value:'/zrain-mascot.png',
    primaryAction:'WEBSITE',primaryLabel:category==='GAMES'?'Play Now':'Open Web App',primaryUrl:webUrl,
    secondaryLabel:storeUrl?'Get on Google Play':repoUrl?'View on GitHub':null,
    secondaryUrl
  };
}
async function save(event) {
  event.preventDefault();
  notice('');
  let product;
  try {product=payload();}catch(error){return notice(error.message);}
  if (projects.some(p=>p.slug===product.slug && p.id!==editingId))return notice('A project with this ID already exists.');
  const wasEditing=Boolean(editingId);
  const button=byId('save-draft');button.disabled=true;
  try {
    if (demo) {
      if (editingId) {
        const row=projects.find(p=>p.id===editingId);
        Object.assign(row,product);
      } else projects.push({...product,id:`demo-new-${Date.now()}`,status:'DRAFT'});
    } else {
      const uri=editingId?'/api/admin/products/'+encodeURIComponent(editingId):'/api/admin/products';
      await request(uri,{method:editingId?'PUT':'POST',body:JSON.stringify(product)});
    }
    resetForm();
    if(!demo)await refresh();else{syncInventory();render();}
    document.dispatchEvent(new Event('zrain:editor-close'));
    notice(demo?'Saved in this preview.':wasEditing?'Catalogue entry updated.':'Project draft saved. Publish it from the catalogue when ready.');
  } catch(error) {notice(error.message);}
  finally {button.disabled=false;}
}

byId('login-form').addEventListener('submit',async event=>{
  event.preventDefault();notice('',true);
  const button=event.submitter;button.disabled=true;
  try {
    const auth=await request('/api/admin/auth/login',{method:'POST',body:JSON.stringify({
      email:byId('login-email').value.trim(),password:byId('login-password').value
    })});
    if(!auth.accessToken)throw new Error('Invalid login response.');
    jwt=auth.accessToken;
    const who=await request('/api/admin/auth/me');
    if(who.role!=='ADMIN')throw new Error('Administrator role required.');
    const status=await request("/api/admin/catalog/status");
    showDashboard();
    setCatalogueActive(status.active === true);
    if(status.active){await refresh();resetForm();}
  }catch(error){logout(false);notice(error.message+' Use the deployed admin URL if local preview origins are not permitted.',true);}
  finally{button.disabled=false;byId('login-password').value='';}
});
function setCatalogueActive(active) {
  byId('catalog-activation').hidden=active;
  byId('admin-dashboard').classList.toggle('catalog-inactive',!active);
}
byId('activate-catalog')?.addEventListener('click',async event=>{
  const button=event.currentTarget;
  button.disabled=true;
  try {
    await request('/api/admin/catalog/activate',{method:'POST'});
    await refresh();
    setCatalogueActive(true);
    resetForm();
  } catch(error) {
    byId('activation-status').textContent=error.message;
  } finally {button.disabled=false;}
});
byId('admin-signout').addEventListener('click',()=>{if(!demo)logout();else notice('Design preview has no account session.');});
byId('new-project').addEventListener('click',()=>{resetForm();document.dispatchEvent(new Event('zrain:editor-open'));byId('field-name').focus({preventScroll:true});});
byId('reset-form').addEventListener('click',resetForm);
byId('project-form').addEventListener('submit',save);
['filter-text','filter-category','filter-kind','filter-status'].forEach(id=>byId(id).addEventListener('input',render));
byId('field-name').addEventListener('input',()=>{
  if(!editingId)byId('field-slug').value=slugify(byId('field-name').value);
  updatePreview();
});
['field-category','field-description','field-game-logo'].forEach(id=>byId(id).addEventListener('input',updatePreview));
byId('password-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(demo)return notice('This is a design preview. Password changes are disabled.');
  const current=byId('current-password').value;
  const next=byId('new-password').value;
  if(next.length<16||next.length>128||next!==byId('confirm-password').value)
    return notice('New passwords must match and contain 16 to 128 characters.');
  try {
    await request('/api/admin/auth/password',{method:'POST',body:JSON.stringify({currentPassword:current,newPassword:next})});
    logout();notice('Password updated. Sign in again.',true);
  }catch(error){notice(error.message);}
  finally{byId('password-form').reset();}
});
resetForm();
if(demo){
  projects=defaultProjects();
  byId('preview-warning').hidden=false;
  showDashboard();
  syncInventory();
  render();
}
