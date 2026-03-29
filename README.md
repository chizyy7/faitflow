# 📖 FaithFlow — Faith Flowing Daily

A beautiful KJV Bible web app with AI verse explanation, prayer journal, and daily devotionals.

## Features

- Full KJV Bible reader with all 66 books and chapter navigation
- AI verse insight panel (Gemini-ready, safe fallback text included)
- Prayer Journal with localStorage persistence and export to `.txt`
- Favourite verses with copy, share, and remove actions
- Daily devotional email capture (n8n webhook-ready)
- Responsive design for mobile, tablet, and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Bible Data | bible-api.com |
| AI | Google Gemini API (optional) |
| Email Automation | n8n webhook (optional) |
| Persistence | localStorage |

## Getting Started

1. Clone or download this repository.
2. Open the `faithflow` folder in VS Code.
3. Launch `index.html` with a static server or Live Server extension.

## Setup

### Gemini API

Edit `assets/js/ai.js` and replace:

- `YOUR_GEMINI_KEY_HERE`

### n8n Webhook

Edit `assets/js/email.js` and replace:

- `YOUR_N8N_WEBHOOK_URL_HERE`

## Pages

- `index.html` - Landing page
- `reader.html` - Bible reader
- `journal.html` - Prayer journal
- `favourites.html` - Saved favourite verses

## Project Structure

```
faithflow/
├── index.html
├── reader.html
├── journal.html
├── favourites.html
├── README.md
└── assets/
    ├── css/
    │   ├── style.css
    │   ├── components.css
    │   └── reader.css
    └── js/
        ├── app.js
        ├── bible.js
        ├── search.js
        ├── ai.js
        ├── journal.js
        ├── audio.js
        ├── favourites.js
        ├── email.js
        ├── bible-page.js
        ├── journal-page.js
        └── favourites-page.js
```

## Notes

- This is a static app with no backend.
- All user data is stored locally in browser localStorage.
- For production, add analytics, validation hardening, and API error telemetry.

## License

MIT
