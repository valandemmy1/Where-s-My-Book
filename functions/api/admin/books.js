const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8'};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
function safeEqual(a,b){
  a=String(a||'');b=String(b||'');if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
export async function onRequestGet({request,env}){
  const supplied=request.headers.get('X-Admin-Key');
  if(!env.ADMIN_KEY)return out({error:'ADMIN_KEY is not configured in this deployment.'},500);
if(!safeEqual(supplied,env.ADMIN_KEY))return out({error:'The admin key does not match.'},401);
  const {results:books=[]}=await env.DB.prepare(`SELECT b.id,b.title,b.author,b.isbn,b.start_city,b.start_region,b.start_country,b.created_at,COUNT(s.id) AS sightings,MAX(s.created_at) AS last_sighting FROM books b LEFT JOIN sightings s ON s.book_id=b.id GROUP BY b.id ORDER BY datetime(b.created_at) DESC LIMIT 1000`).all();
  const totals=await env.DB.prepare(`SELECT (SELECT COUNT(*) FROM books) AS total_books,(SELECT COUNT(*) FROM sightings) AS total_sightings,(SELECT COUNT(DISTINCT book_id) FROM sightings) AS active_books,(SELECT COUNT(DISTINCT country) FROM sightings) AS countries`).first();
  return out({books,stats:totals});
}
