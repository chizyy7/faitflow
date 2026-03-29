const STORAGE_KEY = 'faithflow_favourites';

function read() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function write(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function toggleFavourite(ref, text) {
  const current = read();
  const index = current.findIndex((item) => item.ref === ref);
  if (index >= 0) {
    current.splice(index, 1);
    write(current);
    return false;
  }
  current.unshift({ ref, text, savedAt: new Date().toISOString() });
  write(current);
  return true;
}

export function isFavourite(ref) {
  return read().some((item) => item.ref === ref);
}

export function getAll() {
  return read().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function removeFavourite(ref) {
  write(read().filter((item) => item.ref !== ref));
}

export function renderFavourites(container) {
  const list = getAll();
  if (!list.length) {
    container.innerHTML = '<div class="empty-state">✝ No favourites yet. Start reading and save verses that speak to you.</div>';
    return;
  }

  container.innerHTML = list.map((item) => `
    <article class="favourite-card">
      <h3>${item.ref}</h3>
      <p>${item.text}</p>
      <small>Saved: ${new Date(item.savedAt).toLocaleString()}</small>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.7rem;">
        <button class="chip-btn" data-copy="${encodeURIComponent(`${item.ref} - ${item.text}`)}">📋 Copy</button>
        <button class="chip-btn" data-share="${encodeURIComponent(`${item.ref} - ${item.text}`)}">🔗 Share</button>
        <button class="chip-btn" data-remove="${item.ref}">🗑️ Remove</button>
      </div>
    </article>
  `).join('');
}
