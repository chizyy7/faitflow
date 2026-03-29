import { getAllBooks, getBookByName, loadChapter, loadProgress, renderVerses, saveProgress } from './bible.js';
import { toggleFavourite, isFavourite } from './favourites.js';
import { explainVerse } from './ai.js';
import { playText, stopText } from './audio.js';
import { initNavbar, initScrollReveal, showToast } from './app.js';

const state = {
  book: 'John',
  chapter: 1,
  activeRef: null,
  activeText: null,
  fontScale: Number(localStorage.getItem('faithflow_fontScale') || 1)
};

const el = {};

function qs(id) {
  return document.getElementById(id);
}

function setupElements() {
  el.bookSelect = qs('bookSelect');
  el.chapterGrid = qs('chapterGrid');
  el.reference = qs('currentReference');
  el.verseList = qs('verseList');
  el.prev = qs('prevChapter');
  el.next = qs('nextChapter');
  el.fontSm = qs('fontSmall');
  el.fontMd = qs('fontMedium');
  el.fontLg = qs('fontLarge');
  el.playChapterAudio = qs('playChapterAudio');
  el.stopChapterAudio = qs('stopChapterAudio');
  el.aiPanel = qs('aiPanel');
  el.aiBody = qs('aiBody');
  el.aiClose = qs('aiClose');
  el.progress = qs('chapterProgress');
}

function hydrateBooks() {
  const books = getAllBooks();
  el.bookSelect.innerHTML = books.map((b) => `<option value="${b.name}">${b.name}</option>`).join('');
}

function renderChapters() {
  const book = getBookByName(state.book);
  if (!book) return;
  el.chapterGrid.innerHTML = Array.from({ length: book.chapters }, (_, i) => {
    const chapter = i + 1;
    const active = chapter === state.chapter ? 'active' : '';
    return `<button class="${active}" data-chapter="${chapter}">${chapter}</button>`;
  }).join('');

  el.chapterGrid.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      state.chapter = Number(button.dataset.chapter);
      loadAndRender();
    });
  });
}

async function loadAndRender() {
  el.reference.textContent = `${state.book} - Chapter ${state.chapter}`;
  el.verseList.innerHTML = '<p style="color:var(--color-muted)">Loading chapter...</p>';
  try {
    const verses = await loadChapter(state.book, state.chapter);
    renderVerses(verses, el.verseList);
    bindVerseActions();
    renderChapters();
    saveProgress(state.book, state.chapter);
    const total = getBookByName(state.book).chapters;
    el.progress.style.width = `${(state.chapter / total) * 100}%`;
  } catch {
    el.verseList.innerHTML = '<p>Failed to load chapter. Try again.</p>';
  }
}

function bindVerseActions() {
  const verseEls = el.verseList.querySelectorAll('.verse');
  verseEls.forEach((verse) => {
    const ref = verse.dataset.ref;
    const text = verse.dataset.text;
    const favBtn = verse.querySelector('[data-action="fav"]');
    if (isFavourite(ref)) {
      favBtn.textContent = '⭐ Saved';
    }

    verse.addEventListener('click', (event) => {
      if (event.target.closest('.chip-btn')) return;
      verseEls.forEach((v) => v.classList.remove('active'));
      verse.classList.add('active');
      state.activeRef = ref;
      state.activeText = text;
    });

    verse.querySelectorAll('.chip-btn').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const action = event.currentTarget.dataset.action;
        if (action === 'fav') {
          const saved = toggleFavourite(ref, text);
          event.currentTarget.textContent = saved ? '⭐ Saved' : '⭐ Favourite';
          showToast(saved ? 'Verse saved to favourites' : 'Verse removed from favourites', 'success');
        }
        if (action === 'copy') {
          await navigator.clipboard.writeText(`${ref} - ${text}`);
          showToast('Verse copied to clipboard', 'success');
        }
        if (action === 'explain') {
          el.aiPanel.classList.add('open');
          el.aiBody.innerHTML = '<div class="spinner"></div>';
          try {
            const output = await explainVerse(text, ref);
            el.aiBody.textContent = output;
          } catch (err) {
            el.aiBody.textContent = err.message || 'Unable to explain this verse.';
          }
        }
        if (action === 'listen') {
          const started = playText(
            `${ref}. ${text}`,
            () => showToast('Audio started', 'info'),
            () => showToast('Audio finished', 'info'),
            () => showToast('Unable to play audio on this browser.', 'error')
          );
          if (!started) showToast('Unable to play audio on this browser.', 'error');
        }
      });
    });
  });
}

function bindControls() {
  el.bookSelect.addEventListener('change', () => {
    state.book = el.bookSelect.value;
    state.chapter = 1;
    loadAndRender();
  });

  el.prev.addEventListener('click', () => {
    if (state.chapter > 1) {
      state.chapter -= 1;
      loadAndRender();
    }
  });

  el.next.addEventListener('click', () => {
    const total = getBookByName(state.book).chapters;
    if (state.chapter < total) {
      state.chapter += 1;
      loadAndRender();
    }
  });

  const setScale = (value) => {
    state.fontScale = value;
    localStorage.setItem('faithflow_fontScale', String(value));
    el.verseList.style.fontSize = `${value}rem`;
  };

  el.fontSm.addEventListener('click', () => setScale(0.95));
  el.fontMd.addEventListener('click', () => setScale(1));
  el.fontLg.addEventListener('click', () => setScale(1.15));

  el.playChapterAudio.addEventListener('click', () => {
    const verses = Array.from(el.verseList.querySelectorAll('.verse'));
    if (!verses.length) {
      showToast('No verses loaded yet.', 'info');
      return;
    }
    const chapterText = verses
      .map((verse) => {
        const ref = verse.dataset.ref;
        const text = verse.dataset.text;
        return `${ref}. ${text}`;
      })
      .join(' ');
    const started = playText(
      chapterText,
      () => showToast('Reading chapter audio', 'info'),
      () => showToast('Chapter audio finished', 'success'),
      () => showToast('Unable to play chapter audio. Try another browser.', 'error')
    );
    if (!started) showToast('Unable to play chapter audio. Try another browser.', 'error');
  });

  el.stopChapterAudio.addEventListener('click', () => {
    stopText();
    showToast('Audio stopped', 'info');
  });

  el.aiClose.addEventListener('click', () => {
    el.aiPanel.classList.remove('open');
  });

  window.addEventListener('beforeunload', () => stopText());
}

function init() {
  initNavbar();
  initScrollReveal();
  setupElements();
  hydrateBooks();
  const progress = loadProgress();
  state.book = progress.book || 'John';
  state.chapter = progress.chapter || 1;
  el.bookSelect.value = state.book;
  el.verseList.style.fontSize = `${state.fontScale}rem`;
  bindControls();
  loadAndRender();
}

document.addEventListener('DOMContentLoaded', init);
