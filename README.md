# 📖 FaithFlow — Faith Flowing Daily

> **Your all-in-one spiritual companion.** FaithFlow brings the full King James Version (KJV) Bible to your browser, paired with AI-powered verse explanations, a personal prayer journal, favourite verse saving, and daily devotional emails — all in a beautiful, responsive interface.

---

## ✨ What Is FaithFlow?

FaithFlow is a **static web application** — no account sign-up, no server, no installation required. Just open it in a browser and start reading. Everything runs on your device and loads instantly.

It was built for people who want a distraction-free, spiritually enriching Bible experience with just enough technology to deepen understanding without replacing the Word itself.

---

## 🚀 Features

### 📖 Full KJV Bible Reader
Browse all **66 books** of the King James Bible. Select any book and chapter from a dropdown, and the full verse text loads immediately from [bible-api.com](https://bible-api.com). Navigation is fast and intuitive across the entire canon — Old and New Testament alike.

### 🤖 AI Verse Explainer (Gemini)
Click on any verse while reading and an AI explanation panel slides open. It uses the **Google Gemini API** to give a clear, concise breakdown of the verse in plain language. If no API key is configured, a built-in fallback explanation is shown so the feature never breaks.

### 🙏 Prayer Journal
Write, save, and manage your personal prayers. Each entry is stored in your browser's **localStorage** — meaning your prayers stay on your device and are completely private. You can:
- Add new prayer entries with a title and body
- Mark prayers as answered and track testimonies
- Export all journal entries to a `.txt` file for safekeeping

### ⭐ Favourite Verses
While reading, save any verse to your Favourites list with one click. From the Favourites page you can:
- **Copy** a verse to your clipboard
- **Share** it using the browser's native share sheet (on supported devices)
- **Remove** it from your list at any time

### ✉️ Daily Devotionals
Subscribe with your name and email to receive a morning verse at **6AM** and an evening prayer point at **8PM**, automatically sent via an **n8n webhook** automation. This feature requires a connected n8n workflow (see [Setup](#️-setup) below).

### 🔊 Audio Bible
Listen to Bible chapters read aloud. Useful for hands-free devotional time during commutes, workouts, or quiet moments.

### 📱 Fully Responsive
The layout adapts cleanly across **mobile, tablet, and desktop** screens. The navigation collapses into a hamburger menu on smaller screens so nothing feels cramped.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS (ES Modules) | All pages and interactivity |
| Bible Data | [bible-api.com](https://bible-api.com) | Fetches KJV verse text on demand |
| AI | Google Gemini API *(optional)* | AI-generated verse explanations |
| Email Automation | n8n webhook *(optional)* | Sends scheduled devotional emails |
| Persistence | Browser `localStorage` | Saves your journal and favourites locally |

> **No frameworks. No build tools. No bundler.** The entire app runs as plain HTML, CSS, and JavaScript files — making it lightweight, fast, and easy to understand or modify.

---

## ⚡ Getting Started

You don't need Node.js, npm, or any special tools. Just a browser and a way to serve static files.

**Option A — VS Code Live Server (recommended):**
1. [Clone or download](https://github.com/chizyy7/faithflow) this repository.
2. Open the `faithflow` folder in [VS Code](https://code.visualstudio.com/).
3. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
4. Right-click `index.html` → **Open with Live Server**.

**Option B — Python or Node.js static server:**
```bash
# Python (no install needed, comes with Python 3)
python -m http.server 8000

# Node.js via npx
npx serve .
```
Then open `http://localhost:8000` in your browser.

**Option C — Direct file open:**
Double-click `index.html`. Most features work, but some browsers may block API calls (like Gemini) due to local file security restrictions. Use Option A or B for full functionality.

---

## ⚙️ Setup

FaithFlow works out of the box without any configuration. The two optional features below need API keys to unlock their full capability.

### 🤖 Google Gemini API (AI Verse Explainer)

1. Visit [Google AI Studio](https://aistudio.google.com/) and generate a **free API key**.
2. Open `assets/js/ai.js` in any text editor.
3. Find the placeholder and replace it with your key:
   ```js
   const API_KEY = "your-actual-gemini-api-key";
   ```

> Without this key, the AI panel still displays built-in fallback text — the app will not break or show errors.

---

### ✉️ n8n Devotional Email Webhook

1. Set up an [n8n](https://n8n.io/) workflow with a **Webhook** trigger node and an **Email Send** node.
2. Copy the webhook URL from n8n.
3. Open `assets/js/email.js` and replace the placeholder:
   ```js
   const WEBHOOK_URL = "https://your-n8n-instance.com/webhook/your-id";
   ```

> Without this URL configured, the subscribe form shows a friendly error message. No other features are affected.

---

## 📂 Pages

| File | What it does |
|---|---|
| `index.html` | Landing page — hero section, feature showcase, testimonials, and devotional sign-up form |
| `reader.html` | Bible reader — book/chapter picker, verse display, AI explainer panel, and audio toggle |
| `journal.html` | Prayer journal — write prayers, mark them answered, and export your entries |
| `favourites.html` | Saved verses — view, copy, share, or remove your bookmarked verses |

---

## 🗂️ Project Structure

```
faithflow/
├── index.html          # Landing / home page
├── reader.html         # Bible reader page
├── journal.html        # Prayer journal page
├── favourites.html     # Saved favourite verses page
├── style.css           # Legacy / base styles
├── script.js           # Legacy / base scripts
├── README.md
└── assets/
    ├── css/
    │   ├── style.css       # Global layout and typography
    │   ├── components.css  # Reusable UI components (cards, buttons, modals)
    │   └── reader.css      # Bible reader-specific styles
    └── js/
        ├── app.js          # Navbar, scroll reveal, smooth scroll, toast notifications
        ├── bible.js        # Bible API fetch logic and book/chapter data
        ├── search.js       # Verse search functionality
        ├── ai.js           # Gemini API integration for verse explanations
        ├── audio.js        # Audio Bible playback
        ├── journal.js      # Prayer journal data layer (localStorage read/write)
        ├── favourites.js   # Favourites data layer (localStorage read/write)
        ├── email.js        # n8n webhook subscription handler
        ├── bible-page.js   # Reader page controller
        ├── journal-page.js # Journal page controller
        └── favourites-page.js # Favourites page controller
```

---

## 💡 How It Works (End-to-End)

1. **You open the Bible reader.** The app fetches chapter text from `bible-api.com` over HTTPS and renders it verse by verse.
2. **You click a verse.** The verse reference and text are sent to the Gemini API. The response is shown in a side panel.
3. **You save a verse.** It is written to `localStorage` under a `favourites` key. It persists across sessions.
4. **You write a prayer.** Entries are saved to `localStorage` under a `journal` key. You can export them anytime.
5. **You subscribe to devotionals.** Your name and email are posted to the n8n webhook URL. n8n handles scheduling and email delivery.

---

## ⚠️ Important Notes

- **This is a fully static app** — there is no backend, no database, and no server-side code.
- **All user data (journal and favourites) is stored in your browser's localStorage.** Clearing your browser data will erase your saved entries, so export your journal regularly.
- **The Gemini API key is exposed in client-side JavaScript.** For a production deployment, route API requests through a serverless function or proxy to keep your key private.
- For production use, consider adding: input validation hardening, analytics, API error telemetry, and a Content Security Policy (CSP) header.

---

## 📄 License

MIT — free to use, modify, and distribute.
