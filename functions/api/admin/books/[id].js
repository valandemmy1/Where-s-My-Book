const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});

function safeEqual(a,b){
  a=String(a||'');
  b=String(b||'');
  if(!a||!b||a.length!==b.length)return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}

export async function onRequestDelete({request,env,params}){
  const supplied=request.headers.get('X-Admin-Key');
  if(!env.ADMIN_KEY)return out({error:'ADMIN_KEY is not configured in this deployment.'},500);
  if(!safeEqual(supplied,env.ADMIN_KEY))return out({error:'The admin key does not match.'},401);

  const id=String(params.id||'').trim().toUpperCase();
  if(!id)return out({error:'Book ID is required.'},400);

  try{
    const book=await env.DB.prepare('SELECT id,title FROM books WHERE id=?').bind(id).first();
    if(!book)return out({error:'Book not found.'},404);

    await env.DB.batch([
      env.DB.prepare('DELETE FROM sightings WHERE book_id=?').bind(id),
      env.DB.prepare('DELETE FROM books WHERE id=?').bind(id)
    ]);

    return out({ok:true,deleted:{id:book.id,title:book.title}});
  }catch(error){
    console.error('Admin delete book failed',error);
    return out({error:'The book could not be deleted. Please try again.'},500);
  }
}
