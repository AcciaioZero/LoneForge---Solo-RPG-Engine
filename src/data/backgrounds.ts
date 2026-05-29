// ============================================================
// LoneForge — Background Data (PHB 2024 / SRD 5.2)
// Each background grants: ability score increases, 2 skill
// proficiencies, 1 tool proficiency, and 1 Origin Feat.
// Source: SRD 5.2 CC BY 4.0
// ============================================================

import type { OriginFeat } from './origin_feats'

// ── Ability increase modes ───────────────────────────────────
// PHB 2024: either +2/+1 to two different abilities,
// or +1/+1/+1 to three different abilities.
export type AbilityIncreaseMode = 'two_one' | 'three_ones'

export type AbilityScoreIncreases = Partial<
  Record<
    | 'Strength'
    | 'Dexterity'
    | 'Constitution'
    | 'Intelligence'
    | 'Wisdom'
    | 'Charisma',
    number
  >
>

// ── Background data shape ────────────────────────────────────
export type BackgroundData = {
  name: string
  description: string
  flavor_trait: string         // one evocative sentence for the UI
  ability_score_increases: AbilityScoreIncreases  // standard suggestion
  skill_proficiencies: [string, string]
  tool_proficiency: string | null
  origin_feat: string          // key into ORIGIN_FEATS
}

// ── Custom background state ──────────────────────────────────
// When the player toggles "Customize", they build this instead.
export type CustomBackgroundState = {
  name: string
  ability_mode: AbilityIncreaseMode
  // two_one: one ability +2, one ability +1
  // three_ones: three abilities +1 each
  ability_increases: AbilityScoreIncreases
  skill_proficiencies: [string, string]
  tool_proficiency: string | null
  origin_feat: string          // key into ORIGIN_FEATS
  feat_choice?: string | string[]  // for feats that require selection
}

// ── Pool for custom background builder ──────────────────────
export const BACKGROUND_CUSTOMIZATION_POOLS = {
  abilities: [
    'Strength', 'Dexterity', 'Constitution',
    'Intelligence', 'Wisdom', 'Charisma',
  ] as const,

  skills: [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
    'Deception', 'History', 'Insight', 'Intimidation',
    'Investigation', 'Medicine', 'Nature', 'Perception',
    'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
    'Stealth', 'Survival',
  ] as const,

  tools: [
    "Alchemist's Supplies",
    "Brewer's Supplies",
    "Calligrapher's Supplies",
    "Carpenter's Tools",
    "Cartographer's Tools",
    "Cobbler's Tools",
    "Cook's Utensils",
    "Glassblower's Tools",
    "Herbalism Kit",
    "Jeweler's Tools",
    "Leatherworker's Tools",
    "Mason's Tools",
    "Navigator's Tools",
    "Painter's Supplies",
    "Poisoner's Kit",
    "Potter's Tools",
    "Smith's Tools",
    "Thieves' Tools",
    "Tinker's Tools",
    "Weaver's Tools",
    "Woodcarver's Tools",
    // Instruments count as tools
    'Bagpipes', 'Drum', 'Flute', 'Lute', 'Lyre',
    'Horn', 'Pan Flute', 'Shawm', 'Viol',
    // Gaming sets
    'Dice Set', 'Dragonchess Set', 'Playing Card Set', 'Three-Dragon Ante Set',
    // None is a valid option
    'None',
  ] as const,

  ability_increase_rules: {
    two_one: {
      label: '+2 / +1',
      description: 'Increase one ability by 2 and a different ability by 1.',
      first: 2,
      second: 1,
    },
    three_ones: {
      label: '+1 / +1 / +1',
      description: 'Increase three different abilities by 1 each.',
      each: 1,
    },
  },
} as const

