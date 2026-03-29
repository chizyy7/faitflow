const STORAGE_KEY = 'faithflow_journal_entries';

function uuid() {
  return crypto?.randomUUID?.() || `j_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function read() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function write(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(title, verse, prayer) {
  const entry = {
    id: uuid(),
    title,
    verse,
    prayer,
    answered: false,
    createdAt: new Date().toISOString(),
    answeredAt: null
  };
  const entries = read();
  entries.unshift(entry);
  write(entries);
  return entry;
}

export function getAll() {
  return read().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markAnswered(id) {
  const entries = read().map((entry) =>
    entry.id === id
      ? { ...entry, answered: !entry.answered, answeredAt: !entry.answered ? new Date().toISOString() : null }
      : entry
  );
  write(entries);
  return entries.find((entry) => entry.id === id) || null;
}

export function deleteEntry(id) {
  const entries = read().filter((entry) => entry.id !== id);
  write(entries);
}

export function filterEntries(filter) {
  const entries = getAll();
  if (filter === 'answered') return entries.filter((entry) => entry.answered);
  if (filter === 'unanswered') return entries.filter((entry) => !entry.answered);
  return entries;
}

export function exportJournal() {
  const entries = getAll();
  const lines = ['FaithFlow Prayer Journal', ''];
  for (const e of entries) {
    lines.push(`Date: ${new Date(e.createdAt).toLocaleString()}`);
    lines.push(`Title: ${e.title}`);
    lines.push(`Verse: ${e.verse || 'N/A'}`);
    lines.push(`Status: ${e.answered ? 'Answered' : 'Believing...'}`);
    if (e.answeredAt) lines.push(`Answered On: ${new Date(e.answeredAt).toLocaleString()}`);
    lines.push('Prayer:');
    lines.push(e.prayer);
    lines.push('');
    lines.push('-------------------------');
    lines.push('');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `faithflow_journal_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
