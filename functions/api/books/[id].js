const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
export async function onRequestGet({params,env}){
  const id=String(params.id||'').toUpperCase();
  const book=await env.DB.prepare('SELECT * FROM books WHERE id=?').bind(id).first();
  if(!book)return out({error:'We could not find that Book ID.'},404);
  const {results=[]}=await env.DB.prepare('SELECT id,book_id,city,region,country,event_type,note,created_at FROM sightings WHERE book_id=? ORDER BY datetime(created_at) ASC, id ASC').bind(id).all();
  return out({book,sightings:results});
}
