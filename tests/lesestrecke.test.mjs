import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {assess,factWarnings} from '../app/lib/feedback.mjs';
const chapters=JSON.parse(readFileSync(new URL('../app/chapters.json',import.meta.url)));
const text=JSON.parse(readFileSync(new URL('../app/text.json',import.meta.url)));
test('eight freely selectable chapters cover the full text and film without gaps',()=>{
 assert.equal(chapters.length,8);assert.equal(chapters[0].start,0);assert.equal(chapters.at(-1).end,4340.04);
 const covered=[];chapters.forEach((c,i)=>{if(i)assert.equal(chapters[i-1].end,c.start);for(let p=c.pages[0];p<=c.pages[1];p++)covered.push(p);assert.ok(existsSync(new URL('../public/media/'+c.id+'.jpg',import.meta.url)));});
 assert.deepEqual(covered,text.map(p=>p.page));assert.equal(covered[0],3);assert.equal(covered.at(-1),66);
});
test('all questions have models, criteria and valid textual references',()=>{
 const ids=new Set(); for(const c of chapters)for(const q of c.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.model.length>100);assert.ok(q.criteria.length>1);q.refs.forEach(p=>assert.ok(text.some(t=>t.page===p)));}
 assert.equal(ids.size,32);
});
test('feedback accepts inflection, paraphrases, umlauts and small typos',()=>{
 const q=chapters[0].questions[0];const result=assess('Er arbeitet gewissenhaft an der Bahn. Sonntags besucht er den Gottesdienst und trägt seine saubere Uniform.',q.criteria);assert.equal(result.missing.length,0);
 assert.equal(assess('Gottesdiennst',[{label:'Religion',terms:['gottesdienst']}]).found.length,1);
 assert.equal(assess('Wärter',[{label:'Beruf',terms:['waerter']}]).found.length,1);
});
test('explicit incorrect facts get sourced corrections, negations do not',()=>{
 assert.equal(factWarnings('Thiel ist Lokführer.')[0].page,3);
 assert.equal(factWarnings('Thiel ist nicht Lokführer.').length,0);
 assert.equal(factWarnings('Lene ist die leibliche Mutter von Tobias.')[0].page,5);
 assert.equal(factWarnings('Thiel stirbt.',[66])[0].page,66);
 assert.equal(factWarnings('Thiel stirbt.',[3]).length,0);
});
test('empty and unrelated answers are not accepted',()=>{assert.equal(assess('',chapters[0].questions[0].criteria).found.length,0);assert.equal(assess('Pizza',chapters[0].questions[0].criteria).found.length,0);});
test('reader precedes questions and original saved-work key remains',()=>{
 const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.ok(source.indexOf('className="reading-grid"')<source.indexOf('className="questions"'));assert.ok(source.includes('bahnwaerter-lesestrecke:v2'));assert.ok(!source.includes('disabled='));assert.ok(source.includes('if(ready)'));assert.equal((readFileSync(new URL('../app/legacy-data.ts',import.meta.url),'utf8').match(/id: "/g)||[]).length,7);
});
