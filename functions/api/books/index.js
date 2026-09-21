import {getUser} from '../../_lib/auth.js';
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);
function makeId(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);return 'WMB-'+[...bytes].map(b=>chars[b%chars.length]).join('');}
export async function onRequestPost({request,env}){
  const user=await getUser(request,env);
  let body;try{body=await request.json()}catch{return out({error:'Invalid request.'},400)}
  const book={title:clean(body.title,160),author:clean(body.author,120),isbn:clean(body.isbn,32),start_city:clean(body.start_city,100),start_region:clean(body.start_region,100),start_country:clean(body.start_country,80)||'United States',starter_note:clean(body.starter_note,600)};
  if(!book.title||!book.author||!book.start_city||!book.start_country)return out({error:'Title, author, starting city, and country are required.'},400);
  for(let attempt=0;attempt<5;attempt++){
    const id=makeId();
    try{
      await env.DB.prepare(`INSERT INTO books (id,title,author,isbn,start_city,start_region,start_country,starter_note,owner_user_id) VALUES (?,?,?,?,?,?,?,?,?)`).bind(id,book.title,book.author,book.isbn||null,book.start_city,book.start_region||null,book.start_country,book.starter_note||null,user?.id||null).run();
      const created=await env.DB.prepare('SELECT * FROM books WHERE id=?').bind(id).first(); return out({book:created},201);
    }catch(e){if(!String(e.message||e).toLowerCase().includes('unique'))return out({error:'Could not register this book.'},500)}
  }
  return out({error:'Could not generate a unique Book ID. Please retry.'},500);
}
export function onRequestGet(){return out({error:'Use a specific Book ID.'},405)}
