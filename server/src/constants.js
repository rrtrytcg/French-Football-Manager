export const BASE_REWARD = 50;
export const BASE_UPGRADE_COST = 100;
export const BONUS_STREAK = 5;
export const BONUS_DURATION_MS = 30_000;
export const DEFAULT_STATS = {
  attaque: 1,
  defense: 1,
  passes: 1,
  gardien: 1,
};
export const STATS = Object.keys(DEFAULT_STATS);

export const MATCH_INTERVAL_MS = 5 * 60 * 1000;
export const MATCH_SIM_DURATION_MS = 20_000;
export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;
export const POINTS_LOSS = 0;

export const STAR_PLAYERS = [
  { id: "star-1", name: "Karim Benzema", statBoosts: { attaque: 3, passes: 2 }, cost: 500 },
  { id: "star-2", name: "Antoine Griezmann", statBoosts: { attaque: 2, passes: 3 }, cost: 500 },
  { id: "star-3", name: "Kylian Mbappe", statBoosts: { attaque: 4, defense: 1 }, cost: 750 },
  { id: "star-4", name: "Ngolo Kante", statBoosts: { defense: 3, passes: 2 }, cost: 500 },
  { id: "star-5", name: "Hugo Lloris", statBoosts: { gardien: 4, defense: 1 }, cost: 600 },
  { id: "star-6", name: "Paul Pogba", statBoosts: { passes: 4, attaque: 1 }, cost: 550 },
  { id: "star-7", name: "Raphael Varane", statBoosts: { defense: 3, gardien: 2 }, cost: 500 },
  { id: "star-8", name: "Blaise Matuidi", statBoosts: { defense: 2, passes: 3 }, cost: 450 },
];

export const COMMENTARY_LINES = {
  attack: [
    "L'equipe {team} attaque !",
    "Quelle occasion pour {team} !",
    "{team} presse haut !",
    "Le ballon arrive dans la surface !",
  ],
  save: [
    "Super arret du gardien !",
    "Il sort le ballon en corner !",
    "Quelle reflexe !",
    "Le gardien est solide !",
  ],
  goal: [
    "BUT !",
    "Quel but magnifique !",
    "La foule explose de joie !",
    "GOOOAL !",
  ],
  miss: [
    "Ca passe a cote !",
    "Trop fort ce gardien !",
    "La chance n'est pas au rendez-vous !",
    "Si pres du but !",
  ],
};