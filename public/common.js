const WMB = {
  normalizeId(value=''){return value.trim().toUpperCase().replace(/\s+/g,'');},
  escapeText(value=''){return String(value ?? '');},
  formatDate(value){if(!value)return '';const d=new Date(value.endsWith?.('Z')?value:value.replace(' ','T')+'Z');if(Number.isNaN(d.getTime()))return value;return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d);},
  bookUrl(id){return `${location.origin}/book.html?id=${encodeURIComponent(id)}`;},
  qrUrl(target){return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(target)}`;},
  setText(id,value){const el=document.getElementById(id);if(el)el.textContent=value??'';},
  async api(url,options={}){const res=await fetch(url,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})}});let data={};try{data=await res.json()}catch{}if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);return data;},
  async me(){try{return (await this.api('/api/auth/me')).user}catch{return null}},
  async applyAuthNav(){
    const nav=document.querySelector('.navlinks');if(!nav)return;
    const user=await this.me();
    if(user){
      const my=document.createElement('a');my.href='/my-books.html';my.textContent='My Books';nav.appendChild(my);
      const out=document.createElement('a');out.href='#';out.textContent='Log Out';out.addEventListener('click',async e=>{e.preventDefault();try{await WMB.api('/api/auth/logout',{method:'POST'});}catch{}location.href='/';});nav.appendChild(out);
    }else{
      const sign=document.createElement('a');sign.href='/account.html';sign.textContent='Sign In';nav.appendChild(sign);
    }
  }
};
window.WMB=WMB;
document.addEventListener('DOMContentLoaded',()=>WMB.applyAuthNav());
