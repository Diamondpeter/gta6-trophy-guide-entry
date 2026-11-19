// Boots Leonida Platinum: loads the trophy list, restores saved progress, wires
// the toolbar and the tabs, and routes between the checklist and the pages.
import { loadTrophies } from './data.js';
import {
  DEMO_EARNED,
  exportProgress,
  importProgressFile,
  isDemoMode,
  loadNotes,
  loadProgress,
  saveNotes,
  saveProgress,
} from './store.js';
import { renderChecklist, renderMissables, renderPlanner, renderProgress, renderRoadmap, renderSave } from './views.js';

const state = {
  trophies: [],
  earned: new Set(),
  notes: new Map(),
  search: '',
  kind: 'all',
  grade: 'all',
  earnedOnly: false,
  spoilerSafe: false,
  selectedId: 28,
  tab: 'checklist',
  demo: false,
};

const actions = {
  toggleEarned(id) {
    if (state.earned.has(id)) state.earned.delete(id);
    else state.earned.add(id);
    persist();
    rerender();
  },
  select(id) {
    state.selectedId = id;
    renderChecklist(state, actions);
    renderProgress(state);
  },
  setNote(id, text) {
    if (text.trim()) state.notes.set(String(id), text);
    else state.notes.delete(String(id));
    persist();
  },
  goToTrophy(id) {
    state.selectedId = id;
    location.hash = '#/checklist';
    state.tab = 'checklist';
    showTab();
    rerender();
    document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  exportProgress() {
    exportProgress(state.earned, state.notes);
  },
  async importProgress(file) {
    try {
      const { earned, notes } = await importProgressFile(file);
      state.earned = earned;
      state.notes = notes;
      persist();
      rerender();
      window.alert(`Imported ${earned.size} earned trophies and ${notes.size} notes.`);
    } catch {
      window.alert('That file is not a progress export from this guide.');
    }
  },
  resetProgress() {
    state.earned = new Set();
    state.notes = new Map();
    persist();
    rerender();
  },
};

function persist() {
  if (state.demo) return; // demo progress never touches saved progress
  saveProgress(state.earned);
  saveNotes(state.notes);
}

function showTab() {
  for (const link of document.querySelectorAll('#tabs a')) {
    link.classList.toggle('active', link.dataset.tab === state.tab);
  }
  const isChecklist = state.tab === 'checklist';
  document.getElementById('checklistLayout').hidden = !isChecklist;
  document.getElementById('toolbar').style.display = isChecklist ? '' : 'none';
  document.getElementById('page').hidden = isChecklist;
}

function rerender() {
  renderProgress(state);
  if (state.tab === 'checklist') renderChecklist(state, actions);
  else if (state.tab === 'roadmap') renderRoadmap(state, actions);
  else if (state.tab === 'missables') renderMissables(state, actions);
  else if (state.tab === 'planner') renderPlanner(state, actions);
  else if (state.tab === 'save') renderSave(state, actions);
}

function readHash() {
  const tab = location.hash.replace('#/', '') || 'checklist';
  state.tab = ['checklist', 'roadmap', 'missables', 'planner', 'save'].includes(tab) ? tab : 'checklist';
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderChecklist(state, actions);
  });
  document.getElementById('kindFilter').addEventListener('change', (e) => {
    state.kind = e.target.value;
    renderChecklist(state, actions);
  });
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    state.grade = e.target.value;
    renderChecklist(state, actions);
  });
  document.getElementById('earnedOnly').addEventListener('change', (e) => {
    state.earnedOnly = e.target.checked;
    renderChecklist(state, actions);
  });
  document.getElementById('spoilerSafe').addEventListener('change', (e) => {
    state.spoilerSafe = e.target.checked;
    rerender();
  });
}

async function boot() {
  const doc = await loadTrophies();
  state.trophies = doc.trophies;
  state.demo = isDemoMode();
  if (state.demo) {
    state.earned = new Set(DEMO_EARNED);
    document.getElementById('demoNote').hidden = false;
  } else {
    state.earned = loadProgress();
    state.notes = loadNotes();
  }
  // The demo opens on the missable trophy's guide so the first screen shows
  // the warning, the guide and its sources at once.
  if (state.demo && !state.earned.has(28)) state.selectedId = 14;
  wireToolbar();
  window.addEventListener('hashchange', () => {
    readHash();
    showTab();
    rerender();
  });
  readHash();
  showTab();
  rerender();
}

boot().catch((error) => {
  document.getElementById('main').innerHTML =
    `<p style="padding:20px">The guide could not load its trophy list. Open it from its own files (for example with <code>node serve.ts</code>) and try again. (${error.message})</p>`;
});
