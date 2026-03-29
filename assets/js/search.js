import { loadChapter } from './bible.js';

export async function searchVerses(query) {
  if (!query || query.trim().length < 3) return [];
  const url = `https://bible-api.com/?search=${encodeURIComponent(query.trim())}&translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.verses || []).slice(0, 20);
}

export async function jumpToReference(reference) {
  const [bookPart, chapterVerse] = reference.split(/\s(?=\d+:\d+$)/);
  if (!bookPart || !chapterVerse) return null;
  const chapter = Number(chapterVerse.split(':')[0]);
  return loadChapter(bookPart, chapter);
}
