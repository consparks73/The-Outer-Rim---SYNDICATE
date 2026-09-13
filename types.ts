export interface Searchable {
  id: string;
  label: string;
  description: string;
  item?: string;
  credits?: number;
  chance: number;
  reqQuestState?: { id: string; step?: number; completed?: boolean };
  questUpdate?: { id: string; step: number };
  questComplete?: boolean;
  startQuest?: string;
  locked?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  action?: (gameState: any) => void;
}

export interface Encounter {
  id: string;
  description: string;
  lootLabel?: string;
  lootDescription?: string;
  item?: string;
  credits?: number;
  chance: number;
  onlyNight?: boolean;
  onlyDay?: boolean;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  firstVisitDescription?: string;
  imageUrl: string;
  exits: string[];
  reqQuestState?: { id: string; step?: number; completed?: boolean };
  reqItem?: string;
  hideIfLocked?: boolean;
  actions?: string[];
  npcs?: string[];
  searchables?: Searchable[];
  encounters?: Encounter[];
  nightName?: string;
  nightDescription?: string;
  nightDetailedDescription?: string;
  nightImageUrl?: string;
  nightExits?: string[];
  nightActions?: string[];
  nightNpcs?: string[];
  nightSearchables?: Searchable[];
  ambient?: string[];
  sector?: string;
  faction?: string;
  dangerLevel?: number;
}

export interface Locations {
  [key: string]: Location;
}

export interface Stats {
  str: number;
  per: number;
  end: number;
  cha: number;
  int: number;
  agi: number;
  lck: number;
}

export interface Item {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  count?: number;
  type?:
    | "weapon"
    | "consumable"
    | "misc"
    | "furniture"
    | "utility"
    | "clothing"
    | "droid";
  dmg?: number;
  armor?: number;
  heal?: number;
  service?: "sabacc" | "podracing_live" | "buff_provider";
  buffEffect?: { stat: keyof Stats; value: number; durationHours: number };
  repModifier?: Record<string, number>;
  abilities?: string[]; // e.g. ['translation', 'slicing', 'combat_assist']
  lastUsedAt?: number;
  description?: string;
  price?: number;
}

export interface QuestStep {
  id: number;
  description: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: "locked" | "active" | "completed";
  currentStepIndex: number;
  steps: QuestStep[];
  reward?: string;
  type: "main" | "side";
}

export interface Race {
  id: string;
  name: string;
  description: string;
  bonuses: Partial<Stats>;
  uniqueTrait: string;
}

export interface CharClass {
  id: string;
  name: string;
  description: string;
  bonuses: Partial<Stats>;
  startingItem: Item;
  uniqueBuff: string;
}

export interface Backstory {
  id: string;
  name: string;
  description: string;
  buff: { stat: keyof Stats; value: number } | { item: string } | null;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  statRequirement?: { stat: keyof Stats; value: number };
  prerequisiteSkillId?: string;
  icon: string; // Lucide icon name
  category: "Combat" | "Slicing" | "Diplomacy" | "Survival";
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  reqLevel: number;
  icon: string;
}

export interface Character {
  name: string;
  race: Race;
  charClass: CharClass;
  stats: Stats;
  currentHp: number;
  maxHp: number;
  background: string;
  party: string[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  unlockedSkillIds: string[];
  unlockedPerkIds: string[];
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  dmg: number;
  xp: number;
  credits: number;
  imageUrl: string;
  nightImageUrl?: string;
  introText: string;
}

export interface CombatState {
  active: boolean;
  enemy: Enemy | null;
  log: string[];
  turn: "player" | "enemy";
}

export interface DialogueOption {
  label: string;
  nextId?: string | null;
  reqSkill?: keyof Stats;
  reqVal?: number;
  reqItem?: string;
  reqCredits?: number;
  reqRace?: string;
  reqBackgroundContains?: string;
  reqQuestState?: { id: string; step?: number; completed?: boolean };
  reqReputation?: { id: string; min: number };
  reqTime?: "day" | "night";
  action?: (gameState: any) => void;
  condition?: (gameState: any) => boolean;
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
}

export interface ConditionalGreeting {
  reqQuestState?: { id: string; step?: number; completed?: boolean };
  reqReputation?: { id: string; min: number };
  reqItem?: string;
  reqRace?: string;
  reqBackgroundContains?: string;
  greetingId: string;
}

export interface NPC {
  id: string;
  name: string;
  imageUrl: string;
  nightImageUrl?: string;
  greetingId: string;
  nightGreetingId?: string;
  conditionalGreetings?: ConditionalGreeting[];
  dialogueTree: Record<string, DialogueNode>;
  shopInventory?: string[]; // Array of item IDs
  language?: string; // e.g. 'binary', 'huttinese', 'jawan'
  onlyBetween?: [number, number]; // [startHour, endHour]
  reqQuestState?: { id: string; step?: number; completed?: boolean };
}

export interface HoloNetArticle {
  id: string;
  headline: string;
  body: string;
  source: string;
  date: string;
}

// --- PODRACING TYPES ---
export interface Podracer {
  id: string;
  name: string;
  color: string;
  odds: number; // e.g. 2.5 means 2.5x payout
  speedMod: number; // Internal speed variance
}

export interface ActiveRace {
  type: "rookie" | "main";
  startTime: number; // Timestamp
  betDriverId: string | null;
  betAmount: number;
  completed: boolean;
}

export interface SlicingTask {
  startTime: number;
  duration: number;
  targetId: string;
}

// --- CONTRACT TYPES ---
export interface Contract {
  id: string;
  title: string;
  type: "bounty" | "smuggle" | "slicing";
  targetName: string;
  targetLocation: string;
  reward: number;
  description: string;
  completed: boolean;
}

export interface SaveData {
  version: number;
  currentLocationId: string;
  stats: Character | null;
  inventory: Item[];
  quests: Quest[];
  credits: number;
  isNight: boolean;
  visitedLocations: string[];
  lootedContainers: string[];
  unlockedContainers: string[];
  history: string[];
  lastLoginDate?: string;
  lastStipendClaimDate?: string;
  dailyStreak: number;
  lastDailyRewardClaimDate?: string;
  completedDailyContracts: string[];
  defeatedNpcs?: string[];
  cantinaVisits?: number;
  activeRace?: ActiveRace | null;
  activeSlicingTask?: SlicingTask | null;
  equippedWeaponId?: string | null;
  equippedClothingId?: string | null;
  activeDroidId?: string | null;
  reputation: Record<string, number>;
  activeContracts: Contract[];
  flags?: string[];
}
