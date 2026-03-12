import { getHistory, addHistory } from './store.js';

let versesPool = [];

export async function initEngine() {
  try {
    const response = await fetch('./data/verses.json');
    versesPool = await response.json();
    console.log(`Loaded ${versesPool.length} verses.`);
  } catch (error) {
    console.error("Failed to load generic verses pool.", error);
    // Fallback in case of absolute failure offline
    versesPool = [
      {
        id: "v-emergency",
        reference: "Matthew 11:28",
        text: "Come to me, all you who are weary and burdened, and I will give you rest.",
        testament: "NT",
        themes: ["Rest", "Peace"]
      }
    ];
  }
}

export function getRandomVerse(selectedThemes = [], testamentPref = 'Both') {
  let subset = versesPool;

  // Filter by testament
  if (testamentPref !== 'Both') {
    subset = subset.filter(v => v.testament === testamentPref);
  }

  // Filter by themes if user selected any
  if (selectedThemes.length > 0) {
    subset = subset.filter(v => {
      // Verse matches if any of the verse themes match any of the selected themes
      return v.themes.some(t => selectedThemes.includes(t));
    });
  }

  // If filtering was too restrictive, fallback to whole pool (or testament pool)
  if (subset.length === 0) {
    subset = versesPool;
    if (testamentPref !== 'Both') {
      subset = subset.filter(v => v.testament === testamentPref);
    }
  }

  // Filter out recent history
  const history = getHistory();
  let candidateSubset = subset.filter(v => !history.includes(v.id));

  // If history filtered everything out, just use the subset
  if (candidateSubset.length === 0) {
    candidateSubset = subset;
  }

  // Pick random
  const randomIndex = Math.floor(Math.random() * candidateSubset.length);
  const pickedVerse = candidateSubset[randomIndex];

  // Record history
  addHistory(pickedVerse.id);

  return pickedVerse;
}

export function getAllThemes() {
  const allThemes = new Set();
  versesPool.forEach(v => {
    v.themes.forEach(t => allThemes.add(t));
  });
  return Array.from(allThemes).sort();
}
