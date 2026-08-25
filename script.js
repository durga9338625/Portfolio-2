// =====================
// PARTICLES
// =====================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    const colors = ['rgba(167,139,250,', 'rgba(52,211,153,', 'rgba(244,114,182,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.opacity + ')';
    ctx.fill();
  }
}
for (let i = 0; i < 80; i++) particles.push(new Particle());
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();
window.addEventListener('resize', resize);

// =====================
// 3D TILT ON CARDS
// =====================
const allCards = [...document.querySelectorAll('.svc'), ...document.querySelectorAll('.cat')];
allCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    const rotateX = (y - cy) / cy * 7;
    const rotateY = (cx - x) / cx * 7;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// =====================
// SCROLL FADE-IN
// =====================
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// =====================
// SKILL BARS: replay fill animation when scrolled into view
// =====================
const skillGroups = document.querySelectorAll('.skill-group');
if (skillGroups.length) {
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bar-fill').forEach(fill => {
          fill.style.animation = 'none';
          // force reflow so the animation restarts
          void fill.offsetWidth;
          fill.style.animation = '';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillGroups.forEach(group => skillObserver.observe(group));
}

// =====================
// CONTACT FORM
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
    if (!name) {
      setFieldError('cf-name', 'Please enter your name.');
      valid = false;
    } else {
      setFieldError('cf-name', '');
    }

    const email = document.getElementById('cf-email').value.trim();
    if (!email) {
      setFieldError('cf-email', 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(email)) {
      setFieldError('cf-email', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('cf-email', '');
    }

    const message = document.getElementById('cf-message').value.trim();
    if (!message) {
      setFieldError('cf-message', 'Please add a short message.');
      valid = false;
    } else {
      setFieldError('cf-message', '');
    }

    return valid;
  }

  // Clear individual field errors as the user fixes them
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
    submitBtn.textContent = 'Sending…';
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
      submitBtn.textContent = 'Send message ✦';
    }
  });
}
