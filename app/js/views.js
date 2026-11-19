// Renders every view of the guide: the checklist with its detail pane, the
// roadmap, the missables page, the Next-up planner and the save page.
import { KIND_LABELS, STAGES, stageTrophies } from './data.js';
import { applyFilters, countByGrade, isSpoilerHidden, nextUp } from './filters.js';

function gradeTag(grade) {
  return `<span class="tag grade-${grade}">${grade}</span>`;
}

function countTag(trophy) {
  if (!trophy.count) return '';
  const label = trophy.count >= 1000 ? `$${trophy.count.toLocaleString('en-US')}` : `${trophy.count}`;
  return `<span class="tag count">PSN target: ${label}</span>`;
}

export function renderProgress(state) {
  const { trophies, earned } = state;
  document.getElementById('earnedCount').textContent = earned.size;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const byGrade = countByGrade(trophies, earned);
  document.getElementById('gradeCounts').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
  document.getElementById('progressLabel').textContent =
    earned.size === trophies.length ? 'earned — the platinum is yours' : 'earned';
}

export function renderChecklist(state, actions) {
  const list = document.getElementById('trophyList');
  const visible = applyFilters(state.trophies, state);
  const hiddenCount = state.trophies.filter((t) => isSpoilerHidden(t, state.earned, state.spoilerSafe)).length;
  document.getElementById('listMeta').textContent =
    `Showing ${visible.length} of ${state.trophies.length} trophies` +
    (state.spoilerSafe && hiddenCount ? ` · spoiler-safe is on: ${hiddenCount} story trophies hidden until earned` : '') +
    (state.earned.size ? ` · ${state.earned.size} earned` : '');
  list.replaceChildren();
  for (const t of visible) {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    if (state.earned.has(t.id)) li.classList.add('earned');
    if (state.selectedId === t.id) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => actions.toggleEarned(t.id));
    box.addEventListener('click', (e) => e.stopPropagation());
    li.append(box);
    const body = document.createElement('div');
    if (isSpoilerHidden(t, state.earned, state.spoilerSafe)) {
      body.innerHTML = `<div class="trophy-name spoiler-name">Hidden story trophy — earn it to reveal</div>
        <div class="trophy-desc">Spoiler-safe is on. This trophy is hidden on PlayStation until earned.</div>
        <div class="trophy-tags">${gradeTag(t.grade)}<span class="tag hidden-flag">Hidden</span></div>`;
    } else {
      const name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = t.name;
      const desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      const tags = document.createElement('div');
      tags.className = 'trophy-tags';
      tags.innerHTML = `${gradeTag(t.grade)}<span class="tag">${KIND_LABELS[t.kind] ?? t.kind}</span>${t.missable ? '<span class="tag missable">Missable</span>' : ''}${t.hidden ? '<span class="tag hidden-flag">Hidden</span>' : ''}${countTag(t)}`;
      body.append(name, desc, tags);
    }
    li.append(body);
    li.addEventListener('click', () => actions.select(t.id));
    list.append(li);
  }
  renderDetail(state, actions);
}

