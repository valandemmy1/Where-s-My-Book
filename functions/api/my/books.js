import {json,requireUser} from '../../_lib/auth.js';
export async function onRequestGet({request,env}){
  const user=await requireUser(request,env);if(!user)return json({error:'Please sign in.'},401);
  const {results=[]}=await env.DB.prepare(`
    SELECT b.id,b.title,b.author,b.isbn,b.start_city,b.start_region,b.start_country,b.created_at,
      COUNT(s.id) AS sightings, MAX(s.created_at) AS last_sighting,
      COALESCE((SELECT city FROM sightings sx WHERE sx.book_id=b.id ORDER BY datetime(sx.created_at) DESC,sx.id DESC LIMIT 1),b.start_city) AS latest_city,
      COALESCE((SELECT region FROM sightings sx WHERE sx.book_id=b.id ORDER BY datetime(sx.created_at) DESC,sx.id DESC LIMIT 1),b.start_region) AS latest_region,
      COALESCE((SELECT country FROM sightings sx WHERE sx.book_id=b.id ORDER BY datetime(sx.created_at) DESC,sx.id DESC LIMIT 1),b.start_country) AS latest_country
    FROM books b LEFT JOIN sightings s ON s.book_id=b.id
    WHERE b.owner_user_id=? GROUP BY b.id ORDER BY datetime(b.created_at) DESC`).bind(user.id).all();
  return json({user,books:results});
}
