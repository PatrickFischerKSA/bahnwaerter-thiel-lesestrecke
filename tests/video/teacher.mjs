import assert from 'node:assert/strict';
const base=process.env.VIDEO_API||'http://127.0.0.1:8792',password=process.env.TEACHER_TEST_PASSWORD||'Thiel-Testzugang-2026';
async function req(path,method='GET',body,key){const r=await fetch(base+path,{method,headers:{...(key?{Authorization:'Bearer '+key}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return{status:r.status,data:await r.json()};}
let teacher,room;
try{
 assert.equal((await req('/teacher/rooms')).status,401);
 const login=await req('/teacher/login','POST',{password});assert.equal(login.status,200);teacher=login.data.key;
 const created=await req('/rooms','POST',{title:'Test geschützter Lehrerbereich',count:2},teacher);assert.equal(created.status,201);room=created.data;
 assert.equal((await req('/teacher/import-room','POST',{id:room.id,key:room.invites[0].key},teacher)).status,403);
 assert.equal((await req('/teacher/import-room','POST',{id:room.id,key:room.key,invites:room.invites},teacher)).status,200);
 const roster=await req('/rooms/'+room.id+'/invites','GET',null,teacher);assert.deepEqual(roster.data.invites.map(x=>x.key),room.invites.map(x=>x.key));
 assert.equal((await req('/rooms/'+room.id+'/invites/'+room.invites[0].id,'PUT',{assigned:'Geheim'},room.invites[1].key)).status,403);
 await req('/teacher/logout','POST',{},teacher);assert.equal((await req('/rooms/'+room.id+'/invites','GET',null,teacher)).status,401);
 console.log('PASS: server-side login, owner proof, exact invitation migration, student isolation, session revocation');
}finally{if(room)await req('/rooms/'+room.id,'DELETE',null,room.key);}
