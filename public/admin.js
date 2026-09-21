let adminKey=sessionStorage.getItem('wmb_admin_key')||'';
let allBooks=[];
const keyInput=document.getElementById('adminKey');
keyInput.value=adminKey;

async function loadAdmin(){
  const err=document.getElementById('adminError');
  err.classList.add('hidden');
  adminKey=keyInput.value.trim()||adminKey;
  if(!adminKey){
    err.textContent='Enter your admin key.';
    err.classList.remove('hidden');
    return;
  }
  try{
    const data=await WMB.api('/api/admin/books',{headers:{'X-Admin-Key':adminKey}});
    sessionStorage.setItem('wmb_admin_key',adminKey);
    allBooks=data.books;
    WMB.setText('totalBooks',data.stats.total_books);
    WMB.setText('totalSightings',data.stats.total_sightings);
    WMB.setText('activeBooks',data.stats.active_books);
    WMB.setText('countries',data.stats.countries);
    WMB.setText('totalUsers',data.stats.total_users||0);
    renderRows(allBooks);
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
  }catch(ex){
    err.textContent=ex.message;
    err.classList.remove('hidden');
    sessionStorage.removeItem('wmb_admin_key');
  }
}

function renderRows(rows){
  const body=document.getElementById('bookRows');
  body.replaceChildren();
  for(const b of rows){
    const tr=document.createElement('tr');
    const tdBook=document.createElement('td');
    const link=document.createElement('a');
    link.href=`/book.html?id=${encodeURIComponent(b.id)}`;
    link.textContent=b.title;
    const sub=document.createElement('div');
    sub.textContent=`by ${b.author}`;
    sub.style.cssText='font-size:12px;color:#766b62;margin-top:3px';
    tdBook.append(link,sub);
    tr.appendChild(tdBook);

    const vals=[
      b.id,
      b.owner_email||'Unowned',
      [b.start_city,b.start_region,b.start_country].filter(Boolean).join(', '),
      WMB.formatDate(b.created_at),
      String(b.sightings||0),
      WMB.formatDate(b.last_sighting||b.created_at)
    ];
    for(const val of vals){
      const td=document.createElement('td');
      td.textContent=val;
      tr.appendChild(td);
    }

    const tdActions=document.createElement('td');
    const deleteBtn=document.createElement('button');
    deleteBtn.type='button';
    deleteBtn.className='button danger small';
    deleteBtn.textContent='Delete Book';
    deleteBtn.addEventListener('click',()=>deleteBook(b,deleteBtn));
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);
    body.appendChild(tr);
  }
}

async function deleteBook(book,button){
  const message=`Permanently delete “${book.title}” (${book.id})?\n\nThis will also delete every travel stop for this book. This cannot be undone.`;
  if(!window.confirm(message))return;

  const original=button.textContent;
  button.disabled=true;
  button.textContent='Deleting…';
  try{
    await WMB.api(`/api/admin/books/${encodeURIComponent(book.id)}`,{
      method:'DELETE',
      headers:{'X-Admin-Key':adminKey}
    });
    allBooks=allBooks.filter(b=>b.id!==book.id);
    await loadAdmin();
  }catch(ex){
    window.alert(`Could not delete this book: ${ex.message}`);
    button.disabled=false;
    button.textContent=original;
  }
}

document.getElementById('loginBtn').addEventListener('click',loadAdmin);
document.getElementById('refreshBtn').addEventListener('click',loadAdmin);
document.getElementById('filter').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  renderRows(!q?allBooks:allBooks.filter(b=>[b.id,b.title,b.author,b.owner_email,b.start_city,b.start_region,b.start_country].some(v=>String(v||'').toLowerCase().includes(q))));
});
if(adminKey)loadAdmin();
