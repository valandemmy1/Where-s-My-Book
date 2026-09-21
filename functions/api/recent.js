const JSON_HEADERS={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'public, max-age=30'
};
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});

export async function onRequestGet({env}){
  try{
    const result=await env.DB.prepare(`
      SELECT
        b.id,
        b.title,
        b.author,
        b.start_city,
        b.start_region,
        b.start_country,
        b.created_at,
        (SELECT COUNT(*) FROM sightings s WHERE s.book_id=b.id) AS travel_updates,
        (SELECT s.city FROM sightings s WHERE s.book_id=b.id ORDER BY datetime(s.created_at) DESC, s.id DESC LIMIT 1) AS latest_city,
        (SELECT s.region FROM sightings s WHERE s.book_id=b.id ORDER BY datetime(s.created_at) DESC, s.id DESC LIMIT 1) AS latest_region,
        (SELECT s.country FROM sightings s WHERE s.book_id=b.id ORDER BY datetime(s.created_at) DESC, s.id DESC LIMIT 1) AS latest_country,
        (SELECT s.event_type FROM sightings s WHERE s.book_id=b.id ORDER BY datetime(s.created_at) DESC, s.id DESC LIMIT 1) AS latest_event_type,
        COALESCE(
          (SELECT s.created_at FROM sightings s WHERE s.book_id=b.id ORDER BY datetime(s.created_at) DESC, s.id DESC LIMIT 1),
          b.created_at
        ) AS latest_activity
      FROM books b
      ORDER BY datetime(latest_activity) DESC, datetime(b.created_at) DESC
      LIMIT 6
    `).all();

    return out({books:result.results||[]});
  }catch(err){
    console.error('Recent books lookup failed',err);
    return out({error:'Recent book journeys are temporarily unavailable.'},500);
  }
}
