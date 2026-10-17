// contact-no-redirect-v2: AJAX Formspree, stays on the Contact page.
(() => {
  const FORM_ID = 'contact-redesign-form';
  const ENDPOINT = 'https://formspree.io/f/mbgdwrgo';
  let busy = false;
  let toastTimer;

  function notify(message, error = false) {
    const toast = document.getElementById('contact-send-toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle('is-error', error);
    toast.setAttribute('role', error ? 'alert' : 'status');
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
  }

  // Capture-phase delegation avoids late DOM initialization and older submit listeners.
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== FORM_ID) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy || !form.reportValidity()) return;
    const honey = form.elements.namedItem('_gotcha');
    if (honey && honey.value.trim()) return;

    const button = form.querySelector('button[type="submit"]');
    if (!button) {
      notify('Form configuration error. Please try again later.', true);
      return;
    }
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    const originalLabel = button.innerHTML;
    button.textContent = 'Sending...';
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many attempts. Please try again later.');
        throw new Error('Could not send your message. Please try again.');
      }
      form.reset();
      notify('Thank you! Your message has been sent.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Network error. Please try again.', true);
    } finally {
      busy = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.innerHTML = originalLabel;
    }
  }, true);
})();
