import { initEngine, getRandomVerse, getAllThemes } from './engine.js';
import { getSettings, isFavorite, toggleFavorite, getFavorites } from './store.js';

// --- STATE ---
const appState = {
  currentScreen: 'welcome',
  selectedThemes: [],
  currentVerse: null,
  settings: null
};

// --- DOM ELEMENTS ---
const screens = {
  welcome: document.getElementById('screen-welcome'),
  checkin: document.getElementById('screen-checkin'),
  pause: document.getElementById('screen-pause'),
  shuffle: document.getElementById('screen-shuffle'),
  result: document.getElementById('screen-result'),
  favorites: document.getElementById('screen-favorites'),
  settings: document.getElementById('screen-settings')
};

// Check-in
const emotionChipsContainer = document.getElementById('emotion-chips');
const btnStart = document.getElementById('btn-start');
const btnContinueCheckin = document.getElementById('btn-continue');
const btnSkipCheckin = document.getElementById('btn-skip');

// Shuffle & Pause
const btnDraw = document.getElementById('btn-draw');

// Result
const verseTextEl = document.getElementById('verse-text');
const verseRefEl = document.getElementById('verse-ref');
const btnFavorite = document.getElementById('btn-favorite');
const btnCopy = document.getElementById('btn-copy');
const btnAnother = document.getElementById('btn-another');
const btnRestart = document.getElementById('btn-restart');

// Favorites
const btnViewFavorites = document.getElementById('btn-favorites');
const btnBackHome = document.getElementById('btn-back-home');
const favoritesList = document.getElementById('favorites-list');

// Settings Navigation
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const selectDuration = document.getElementById('setting-duration');
const selectTestament = document.getElementById('setting-testament');
const btnClearData = document.getElementById('btn-clear-data');

// --- NAVIGATION LOGIC ---
function navigateTo(screenId) {
  // Fade out current
  const current = screens[appState.currentScreen];
  current.classList.add('fade-out');
  
  setTimeout(() => {
    current.classList.add('hidden');
    current.classList.remove('fade-out');
    
    // Show new
    const next = screens[screenId];
    next.classList.remove('hidden');
    next.classList.add('fade-in');
    
    setTimeout(() => {
      next.classList.remove('fade-in');
    }, 400);

    appState.currentScreen = screenId;
    onScreenEnter(screenId);
  }, 400); // match CSS var(--transition-smooth)
}

// --- SCREEN LOGIC ---
async function onScreenEnter(screenId) {
  if (screenId === 'checkin') {
    renderChips();
  }
  else if (screenId === 'pause') {
    const settings = getSettings();
    const duration = settings.meditationDuration * 1000;
    
    // Automatically advance after meditation duration
    setTimeout(() => {
      if (appState.currentScreen === 'pause') {
        navigateTo('shuffle');
      }
    }, duration);
  }
  else if (screenId === 'result') {
    renderVerse();
  }
  else if (screenId === 'favorites') {
    renderFavorites();
  }
}

// --- EVENT LISTENERS ---
btnStart.addEventListener('click', () => navigateTo('checkin'));
btnSkipCheckin.addEventListener('click', () => {
  appState.selectedThemes = [];
  navigateTo('pause');
});
btnContinueCheckin.addEventListener('click', () => {
  navigateTo('pause');
});

// Draw interactions
btnDraw.addEventListener('click', () => {
  // Pick a verse and transition
  const pref = getSettings().testamentPreference;
  appState.currentVerse = getRandomVerse(appState.selectedThemes, pref);
  navigateTo('result');
});

// Result interactions
btnAnother.addEventListener('click', () => navigateTo('pause'));
btnRestart.addEventListener('click', () => {
  appState.selectedThemes = [];
  navigateTo('welcome');
});

btnFavorite.addEventListener('click', () => {
  if (appState.currentVerse) {
    const isSaved = toggleFavorite(appState.currentVerse);
    btnFavorite.textContent = isSaved ? '♥ Saved' : '♡ Save';
  }
});

btnCopy.addEventListener('click', async () => {
  if (appState.currentVerse) {
    const textToCopy = `"${appState.currentVerse.text}" - ${appState.currentVerse.reference}\n\nFrom Quiet Space`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = btnCopy.textContent;
      btnCopy.textContent = '✓ Copied!';
      setTimeout(() => btnCopy.textContent = originalText, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
});

// Favorites Navigation
btnViewFavorites.addEventListener('click', () => navigateTo('favorites'));
btnBackHome.addEventListener('click', () => navigateTo('welcome'));

// Settings Interactions
btnSettings.addEventListener('click', () => {
  appState.settings = getSettings();
  selectDuration.value = appState.settings.meditationDuration;
  selectTestament.value = appState.settings.testamentPreference;
  navigateTo('settings');
});
btnCloseSettings.addEventListener('click', () => {
  navigateTo('welcome');
});

selectDuration.addEventListener('change', (e) => {
  appState.settings.meditationDuration = parseInt(e.target.value);
  import('./store.js').then(store => store.saveSettings(appState.settings));
});

selectTestament.addEventListener('change', (e) => {
  appState.settings.testamentPreference = e.target.value;
  import('./store.js').then(store => store.saveSettings(appState.settings));
});

btnClearData.addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all saved verses, history, and settings? This cannot be undone.")) {
    localStorage.clear();
    alert("Data cleared.");
    window.location.reload();
  }
});

// --- RENDERERS ---
function renderChips() {
  const themes = getAllThemes();
  emotionChipsContainer.innerHTML = '';
  
  themes.forEach(theme => {
    const chip = document.createElement('div');
    chip.className = `chip ${appState.selectedThemes.includes(theme) ? 'selected' : ''}`;
    chip.textContent = theme;
    
    chip.addEventListener('click', () => {
      if (appState.selectedThemes.includes(theme)) {
        appState.selectedThemes = appState.selectedThemes.filter(t => t !== theme);
        chip.classList.remove('selected');
      } else {
        appState.selectedThemes.push(theme);
        chip.classList.add('selected');
      }
    });

    emotionChipsContainer.appendChild(chip);
  });
}

function renderVerse() {
  if (!appState.currentVerse) return;
  
  verseTextEl.textContent = `"${appState.currentVerse.text}"`;
  verseRefEl.textContent = `- ${appState.currentVerse.reference}`;
  
  btnFavorite.textContent = isFavorite(appState.currentVerse.id) ? '♥ Saved' : '♡ Save';
}

function renderFavorites() {
  const favs = getFavorites();
  favoritesList.innerHTML = '';
  
  if (favs.length === 0) {
    favoritesList.innerHTML = '<p style="color: var(--text-muted); text-align:center;">No saved verses yet.</p>';
    return;
  }
  
  favs.forEach(v => {
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.innerHTML = `
      <p class="text">"${v.text}"</p>
      <p class="ref">${v.reference}</p>
    `;
    favoritesList.appendChild(div);
  });
}

// --- BOOTSTRAP ---
async function bootstrap() {
  await initEngine();
  // Ensure we start on welcome
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens.welcome.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', bootstrap);