// ── Background Templates ─────────────────────────────────────
export const BACKGROUND_TEMPLATES: Record<string, BackgroundData> = {

  Acolyte: {
    name: 'Acolyte',
    description:
      'You have spent your life in service to a temple, learning its rites and lore. Your faith is your foundation — and your weapon.',
    flavor_trait: 'You move through the world with the quiet authority of someone who has spoken to something larger than themselves.',
    ability_score_increases: { Wisdom: 2, Intelligence: 1 },
    skill_proficiencies: ['Insight', 'Religion'],
    tool_proficiency: null,
    origin_feat: 'Magic Initiate',
  },

  Criminal: {
    name: 'Criminal',
    description:
      'You have a history of breaking the law. Whether out of necessity, greed, or rebellion, you learned that the rules are only obstacles for those who haven\'t learned to go around them.',
    flavor_trait: 'You read exits before you read faces, and you remember both.',
    ability_score_increases: { Dexterity: 2, Constitution: 1 },
    skill_proficiencies: ['Sleight of Hand', 'Stealth'],
    tool_proficiency: "Thieves' Tools",
    origin_feat: 'Alert',
  },

  Entertainer: {
    name: 'Entertainer',
    description:
      'You thrive in the spotlight. Whether on a stage, a street corner, or a banquet hall, you have learned to read an audience and give them exactly what they came for — or something better.',
    flavor_trait: 'You know how to make a room remember you, and how to make it forget you.',
    ability_score_increases: { Charisma: 2, Dexterity: 1 },
    skill_proficiencies: ['Acrobatics', 'Performance'],
    tool_proficiency: 'Lute',
    origin_feat: 'Musician',
  },

  Farmer: {
    name: 'Farmer',
    description:
      'You have worked the land for years. Seasons, harvests, drought, and plenty — all of it has given you a patience and endurance that few understand until they need it.',
    flavor_trait: 'You understand that most things worth having take longer than anyone expects.',
    ability_score_increases: { Constitution: 2, Strength: 1 },
    skill_proficiencies: ['Animal Handling', 'Nature'],
    tool_proficiency: "Carpenter's Tools",
    origin_feat: 'Tough',
  },

  Guard: {
    name: 'Guard',
    description:
      'You have protected the peace in a settlement — standing watch through long nights and making the calls that let others sleep soundly. That responsibility leaves marks that don\'t wash off.',
    flavor_trait: 'Your eyes still move to doorways and dark corners before anything else.',
    ability_score_increases: { Strength: 2, Wisdom: 1 },
    skill_proficiencies: ['Athletics', 'Perception'],
    tool_proficiency: 'Gaming Set (dice or cards)',
    origin_feat: 'Alert',
  },

  Guide: {
    name: 'Guide',
    description:
      'You have led travelers through the wilderness — places without roads, without signs, without the safety of walls. You know that the map is never as reliable as the person reading it.',
    flavor_trait: 'You notice the way animals stop moving before you do, and you\'ve learned to trust that.',
    ability_score_increases: { Wisdom: 2, Dexterity: 1 },
    skill_proficiencies: ['Stealth', 'Survival'],
    tool_proficiency: "Cartographer's Tools",
    origin_feat: 'Skilled',
  },

  Hermit: {
    name: 'Hermit',
    description:
      'You have lived a life of seclusion — away from the noise of the world, listening to something quieter. What you found in that silence has stayed with you, even now that you\'ve returned.',
    flavor_trait: 'Most people fill silence. You\'ve learned to read it.',
    ability_score_increases: { Wisdom: 2, Constitution: 1 },
    skill_proficiencies: ['Medicine', 'Religion'],
    tool_proficiency: "Herbalism Kit",
    origin_feat: 'Magic Initiate',
  },

  Merchant: {
    name: 'Merchant',
    description:
      'You have traded goods across the land, learning that every transaction tells you something about the person on the other side of it — if you know how to listen.',
    flavor_trait: 'You price things accurately, including people.',
    ability_score_increases: { Charisma: 2, Intelligence: 1 },
    skill_proficiencies: ['Animal Handling', 'Persuasion'],
    tool_proficiency: "Navigator's Tools",
    origin_feat: 'Lucky',
  },

  Noble: {
    name: 'Noble',
    description:
      'You were born into a life of privilege. The weight of a name, a lineage, and expectations you didn\'t choose has shaped you in ways that don\'t disappear when the circumstances do.',
    flavor_trait: 'You know how to walk into a room so that everyone in it understands who holds authority.',
    ability_score_increases: { Charisma: 2, Intelligence: 1 },
    skill_proficiencies: ['History', 'Persuasion'],
    tool_proficiency: "Chess Set",
    origin_feat: 'Skilled',
  },

  Sage: {
    name: 'Sage',
    description:
      'You have spent your life in study. Libraries, laboratories, and long conversations with people who knew more than you — all of it left you with more questions than answers, which is the point.',
    flavor_trait: 'You ask the follow-up question that everyone else was too polite to ask.',
    ability_score_increases: { Intelligence: 2, Wisdom: 1 },
    skill_proficiencies: ['Arcana', 'History'],
    tool_proficiency: "Calligrapher's Supplies",
    origin_feat: 'Magic Initiate',
  },

  Sailor: {
    name: 'Sailor',
    description:
      'You have sailed the high seas — or the rivers, or the lakes, or any water large enough to remind you that you are very small in relation to it. That perspective changes a person.',
    flavor_trait: 'You trust weather before you trust people, and you\'re usually right.',
    ability_score_increases: { Dexterity: 2, Strength: 1 },
    skill_proficiencies: ['Athletics', 'Perception'],
    tool_proficiency: "Navigator's Tools",
    origin_feat: 'Tavern Brawler',
  },

  Soldier: {
    name: 'Soldier',
    description:
      'You have served in an army. You know what it costs to follow orders you disagree with, what it feels like to keep moving when your body says stop, and what you are willing to do when it comes down to it.',
    flavor_trait: 'You still position yourself with your back to walls in unfamiliar rooms.',
    ability_score_increases: { Strength: 2, Constitution: 1 },
    skill_proficiencies: ['Athletics', 'Intimidation'],
    tool_proficiency: "Gaming Set (dice)",
    origin_feat: 'Savage Attacker',
  },

  Wayfarer: {
    name: 'Wayfarer',
    description:
      'You have wandered the world without a fixed home, learning that every place has its own logic and every person its own rules. You carry less than most people and notice more.',
    flavor_trait: 'You know which roads are safer after dark and which inns ask fewer questions.',
    ability_score_increases: { Dexterity: 2, Wisdom: 1 },
    skill_proficiencies: ['Insight', 'Stealth'],
    tool_proficiency: "Thieves' Tools",
    origin_feat: 'Lucky',
  },
}

