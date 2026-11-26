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
 const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.ok(source.indexOf('className="reading-grid"')<source.indexOf('className="questions"'));assert.ok(source.includes('bahnwaerter-lesestrecke:v2'));assert.ok(!source.includes('disabled='));assert.ok(/if\s*\(ready\)/.test(source));assert.equal((readFileSync(new URL('../app/legacy-data.ts',import.meta.url),'utf8').match(/id: "/g)||[]).length,7);
});
test('investigation integrates all supplied passage and theory material',()=>{
 const m=JSON.parse(readFileSync(new URL('../app/imported-material.json',import.meta.url)));assert.equal(m.modules.length,9);assert.equal(m.modules.flatMap(x=>x.entries).length,36);assert.equal(m.modules.flatMap(x=>x.entries.flatMap(e=>e.prompts)).length,108);assert.equal(m.theory.length,3);assert.equal(m.lessons.length,7);
 for(const mod of m.modules)for(const e of mod.entries){assert.ok(e.refs.length);e.refs.forEach(p=>assert.ok(text.some(t=>t.page===p)));assert.ok(e.pageHint);}
 const demo=JSON.parse(readFileSync(new URL('../app/demo-material.json',import.meta.url)));assert.equal(demo.segments.length,4);assert.equal(demo.tasks.length,3);
});
test('case starts from the ending and separates historical law from later transfer',()=>{
 const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');assert.ok(/useState\(["']fall["']\)/.test(source));assert.ok(source.indexOf('01 · Fall und Massstab')<source.indexOf('02 · Wie konnte es dazu kommen?'));
 const investigation=readFileSync(new URL('../app/investigation.tsx',import.meta.url),'utf8').replace(/\s+/g,' ');assert.ok(investigation.includes('kein im Text')||investigation.includes('Ein genaues Tatdatum'));assert.ok(investigation.includes('§ 51'));assert.ok(investigation.includes('nicht automatisch eine Einweisung'));assert.ok(investigation.includes('keine Beweise im Fall Thiel'));assert.ok(investigation.includes('case:evidence'));assert.ok(investigation.includes('thiel-ermittlungsbericht.md'));
});

test('all chapter questions offer open perspectives rather than model paragraphs', () => {
 for(const c of chapters) for(const q of c.questions) {
  assert.ok(q.perspectives.length >= 2);
  assert.ok(q.perspectives.every(p => p.length > 45 && p !== q.model));
 }
});
test('writing feedback requests evidence, distinguishes signals, and never awards correctness', async () => {
 const {reviewWriting} = await import('../app/lib/feedback.mjs');
 assert.match(reviewWriting('').join(' '), /Noch kein Entwurf/);
 assert.match(reviewWriting('Thiel ist böse.').join(' '), /Fundstelle ist noch nicht erkennbar/);
 const supported=reviewWriting('Text S. 66: Thiel schweigt, deshalb bleibt sein Motiv jedoch offen.').join(' ');
 assert.match(supported,/Fundstellensignal ist vorhanden/);
 assert.match(supported,/Begründungszusammenhang/);
 assert.match(supported,/Einschränkung oder Gegenposition/);
 assert.doesNotMatch(supported,/richtig beantwortet|volle Punktzahl/);
 assert.match(reviewWriting('Thiel ist Lokführer.').join(' '), /Sachhinweis: Thiel ist Bahnwärter/);
 assert.doesNotMatch(reviewWriting('Thiel ist kein Lokführer.').join(' '), /Sachhinweis/);
});
