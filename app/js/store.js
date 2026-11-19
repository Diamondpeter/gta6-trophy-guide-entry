// Saved progress: which trophies are earned and the reader's own notes, kept in
// localStorage so the checklist survives closing the browser. Export writes the
// same data as a JSON file; import reads one back. Nothing leaves the browser.
const PROGRESS_KEY = 'leonida-platinum-progress-v1';
const NOTES_KEY = 'leonida-platinum-notes-v1';

// A demo set of 13 earned trophies, used only when the page opens with ?demo=1
// (for example to show the tracker in a screenshot). Demo progress is kept in
// memory only and never touches the reader's saved progress.
export const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 19, 21, 28, 33, 35, 42, 52];

export function isDemoMode() {
  return new URLSearchParams(location.search).has('demo');
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return new Map(Object.entries(obj ?? {}));
  } catch {
    return new Map();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(Object.fromEntries(notes)));
}

export function exportProgress(earned, notes) {
  const payload = {
    app: 'Leonida Platinum — GTA VI trophy tracker',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    notes: Object.fromEntries(notes),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const earned = new Set(Array.isArray(data.earned) ? data.earned : data);
  const notes = new Map(Object.entries(data.notes ?? {}));
  return { earned, notes };
}
