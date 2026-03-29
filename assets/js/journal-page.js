import { addEntry, deleteEntry, exportJournal, filterEntries, markAnswered } from './journal.js';
import { initNavbar, initScrollReveal, showToast } from './app.js';

const el = {};
let activeFilter = 'all';

function qs(id) {
  return document.getElementById(id);
}

function setupElements() {
  el.newPrayerBtn = qs('newPrayerBtn');
  el.modal = qs('prayerModal');
  el.closeModal = qs('closeModal');
  el.form = qs('prayerForm');
  el.list = qs('journalList');
  el.total = qs('statTotal');
  el.answered = qs('statAnswered');
  el.pending = qs('statPending');
  el.exportBtn = qs('exportBtn');
}

function renderStats() {
  const all = filterEntries('all');
  const answered = all.filter((entry) => entry.answered).length;
  el.total.textContent = String(all.length);
  el.answered.textContent = String(answered);
  el.pending.textContent = String(all.length - answered);
}

function renderList() {
  const rows = filterEntries(activeFilter);
  if (!rows.length) {
    el.list.innerHTML = '<div class="empty-state">No prayers in this filter yet.</div>';
    return;
  }

  el.list.innerHTML = rows.map((entry) => `
    <article class="prayer-card">
      <div style="display:flex;justify-content:space-between;gap:0.7rem;align-items:flex-start;">
        <h3>${entry.title}</h3>
        <small>${new Date(entry.createdAt).toLocaleDateString()}</small>
      </div>
      ${entry.verse ? `<p class="badge pending" style="margin-top:0.3rem;">${entry.verse}</p>` : ''}
      <p style="margin-top:0.6rem;white-space:pre-wrap;">${entry.prayer}</p>
      <div style="display:flex;justify-content:space-between;gap:0.5rem;margin-top:0.7rem;flex-wrap:wrap;">
        <span class="badge ${entry.answered ? 'answered' : 'pending'}">${entry.answered ? '✅ Answered!' : 'Believing...'}</span>
        <div style="display:flex;gap:0.5rem;">
          <button class="chip-btn" data-toggle="${entry.id}">${entry.answered ? 'Mark Pending' : 'Mark Answered'}</button>
          <button class="chip-btn" data-delete="${entry.id}">Delete</button>
        </div>
      </div>
    </article>
  `).join('');

  el.list.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      markAnswered(btn.dataset.toggle);
      showToast('Prayer status updated', 'success');
      renderStats();
      renderList();
    });
  });

  el.list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteEntry(btn.dataset.delete);
      showToast('Prayer removed', 'info');
      renderStats();
      renderList();
    });
  });
}

function bindEvents() {
  el.newPrayerBtn.addEventListener('click', () => el.modal.classList.add('open'));
  el.closeModal.addEventListener('click', () => el.modal.classList.remove('open'));

  el.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(el.form);
    addEntry(data.get('title'), data.get('verse'), data.get('prayer'));
    el.form.reset();
    el.modal.classList.remove('open');
    showToast('Prayer saved', 'success');
    renderStats();
    renderList();
  });

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      activeFilter = button.dataset.filter;
      renderList();
    });
  });

  el.exportBtn.addEventListener('click', () => {
    exportJournal();
    showToast('Journal exported', 'success');
  });
}

function init() {
  initNavbar();
  initScrollReveal();
  setupElements();
  bindEvents();
  renderStats();
  renderList();
}

document.addEventListener('DOMContentLoaded', init);
