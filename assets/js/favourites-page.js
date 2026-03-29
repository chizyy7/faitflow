import { getAll, removeFavourite, renderFavourites } from './favourites.js';
import { initNavbar, initScrollReveal, showToast } from './app.js';

const el = {};

function qs(id) {
  return document.getElementById(id);
}

function bindActions() {
  el.list.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = decodeURIComponent(btn.dataset.copy);
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      showToast('Verse copied to clipboard!', 'success');
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    });
  });

  el.list.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = decodeURIComponent(btn.dataset.share);
      try {
        if (navigator.share) {
          await navigator.share({ title: 'FaithFlow Verse', text });
        } else {
          await navigator.clipboard.writeText(text);
          showToast('Share API unavailable, copied instead.', 'info');
        }
      } catch {
        showToast('Share cancelled.', 'info');
      }
    });
  });

  el.list.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFavourite(btn.dataset.remove);
      showToast('Removed from favourites', 'info');
      render();
    });
  });
}

function render() {
  renderFavourites(el.list);
  el.count.textContent = `${getAll().length} verses saved`;
  bindActions();
}

function init() {
  initNavbar();
  initScrollReveal();
  el.list = qs('favouritesList');
  el.count = qs('verseCount');
  render();
}

document.addEventListener('DOMContentLoaded', init);
