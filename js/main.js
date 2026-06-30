// ── NAV SCROLL ───────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 40
    ? 'rgba(10,10,15,0.95)'
    : 'rgba(10,10,15,0.7)';
});

// ── HAMBURGER ─────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── GSAP SCROLL REVEALS ───────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
gsap.from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
gsap.from('.hero-headline', { opacity: 0, y: 30, duration: 0.9, delay: 0.4 });
gsap.from('.hero-sub',      { opacity: 0, y: 20, duration: 0.8, delay: 0.6 });
gsap.from('.btn-primary',   { opacity: 0, y: 20, duration: 0.7, delay: 0.8 });

// Section reveals
document.querySelectorAll('.reveal').forEach(el => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
    }
  });
});

// Stagger value cards
gsap.from('.value-card', {
  opacity: 0,
  y: 30,
  duration: 0.7,
  stagger: 0.15,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.about-values',
    start: 'top 85%',
  }
});

// Product card
gsap.from('.product-card-main', {
  opacity: 0,
  y: 40,
  duration: 0.9,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.product-card-main',
    start: 'top 85%',
  }
});

// Strip animation zone fade-in
gsap.from('.strip-anim', {
  opacity: 0,
  scale: 0.92,
  duration: 1,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.ucheck-strip',
    start: 'top 80%',
  }
});

// Contact
gsap.from('.contact-email', {
  opacity: 0,
  y: 20,
  duration: 0.8,
  scrollTrigger: {
    trigger: '.contact-email',
    start: 'top 90%',
  }
});