export function renderDetail(state, actions) {
  const pane = document.getElementById('detail');
  const t = state.trophies.find((x) => x.id === state.selectedId) ?? state.trophies[0];
  if (!t) { pane.replaceChildren(); return; }
  if (isSpoilerHidden(t, state.earned, state.spoilerSafe)) {
    pane.innerHTML = `<h2>Hidden story trophy</h2>
      <p class="official">Spoiler-safe is on. This trophy is hidden on PlayStation until it is earned, so its name, description and guide stay hidden here too.</p>
      <p>Tick it off in the checklist when you earn it and the guide will open. Or turn spoiler-safe off in the toolbar above.</p>
      <div class="earn-row"><button type="button" id="detailEarn">Mark as earned</button></div>`;
    pane.querySelector('#detailEarn').addEventListener('click', () => actions.toggleEarned(t.id));
    return;
  }
  const note = state.notes.get(String(t.id)) ?? '';
  pane.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `“${t.description}” — official description`;
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.innerHTML = `${gradeTag(t.grade)}<span class="tag">${KIND_LABELS[t.kind] ?? t.kind}</span>${t.missable ? '<span class="tag missable">Missable</span>' : ''}${t.hidden ? '<span class="tag hidden-flag">Hidden on PlayStation</span>' : ''}${countTag(t)}<span class="tag">Roadmap stage ${t.stage}</span>`;
  pane.append(title, official, tags);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.innerHTML = '<strong>Missable — read this first.</strong> This is the only trophy in the game that can be missed. See the guide below before you finish Chapter 1.';
    pane.append(warn);
  }
  if (/NOT YET CONFIRMED/.test(t.guide)) {
    const unknown = document.createElement('p');
    unknown.className = 'unknown';
    unknown.innerHTML = '<strong>Not yet confirmed.</strong> No published guide has verified this trophy’s exact trigger. This guide says so rather than inventing a location.';
    pane.append(unknown);
  }
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide.replace(/^NOT YET CONFIRMED — /, '');
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.label;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    sources.append(li);
  }
  const noteHeading = document.createElement('h3');
  noteHeading.textContent = 'Your note';
  const textarea = document.createElement('textarea');
  textarea.value = note;
  textarea.placeholder = 'Your own note for this trophy — a location, a loadout, a reminder…';
  textarea.setAttribute('aria-label', `Note for ${t.name}`);
  textarea.addEventListener('input', () => actions.setNote(t.id, textarea.value));
  const earnRow = document.createElement('div');
  earnRow.className = 'earn-row';
  const earnButton = document.createElement('button');
  earnButton.type = 'button';
  earnButton.textContent = state.earned.has(t.id) ? '✓ Earned — tick off' : 'Mark as earned';
  earnButton.addEventListener('click', () => actions.toggleEarned(t.id));
  earnRow.append(earnButton);
  pane.append(guideHeading, guide, sourcesHeading, sources, noteHeading, textarea, earnRow);
}

export function renderRoadmap(state, actions) {
  const page = document.getElementById('page');
  page.innerHTML = `<h2>Roadmap to the platinum</h2>
    <p class="lede">About 200 hours at a 4-out-of-10 difficulty, in one playthrough with no online trophies (PowerPyx). Play the story first, then work the 100% checklist after the credits, then clean up. Nothing on the checklist is missable — the only thing to do early is the Chapter 1 meditation.</p>`;
  for (const stage of STAGES) {
    const items = stageTrophies(state.trophies, stage.n);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    const section = document.createElement('section');
    section.className = 'stage';
    section.innerHTML = `<h3>Stage ${stage.n} — ${stage.title}</h3>
      <p class="stage-meta">${stage.hours} · ${done} of ${items.length} trophies earned</p>
      <div class="stage-bar"><div style="width:${(done / items.length) * 100}%"></div></div>
      <p>${stage.blurb}</p>`;
    const ul = document.createElement('ul');
    for (const t of items) {
      const li = document.createElement('li');
      if (state.earned.has(t.id)) li.classList.add('done');
      li.textContent = isSpoilerHidden(t, state.earned, state.spoilerSafe)
        ? 'Hidden story trophy'
        : `${t.name} — ${t.description}${t.missable ? ' (missable)' : ''}`;
      li.addEventListener('click', () => actions.goToTrophy(t.id));
      li.style.cursor = 'pointer';
      ul.append(li);
    }
    section.append(ul);
    page.append(section);
  }
}

