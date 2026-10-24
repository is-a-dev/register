// ===== Mobile menu =====
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ===== Header shadow + active link on scroll =====
const header = document.getElementById('header');
const sections = document.querySelectorAll('section[id]');
const links = nav.querySelectorAll('a');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  let current = 'home';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
});

// ===== Reveal on scroll =====
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + 'ms';
  revealObs.observe(el);
});

// ===== Counter animation =====
function runCounter(el) {
  const to = +el.dataset.to;
  const dur = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(p * to);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { runCounter(e.target); countObs.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.count').forEach(c => countObs.observe(c));

// ===== Contact form =====
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = 'Thanks! Your message has been sent.';
  form.reset();
  setTimeout(() => (formMsg.textContent = ''), 4000);
});
