# Quiet Space

A self-contained, offline-first Progressive Web App (PWA) designed to provide a short, calming spiritual experience for users feeling overwhelmed or in need of hope.

## Features
- **Emotional Check-in**: Select how you are feeling (or skip).
- **Meditation Pause**: Configurable 5/10/15 second breathing circle.
- **Verse Selection Engine**: Randomly provides an encouraging verse matching your chosen emotions (from `data/verses.json`).
- **Complete Privacy**: All favorites, history, and preferences are stored entirely locally `localStorage`. No analytics or user accounts.
- **Offline Capable**: Once loaded once, you can install the app on mobile or desktop and it fully operates offline via a Service Worker.

## Architecture & Stack Choice
- **HTML/JS/CSS (Vanilla)**: The goal was an extremely lightweight, maintainable app without build steps or complex chains. By using ECMAScript modules and native browser APIs, the source code stays small and works perfectly on static hosting (like GitHub Pages).
- **CSS Variables**: A bespoke, minimal design language utilizing CSS variables for soft transitions and a calming palette.
- **PWA Service Worker**: `service-worker.js` caches all critical HTML, JS, CSS, and JSON files on initial load.

## Data Structure
Verses are stored locally at `data/verses.json`. 
Each verse carries:
- `id`: unique identifier
- `reference`: scripture location (e.g., "Philippians 4:6-7")
- `text`: the text
- `testament`: "OT" or "NT"
- `themes`: array of matching themes (e.g., `["Anxiety", "Peace", "Trust"]`)

## How to Run Locally

You can run this project locally with any simple HTTP server (do not open `index.html` directly in the browser via `file://` because ES Module imports and Service Workers require `http://` or `https://`).

### Using Python:
```bash
python -m http.server 3000
```
Then navigate to `http://localhost:3000`

### Using VS Code:
Install the **Live Server** extension, open the folder, and click "Go Live" in the bottom right corner.