export function renderMissables(state, actions) {
  const page = document.getElementById('page');
  const flagged = state.trophies.filter((t) => t.missable);
  const safe = state.trophies.filter((t) => !t.missable);
  page.innerHTML = `<h2>Missable trophies</h2>
    <p class="lede">Built from the official descriptions and checked against PowerPyx and GTA Zone: <strong>${flagged.length} trophy can be missed</strong>, and the other ${safe.length} cannot. Story trophies pop by playing the story, every side questline stays open after the story, and nothing on the 100% checklist is missable.</p>`;
  for (const t of flagged) {
    const hero = document.createElement('div');
    hero.className = 'missable-hero';
    const name = document.createElement('h3');
    name.textContent = `⚠ ${t.name} — ${t.description}`;
    const guide = document.createElement('p');
    guide.textContent = t.guide.replace(/^THE ONE TROPHY THAT CAN BE MISSED\. /, '');
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Open the full guide';
    open.addEventListener('click', () => actions.goToTrophy(t.id));
    hero.append(name, guide, open);
    page.append(hero);
  }
  const safeHeading = document.createElement('h3');
  safeHeading.textContent = `Safe — ${safe.length} trophies that cannot be missed`;
  const safeList = document.createElement('p');
  safeList.textContent = 'Every chapter and mission trophy, every side-character finale, every activity, collectible, robbery and money trophy: they all stay available in free-roam after the story, and the optional questlines reappear even if a quest giver goes quiet for a chapter. Do them whenever you like.';
  page.append(safeHeading, safeList);
}

export function renderPlanner(state, actions) {
  const page = document.getElementById('page');
  const next = nextUp(state.trophies, state.earned, 5);
  page.innerHTML = `<h2>Next up</h2>
    <p class="lede">Your next five trophies, in roadmap order — earliest stage first, the missable one before anything else. ${state.earned.size} of ${state.trophies.length} earned so far.</p>`;
  const list = document.createElement('ol');
  list.className = 'next-list';
  for (const t of next) {
    const li = document.createElement('li');
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = isSpoilerHidden(t, state.earned, state.spoilerSafe) ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoilerHidden(t, state.earned, state.spoilerSafe)
      ? 'Spoiler-safe is on — earn it to reveal the guide.'
      : `${t.description} · Stage ${t.stage} · ${KIND_LABELS[t.kind] ?? t.kind}${t.missable ? ' · Missable' : ''}`;
    body.append(name, desc);
    li.append(body);
    li.addEventListener('click', () => actions.goToTrophy(t.id));
    list.append(li);
  }
  page.append(list);
  const tip = document.createElement('p');
  tip.className = 'lede';
  tip.textContent = 'Tip: keep a save at the start and end of each chapter — the game has 15 manual save slots and no mission replay, so a chapter save is your safety net (PowerPyx).';
  page.append(tip);
}

export function renderSave(state, actions) {
  const page = document.getElementById('page');
  page.innerHTML = `<h2>Save &amp; export</h2>
    <p class="lede">Your progress and notes live in this browser only (localStorage). Export them to a file to back them up or move them to another browser, and import the file back here to restore them.</p>
    <div class="save-grid">
      <div class="save-card"><h3>Export</h3><p>Download ${state.earned.size} earned trophies and ${state.notes.size} notes as one JSON file.</p><button type="button" id="exportBtn">Export progress</button></div>
      <div class="save-card"><h3>Import</h3><p>Restore progress from a file exported by this guide.</p><label class="import-label">Import progress<input id="importFile" type="file" accept="application/json,.json"></label></div>
      <div class="save-card"><h3>Reset</h3><p>Clear every tick and note in this browser and start over.</p><button type="button" class="secondary" id="resetBtn">Reset all progress</button></div>
    </div>
    <p class="lede" style="margin-top:16px">This guide works offline and sends nothing anywhere: export and import are files on your own computer, and there is no account, no sync and no tracking.</p>`;
  page.querySelector('#exportBtn').addEventListener('click', () => actions.exportProgress());
  page.querySelector('#importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) actions.importProgress(file);
  });
  page.querySelector('#resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies and notes in this browser?')) actions.resetProgress();
  });
}
