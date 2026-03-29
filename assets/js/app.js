export function initNavbar() {
  const menuBtn = document.querySelector('[data-mobile-menu]');
  const nav = document.querySelector('.main-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const links = Array.from(document.querySelectorAll('.main-nav a'));
  const path = location.pathname.split('/').pop() || 'index.html';
  for (const link of links) {
    const href = link.getAttribute('href');
    if (href && href.endsWith(path)) {
      link.classList.add('active');
    }
  }
}

export function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  for (const item of items) observer.observe(item);
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

export function initHeroTilt() {
  const hero = document.querySelector('.hero-3d');
  if (!hero) return;

  const reset = () => {
    hero.style.setProperty('--scene-tilt-x', '-8deg');
    hero.style.setProperty('--scene-tilt-y', '16deg');
  };

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const tiltY = (x - 0.5) * 18;
    const tiltX = (0.5 - y) * 16;
    hero.style.setProperty('--scene-tilt-x', `${tiltX}deg`);
    hero.style.setProperty('--scene-tilt-y', `${tiltY}deg`);
  });

  hero.addEventListener('pointerleave', reset);
  reset();
}

export function showToast(message, type = 'info') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

window.showToast = showToast;
