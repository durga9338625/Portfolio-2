// =====================
// SCROLL FADE-IN
// =====================
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// =====================
// 3D TILT ON FILE / TEMPLATE CARDS
// =====================
const tiltCards = [...document.querySelectorAll('.file-card'), ...document.querySelectorAll('.tmpl-card')];
tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    const rotateX = (y - cy) / cy * 5;
    const rotateY = (cx - x) / cx * 5;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// =====================
// SKILL BARS: replay fill when scrolled into view
// =====================
const terminal = document.querySelector('.terminal');
if (terminal) {
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bar-fill').forEach(fill => {
          fill.style.animation = 'none';
          void fill.offsetWidth;
          fill.style.animation = '';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  skillObserver.observe(terminal);
}

// =====================
// CONTACT FORM — Formspree
// =====================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const statusEl = document.getElementById('cf-status');
  const submitBtn = document.getElementById('cf-submit');

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = contactForm.querySelector(`.form-error[data-for="${fieldId}"]`);
    const wrapper = field.closest('.form-field');
    if (message) {
      wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let valid = true;

    const name = document.getElementById('cf-name').value.trim();
    if (!name) { setFieldError('cf-name', 'Please enter your name.'); valid = false; }
    else setFieldError('cf-name', '');

    const email = document.getElementById('cf-email').value.trim();
    if (!email) { setFieldError('cf-email', 'Please enter your email.'); valid = false; }
    else if (!isValidEmail(email)) { setFieldError('cf-email', 'Please enter a valid email address.'); valid = false; }
    else setFieldError('cf-email', '');

    const message = document.getElementById('cf-message').value.trim();
    if (!message) { setFieldError('cf-message', 'Please add a short message.'); valid = false; }
    else setFieldError('cf-message', '');

    return valid;
  }

  ['cf-name', 'cf-email', 'cf-message'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => setFieldError(id, ''));
  });

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm()) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      statusEl.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'sending…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusEl.textContent = "Thanks — your message is on its way. I'll reply within 24 hours.";
        statusEl.className = 'form-status success';
        contactForm.reset();
      } else {
        const data = await response.json().catch(() => null);
        const errorMsg = data && data.errors && data.errors.length
          ? data.errors.map(err => err.message).join(', ')
          : 'Something went wrong. Please try again or email me directly.';
        statusEl.textContent = errorMsg;
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = 'Network error — please try again or email me directly.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'send_message() →';
    }
  });
}
