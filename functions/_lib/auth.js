const enc = new TextEncoder();

export function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extraHeaders}});
}

function toB64Url(bytes){
  let bin=''; for(const b of bytes) bin+=String.fromCharCode(b);
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a;}
function randomToken(n=32){return toB64Url(randomBytes(n));}
export function randomSalt(){return toB64Url(randomBytes(16));}
export function makeUserId(){return 'USR-'+randomToken(9).replace(/[^A-Za-z0-9]/g,'').slice(0,12).toUpperCase();}

export function normalizeEmail(v){return String(v||'').trim().toLowerCase().slice(0,254);}
export function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
export function safeEqual(a,b){a=String(a||'');b=String(b||'');if(!a||!b||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}

// Password stretching is deliberately performed in the browser so it does not
// consume the very small CPU allowance of a free Cloudflare Pages Function.
// The server stores SHA-256(client PBKDF2 proof), not the proof itself.
export async function hashPasswordProof(proof){
  const value=String(proof||'').trim();
  if(!/^[A-Za-z0-9_-]{40,60}$/.test(value))throw new Error('Invalid password proof.');
  const dig=await crypto.subtle.digest('SHA-256',enc.encode(value));
  return toB64Url(new Uint8Array(dig));
}

async function sha256(value){const dig=await crypto.subtle.digest('SHA-256',enc.encode(value));return toB64Url(new Uint8Array(dig));}
function cookieValue(request,name){
  const raw=request.headers.get('Cookie')||'';
  for(const part of raw.split(';')){const i=part.indexOf('=');if(i<0)continue;const k=part.slice(0,i).trim();if(k===name)return decodeURIComponent(part.slice(i+1).trim());}
  return '';
}
export async function createSession(env,userId){
  const token=randomToken(32), tokenHash=await sha256(token), days=30;
  const expires=new Date(Date.now()+days*86400000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(tokenHash,userId,expires).run();
  const cookie=`wmb_session=${encodeURIComponent(token)}; Path=/; Max-Age=${days*86400}; HttpOnly; Secure; SameSite=Lax`;
  return {cookie,expires};
}
export function clearSessionCookie(){return 'wmb_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';}
export async function deleteSession(request,env){const token=cookieValue(request,'wmb_session');if(!token)return;await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();}
export async function getUser(request,env){
  const token=cookieValue(request,'wmb_session'); if(!token)return null;
  const tokenHash=await sha256(token);
  return await env.DB.prepare(`SELECT u.id,u.email,u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND datetime(s.expires_at)>datetime('now') LIMIT 1`).bind(tokenHash).first();
}
export async function requireUser(request,env){return await getUser(request,env);}
