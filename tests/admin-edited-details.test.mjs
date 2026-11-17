import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcilePublishedCatalog} from '../public/ecosystem-catalog.mjs';

test('published catalogue reflects edited and removed repository links',()=>{
  const row={slug:'zrain-links',name:'Edited name',description:'Edited description',category:'PRESENCE',status:'PUBLISHED',primaryAction:'WEBSITE',primaryUrl:'https://zrain-links.web.app/',secondaryUrl:'https://github.com/zrain03/changed'};
  const edited=reconcilePublishedCatalog([row],undefined,{managedTools:true})[0];
  assert.equal(edited.name,'Edited name');
  assert.equal(edited.description,'Edited description');
  assert.equal(edited.repoUrl,'https://github.com/zrain03/changed');
  assert.equal(reconcilePublishedCatalog([{...row,secondaryUrl:null}],undefined,{managedTools:true})[0].repoUrl,null);
  assert.equal(reconcilePublishedCatalog([{...row,secondaryUrl:'https://github.com/another-owner/project'}],undefined,{managedTools:true})[0].repoUrl,'https://github.com/another-owner/project');
  assert.equal(reconcilePublishedCatalog([{...row,secondaryUrl:'https://github.com.attacker.example/project'}],undefined,{managedTools:true})[0].repoUrl,null);
});
