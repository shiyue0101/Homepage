/* Contact form English-only inline validation; event delegation installed before main.js. */
(() => {
  'use strict';
  const FORM_ID = 'contact-redesign-form';
  const ENDPOINT = 'https://formspree.io/f/mbgdwrgo';
  const specs = [
    ['contact-redesign-first-name', '* Please enter your first name.'],
    ['contact-redesign-last-name', '* Please enter your last name.'],
    ['contact-redesign-email', '* Please enter your email address.'],
    ['contact-redesign-message', '* Please enter your message.']
  ];
  let busy = false;
  let toastTimer;
  function fieldError(el) {
    let note = document.getElementById(el.id + '-inline-error');
    if (!note) {
      note = document.createElement('span');
      note.className = 'contact-inline-error';
      note.id = el.id + '-inline-error';
      note.setAttribute('aria-live', 'polite');
      el.insertAdjacentElement('afterend', note);
    }
    return note;
  }
  function validate(el, emptyText) {
    const value = el.value.trim();
    let message = !value ? emptyText : '';
    if (value && el.type === 'email' && !el.validity.valid) message = 'Please enter a valid email address.';
    const note = fieldError(el);
    note.textContent = message;
    el.classList.toggle('contact-field-invalid', !!message);
    if (message) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !message;
  }
  function notify(message, error) {
    let toast = document.getElementById('contact-english-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'contact-english-toast';
      toast.className = 'contact-english-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle('is-error', !!error);
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
  }
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form || form.id !== FORM_ID) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy) return;
    form.noValidate = true;
    const fields = specs.map(([id, msg]) => [document.getElementById(id), msg]);
    if (fields.some(([el]) => !el)) { notify('The form is unavailable. Please refresh and try again.', true); return; }
    let firstBad = null;
    for (const [el, msg] of fields) if (!validate(el, msg) && !firstBad) firstBad = el;
    if (firstBad) { firstBad.focus(); return; }
    const button = form.querySelector('button[type="submit"]');
    const oldButton = button ? button.innerHTML : '';
    busy = true;
    if (button) { button.disabled = true; button.textContent = 'Sending...'; }
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      // Remove validation errors from newly reset fields; empty form is normal after success.
      for (const [el] of fields) {
        fieldError(el).textContent = '';
        el.classList.remove('contact-field-invalid');
        el.removeAttribute('aria-invalid');
      }
      notify('Thank you! Your message has been sent.', false);
    } catch (e) {
      notify('Your message could not be sent. Please try again.', true);
    } finally {
      busy = false;
      if (button) { button.disabled = false; button.innerHTML = oldButton; }
    }
  }, true);
  // Keep hints in sync after editing; native invalid popups are disabled in HTML.
  document.addEventListener('input', event => {
    const el = event.target;
    const pair = specs.find(([id]) => id === el.id);
    if (pair && el.classList.contains('contact-field-invalid')) validate(el, pair[1]);
  }, true);
  document.addEventListener('blur', event => {
    const el = event.target;
    const pair = specs.find(([id]) => id === el.id);
    if (pair && (el.classList.contains('contact-field-invalid') || el.value.trim())) validate(el, pair[1]);
  }, true);
})();
