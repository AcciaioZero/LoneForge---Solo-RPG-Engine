/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Attribute = 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma';

export type Skill = 
  | 'Athletics' 
  | 'Acrobatics' | 'Sleight of Hand' | 'Stealth'
  | 'Arcana' | 'History' | 'Investigation' | 'Nature' | 'Religion'
  | 'Animal Handling' | 'Insight' | 'Medicine' | 'Perception' | 'Survival'
  | 'Deception' | 'Intimidation' | 'Performance' | 'Persuasion';

export type CharacterClass = 'Barbarian' | 'Bard' | 'Fighter' | 'Rogue' | 'Cleric' | 'Wizard' | 'Warlock';

export type Species = 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Gnome' | 'Dragonborn' | 'Tiefling' | 'Orc' | 'Goliath';

export type Background = 
  | 'Acolyte' | 'Criminal' | 'Entertainer' | 'Farmer' | 'Guard' 
  | 'Guide' | 'Hermit' | 'Merchant' | 'Noble' | 'Sage' 
  | 'Sailor' | 'Soldier' | 'Wayfarer';

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'bonus_action' | 'reaction' | 'passive';
  damage?: string;
  attackBonus?: number;
  healing?: string;
  usesPerLongRest?: number;
  currentUses?: number;
  cooldown?: number; // turns
  currentCooldown?: number;
}

export interface SpellSlot {
  level: number;
  total: number;
  current: number;
}

export interface VendorProfile {
  sells: boolean;
  buys: string[];
  notes?: string;
  interactions?: string[];
  primary_categories?: string[];
  secondary_categories?: string[];
  stock_size?: { min: number; max: number };
  price_modifier?: number;
  rarity_filter?: string[];
  generalist?: boolean;
  special?: string;
  armor_subtypes?: string[];
}

export interface VendorMap {
  vendor_map: {
    version: string;
    source: string;
    note: string;
    category_reference: string[];
    locations: Record<string, VendorProfile>;
  };
}

export interface Character {
  name: string;
  class: CharacterClass;
  species: Species;
  background: Background;
  level: number;
  hp: number;
  maxHp: number;
  baseAc: number;
  stats: Record<Attribute, number>;
  proficiencies: Skill[];
  savingThrowProficiencies: Attribute[];
  speed: number;
  hitDie: string;
  inventory: Item[];
  abilities: Ability[];
  xp: number;
  gold: number;
  cp: number;
  sp: number;
  ep: number;
  pp: number;
  notes: string;
  tempHp?: number;
  spellSlots?: SpellSlot[];
  knownSpells?: Spell[];
  subclass?: string;
  companions?: Companion[];
  customAbilities?: Ability[];
  treasure?: Item[];
  acBonus?: number;
  initiativeBonus?: number;
  speedBonus?: number;
}

export interface Companion {
  id: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  stats: Record<Attribute, number>;
  abilities: Ability[];
  notes?: string;
}

export interface ItemQuest {
  hook: string;
  origin: string;
  quest_type: string;
  steps: string[];
  reward_hint: string;
  oracle_seed: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'Weapon' | 'Armor' | 'Consumable' | 'Treasure' | 'Tool' | 'Gear';
  subType?: string;
  bonus?: number;
  description: string;
  isEquipped?: boolean;
  value?: number;
  weight?: string;
  rarity?: string;
  properties?: string;
  mastery?: string;
  cost?: string;
  damage?: string;
  itemQuest?: ItemQuest;
}

export interface LootItem {
  Name: string;
  Source: string;
  Page: number;
  Rarity: string;
  Type: string;
  Attunement: string | null;
  Damage: string | null;
  Properties: string | null;
  Mastery: string | null;
  Weight: string | null;
  Value: string | null;
  Text: string | null;
}

export interface LootMagicItem {
  id: string;
  name: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  description: string;
  value_gp: number;
  isPlaceholder?: boolean;
  thematicTags?: string[];
}

export interface LootValuable {
  name: string;
  type: 'gemstone' | 'art_object';
  value_gp: number;
  description?: string;
}

export interface LootResult {
  currency: {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
  };
  magic_items: LootMagicItem[];
  valuables: LootValuable[];
  total_gp_value: number;
}

export interface OracleResult {
  answer: 'Yes, and...' | 'Yes' | 'Yes, but...' | 'No, but...' | 'No' | 'No, and...';
  roll: number;
  rawRoll?: number;
  modifier?: number;
}

export type OracleResponse = OracleResult;

export interface GameLog {
  id: string;
  timestamp: number;
  type: 'narrative' | 'roll' | 'combat' | 'loot';
  content: string;
}

export type LogEntry = GameLog;

export interface Notification {
  id: string;
  type: 'narrative' | 'roll' | 'combat' | 'loot';
  content: string;
  timestamp: number;
}

export interface RoomRolls {
  purple: number;
  blue: number;
  green: number;
  red: number;
  gold: number;
  multicolour: number;
}

