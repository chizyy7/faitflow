export const BIBLE_API = 'https://bible-api.com';

export const BOOKS = {
  oldTestament: [
    { name: 'Genesis', chapters: 50, abbr: 'genesis' },
    { name: 'Exodus', chapters: 40, abbr: 'exodus' },
    { name: 'Leviticus', chapters: 27, abbr: 'leviticus' },
    { name: 'Numbers', chapters: 36, abbr: 'numbers' },
    { name: 'Deuteronomy', chapters: 34, abbr: 'deuteronomy' },
    { name: 'Joshua', chapters: 24, abbr: 'joshua' },
    { name: 'Judges', chapters: 21, abbr: 'judges' },
    { name: 'Ruth', chapters: 4, abbr: 'ruth' },
    { name: '1 Samuel', chapters: 31, abbr: '1-samuel' },
    { name: '2 Samuel', chapters: 24, abbr: '2-samuel' },
    { name: '1 Kings', chapters: 22, abbr: '1-kings' },
    { name: '2 Kings', chapters: 25, abbr: '2-kings' },
    { name: '1 Chronicles', chapters: 29, abbr: '1-chronicles' },
    { name: '2 Chronicles', chapters: 36, abbr: '2-chronicles' },
    { name: 'Ezra', chapters: 10, abbr: 'ezra' },
    { name: 'Nehemiah', chapters: 13, abbr: 'nehemiah' },
    { name: 'Esther', chapters: 10, abbr: 'esther' },
    { name: 'Job', chapters: 42, abbr: 'job' },
    { name: 'Psalms', chapters: 150, abbr: 'psalms' },
    { name: 'Proverbs', chapters: 31, abbr: 'proverbs' },
    { name: 'Ecclesiastes', chapters: 12, abbr: 'ecclesiastes' },
    { name: 'Song of Solomon', chapters: 8, abbr: 'song-of-solomon' },
    { name: 'Isaiah', chapters: 66, abbr: 'isaiah' },
    { name: 'Jeremiah', chapters: 52, abbr: 'jeremiah' },
    { name: 'Lamentations', chapters: 5, abbr: 'lamentations' },
    { name: 'Ezekiel', chapters: 48, abbr: 'ezekiel' },
    { name: 'Daniel', chapters: 12, abbr: 'daniel' },
    { name: 'Hosea', chapters: 14, abbr: 'hosea' },
    { name: 'Joel', chapters: 3, abbr: 'joel' },
    { name: 'Amos', chapters: 9, abbr: 'amos' },
    { name: 'Obadiah', chapters: 1, abbr: 'obadiah' },
    { name: 'Jonah', chapters: 4, abbr: 'jonah' },
    { name: 'Micah', chapters: 7, abbr: 'micah' },
    { name: 'Nahum', chapters: 3, abbr: 'nahum' },
    { name: 'Habakkuk', chapters: 3, abbr: 'habakkuk' },
    { name: 'Zephaniah', chapters: 3, abbr: 'zephaniah' },
    { name: 'Haggai', chapters: 2, abbr: 'haggai' },
    { name: 'Zechariah', chapters: 14, abbr: 'zechariah' },
    { name: 'Malachi', chapters: 4, abbr: 'malachi' }
  ],
  newTestament: [
    { name: 'Matthew', chapters: 28, abbr: 'matthew' },
    { name: 'Mark', chapters: 16, abbr: 'mark' },
    { name: 'Luke', chapters: 24, abbr: 'luke' },
    { name: 'John', chapters: 21, abbr: 'john' },
    { name: 'Acts', chapters: 28, abbr: 'acts' },
    { name: 'Romans', chapters: 16, abbr: 'romans' },
    { name: '1 Corinthians', chapters: 16, abbr: '1-corinthians' },
    { name: '2 Corinthians', chapters: 13, abbr: '2-corinthians' },
    { name: 'Galatians', chapters: 6, abbr: 'galatians' },
    { name: 'Ephesians', chapters: 6, abbr: 'ephesians' },
    { name: 'Philippians', chapters: 4, abbr: 'philippians' },
    { name: 'Colossians', chapters: 4, abbr: 'colossians' },
    { name: '1 Thessalonians', chapters: 5, abbr: '1-thessalonians' },
    { name: '2 Thessalonians', chapters: 3, abbr: '2-thessalonians' },
    { name: '1 Timothy', chapters: 6, abbr: '1-timothy' },
    { name: '2 Timothy', chapters: 4, abbr: '2-timothy' },
    { name: 'Titus', chapters: 3, abbr: 'titus' },
    { name: 'Philemon', chapters: 1, abbr: 'philemon' },
    { name: 'Hebrews', chapters: 13, abbr: 'hebrews' },
    { name: 'James', chapters: 5, abbr: 'james' },
    { name: '1 Peter', chapters: 5, abbr: '1-peter' },
    { name: '2 Peter', chapters: 3, abbr: '2-peter' },
    { name: '1 John', chapters: 5, abbr: '1-john' },
    { name: '2 John', chapters: 1, abbr: '2-john' },
    { name: '3 John', chapters: 1, abbr: '3-john' },
    { name: 'Jude', chapters: 1, abbr: 'jude' },
    { name: 'Revelation', chapters: 22, abbr: 'revelation' }
  ]
};

const ALL_BOOKS = [...BOOKS.oldTestament, ...BOOKS.newTestament];

export function getAllBooks() {
  return ALL_BOOKS;
}

export function getBookByName(name) {
  return ALL_BOOKS.find((book) => book.name === name);
}

export async function loadChapter(book, chapter) {
  const url = `${BIBLE_API}/${encodeURIComponent(book)}+${chapter}?translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load chapter');
  }
  const data = await res.json();
  return data.verses || [];
}

export function saveProgress(book, chapter) {
  localStorage.setItem('faithflow_progress', JSON.stringify({ book, chapter }));
}

export function loadProgress() {
  const saved = localStorage.getItem('faithflow_progress');
  return saved ? JSON.parse(saved) : { book: 'John', chapter: 1 };
}

export function renderVerses(verses, container) {
  container.innerHTML = verses
    .map((v) => `
      <div class="verse" data-ref="${v.book_name} ${v.chapter}:${v.verse}" data-text="${v.text.trim()}">
        <span class="verse-number">${v.verse}</span>
        <span class="verse-text">${v.text.trim()}</span>
        <div class="verse-action-bar">
          <button class="chip-btn" data-action="fav">⭐ Favourite</button>
          <button class="chip-btn" data-action="explain">💡 Explain</button>
          <button class="chip-btn" data-action="copy">📋 Copy</button>
          <button class="chip-btn" data-action="listen">🔊 Listen</button>
        </div>
      </div>
    `)
    .join('');
}
