function locationText(city,region,country){
  return [city,region,country].filter(Boolean).join(', ');
}
function activityLabel(type){
  return ({found:'Found',reading:'Reading',passed:'Passed along',released:'Released for another reader'})[type]||'Journey update';
}
function make(tag,className,text){
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=text;
  return el;
}
async function loadRecentBooks(){
  const loading=document.getElementById('recentLoading');
  const empty=document.getElementById('recentEmpty');
  const grid=document.getElementById('recentGrid');
  if(!grid)return;
  try{
    const {books=[]}=await WMB.api('/api/recent');
    loading?.classList.add('hidden');
    if(!books.length){empty?.classList.remove('hidden');return;}
    grid.replaceChildren();
    for(const book of books){
      const card=make('article','recent-card');
      const top=make('div','recent-card-top');
      top.append(make('span','recent-code',book.id));
      top.append(make('span','recent-date',WMB.formatDate(book.latest_activity)));
      card.append(top);

      card.append(make('h3','',book.title));
      card.append(make('p','recent-author',`by ${book.author}`));

      const route=make('div','recent-route');
      const origin=make('div','recent-place');
      origin.append(make('span','recent-place-label','Started'));
      origin.append(make('strong','',locationText(book.start_city,book.start_region,book.start_country)));
      route.append(origin);

      const arrow=make('div','recent-arrow','→');
      route.append(arrow);

      const latest=make('div','recent-place');
      if(Number(book.travel_updates)>0){
        latest.append(make('span','recent-place-label',activityLabel(book.latest_event_type)));
        latest.append(make('strong','',locationText(book.latest_city,book.latest_region,book.latest_country)));
      }else{
        latest.append(make('span','recent-place-label','Status'));
        latest.append(make('strong','','Journey just started'));
      }
      route.append(latest);
      card.append(route);

      const bottom=make('div','recent-card-bottom');
      const count=Number(book.travel_updates)||0;
      bottom.append(make('span','recent-count',`${count} ${count===1?'travel update':'travel updates'}`));
      const link=make('a','button small','View Journey');
      link.href=`/book.html?id=${encodeURIComponent(book.id)}`;
      bottom.append(link);
      card.append(bottom);
      grid.append(card);
    }
  }catch(err){
    loading?.classList.add('hidden');
    if(empty){empty.textContent='Recent journeys are temporarily unavailable.';empty.classList.remove('hidden');}
  }
}
document.addEventListener('DOMContentLoaded',loadRecentBooks);
