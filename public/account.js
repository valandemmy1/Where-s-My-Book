const next=new URLSearchParams(location.search).get('next')||'/my-books.html';
const enc=new TextEncoder();

function toB64Url(bytes){
  let bin='';for(const b of bytes)bin+=String.fromCharCode(b);
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function fromB64Url(s){
  s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
  const bin=atob(s),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;
}
function newSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return toB64Url(a);}
async function passwordProof(password,salt,iterations){
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:fromB64Url(salt),iterations,hash:'SHA-256'},key,256);
  return toB64Url(new Uint8Array(bits));
}

(async()=>{if(await WMB.me())location.href=next;})();
function show(id,msg){const el=document.getElementById(id);el.textContent=msg;el.classList.remove('hidden')}
function busy(form,on,label){const b=form.querySelector('button[type="submit"]');if(!b)return;b.disabled=on;if(on){b.dataset.old=b.textContent;b.textContent=label}else b.textContent=b.dataset.old||b.textContent}

document.getElementById('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,err=document.getElementById('loginError');err.classList.add('hidden');busy(form,true,'Signing In…');
  try{
    const email=document.getElementById('loginEmail').value.trim(),password=document.getElementById('loginPassword').value;
    const prep=await WMB.api('/api/auth/login-info',{method:'POST',body:JSON.stringify({email})});
    const proof=await passwordProof(password,prep.salt,prep.iterations);
    await WMB.api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password_proof:proof})});
    location.href=next;
  }catch(ex){show('loginError',ex.message)}finally{busy(form,false)}
});

document.getElementById('signupForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,err=document.getElementById('signupError');err.classList.add('hidden');
  const password=document.getElementById('signupPassword').value;
  if(password!==document.getElementById('signupConfirm').value){show('signupError','The passwords do not match.');return;}
  if(password.length<12){show('signupError','Use at least 12 characters for your password.');return;}
  busy(form,true,'Securing Account…');
  try{
    const email=document.getElementById('signupEmail').value.trim(),salt=newSalt(),iterations=210000;
    const proof=await passwordProof(password,salt,iterations);
    await WMB.api('/api/auth/register',{method:'POST',body:JSON.stringify({email,password_proof:proof,password_salt:salt,password_iterations:iterations})});
    location.href=next;
  }catch(ex){show('signupError',ex.message)}finally{busy(form,false)}
});
