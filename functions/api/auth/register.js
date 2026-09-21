import {json,normalizeEmail,validEmail,createPasswordRecord,createSession,makeUserId} from '../../_lib/auth.js';
export async function onRequestPost({request,env}){
  let body;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
  const email=normalizeEmail(body.email), password=String(body.password||'');
  if(!validEmail(email))return json({error:'Enter a valid email address.'},400);
  if(password.length<10)return json({error:'Password must be at least 10 characters.'},400);
  const exists=await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if(exists)return json({error:'An account with that email already exists.'},409);
  const rec=await createPasswordRecord(password), id=makeUserId();
  try{await env.DB.prepare('INSERT INTO users (id,email,password_hash,password_salt,password_iterations) VALUES (?,?,?,?,?)').bind(id,email,rec.hash,rec.salt,rec.iterations).run();}
  catch{return json({error:'Could not create the account.'},500)}
  const session=await createSession(env,id);
  return json({user:{id,email}},201,{'Set-Cookie':session.cookie});
}