export interface Room {
  id: string;
  type: string;
  feature: string;
  danger?: string;
  loot?: Item;
  lootResult?: LootResult;
  enemies?: Enemy[];
  rolls?: RoomRolls;
  clue?: string;
  npc?: NPC;
  event?: string;
  environmentFeature?: string;
  trap?: string;
  encounterDifficulty?: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  attackBonus: number;
  damage: string; // e.g. "1d6+2"
  xpValue: number;
  cr: number;
  type: string;
  abilities: Ability[];
  stats: Record<Attribute, number>;
  savingThrows?: string;
  skills?: string;
  vulnerabilities?: string;
  resistances?: string;
  immunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  environment?: string;
  treasure?: string;
  description?: string;
}

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'enemy';
  initiative: number;
  currentHp: number;
  maxHp: number;
  ac: number;
  ref: any; // Reference to the actual object if needed, or just ID
}

export interface EncounterSuggestion {
  enemies: { name: string; cr: number; count: number }[];
  totalCR: number;
  effectiveCR: number;
  budget: number;
  label: string;
}

export type GameContext = 'Settlement' | 'Wilderness' | 'Dungeon' | 'Combat' | 'Narrative';

export interface NPC {
  id: string;
  name: string;
  race: string;
  role: string;
  alignment: string;
  disposition: string;
  traits: string[];
  goal: string;
  secret: string;
  description: string;
  greeting: string;
}

export type Npc = NPC;

export interface Faction {
  id: string;
  name: string;
  type: string;
  alignment: string;
  influence: string;
  leader: string;
  goal: string;
  secret: string;
  description: string;
  motto: string;
  headquarters: string;
}

export interface Spell {
  name: string;
  source: string;
  page: string;
  level: string;
  castingTime: string;
  duration: string;
  school: string;
  range: string;
  components: string;
  classes: string;
  optionalClasses?: string;
  subclasses?: string;
  text: string;
  atHigherLevels?: string;
  isPrepared?: boolean;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  npcs: NPC[];
  inventory?: Item[];
  interactions: string[];
  districtId?: string;
  notes?: string;
}

export interface DistrictDisturbance {
  disturbance: string;
  outcome: string;
}

export type DistrictType = 
  | 'Artists' 
  | 'Arcane' 
  | 'Trade' 
  | 'Religious' 
  | 'Entertainment' 
  | 'Government' 
  | 'Military' 
  | 'Services' 
  | 'Residential'
  | 'General';

export interface District {
  id: string;
  name: string;
  type: DistrictType;
  description: string;
  locations: Location[];
}

export type SettlementType = 'Encampment' | 'Hamlet' | 'Village' | 'Town' | 'City' | 'Metropolis';

export type SettlementEvent = string;

export interface Settlement {
  name: string;
  type: SettlementType;
  population: number;
  description: string;
  districts: District[];
}

export interface WildernessTravel {
  destination: string;
  totalDays: number;
  currentDay: number;
  terrain: string;
  rations: number;
}

export interface Quest {
  problem: string;
  result: string;
  hook: string;
}

export interface DowntimeEvent {
  id?: string;
  roll: number;
  name: string;
  description: string;
  isResolved?: boolean;
  mechanical_effect: {
    type: string;
    value?: string | number;
    note?: string;
    secondary?: {
      type: string;
      value?: string | number;
      note?: string;
    };
  };
}

export interface ActiveDowntime {
  activityId: string;
  variantId: string;
  name: string;
  currentProgress: number;
  requiredProgress: number;
  complications: DowntimeEvent[];
  opportunities: DowntimeEvent[];
  isComplete: boolean;
  resolutionScore?: number;
  resolutionOutcome?: any;
  materialCost?: number;
  selectedModifierIds?: string[];
  modifiers: {
    dcBonus: number;
    advantageNext: boolean;
    disadvantageNext: boolean;
    skipNextDay: boolean;
    double_progress_today: boolean;
    next_check_double_progress: boolean;
    resolutionBonus: number;
  };
  history: string[];
}

export type GameState = {
  character: Character;
  logs: GameLog[];
  context: GameContext;
  currentRoom: Room | null;
  currentSettlement: Settlement | null;
  travel: WildernessTravel | null;
  activeDowntime: ActiveDowntime | null;
  isCombatActive: boolean;
  combatTurn: number;
  initiativeOrder: Combatant[];
  activeCombatantIndex: number;
  adventureHook: {
    problem: string;
    result: string;
    hook: string;
  } | null;
  isGameOver: boolean;
  isCreatingCharacter: boolean;
  isSelectingDungeon: boolean;
  isSelectingTravel: boolean;
  isSelectingUrbanEvent: boolean;
  isBrowsingSpells: boolean;
  isCamping: boolean;
  isDayActive: boolean;
  lastTravelLog: string | null;
  roomsExplored: number;
  dungeonConfig: {
    type: string;
    totalRooms: number;
    isComplete: boolean;
  } | null;
  hasUsedAction: boolean;
  hasUsedBonusAction: boolean;
  notifications: Notification[];
  isEditingCombat: boolean;
  npcHistory: NPC[];
  pendingSubclassSelection: string[] | null;
  discoveredCompendiumQuests: Record<string, ItemQuest>;
  lastLootResult: LootResult | null;
};
