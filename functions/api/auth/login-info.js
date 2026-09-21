import {json,normalizeEmail,randomSalt} from '../../_lib/auth.js';
export async function onRequestPost({request,env}){
  let body;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
  const email=normalizeEmail(body.email);
  try{
    const user=await env.DB.prepare('SELECT password_salt,password_iterations FROM users WHERE email=?').bind(email).first();
    // Return plausible settings even for an unknown email so this endpoint does not
    // become a simple account-enumeration check.
    return json({salt:user?.password_salt||randomSalt(),iterations:Number(user?.password_iterations||210000)});
  }catch(err){console.error('Login preparation failed',err);return json({error:'Sign-in could not be prepared.'},500)}
}
