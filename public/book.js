const params=new URLSearchParams(location.search); const bookId=WMB.normalizeId(params.get('id')||'');
async function loadBook(){
  const loading=document.getElementById('loading'), error=document.getElementById('error'), content=document.getElementById('content');
  if(!bookId){loading.classList.add('hidden');error.textContent='No Book ID was provided.';error.classList.remove('hidden');return;}
  try{
    const {book,sightings}=await WMB.api(`/api/books/${encodeURIComponent(bookId)}`);
    document.title=`${book.title} — Where's My Book?`;
    WMB.setText('bookId',book.id); WMB.setText('bookTitle',book.title); WMB.setText('bookAuthor',book.author);
    WMB.setText('origin',`Started in ${[book.start_city,book.start_region,book.start_country].filter(Boolean).join(', ')}`);
    WMB.setText('registered',`Registered ${WMB.formatDate(book.created_at)}`);
    const cities=new Set(sightings.map(s=>`${s.city}|${s.region||''}|${s.country}`)); const countries=new Set(sightings.map(s=>s.country));
    WMB.setText('stopCount',sightings.length); WMB.setText('cityCount',cities.size); WMB.setText('countryCount',countries.size);
    renderTimeline(book,sightings);
    loading.classList.add('hidden'); content.classList.remove('hidden');
  }catch(ex){loading.classList.add('hidden');error.textContent=ex.message;error.classList.remove('hidden');}
}
function renderTimeline(book,sightings){
  const root=document.getElementById('timeline'); root.replaceChildren();
  const entries=[{city:book.start_city,region:book.start_region,country:book.start_country,note:book.starter_note||'This book began its journey.',created_at:book.created_at,event_type:'started'},...sightings];
  for(const s of entries){
    const row=document.createElement('div');row.className='timeline-item';const dot=document.createElement('div');dot.className='dot';const c=document.createElement('div');c.className='timeline-content';const h=document.createElement('h4');h.textContent=[s.city,s.region,s.country].filter(Boolean).join(', ');const time=document.createElement('time');time.textContent=`${label(s.event_type)} · ${WMB.formatDate(s.created_at)}`;c.append(h,time);if(s.note){const p=document.createElement('p');p.textContent=s.note;c.append(p)}row.append(dot,c);root.append(row);
  }
}
function label(t){return({started:'Journey started',found:'Found',reading:'Reading',passed:'Passed along',released:'Released for another reader'})[t]||'Stop'}
document.getElementById('sightingForm').addEventListener('submit',async(e)=>{
  e.preventDefault(); const btn=document.getElementById('addStopBtn'),err=document.getElementById('sightingError'),ok=document.getElementById('sightingSuccess');err.classList.add('hidden');ok.classList.add('hidden');btn.disabled=true;btn.textContent='Adding…';
  const payload={city:document.getElementById('city').value.trim(),region:document.getElementById('region').value.trim(),country:document.getElementById('country').value.trim(),event_type:document.getElementById('eventType').value,note:document.getElementById('note').value.trim()};
  try{await WMB.api(`/api/books/${encodeURIComponent(bookId)}/sightings`,{method:'POST',body:JSON.stringify(payload)});ok.classList.remove('hidden');document.getElementById('note').value='';await loadBook();}
  catch(ex){err.textContent=ex.message;err.classList.remove('hidden');}
  finally{btn.disabled=false;btn.textContent='Add My Stop';}
});
loadBook();
