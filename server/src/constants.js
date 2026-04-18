export const BASE_REWARD = parseInt(process.env.BASE_REWARD || "50", 10);
export const BASE_UPGRADE_COST = parseInt(process.env.BASE_UPGRADE_COST || "100", 10);
export const BONUS_STREAK = parseInt(process.env.BONUS_STREAK || "5", 10);
export const BONUS_DURATION_MS = parseInt(process.env.BONUS_DURATION_MS || "30000", 10);
export const DEFAULT_STATS = {
  attaque: 1,
  defense: 1,
  passes: 1,
  gardien: 1,
};
export const STATS = Object.keys(DEFAULT_STATS);

export const MATCH_INTERVAL_MS = parseInt(process.env.MATCH_INTERVAL_MS || "300000", 10);
export const MATCH_SIM_DURATION_MS = parseInt(process.env.MATCH_SIM_DURATION_MS || "20000", 10);
export const POINTS_WIN = parseInt(process.env.POINTS_WIN || "3", 10);
export const POINTS_DRAW = parseInt(process.env.POINTS_DRAW || "1", 10);
export const POINTS_LOSS = parseInt(process.env.POINTS_LOSS || "0", 10);

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

export const MYSTERY_BOX_COST = 100;
export const MYSTERY_BOX_REWARDS = [
  { type: "euros", value: 50, message: "+50 EUR!", weight: 30 },
  { type: "euros", value: 150, message: "+150 EUR! Gros lot!", weight: 15 },
  { type: "euros", value: 300, message: "+300 EUR! Jackpot!", weight: 5 },
  { type: "upgrade", stat: "attaque", message: "Attaque +1 gratuit!", weight: 12 },
  { type: "upgrade", stat: "defense", message: "Defense +1 gratuit!", weight: 12 },
  { type: "upgrade", stat: "passes", message: "Passes +1 gratuit!", weight: 12 },
  { type: "upgrade", stat: "gardien", message: "Gardien +1 gratuit!", weight: 12 },
  { type: "boost", stat: "attaque", duration: 60000, message: "Boost Attaque 60s!", weight: 1 },
];

export const PENALTY_SHOOTOUT_QUESTIONS = 5;
export const PENALTY_REWARD_WINNER = 100;