// CONTACT-PROTECTION-V1: elementary source obfuscation, not strong security.
(() => {
  const decode = (values) => String.fromCharCode(...values);
  const email = decode([
    115, 104, 105, 121, 117, 101, 48, 49, 48, 49, 64, 111, 117, 116, 108, 111,
    111, 107, 46, 99, 111, 109,
  ]);
  const phone = decode([43, 52, 53, 57, 49, 56, 49, 55, 55, 55, 48]);
  const root = document.getElementById("contact");
  if (!root) return;
  const emailEl = root.querySelector("#protected-email");
  const phoneEl = root.querySelector("#protected-phone");
  if (emailEl) {
    emailEl.textContent = email;
    emailEl.href = "mailto:" + email;
  }
  if (phoneEl) {
    phoneEl.textContent = "+45 91 81 77 70";
    phoneEl.href = "tel:" + phone;
  }
})();
