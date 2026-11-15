/* Zrain Admin v8.1: custom, accessible controls and one focused project drawer.
   Built over the original selects, so the existing API/form handlers remain authoritative. */
(()=>{
  'use strict';
  const ready=()=>{
    const body=document.body;
    const editor=document.getElementById('project-editor');
    const railButtons=[...document.querySelectorAll('[data-workspace-section]')];
    const closeButton=document.getElementById('zrEditorClose');
    const scrim=document.getElementById('zrEditorScrim');
    let choiceOpen=null;
    let editorOrigin=null;
    if(body.dataset.adminMode==='preview')body.classList.add('zr-dashboard-visible');

    function chooseSection(section){
      body.dataset.adminSection=section;
      railButtons.forEach(el=>{
        const active=el.dataset.workspaceSection===section;
        el.classList.toggle('is-active',active);
        if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
      });
      if(section==='account')document.getElementById('admin-account').scrollIntoView({block:'start',behavior:'smooth'});
      else document.getElementById('catalog-panel').scrollIntoView({block:'start',behavior:'smooth'});
    }
    railButtons.forEach(button=>button.addEventListener('click',()=>chooseSection(button.dataset.workspaceSection)));
    document.querySelectorAll('[data-workspace-open-editor]').forEach(button=>button.addEventListener('click',()=>document.getElementById('new-project').click()));
    function openEditor(){
      editorOrigin=document.activeElement instanceof HTMLElement?document.activeElement:null;
      body.dataset.editorOpen='true';
      editor.setAttribute('aria-hidden','false');
      closeChoices();
      window.requestAnimationFrame(()=>document.getElementById('field-name').focus({preventScroll:true}));
    }
    function closeEditor(){
      closeChoices();
      body.dataset.editorOpen='false';
      editor.setAttribute('aria-hidden','true');
      if(editorOrigin?.isConnected)editorOrigin.focus({preventScroll:true});
    }
    document.addEventListener('zrain:editor-open',openEditor);
    document.addEventListener('zrain:editor-close',closeEditor);
    document.addEventListener('zrain:workspace-visible',()=>body.classList.add('zr-dashboard-visible'));
    document.addEventListener('zrain:workspace-hidden',()=>{body.classList.remove('zr-dashboard-visible');closeEditor()});
    closeButton?.addEventListener('click',closeEditor);
    scrim?.addEventListener('click',closeEditor);

    const curtain=document.createElement('button');
    curtain.type='button';curtain.className='zr-choice-curtain';curtain.tabIndex=-1;curtain.setAttribute('aria-label','Close selection menu');
    body.append(curtain);curtain.addEventListener('click',closeChoices);
    function closeChoices(){
      if(choiceOpen){choiceOpen.classList.remove('is-open');choiceOpen.querySelector('.zr-choice-trigger')?.setAttribute('aria-expanded','false');choiceOpen=null}
      body.classList.remove('zr-choice-open');
    }
    function openChoice(wrap){
      if(choiceOpen===wrap){closeChoices();return}
      closeChoices();choiceOpen=wrap;
      wrap.classList.remove('is-flipped');
      wrap.classList.add('is-open');
      wrap.querySelector('.zr-choice-trigger').setAttribute('aria-expanded','true');
      body.classList.add('zr-choice-open');
      if(window.innerWidth>580){
        const popup=wrap.querySelector('.zr-choice-menu');
        if(popup.getBoundingClientRect().bottom>window.innerHeight-18 && wrap.getBoundingClientRect().top>popup.getBoundingClientRect().height+18) wrap.classList.add('is-flipped');
      }
      // Ensure a picked option is visible in a long shelf menu.
      const selected=wrap.querySelector('.zr-choice-option.is-selected');
      if(selected)selected.scrollIntoView({block:'nearest'});
    }
    function enhanceSelect(select){
      const id=select.id;
      const category=id==='filter-category'||id==='field-category';
      const wrap=document.createElement('div');
      wrap.className='zr-choice'+(category?' is-category':'');
      wrap.dataset.choiceFor=id;
      select.parentNode.insertBefore(wrap,select);wrap.append(select);
      select.classList.add('zr-choice-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
      const menu=document.createElement('div');menu.className='zr-choice-menu';menu.id='zr-menu-'+id;menu.setAttribute('role','listbox');
      menu.setAttribute('aria-label',id==='filter-category'?'Choose a product category':id==='field-category'?'Project category':'Choose '+id.replace('filter-','').replace('field-',''));
      const trigger=document.createElement('button');trigger.type='button';trigger.id='zr-select-'+id;trigger.className='zr-choice-trigger';
      trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-controls',menu.id);trigger.setAttribute('aria-expanded','false');
      trigger.setAttribute('aria-label',(id==='filter-category'?'Category filter':id==='field-category'?'Project category':id.replace('filter-','')+' filter'));
      trigger.innerHTML='<span class="zr-choice-selected"></span><span aria-hidden="true" class="zr-choice-chevron">⌄</span>';
      wrap.append(trigger,menu);
      const lbl=document.querySelector('label[for="'+id+'"]');if(lbl)lbl.htmlFor=trigger.id;
      const options=[];
      for(const [index,opt] of [...select.options].entries()){
        const btn=document.createElement('button');btn.type='button';btn.className='zr-choice-option';btn.dataset.choiceValue=opt.value;btn.setAttribute('role','option');btn.setAttribute('aria-selected','false');
        if(category){const no=document.createElement('span');no.className='zr-choice-number';no.textContent=index===0&&opt.value==='all'?'✳':String(index+(id==='field-category'?1:0)).padStart(2,'0');btn.append(no)}
        const label=document.createElement('span');label.textContent=opt.textContent;btn.append(label);
        menu.append(btn);options.push(btn);
        btn.addEventListener('click',()=>{
          if(select.value!==opt.value){select.value=opt.value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
          sync();closeChoices();trigger.focus({preventScroll:true});
        });
      }
      function sync(){
        const option=select.selectedOptions[0];trigger.querySelector('.zr-choice-selected').textContent=option?option.textContent:'Choose...';
        options.forEach(btn=>{const selected=btn.dataset.choiceValue===select.value;btn.classList.toggle('is-selected',selected);btn.setAttribute('aria-selected',String(selected))});
        trigger.disabled=select.disabled;
      }
      trigger.addEventListener('click',()=>openChoice(wrap));
      trigger.addEventListener('keydown',e=>{
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){
          e.preventDefault();if(choiceOpen!==wrap)openChoice(wrap);
          const current=options.findIndex(x=>x.dataset.choiceValue===select.value);
          (options[(current+(e.key==='ArrowDown'?1:options.length-1))%options.length]||options[0]).focus();
        }
      });
      menu.addEventListener('keydown',e=>{
        const activeIndex=options.indexOf(document.activeElement);
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){
          e.preventDefault();options[(activeIndex+options.length+(e.key==='ArrowDown'?1:-1))%options.length].focus();
        } else if(e.key==='Home'){e.preventDefault();options[0].focus()}
        else if(e.key==='End'){e.preventDefault();options[options.length-1].focus()}
        else if(e.key==='Tab'){closeChoices()}
      });
      select.addEventListener('change',sync);select.addEventListener('input',sync);
      sync();return sync;
    }
    const syncers=[...document.querySelectorAll('.admin-filters select, #project-form select')].map(enhanceSelect);
    window.zrainSyncChoices=()=>syncers.forEach(fn=>fn());
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        if(choiceOpen){e.preventDefault();const trg=choiceOpen.querySelector('.zr-choice-trigger');closeChoices();trg?.focus({preventScroll:true})}
        else if(body.dataset.editorOpen==='true'){e.preventDefault();closeEditor()}
      }
    });
    document.addEventListener('pointerdown',e=>{
      if(choiceOpen&&!choiceOpen.contains(e.target)&&e.target!==curtain)closeChoices();
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
