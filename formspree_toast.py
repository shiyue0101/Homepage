#!/usr/bin/env python3
"""Use in Homepage directory: python3 formspree_toast.py
Keep existing Contact visual style; submit to Formspree with fetch and show toast.
"""
from pathlib import Path
import re, shutil, sys

HTML = Path('index.html')
CSS = Path('style.css')
ENDPOINT = 'https://formspree.io/f/mbgdwrgo'
MARK = 'contact-formspree-toast-v1'
if not HTML.exists() or not CSS.exists():
    sys.exit('请在 Homepage 根目录运行（需有 index.html 和 style.css）。')
source = HTML.read_text(encoding='utf-8')
style = CSS.read_text(encoding='utf-8')
if MARK in source:
    print('已安装此版本的提示，无需重复修改。')
    sys.exit(0)

sec_re = re.compile(r'<section\b[^>]*\bid=["\']contact["\'][^>]*>.*?</section>', re.I | re.S)
sec_match = sec_re.search(source)
if not sec_match:
    sys.exit('未找到 #contact section，未修改文件。')
section = sec_match.group(0)
form_re = re.compile(r'<form\b(?=[^>]*\bid=["\']contact-redesign-form["\'])[^>]*>', re.I | re.S)
fm = form_re.search(section)
if not fm:
    sys.exit('未找到 #contact-redesign-form，未修改文件。')
# Replace current handler associated with form (either mailto version or previous Formspree version).
script_re = re.compile(r'<script\b[^>]*>.*?</script\s*>', re.I | re.S)
form_scripts = [m for m in script_re.finditer(section) if 'contact-redesign-form' in m.group(0)]
if len(form_scripts) != 1:
    sys.exit(f'预期找到 1 个 Contact 表单脚本，实际找到 {len(form_scripts)} 个。为安全起见未修改。')

# Original script replacement in reverse order from later to earlier.
js = '''<script>
  // contact-formspree-toast-v1
  (() => {
    const form = document.getElementById('contact-redesign-form');
    const toast = document.getElementById('contact-send-toast');
    if (!form || !toast) return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    let dismissTimer;

    const showToast = (message, type) => {
      window.clearTimeout(dismissTimer);
      toast.textContent = message;
      toast.classList.toggle('is-error', type === 'error');
      toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
      toast.classList.add('is-visible');
      dismissTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 5000);
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled || !form.reportValidity()) return;
      const honeypot = form.elements.namedItem('_gotcha');
      if (honeypot && honeypot.value.trim()) return;

      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      const oldLabel = button.innerHTML;
      button.textContent = 'Sending...';
      toast.classList.remove('is-visible');
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Submission rejected');
        form.reset();
        showToast('Thank you! Your message has been sent. ✓', 'success');
      } catch (error) {
        showToast('Could not send your message. Please try again.', 'error');
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.innerHTML = oldLabel;
      }
    });
  })();
</script>'''
ss = form_scripts[0]
section = section[:ss.start()] + js + section[ss.end():]
# Set form action/method irrespective of current state.
section = form_re.sub(lambda m: re.sub(r'\s+(?:action|method)\s*=\s*(["\']).*?\1', '', m.group(0), flags=re.I)[:-1] + f' action="{ENDPOINT}" method="POST">', section, count=1)
# Keep existing name, email, message fields; make sure they have form field names.
if not all(re.search(r'\bname=["\']'+re.escape(n)+r'["\']', section, re.I) for n in ('email', 'message')):
    sys.exit('表单缺少 email 或 message 字段，未修改。')
# Update button text to match functionality and remove stale feedback text.
section = re.sub(r'(<button\b(?=[^>]*\btype=["\']submit["\'])[^>]*>).*?(</button>)', r'\1Send Message <span aria-hidden="true">↗</span>\2', section, count=1, flags=re.I|re.S)
section = re.sub(r'(<p\b[^>]*class=["\']contact-redesign-footnote["\'][^>]*>).*?(</p>)', r'\1Your message will be sent directly from this page.\2', section, count=1, flags=re.S|re.I)
# Remove previous inline feedback (if present) so there is just one success message.
section = re.sub(r'\s*<p\b[^>]*id=["\']contact-form-status["\'][^>]*>.*?</p>', '', section, flags=re.S|re.I)
section = re.sub(r'</section>\s*$', '''  <div id="contact-send-toast" class="contact-send-toast" role="status" aria-live="polite" aria-atomic="true"></div>
</section>''', section, flags=re.I)
updated = source[:sec_match.start()] + section + source[sec_match.end():]

css_block = '''
/* BEGIN contact-formspree-toast-v1 */
#contact .contact-send-toast {
  position: fixed;
  left: 50%;
  bottom: max(28px, env(safe-area-inset-bottom, 0px));
  transform: translate(-50%, 18px);
  max-width: min(90vw, 490px);
  padding: 15px 22px;
  border: 1px solid var(--border, #cdaaad);
  border-radius: 12px;
  background: var(--text, #432f32);
  color: #fff;
  box-shadow: 0 12px 32px rgba(40, 20, 26, .17);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 10000;
  transition: opacity .25s ease, transform .25s ease, visibility .25s ease;
}
#contact .contact-send-toast.is-visible {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}
#contact .contact-send-toast.is-error {
  background: #7a3e47;
}
@media (prefers-reduced-motion: reduce) {
  #contact .contact-send-toast { transition: none; }
}
/* END contact-formspree-toast-v1 */
'''
# Avoid writing backups if validation fails. Both files updated together.
for path in (HTML, CSS):
    backup = path.with_name(path.name + '.before_formspree_toast.bak')
    if not backup.exists(): shutil.copy2(path, backup)
HTML.write_text(updated, encoding='utf-8')
CSS.write_text(style + '\n' + css_block, encoding='utf-8')
print('完成：表单异步提交 + 页面内 Toast 提醒（成功/失败），无需跳转。')
print('修改了 index.html 和 style.css；已保留 .bak 备份。')
