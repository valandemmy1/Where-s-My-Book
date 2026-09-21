import {json,normalizeEmail,hashPasswordProof,safeEqual,createSession} from '../../_lib/auth.js';
export async function onRequestPost({request,env}){
  try{
    let body;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
    const email=normalizeEmail(body.email), proof=String(body.password_proof||'');
    const user=await env.DB.prepare('SELECT id,email,password_hash,password_salt,password_iterations,created_at FROM users WHERE email=?').bind(email).first();
    if(!user)return json({error:'Email or password is incorrect.'},401);
    const candidate=await hashPasswordProof(proof);
    if(!safeEqual(candidate,user.password_hash))return json({error:'Email or password is incorrect.'},401);
    const session=await createSession(env,user.id);
    return json({user:{id:user.id,email:user.email,created_at:user.created_at}},200,{'Set-Cookie':session.cookie});
  }catch(err){console.error('Login failed',err);return json({error:'Sign in could not be completed. Please try again.'},500)}
}
