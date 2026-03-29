document.addEventListener('DOMContentLoaded', () => {
    // ---- STATE ----
    const state = {
        baseFontSize: 1.1, // rem
        currentBook: 'John',
        currentChapter: 1,
        selectedVerseText: null,
        selectedVerseRef: null,
        favourites: JSON.parse(localStorage.getItem('faithflow_favourites')) || [],
        journal: JSON.parse(localStorage.getItem('faithflow_journal')) || [],
        isPlayingAudio: false
    };

    const BOOKS = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
        "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
        "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
        "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
        "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
        "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
        "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John",
        "3 John", "Jude", "Revelation"
    ];

    // Number of chapters per book (approximate/abridged for demo, could fetch from API if needed)
    // We will dynamically just show up to 150 for Psalms, etc.
    const getChaptersForBook = (book) => {
        if(book === "Psalms") return 150;
        if(book === "Isaiah") return 66;
        if(book === "Genesis") return 50;
        if(book === "Revelation") return 22;
        if(book === "John" || book === "Luke") return 24;
        if(book === "Matthew" || book === "Acts") return 28;
        if(book === "Mark") return 16;
        return 30; // Default fallback layout
    };

    // ---- DOM ELEMENTS ----
    const elements = {
        navLinks: document.querySelectorAll('.nav-link'),
        workspace: document.querySelector('.workspace'),
        favouritesSection: document.getElementById('favouritesSection'),
        journalFullSection: document.getElementById('journalFullSection'),
        
        bookSelect: document.getElementById('bookSelect'),
        chapterGrid: document.getElementById('chapterGrid'),
        versesContainer: document.getElementById('versesContainer'),
        verseLoader: document.getElementById('verseLoader'),
        currentReference: document.getElementById('currentReference'),
        prevChapter: document.getElementById('prevChapter'),
        nextChapter: document.getElementById('nextChapter'),
        
        fontLess: document.getElementById('fontLess'),
        fontMore: document.getElementById('fontMore'),
        
        selectedVerseDisplay: document.getElementById('selectedVerseDisplay'),
        explainBtn: document.getElementById('explainBtn'),
        aiResponse: document.getElementById('aiResponse'),
        
        journalTitle: document.getElementById('journalTitle'),
        journalText: document.getElementById('journalText'),
        saveJournalBtn: document.getElementById('saveJournalBtn'),
        journalGrid: document.getElementById('journalGrid'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        exportJournalBtn: document.getElementById('exportJournalBtn'),
        
        favouritesGrid: document.getElementById('favouritesGrid'),
        
        searchInput: document.getElementById('searchInput'),
        searchResultsOverlay: document.getElementById('searchResultsOverlay'),
        searchResultsContent: document.getElementById('searchResultsContent'),
        closeSearchBtn: document.getElementById('closeSearchBtn'),
        
        subscribeForm: document.getElementById('subscribeForm'),
        formMsg: document.getElementById('formMsg'),
        
        playAudio: document.getElementById('playAudio'),
        stopAudio: document.getElementById('stopAudio')
    };

    let synth = window.speechSynthesis;
    let utterance = null;

    // ---- INITIALIZATION ----
    const init = () => {
        populateBooks();
        loadChapter(state.currentBook, state.currentChapter);
        setupEventListeners();
        renderJournal();
        renderFavourites();
    };

    const populateBooks = () => {
        elements.bookSelect.innerHTML = BOOKS.map(b => `<option value="${b}">${b}</option>`).join('');
        elements.bookSelect.value = state.currentBook;
        renderChapterGrid(state.currentBook);
    };

    const renderChapterGrid = (book) => {
        const count = getChaptersForBook(book);
        let html = '';
        for(let i = 1; i <= count; i++){
            html += `<button class="chapter-btn ${i === state.currentChapter && state.currentBook === book ? 'active' : ''}" data-chapter="${i}">${i}</button>`;
        }
        elements.chapterGrid.innerHTML = html;
        
        document.querySelectorAll('.chapter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapter = parseInt(e.target.dataset.chapter);
                loadChapter(state.currentBook, chapter);
            });
        });
    };

    // ---- API LOGIC ----
    const loadChapter = async (book, chapter) => {
        state.currentBook = book;
        state.currentChapter = chapter;
        
        elements.bookSelect.value = book;
        renderChapterGrid(book);
        
        elements.currentReference.textContent = `${book} ${chapter}`;
        elements.versesContainer.innerHTML = '';
        elements.verseLoader.classList.remove('hidden');
        elements.verseLoader.style.display = 'block';

        stopAudio(); // Stop any playing audio when changing chapters

        try {
            const response = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=kjv`);
            const data = await response.json();
            
            elements.verseLoader.style.display = 'none';
            renderVerses(data.verses);
        } catch (err) {
            elements.verseLoader.textContent = "Failed to load scripture. Please try again.";
        }
    };

    const renderVerses = (verses) => {
        if(!verses || verses.length === 0) return;
        
        let html = '';
        verses.forEach(v => {
            const isFav = state.favourites.some(fav => fav.reference === `${v.book_name} ${v.chapter}:${v.verse}`);
            html += `
                <div class="verse" data-ref="${v.book_name} ${v.chapter}:${v.verse}">
                    <span class="verse-num">${v.verse}</span>
                    <span class="verse-text">${v.text}</span>
                    <div class="verse-actions">
                        <button class="verse-action-btn ${isFav ? 'active' : ''}" data-action="fav" title="Favourite"><ion-icon name="heart${isFav ? '' : '-outline'}"></ion-icon></button>
                        <button class="verse-action-btn" data-action="copy" title="Copy"><ion-icon name="copy-outline"></ion-icon></button>
                    </div>
                </div>
            `;
        });
        elements.versesContainer.innerHTML = html;

        // Verse Selection Event
        document.querySelectorAll('.verse').forEach(verseEl => {
            verseEl.addEventListener('click', (e) => {
                // Ignore clicks on action buttons
                if(e.target.closest('.verse-action-btn')) return;

                document.querySelectorAll('.verse').forEach(v => v.classList.remove('selected'));
                verseEl.classList.add('selected');
                
                const ref = verseEl.dataset.ref;
                const text = verseEl.querySelector('.verse-text').textContent;
                
                state.selectedVerseRef = ref;
                state.selectedVerseText = text;
                
                elements.selectedVerseDisplay.innerHTML = `<strong>${ref}</strong>: "${text}"`;
                elements.explainBtn.classList.remove('hidden');
                elements.aiResponse.classList.remove('active');
            });
        });

        // Action Buttons Event
        document.querySelectorAll('.verse-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const verseEl = btn.closest('.verse');
                const ref = verseEl.dataset.ref;
                const text = verseEl.querySelector('.verse-text').textContent;

                if (action === 'fav') {
                    toggleFavourite(ref, text, btn);
                } else if (action === 'copy') {
                    navigator.clipboard.writeText(`${ref} - ${text}`).then(() => {
                        const icon = btn.querySelector('ion-icon');
                        icon.setAttribute('name', 'checkmark-outline');
                        setTimeout(() => icon.setAttribute('name', 'copy-outline'), 2000);
                    });
                }
            });
        });
    };

    // ---- FAVOURITES LOGIC ----
    const toggleFavourite = (ref, text, btn) => {
        const index = state.favourites.findIndex(f => f.reference === ref);
        if (index > -1) {
            state.favourites.splice(index, 1);
            btn.classList.remove('active');
            btn.querySelector('ion-icon').setAttribute('name', 'heart-outline');
        } else {
            state.favourites.push({ reference: ref, text: text, addedAt: new Date().toISOString() });
            btn.classList.add('active');
            btn.querySelector('ion-icon').setAttribute('name', 'heart');
        }
        localStorage.setItem('faithflow_favourites', JSON.stringify(state.favourites));
        renderFavourites();
    };

    const renderFavourites = () => {
        if(state.favourites.length === 0){
            elements.favouritesGrid.innerHTML = `<p style="color:var(--cream-muted);">You have no saved verses yet.</p>`;
            return;
        }

        elements.favouritesGrid.innerHTML = state.favourites.map(fav => `
            <div class="fav-card">
                <div class="journal-date">${new Date(fav.addedAt).toLocaleDateString()}</div>
                <div class="journal-title" style="color:var(--gold);">${fav.reference}</div>
                <div class="journal-body">"${fav.text}"</div>
                <button class="btn-secondary remove-fav-btn" data-ref="${fav.reference}">Remove</button>
            </div>
        `).join('');

        document.querySelectorAll('.remove-fav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ref = btn.dataset.ref;
                state.favourites = state.favourites.filter(f => f.reference !== ref);
                localStorage.setItem('faithflow_favourites', JSON.stringify(state.favourites));
                renderFavourites();
                // Also update reader view if currently viewing
                loadChapter(state.currentBook, state.currentChapter);
            });
        });
    };

    // ---- PRAYER JOURNAL LOGIC ----
    const saveJournal = () => {
        const title = elements.journalTitle.value.trim();
        const text = elements.journalText.value.trim();
        
        if(!title || !text) return alert("Please enter both title and prayer text.");

        const entry = {
            id: Date.now().toString(),
            title: title,
            text: text,
            reference: state.selectedVerseRef, // attach verse if selected
            date: new Date().toISOString(),
            status: 'pending' // pending or answered
        };

        state.journal.unshift(entry);
        localStorage.setItem('faithflow_journal', JSON.stringify(state.journal));
        
        elements.journalTitle.value = '';
        elements.journalText.value = '';
        elements.selectedVerseDisplay.innerHTML = '';
        elements.explainBtn.classList.add('hidden');
        state.selectedVerseRef = null;
        state.selectedVerseText = null;
        
        renderJournal();
        alert("Prayer saved to journal.");
    };

    const renderJournal = (filter = 'all') => {
        let list = state.journal;
        if(filter !== 'all'){
            list = list.filter(j => j.status === filter);
        }

        if(list.length === 0){
            elements.journalGrid.innerHTML = `<p style="color:var(--cream-muted);">No prayers found in this category.</p>`;
            return;
        }

        elements.journalGrid.innerHTML = list.map(entry => `
            <div class="journal-card" style="${entry.status === 'answered' ? 'border-color: #2ecc71;' : ''}">
                <div class="journal-date">${new Date(entry.date).toLocaleDateString()} ${entry.status === 'answered' ? '✅ Answered' : ''}</div>
                <div class="journal-title">${entry.title}</div>
                ${entry.reference ? `<div class="journal-ref">${entry.reference}</div>` : ''}
                <div class="journal-body">${entry.text}</div>
                <div class="journal-actions">
                    <button class="btn-icon toggle-status-btn" data-id="${entry.id}" title="${entry.status === 'pending' ? 'Mark Answered' : 'Mark Pending'}">
                        <ion-icon name="${entry.status === 'pending' ? 'checkmark-circle-outline' : 'ellipse-outline'}"></ion-icon>
                    </button>
                    <button class="btn-icon delete-journal-btn" data-id="${entry.id}" title="Delete">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const entryIndex = state.journal.findIndex(j => j.id === id);
                if (entryIndex > -1) {
                    state.journal[entryIndex].status = state.journal[entryIndex].status === 'pending' ? 'answered' : 'pending';
                    localStorage.setItem('faithflow_journal', JSON.stringify(state.journal));
                    renderJournal(filter);
                }
            });
        });

        document.querySelectorAll('.delete-journal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if(confirm("Delete this prayer?")) {
                    const id = btn.dataset.id;
                    state.journal = state.journal.filter(j => j.id !== id);
                    localStorage.setItem('faithflow_journal', JSON.stringify(state.journal));
                    renderJournal(filter);
                }
            });
        });
    };

    const exportJournal = () => {
        let text = "FaithFlow Prayer Journal\n\n";
        state.journal.forEach(j => {
            text += `Date: ${new Date(j.date).toLocaleDateString()}\n`;
            text += `Title: ${j.title}\n`;
            text += `Status: ${j.status.toUpperCase()}\n`;
            if(j.reference) text += `Verse: ${j.reference}\n`;
            text += `Prayer: ${j.text}\n\n-----------------\n\n`;
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faithflow_journal_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ---- SEARCH LOGIC ----
    let searchTimeout;
    const handleSearch = (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        
        if (query.length < 3) {
            elements.searchResultsOverlay.classList.add('hidden');
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                elements.searchResultsOverlay.classList.remove('hidden');
                elements.searchResultsContent.innerHTML = '<p style="color:var(--gold);">Searching...</p>';
                
                const response = await fetch(`https://bible-api.com/?search=${encodeURIComponent(query)}&translation=kjv`);
                const data = await response.json();
                
                if (data.verses && data.verses.length > 0) {
                    elements.searchResultsContent.innerHTML = data.verses.slice(0, 15).map(v => `
                        <div class="search-result-item" data-book="${v.book_name}" data-chapter="${v.chapter}">
                            <div class="search-ref">${v.book_name} ${v.chapter}:${v.verse}</div>
                            <div>"${v.text}"</div>
                        </div>
                    `).join('');
                    
                    document.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const book = item.dataset.book;
                            const chap = parseInt(item.dataset.chapter);
                            loadChapter(book, chap);
                            elements.searchResultsOverlay.classList.add('hidden');
                            elements.searchInput.value = '';
                            
                            // switch tab
                            elements.navLinks.forEach(l => l.classList.remove('active'));
                            document.querySelector('a[href="#reader"]').classList.add('active');
                            elements.workspace.classList.remove('hidden');
                            elements.favouritesSection.classList.add('hidden');
                            elements.journalFullSection.classList.add('hidden');
                        });
                    });
                } else {
                    elements.searchResultsContent.innerHTML = '<p>No results found.</p>';
                }
            } catch (err) {
                elements.searchResultsContent.innerHTML = '<p>Error searching. Try again later.</p>';
            }
        }, 500); // 500ms debounce
    };

    // ---- AUDIO BIBLE LOGIC ----
    const playAudio = () => {
        if (!synth) return alert("Text-to-speech not supported in this browser.");
        
        const textElements = document.querySelectorAll('.verse-text');
        if (textElements.length === 0) return;
        
        let fullText = `${state.currentBook} Chapter ${state.currentChapter}. `;
        textElements.forEach((el, index) => {
            fullText += `Verse ${index + 1}. ${el.textContent} `;
        });

        stopAudio(); // clear previous
        
        utterance = new SpeechSynthesisUtterance(fullText);
        utterance.rate = 0.9;
        utterance.pitch = 0.9; // deeper reading voice
        
        // Find an english voice if possible
        const voices = synth.getVoices();
        const engVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
        if (engVoice) utterance.voice = engVoice;

        utterance.onstart = () => { state.isPlayingAudio = true; elements.playAudio.classList.add('active'); };
        utterance.onend = () => { state.isPlayingAudio = false; elements.playAudio.classList.remove('active'); };
        
        synth.speak(utterance);
    };

    const stopAudio = () => {
        if (synth && synth.speaking) {
            synth.cancel();
            state.isPlayingAudio = false;
            elements.playAudio.classList.remove('active');
        }
    };

    // ---- GEMINI MOCK LOGIC ----
    const explainVerse = () => {
        if (!state.selectedVerseRef) return;
        
        elements.aiResponse.classList.add('active');
        elements.aiResponse.innerHTML = `<span style="color:var(--gold); font-style:italic;">Seeking divine insight...</span>`;
        
        // Simulating an API call to Gemini (Since no actual API key is provided here for safety/limits)
        setTimeout(() => {
            const verse = state.selectedVerseRef;
            elements.aiResponse.innerHTML = `
                <h4 style="color:var(--gold); margin-bottom:10px;">Understanding ${verse}</h4>
                <p style="margin-bottom:10px;"><strong>Historical Context:</strong> This passage was written during a time of immense transition, designed to offer hope and grounding to early believers. It emphasizes that faith is an active, living force.</p>
                <p style="margin-bottom:10px;"><strong>Practical Application:</strong> In our modern lives, it's easy to get distracted by noise and anxiety. This verse reminds us to center ourselves, finding peace in promises rather than immediate circumstances. Take a moment today to breathe and reflect on where you place your trust.</p>
                <p style="font-style:italic; color:var(--cream-muted);"><strong>Prayer:</strong> Lord, help me to embody the truth of this verse today. Let it be a lamp to my feet and a guide to my actions. Amen.</p>
            `;
        }, 1500);
    };

    // ---- EVENT LISTENERS SETUP ----
    const setupEventListeners = () => {
        // Navigation Hooks
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                elements.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const target = link.getAttribute('href');
                elements.workspace.classList.add('hidden');
                elements.favouritesSection.classList.add('hidden');
                elements.journalFullSection.classList.add('hidden');
                
                if (target === '#reader') elements.workspace.classList.remove('hidden');
                if (target === '#journal') elements.journalFullSection.classList.remove('hidden');
                if (target === '#favourites') elements.favouritesSection.classList.remove('hidden');
            });
        });

        // Reader Controls
        elements.bookSelect.addEventListener('change', (e) => loadChapter(e.target.value, 1));
        
        elements.prevChapter.addEventListener('click', () => {
            if (state.currentChapter > 1) {
                loadChapter(state.currentBook, state.currentChapter - 1);
            } else {
                const bookIndex = BOOKS.indexOf(state.currentBook);
                if (bookIndex > 0) {
                    const prevBook = BOOKS[bookIndex - 1];
                    loadChapter(prevBook, getChaptersForBook(prevBook));
                }
            }
        });

        elements.nextChapter.addEventListener('click', () => {
            const maxCh = getChaptersForBook(state.currentBook);
            if (state.currentChapter < maxCh) {
                loadChapter(state.currentBook, state.currentChapter + 1);
            } else {
                const bookIndex = BOOKS.indexOf(state.currentBook);
                if (bookIndex < BOOKS.length - 1) {
                    loadChapter(BOOKS[bookIndex + 1], 1);
                }
            }
        });

        // Font sizing
        elements.fontMore.addEventListener('click', () => {
            if (state.baseFontSize < 1.8) {
                state.baseFontSize += 0.1;
                elements.versesContainer.style.fontSize = `${state.baseFontSize}rem`;
            }
        });
        
        elements.fontLess.addEventListener('click', () => {
            if (state.baseFontSize > 0.8) {
                state.baseFontSize -= 0.1;
                elements.versesContainer.style.fontSize = `${state.baseFontSize}rem`;
            }
        });

        // Search
        elements.searchInput.addEventListener('input', handleSearch);
        elements.closeSearchBtn.addEventListener('click', () => {
            elements.searchResultsOverlay.classList.add('hidden');
            elements.searchInput.value = '';
        });

        // Journal
        elements.saveJournalBtn.addEventListener('click', saveJournal);
        elements.exportJournalBtn.addEventListener('click', exportJournal);
        
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderJournal(btn.dataset.filter);
            });
        });

        // AI Explainer
        elements.explainBtn.addEventListener('click', explainVerse);

        // Subscription Form (n8n Webhook Mock)
        elements.subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('subName').value;
            const email = document.getElementById('subEmail').value;
            
            // Mocking webhook POST
            elements.formMsg.style.color = 'var(--gold)';
            elements.formMsg.textContent = "Submitting to n8n webhook...";
            
            setTimeout(() => {
                elements.formMsg.style.color = '#2ecc71';
                elements.formMsg.textContent = `Welcome, ${name}! You'll receive your first devotional tomorrow at 6:00 AM.`;
                elements.subscribeForm.reset();
            }, 1000);
        });

        // Audio Controls
        elements.playAudio.addEventListener('click', () => {
            if (state.isPlayingAudio) {
                stopAudio();
            } else {
                playAudio();
            }
        });
        
        elements.stopAudio.addEventListener('click', stopAudio);
        
        // Voice initialization workaround for some browsers
        if(speechSynthesis !== undefined) {
             speechSynthesis.onvoiceschanged = () => {
                 // Forces voices to load
                 speechSynthesis.getVoices();
             };
        }
    };

    const setupHeroDepth = () => {
        const hero3D = document.querySelector('.hero-3d');
        if (!hero3D) return;

        const resetTilt = () => {
            hero3D.style.setProperty('--scene-tilt-x', '-8deg');
            hero3D.style.setProperty('--scene-tilt-y', '18deg');
        };

        hero3D.addEventListener('pointermove', (e) => {
            const rect = hero3D.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const tiltY = (x - 0.5) * 18;
            const tiltX = (0.5 - y) * 16;

            hero3D.style.setProperty('--scene-tilt-x', `${tiltX}deg`);
            hero3D.style.setProperty('--scene-tilt-y', `${tiltY}deg`);
        });

        hero3D.addEventListener('pointerleave', resetTilt);
        resetTilt();
    };

    // Kickoff
    init();
    setupHeroDepth();
});
