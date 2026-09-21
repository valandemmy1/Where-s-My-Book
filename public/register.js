const form=document.getElementById('registerForm');
form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const btn=document.getElementById('submitBtn'); const err=document.getElementById('formError');
  err.classList.add('hidden'); btn.disabled=true; btn.textContent='Registering…';
  const payload={title:form.title.value.trim(),author:form.author.value.trim(),isbn:form.isbn.value.trim(),start_city:form.city.value.trim(),start_region:form.region.value.trim(),start_country:form.country.value.trim(),starter_note:form.starterNote.value.trim()};
  try{
    const {book}=await WMB.api('/api/books',{method:'POST',body:JSON.stringify(payload)});
    const url=WMB.bookUrl(book.id);
    WMB.setText('plateCode',book.id); WMB.setText('successTitle', book.title);
WMB.setText('successId', book.id);
    document.getElementById('qr').src=WMB.qrUrl(url);
    document.getElementById('viewJourney').href=`/book.html?id=${encodeURIComponent(book.id)}`;
    document.getElementById('success').classList.remove('hidden');
    document.getElementById('success').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(ex){err.textContent=ex.message;err.classList.remove('hidden');}
  finally{btn.disabled=false;btn.textContent='Create Book Journey';}
});
