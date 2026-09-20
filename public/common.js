const WMB = {
  normalizeId(value='') {
    return value.trim().toUpperCase().replace(/\s+/g,'');
  },
  escapeText(value='') {
    return String(value ?? '');
  },
  formatDate(value) {
    if (!value) return '';
    const d = new Date(value.endsWith?.('Z') ? value : value.replace(' ', 'T') + 'Z');
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(d);
  },
  bookUrl(id) {
    const base = `${location.origin}${location.pathname.includes('/book.html') ? location.pathname.replace(/book\.html.*$/,'') : '/'}`;
    return `${location.origin}/book.html?id=${encodeURIComponent(id)}`;
  },
  qrUrl(target) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(target)}`;
  },
  setText(id, value) {
    const el=document.getElementById(id); if(el) el.textContent=value ?? '';
  },
  async api(url, options={}) {
    const res = await fetch(url, {
      ...options,
      headers: {'Content-Type':'application/json', ...(options.headers||{})}
    });
    let data={};
    try{data=await res.json();}catch{}
    if(!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }
};
window.WMB=WMB;
