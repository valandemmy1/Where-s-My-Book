import {json,normalizeEmail,verifyPassword,createSession} from '../../_lib/auth.js';
export async function onRequestPost({request,env}){
  let body;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
  const email=normalizeEmail(body.email), password=String(body.password||'');
  const user=await env.DB.prepare('SELECT id,email,password_hash,password_salt,password_iterations,created_at FROM users WHERE email=?').bind(email).first();
  if(!user || !(await verifyPassword(password,user)))return json({error:'Email or password is incorrect.'},401);
  const session=await createSession(env,user.id);
  return json({user:{id:user.id,email:user.email,created_at:user.created_at}},200,{'Set-Cookie':session.cookie});
}
