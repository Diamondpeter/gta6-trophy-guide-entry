// Loads the official trophy list and its guides from app/data/trophies.json.
// Every name, description and grade in that file is the official list as
// published on Exophase and PSNProfiles; the guides are this entry's own words.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  return doc;
}

export const KIND_LABELS = {
  story: 'Story',
  characters: 'Side characters',
  collectibles: 'Collectibles',
  activities: 'Activities',
  exploration: 'Exploration',
  crime: 'Crime',
  combat: 'Combat',
  money: 'Money',
  platinum: 'Platinum',
};

export const STAGES = [
  { n: 1, title: 'Play the story', hours: '60–80 hours', blurb: 'Finish the five chapters and take optional missions as they appear. Scan vehicles and study animals on the way — that progress already counts toward the 100% checklist. Do the Chapter 1 meditation at Jason’s house before the chapter ends: it is the one thing in the game that can be missed.' },
  { n: 2, title: 'Side characters & strangers', hours: 'Alongside the story', blurb: 'Finish the questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret, plus 8 Strangers & Freaks strands. Every one of them stays open after the story, so nothing here is missable — but doing them as they appear teaches you the game’s systems.' },
  { n: 3, title: 'Activities, races & challenges', hours: 'As you go', blurb: 'Shooting ranges, drone races, car races, stunts, arcade games, fishing and the 9 activity types. Most of these count toward the 100% checklist, and the challenges (any 70 of 80) are the checklist’s biggest single ask.' },
  { n: 4, title: 'Explore, collect & crime', hours: 'Free-roam', blurb: 'Unfog the map, scan vehicles and WAiNK spots, finish the card sets, and run the robberies: shops, jewelry stores, bank vaults, armored trucks and one illegal operation per gang. This is also where the money trophies land.' },
  { n: 5, title: '100% & the platinum', hours: 'About 100 hours after the story', blurb: 'After the credits the 100% checklist appears under Progress, then Stats. Work through it — it is closer to 60% true completion — and the gold for A Long Road pops, followed at once by the platinum.' },
];

export function stageTrophies(trophies, stageNumber) {
  return trophies.filter((t) => t.stage === stageNumber);
}
