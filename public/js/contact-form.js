/* Contact form validation, Turnstile, and Formspree submission. */
(() => {
  const FORM_ID = 'contact-redesign-form';
  const ENDPOINT = 'https://formspree.io/f/mbgdwrgo';
  const FIELD_IDS = [
    ['contact-redesign-first-name', '* Please enter your first name.'],
    ['contact-redesign-last-name', '* Please enter your last name.'],
    ['contact-redesign-email', '* Please enter a valid email address.'],
    ['contact-redesign-message', '* Please enter your message.']
  ];
  let busy = false;
  let toastTimer = null;

  const form = document.getElementById(FORM_ID);
  if (!form) return;
  form.noValidate = true;
  const button = form.querySelector('button[type="submit"]');
  const verificationError = document.getElementById('contact-turnstile-error');
  const toast = document.getElementById('contact-send-toast');

  function fieldError(input) {
    let error = document.getElementById(input.id + '-inline-error');
    if (!error) {
      error = document.createElement('p');
      error.id = input.id + '-inline-error';
      error.className = 'contact-turnstile-field-error';
      error.hidden = true;
      input.insertAdjacentElement('afterend', error);
    }
    return error;
  }
  function setFieldError(input, message) {
    const error = fieldError(input);
    error.textContent = message;
    error.hidden = !message;
    input.classList.toggle('contact-field-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) input.setAttribute('aria-describedby', error.id);
    else input.removeAttribute('aria-describedby');
  }
  function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validate() {
    let firstInvalid = null;
    for (const [id, emptyMessage] of FIELD_IDS) {
      const input = document.getElementById(id);
      if (!input) continue;
      input.setCustomValidity(''); // Prevent old native custom validity from sticking.
      const value = input.value.trim();
      let message = !value ? emptyMessage : '';
      if (!message && id === 'contact-redesign-email' && !validEmail(value)) {
        message = 'Please enter a valid email address.';
      }
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) { firstInvalid.focus(); return false; }
    return true;
  }
  function showToast(message, kind) {
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.type = kind;
    toast.classList.add('is-visible');
    toast.classList.toggle('is-error', kind === 'error');
    toast.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 5000);
  }
  function showVerificationError(message) {
    if (!verificationError) return;
    verificationError.hidden = !message;
    verificationError.textContent = message;
  }
  function resetChallenge() {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      try { window.turnstile.reset(); } catch (_e) { /* turnstile not ready */ }
    }
  }
  FIELD_IDS.forEach(([id]) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', () => {
      input.setCustomValidity('');
      setFieldError(input, '');
    });
  });

  // Document capture listener precedes existing listeners on the form. Never allow
  // native navigation even if the CAPTCHA fails to load.
  document.addEventListener('submit', async event => {
    if (event.target !== form) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy) return;
    if (form.elements.namedItem('_gotcha')?.value.trim()) return;
    if (!validate()) return;
    const token = form.querySelector('[name="cf-turnstile-response"]')?.value?.trim();
    if (!token) {
      showVerificationError('* Please complete the human verification before sending.');
      return;
    }
    showVerificationError('');
    busy = true;
    const originalLabel = button?.textContent || 'Send';
    if (button) { button.disabled = true; button.textContent = 'Sending...'; }
    try {
      const data = new FormData(form);
      data.set('cf-turnstile-response', token);
      const response = await fetch(ENDPOINT, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const serverMessage = Array.isArray(body.errors) ? body.errors.map(e => e.message).join(' ') : '';
        throw new Error(serverMessage || 'Could not send your message. Please try again.');
      }
      form.reset();
      FIELD_IDS.forEach(([id]) => {
        const input = document.getElementById(id);
        if (input) setFieldError(input, '');
      });
      showToast('Thank you! Your message has been sent.', 'success');
    } catch (error) {
      showToast('Message not sent. Please try again.', 'error');
      console.error('Contact form submission failed:', error);
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.textContent = originalLabel; }
      resetChallenge();
    }
  }, true);
})();