// ── Helpers ──────────────────────────────────────────────────
export const BACKGROUND_NAMES = Object.keys(
  BACKGROUND_TEMPLATES,
) as (keyof typeof BACKGROUND_TEMPLATES)[]

export function getBackgroundData(name: string): BackgroundData | undefined {
  return BACKGROUND_TEMPLATES[name]
}

/** Validate a custom background state before applying it */
export function validateCustomBackground(
  custom: Partial<CustomBackgroundState>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!custom.name?.trim()) errors.push('Background name is required.')

  // Validate ability increases
  if (custom.ability_mode === 'two_one') {
    const entries = Object.entries(custom.ability_increases ?? {}).filter(
      ([, v]) => v && v > 0,
    )
    const hasTwo = entries.some(([, v]) => v === 2)
    const hasOne = entries.some(([, v]) => v === 1)
    if (!hasTwo || !hasOne || entries.length !== 2)
      errors.push('+2/+1 mode requires exactly one ability +2 and one ability +1.')
  } else if (custom.ability_mode === 'three_ones') {
    const entries = Object.entries(custom.ability_increases ?? {}).filter(
      ([, v]) => v === 1,
    )
    if (entries.length !== 3)
      errors.push('+1/+1/+1 mode requires exactly three different abilities at +1.')
  } else {
    errors.push('Ability increase mode must be selected.')
  }

  // Skills
  const skills = custom.skill_proficiencies ?? []
  if (skills.length !== 2 || skills[0] === skills[1])
    errors.push('Choose two different skill proficiencies.')

  // Feat
  if (!custom.origin_feat) errors.push('An Origin Feat must be selected.')

  return { valid: errors.length === 0, errors }
}

/** Merge a custom background's ability increases with point-buy base scores */
export function applyAbilityIncreases(
  base: Record<string, number>,
  increases: AbilityScoreIncreases,
): Record<string, number> {
  const result = { ...base }
  for (const [ability, bonus] of Object.entries(increases)) {
    if (bonus && result[ability] !== undefined) {
      result[ability] = result[ability] + bonus
    }
  }
  return result
}
