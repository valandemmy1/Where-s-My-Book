import {json,normalizeEmail,validEmail,hashPasswordProof,createSession,makeUserId} from '../../_lib/auth.js';
export async function onRequestPost({request,env}){
  try{
    let body;try{body=await request.json()}catch{return json({error:'Invalid request.'},400)}
    const email=normalizeEmail(body.email);
    const proof=String(body.password_proof||'');
    const salt=String(body.password_salt||'');
    const iterations=Number(body.password_iterations||0);
    if(!validEmail(email))return json({error:'Enter a valid email address.'},400);
    if(!/^[A-Za-z0-9_-]{20,40}$/.test(salt))return json({error:'Could not prepare the password securely. Please retry.'},400);
    if(!Number.isInteger(iterations)||iterations<100000||iterations>500000)return json({error:'Invalid password security settings.'},400);
    const exists=await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
    if(exists)return json({error:'An account with that email already exists.'},409);
    const passwordHash=await hashPasswordProof(proof), id=makeUserId();
    await env.DB.prepare('INSERT INTO users (id,email,password_hash,password_salt,password_iterations) VALUES (?,?,?,?,?)').bind(id,email,passwordHash,salt,iterations).run();
    const session=await createSession(env,id);
    return json({user:{id,email}},201,{'Set-Cookie':session.cookie});
  }catch(err){
    console.error('Account registration failed',err);
    return json({error:'Account creation could not be completed. Please try again.'},500);
  }
}
