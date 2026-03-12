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
  shuffle: document.getElementById('screen-shuffle'),
  result: document.getElementById('screen-result'),
  favorites: document.getElementById('screen-favorites'),
  settings: document.getElementById('screen-settings')
};

// Check-in and Audio
const emotionChipsContainer = document.getElementById('emotion-chips');
const btnStart = document.getElementById('btn-start');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
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
const selectTestament = document.getElementById('setting-testament');
const btnClearData = document.getElementById('btn-clear-data');

// Audio Element
const bgMusic = document.getElementById('bg-music');
let isAudioPlaying = false; // Track if we've successfully started audio
let hasInteracted = false; // Track first interaction for autoplay policy

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
  else if (screenId === 'result') {
    renderVerse();
  }
  else if (screenId === 'favorites') {
    renderFavorites();
  }
}

// --- AUDIO LOGIC ---
let playPromise = null;

function attemptPlayAudio() {
  if (!appState.settings) appState.settings = getSettings();
  
  if (!appState.settings.musicMuted && !isAudioPlaying && bgMusic) {
    if (playPromise !== null) return; // Already attempting to play
    
    playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioPlaying = true;
        updateAudioToggleIcon();
        playPromise = null;
      }).catch(err => {
        console.log("Audio play failed: ", err);
        playPromise = null;
      });
    }
  }
}

function updateAudioToggleIcon() {
  if (!appState.settings) return;
  btnAudioToggle.textContent = appState.settings.musicMuted ? '🔇' : '🔊';
}

function handleFirstInteraction() {
  if (!hasInteracted) {
    hasInteracted = true;
    attemptPlayAudio();
    // Remove listeners once interacted
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  }
}

// Listen for any interaction anywhere to start audio seamlessly
document.addEventListener('click', handleFirstInteraction);
document.addEventListener('touchstart', handleFirstInteraction);

// --- EVENT LISTENERS ---
btnStart.addEventListener('click', () => {
    navigateTo('checkin');
});
btnAudioToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent triggering document interaction if clicking toggle first
  if (!appState.settings) appState.settings = getSettings();
  
  appState.settings.musicMuted = !appState.settings.musicMuted;
  import('./store.js').then(store => store.saveSettings(appState.settings));
  
  updateAudioToggleIcon();
  
  if (appState.settings.musicMuted) {
    bgMusic.pause();
    isAudioPlaying = false;
  } else {
    attemptPlayAudio();
  }
});

btnSkipCheckin.addEventListener('click', () => {
  appState.selectedThemes = [];
  navigateTo('shuffle');
});
btnContinueCheckin.addEventListener('click', () => {
  navigateTo('shuffle');
});

// Draw interactions
btnDraw.addEventListener('click', () => {
  // Pick a verse and transition
  const pref = getSettings().testamentPreference;
  appState.currentVerse = getRandomVerse(appState.selectedThemes, pref);
  navigateTo('result');
});

// Result interactions
btnAnother.addEventListener('click', () => navigateTo('shuffle'));
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
  selectTestament.value = appState.settings.testamentPreference;
  navigateTo('settings');
});
btnCloseSettings.addEventListener('click', () => {
  navigateTo('welcome');
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
  appState.settings = getSettings();
  updateAudioToggleIcon();
  if (appState.settings.musicMuted) {
      bgMusic.pause();
  }
  
  await initEngine();
  // Ensure we start on welcome
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens.welcome.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', bootstrap);
