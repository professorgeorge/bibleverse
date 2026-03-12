const STORAGE_KEYS = {
  FAVORITES: 'quiet_space_favorites',
  HISTORY: 'quiet_space_history',
  SETTINGS: 'quiet_space_settings'
};

const DEFAULT_SETTINGS = {
  testamentPreference: 'Both',
  reducedAnimation: false,
  darkMode: false, // Alternatively, can rely purely on system preference
  musicMuted: false
};

// --- SETTINGS ---
export function getSettings() {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// --- HISTORY ---
// Keep track of recent 15 verses to avoid repeats
export function getHistory() {
  const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return history ? JSON.parse(history) : [];
}

export function addHistory(verseId) {
  let history = getHistory();
  // Remove if it's already in history to move it to the front
  history = history.filter(id => id !== verseId);
  history.unshift(verseId);
  // Keep max 15
  if (history.length > 15) {
    history = history.slice(0, 15);
  }
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// --- FAVORITES ---
export function getFavorites() {
  const favs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return favs ? JSON.parse(favs) : [];
}

export function isFavorite(verseId) {
  return getFavorites().some(v => v.id === verseId);
}

export function toggleFavorite(verse) {
  let favs = getFavorites();
  const exists = favs.find(v => v.id === verse.id);
  if (exists) {
    favs = favs.filter(v => v.id !== verse.id);
  } else {
    favs.unshift({ ...verse, _savedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  return !exists;
}
