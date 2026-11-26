import assert from 'node:assert/strict';
const BASE=process.env.VIDEO_API||'http://127.0.0.1:8792';
async function call(path,method='GET',data,key,raw){const r=await fetch(BASE+path,{method,headers:{Origin:'https://patrickfischerksa.github.io',...(key?{Authorization:'Bearer '+key}:{}),...(data?{'Content-Type':'application/json'}:{})},body:raw|| (data?JSON.stringify(data):undefined)});return{status:r.status,data:await r.json()};}
const bytes=new Uint8Array(1000);bytes.set([0x1a,0x45,0xdf,0xa3]);
let room;
const login=await call("/teacher/login","POST",{password:process.env.TEACHER_TEST_PASSWORD||"Thiel-Testzugang-2026"});assert.equal(login.status,200);const teacher=login.data.key;
assert.equal((await call("/rooms","POST",{count:1})).status,401);
try {
 const c=await call('/rooms','POST',{title:'Automatischer Funktionstest',count:2},teacher);assert.equal(c.status,201,JSON.stringify(c));room=c.data;const root='/rooms/'+room.id;const a=room.invites[0],b=room.invites[1];
 const roster=await call(root+'/invites','GET',null,teacher);assert.equal(roster.data.invites.length,2);assert.equal(roster.data.invites[0].key,a.key);assert.equal((await call(root+'/invites','GET',null,a.key)).status,403);
 assert.equal((await call(root+'/invites/'+a.id,'PUT',{assigned:'Privates Testkürzel'},teacher)).status,200);
 assert.ok(!JSON.stringify((await call(root,'GET',null,b.key)).data).includes('Privates Testkürzel'));
 assert.ok((await call('/teacher/rooms','GET',null,teacher)).data.rooms.some(r=>r.id===room.id));
 assert.equal((await call(root)).status,401);
 assert.equal((await call(root,'GET',null,b.key)).data.person.id,b.id);
 assert.equal((await call(root+'/phase','POST',{phase:'view'},a.key)).status,403);
 const invalid=await call(root+'/videos','POST',{duration:30},a.key);assert.equal(invalid.status,400);
 const meta={title:'Testplädoyer',stance:'Psychiatrie',law:'§ 51: Zustand zur Tatzeit bleibt zu prüfen.',context:'Krafft-Ebing 1875: Untersuchung statt Diagnose aus der Tat.',counter:'Eine spätere Krise beweist den Tatzeit-Zustand nicht.',duration:120,bytes:1000,mime:'video/webm'};
 const video=await call(root+'/videos','POST',meta,a.key);assert.equal(video.status,201,JSON.stringify(video));const v=root+'/videos/'+video.data.id;
 assert.equal((await call(v,'PUT',null,b.key,bytes)).status,403);
 assert.equal((await call(v,'PUT',null,a.key,bytes)).status,200);
 assert.equal((await call(root,'GET',null,b.key)).data.videos.length,0);
 assert.equal((await fetch(BASE+v+'/media?key='+b.key)).status,403);
 assert.equal((await call(v+'/approve','POST',{},room.key)).status,200);
 const media=await fetch(BASE+v+'/media?key='+b.key,{headers:{Range:'bytes=0-9'}});assert.equal(media.status,206);assert.equal((await media.arrayBuffer()).byteLength,10);assert.equal(media.headers.get('Content-Range'),'bytes 0-9/1000');
 assert.equal((await call(root+'/vote','POST',{choice:'Psychiatrie',reason:'Krafft-Ebing verlangt zuerst eine Untersuchung.'},b.key)).status,403);
 assert.equal((await call(root+'/phase','POST',{phase:'view'},room.key)).status,200);
 assert.equal((await call(v,'DELETE',null,room.key)).status,400);
 assert.equal((await call(root+'/phase','POST',{phase:'vote'},room.key)).status,200);
 assert.equal((await call(root+'/vote','POST',{choice:'Psychiatrie',reason:'Krafft-Ebing verlangt zuerst eine Untersuchung.'},b.key)).status,400);
 assert.equal((await call(root+'/confirm-viewing','POST',{note:'Alle Testteilnehmenden haben gemeinsam sämtliche Beiträge gesehen.'},room.key)).status,200);
 assert.equal((await call(root+'/vote','POST',{choice:'Psychiatrie',reason:'Krafft-Ebing verlangt zuerst eine Untersuchung.'},b.key)).status,200);
 assert.equal((await call(root+'/vote','POST',{choice:'Gefängnis',reason:'Geänderte begründete Empfehlung im Test.'},b.key)).status,200);
 const hidden=await call(root,'GET',null,room.key);assert.equal(hidden.data.votes,1);assert.equal(hidden.data.result,null);
 assert.equal((await call(root+'/phase','POST',{phase:'closed'},room.key)).status,200);
 const final=await call(root,'GET',null,a.key);assert.deepEqual(final.data.result,[{choice:'Gefängnis',n:1}]);
 assert.equal((await call(root+'/vote','POST',{choice:'Psychiatrie',reason:'Zu spät eingereichte Stimme im Test.'},b.key)).status,403);
 console.log('PASS: room isolation, uploads, private media ranges, moderation, viewing requirement, single vote/update, hidden results and closed vote');
} finally {if(room){assert.equal((await call('/rooms/'+room.id,'DELETE',null,room.key)).status,200);assert.equal((await call('/rooms/'+room.id,'GET',null,room.key)).status,404);await call('/teacher/forget-room','POST',{id:room.id},teacher);await call('/teacher/logout','POST',{},teacher);assert.equal((await call('/teacher/rooms','GET',null,teacher)).status,401);console.log('PASS: test room deleted and session revoked');}}
