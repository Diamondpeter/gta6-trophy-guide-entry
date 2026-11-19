// Filtering for the checklist: text search, kind, grade, earned-only and the
// spoiler rule. A trophy is spoiler-hidden when the spoiler setting is on, the
// trophy is hidden on PlayStation, and it has not been earned yet — its name and
// description stay hidden until the reader earns it (or turns the setting off).
export function isSpoilerHidden(trophy, earned, spoilerSafe) {
  return spoilerSafe && trophy.hidden && !earned.has(trophy.id);
}

export function applyFilters(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable') {
      if (!t.missable) return false;
    } else if (state.kind !== 'all' && t.kind !== state.kind) {
      return false;
    }
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (earned.has(t.id)) counts[t.grade] += 1;
  }
  return counts;
}

export function nextUp(trophies, earned, limit = 5) {
  // The next trophies to chase, in roadmap order: earliest stage first, and
  // inside a stage the story and missable ones before the grind.
  const rank = (t) => (t.missable ? 0 : t.kind === 'story' ? 1 : 2);
  return trophies
    .filter((t) => !earned.has(t.id))
    .sort((a, b) => a.stage - b.stage || rank(a) - rank(b) || a.id - b.id)
    .slice(0, limit);
}
