const GEMINI_KEY = 'YOUR_GEMINI_KEY_HERE';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

export async function explainVerse(verseText, verseRef) {
  if (GEMINI_KEY === 'YOUR_GEMINI_KEY_HERE') {
    return [
      '**What It Means:**',
      `This verse (${verseRef}) reminds us that God is present and active in everyday life. It calls us to trust Him with both big decisions and quiet moments.`,
      '',
      '**Historical Context:**',
      'The writers of Scripture often addressed people facing uncertainty, pressure, and spiritual drift. These words grounded believers in God\'s unchanging character.',
      '',
      '**For Your Life Today:**',
      'Take one practical step of obedience from this verse today. Pause, pray, and let this truth shape your words, decisions, and attitude toward others.',
      '',
      '**A Prayer For You:**',
      'Lord Jesus, let Your Word lead my heart today. Give me strength to obey what You teach and peace to trust You completely. Amen.'
    ].join('\n');
  }

  const prompt = `You are a warm, knowledgeable Bible teacher.\nExplain this Bible verse for a modern Christian:\n\n"${verseRef} — ${verseText}" (KJV)\n\nStructure your response with these exact sections:\n**What It Means:** (2-3 simple sentences)\n**Historical Context:** (1-2 sentences)\n**For Your Life Today:** (2-3 practical sentences)\n**A Prayer For You:** (1 short prayer, 2-3 sentences)\n\nKeep it warm, encouraging, and under 250 words total.`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation returned.';
}
