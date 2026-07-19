const reviewForm=document.getElementById('veteran-review-form');
const reviewStatus=document.getElementById('review-status');
const endpoint='https://script.google.com/macros/s/AKfycbw10U4rL38nhbHNv3QL6KhoQWgYS8DPtdVes1L3pCKB6XgHj0fOUmRYzYQv0NBATlw2/exec';
reviewForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=reviewForm.querySelector('button[type="submit"]');
  const values=Object.fromEntries(new FormData(reviewForm));
  if(values.website)return;
  button.disabled=true;
  button.textContent='Sending…';
  reviewStatus.textContent='Sending your private request…';
  try{
    await fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'content-type':'text/plain;charset=utf-8'},body:JSON.stringify({...values,formType:'Veteran Financial Review',page:location.href,submittedAt:new Date().toISOString()})});
    reviewForm.reset();
    reviewStatus.textContent='Thank you. Your review request has been received.';
    if(typeof gtag==='function')gtag('event','generate_lead',{form_id:'veteran_financial_review'});
  }catch(error){
    reviewStatus.textContent='The request could not be sent. Please email alex@wattsunifiedsolutions.com.';
  }finally{
    button.disabled=false;
    button.textContent='Request Review';
  }
});
