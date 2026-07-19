const strategyForm = document.getElementById('strategy-form');
const formStatus = document.getElementById('form-status');
const endpoint = 'https://script.google.com/macros/s/AKfycbw10U4rL38nhbHNv3QL6KhoQWgYS8DPtdVes1L3pCKB6XgHj0fOUmRYzYQv0NBATlw2/exec';

strategyForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = strategyForm.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(strategyForm));
  if (values.website) return;

  button.disabled = true;
  button.textContent = 'Sending your request…';
  formStatus.classList.remove('error');
  formStatus.textContent = 'Sending your private request…';

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: {'content-type': 'text/plain;charset=utf-8'},
      body: JSON.stringify({
        ...values,
        formType: 'Retirement Wealth Strategy Session',
        page: location.href,
        submittedAt: new Date().toISOString()
      })
    });
    strategyForm.reset();
    formStatus.textContent = 'Thank you. Your strategy-session request has been received.';
  } catch (error) {
    formStatus.classList.add('error');
    formStatus.textContent = 'The request could not be sent. Please email alex@wattsunifiedsolutions.com.';
  } finally {
    button.disabled = false;
    button.innerHTML = 'Request my strategy session <span aria-hidden="true">→</span>';
  }
});
