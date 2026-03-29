let synth = window.speechSynthesis;
let playbackToken = 0;

function pickVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((voice) => /en-(US|GB|NG|CA|AU)/i.test(voice.lang)) ||
    voices.find((voice) => /en/i.test(voice.lang)) ||
    voices[0]
  );
}

function splitIntoChunks(text, maxLen = 220) {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current.trim());
    }

    if (sentence.length <= maxLen) {
      current = sentence;
      continue;
    }

    const words = sentence.split(' ');
    let line = '';
    for (const word of words) {
      const wordCandidate = line ? `${line} ${word}` : word;
      if (wordCandidate.length > maxLen) {
        if (line) chunks.push(line.trim());
        line = word;
      } else {
        line = wordCandidate;
      }
    }
    current = line;
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

export function playText(content, onStart, onEnd, onError) {
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    if (onError) onError('Speech is not supported in this browser.');
    return false;
  }

  const chunks = splitIntoChunks(content);
  if (!chunks.length) {
    if (onError) onError('No readable text was found.');
    return false;
  }

  stopText();
  playbackToken += 1;
  const token = playbackToken;
  const voice = pickVoice();
  let index = 0;
  let started = false;

  const speakNext = () => {
    if (token !== playbackToken) return;
    if (index >= chunks.length) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (!started) {
        started = true;
        if (onStart) onStart();
      }
    };

    utterance.onend = () => {
      index += 1;
      speakNext();
    };

    utterance.onerror = (event) => {
      if (token !== playbackToken) return;
      if (onError) onError(event.error || 'Speech playback failed.');
    };

    synth.speak(utterance);
  };

  // Ensures voices load in browsers that populate asynchronously.
  // We do not wait for onvoiceschanged because delaying speak() breaks the
  // synchronous user-gesture requirement in many modern browsers.
  speakNext();

  return true;
}

export function stopText() {
  playbackToken += 1;
  if (synth && (synth.speaking || synth.pending)) synth.cancel();
}
