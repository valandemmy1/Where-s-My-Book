const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);
const allowed=new Set(['found','reading','passed','released']);
export async function onRequestPost({request,params,env}){
  const bookId=String(params.id||'').toUpperCase();
  const exists=await env.DB.prepare('SELECT id FROM books WHERE id=?').bind(bookId).first();
  if(!exists)return out({error:'We could not find that Book ID.'},404);
  let body;try{body=await request.json()}catch{return out({error:'Invalid request.'},400)}
  const city=clean(body.city,100),region=clean(body.region,100),country=clean(body.country,80)||'United States',note=clean(body.note,600),eventType=allowed.has(body.event_type)?body.event_type:'found';
  if(!city||!country)return out({error:'City and country are required.'},400);
  const result=await env.DB.prepare('INSERT INTO sightings (book_id,city,region,country,event_type,note) VALUES (?,?,?,?,?,?)').bind(bookId,city,region||null,country,eventType,note||null).run();
  return out({ok:true,id:result.meta?.last_row_id},201);
}
