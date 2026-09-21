const form=document.getElementById('registerForm');
let currentUser=null;
(async()=>{
  currentUser=await WMB.me();
  if(currentUser){
    WMB.setText('ownershipLine',`Signed in as ${currentUser.email}. This book will be saved to My Books.`);
  }else{
    WMB.setText('ownershipLine','No account required. Register this book now, or sign in above if you want it saved to My Books.');
    document.getElementById('accountOption').classList.remove('hidden');
  }
})();
form.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const btn=document.getElementById('submitBtn'),err=document.getElementById('formError');
  err.classList.add('hidden');btn.disabled=true;btn.textContent='Registering…';
  const payload={title:form.title.value.trim(),author:form.author.value.trim(),isbn:form.isbn.value.trim(),start_city:form.city.value.trim(),start_region:form.region.value.trim(),start_country:form.country.value.trim(),starter_note:form.starterNote.value.trim()};
  try{
    const {book}=await WMB.api('/api/books',{method:'POST',body:JSON.stringify(payload)});
    const url=WMB.bookUrl(book.id);
    WMB.setText('plateCode',book.id);WMB.setText('successTitle',book.title);WMB.setText('successId',book.id);
    document.getElementById('qr').src=WMB.qrUrl(url);
    document.getElementById('viewJourney').href=`/book.html?id=${encodeURIComponent(book.id)}`;
    if(currentUser){
      WMB.setText('successOwnership','Your book has its own permanent journey page and has been added to My Books.');
      document.getElementById('myBooksButton').classList.remove('hidden');
    }else{
      WMB.setText('successOwnership','Your book has its own permanent journey page. No account was created or required. Save your Book ID or print the bookplate so you can return to its journey later.');
    }
    document.getElementById('success').classList.remove('hidden');
    document.getElementById('success').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(ex){err.textContent=ex.message;err.classList.remove('hidden')}
  finally{btn.disabled=false;btn.textContent='Create Book Journey'}
});
