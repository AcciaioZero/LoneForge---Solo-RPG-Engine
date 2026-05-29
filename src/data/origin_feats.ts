// ============================================================
// LoneForge — Origin Feats (PHB 2024 / SRD 5.2)
// Available at character level 1 through Background selection.
// Source: SRD 5.2 CC BY 4.0 / LoneForge Homebrew
// ============================================================

export type FeatEffectType =
  | 'ability_score'
  | 'skill_proficiency'
  | 'tool_proficiency'
  | 'weapon_proficiency'
  | 'armor_proficiency'
  | 'language_proficiency'
  | 'spell_access'
  | 'resistance'
  | 'hp_bonus'
  | 'initiative_bonus'
  | 'reroll_ones'
  | 'saving_throw_bonus'
  | 'speed_bonus'
  | 'carrying_capacity'
  | 'advantage_on'
  | 'extra_proficiency'
  | 'cant_be_surprised'
  | 'other'

export type FeatEffect = {
  type: FeatEffectType
  value?: string | number
  target?: string       // e.g. "all saving throws", "Strength checks"
  condition?: string    // e.g. "when you roll initiative"
  damage_type?: string  // for resistance
  note?: string
}

export type FeatChoice = {
  type: 'skill' | 'tool' | 'weapon_type' | 'spell_list' | 'ability' | 'language'
  count: number
  pool?: string[]
  note?: string
  // If the choice unlocks further effects, map choice key -> effects
  grants_effects?: boolean
}

export type OriginFeat = {
  name: string
  description: string
  effects: FeatEffect[]
  requires_choice?: FeatChoice
  // For feats like Magic Initiate where the choice determines spells gained
  choice_note?: string
  source: 'PHB_2024' | 'LoneForge'
}

export const ORIGIN_FEATS: Record<string, OriginFeat> = {

  // ── ALERT ──────────────────────────────────────────────────
  Alert: {
    name: 'Alert',
    source: 'PHB_2024',
    description:
      'Always on the lookout for danger, you gain the following benefits.',
    effects: [
      {
        type: 'initiative_bonus',
        value: 5,
        note: '+5 bonus to Initiative rolls.',
      },
      {
        type: 'cant_be_surprised',
        note: 'You cannot be Surprised while you are conscious.',
      },
    ],
  },

  // ── CRAFTER ────────────────────────────────────────────────
  Crafter: {
    name: 'Crafter',
    source: 'PHB_2024',
    description:
      'You have practiced crafting items using a wide variety of tools. You gain the following benefits.',
    effects: [
      {
        type: 'tool_proficiency',
        value: 3,
        note: 'Gain proficiency with three Artisan\'s Tools of your choice.',
      },
      {
        type: 'other',
        note:
          'Whenever you make a long rest in a town or city, you can craft one nonmagical item worth up to 20 gp that uses Artisan\'s Tools you have proficiency with. The item is completed at the end of the rest.',
      },
    ],
    requires_choice: {
      type: 'tool',
      count: 3,
      pool: [
        "Alchemist's Supplies",
        "Brewer's Supplies",
        "Calligrapher's Supplies",
        "Carpenter's Tools",
        "Cartographer's Tools",
        "Cobbler's Tools",
        "Cook's Utensils",
        "Glassblower's Tools",
        "Jeweler's Tools",
        "Leatherworker's Tools",
        "Mason's Tools",
        "Painter's Supplies",
        "Potter's Tools",
        "Smith's Tools",
        "Tinker's Tools",
        "Weaver's Tools",
        "Woodcarver's Tools",
      ],
      note: 'Choose 3 Artisan\'s Tools.',
    },
  },

  // ── HEALER ─────────────────────────────────────────────────
  Healer: {
    name: 'Healer',
    source: 'PHB_2024',
    description:
      'You have the training and intuition to administer first aid and keep others alive. You gain the following benefits.',
    effects: [
      {
        type: 'other',
        note:
          'Battle Medic: If you have a Healer\'s Kit, you can use it to tend to a creature\'s wounds as a Utilize action. That creature can expend one of its Hit Dice, rolling it and adding its Constitution modifier. The creature regains HP equal to the total. The creature can\'t regain HP from this feat again until it finishes a Short or Long Rest.',
      },
      {
        type: 'other',
        note:
          'Healing Rerolls: Whenever you roll a die to determine the number of HP you restore with a spell or this feat, you can reroll the die if it rolls a 1, and you must use the new roll.',
      },
    ],
  },

  // ── LUCKY ──────────────────────────────────────────────────
  Lucky: {
    name: 'Lucky',
    source: 'PHB_2024',
    description:
      'You have inexplicable luck that seems to kick in at just the right moment. You have 2 Luck Points. Whenever you fail a d20 Test, you can spend 1 Luck Point to reroll the d20 and you must use the new roll. You regain your expended Luck Points when you finish a Long Rest.',
    effects: [
      {
        type: 'other',
        value: 2,
        note: '2 Luck Points per Long Rest. On a failed d20 Test, spend 1 to reroll.',
      },
    ],
  },

  // ── MAGIC INITIATE ─────────────────────────────────────────
  'Magic Initiate': {
    name: 'Magic Initiate',
    source: 'PHB_2024',
    description:
      'You have learned the basics of a particular magical tradition. Choose a Spell List: Cleric, Druid, or Wizard. You learn 2 Cantrips from that list and 1 Level 1 Spell, which you can cast once per Long Rest without a spell slot. Your spellcasting ability for these spells is the ability associated with the chosen list (Wisdom for Cleric/Druid, Intelligence for Wizard).',
    effects: [
      {
        type: 'spell_access',
        note:
          'Learn 2 cantrips + 1 level-1 spell from chosen list. Cast the level-1 spell once per Long Rest for free.',
      },
    ],
    requires_choice: {
      type: 'spell_list',
      count: 1,
      pool: ['Cleric', 'Druid', 'Wizard'],
      note:
        'Choose a spell list. Then choose 2 cantrips and 1 level-1 spell from that list.',
      grants_effects: true,
    },
    choice_note:
      'Spellcasting ability: Wisdom (Cleric/Druid) or Intelligence (Wizard).',
  },

  // ── MUSICIAN ───────────────────────────────────────────────
  Musician: {
    name: 'Musician',
    source: 'PHB_2024',
    description:
      'You are an accomplished performer. You gain the following benefits.',
    effects: [
      {
        type: 'tool_proficiency',
        value: 1,
        note: 'Gain proficiency with one Musical Instrument of your choice.',
      },
      {
        type: 'other',
        note:
          'Inspiring Song: As you finish a Short or Long Rest, you can play a song on a Musical Instrument you have proficiency with. Any ally who hears the song regains one expended use of their Bardic Inspiration.',
      },
    ],
    requires_choice: {
      type: 'tool',
      count: 1,
      pool: [
        'Bagpipes',
        'Drum',
        'Dulcimer',
        'Flute',
        'Hand Drum',
        'Lute',
        'Lyre',
        'Horn',
        'Pan Flute',
        'Shawm',
        'Viol',
      ],
      note: 'Choose 1 Musical Instrument.',
    },
  },

  // ── SAVAGE ATTACKER ────────────────────────────────────────
  'Savage Attacker': {
    name: 'Savage Attacker',
    source: 'PHB_2024',
    description:
      'You have trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon\'s damage dice twice and use either roll against the target.',
    effects: [
      {
        type: 'other',
        note:
          'Once per turn on a weapon hit: roll damage dice twice, use either result.',
      },
    ],
  },

  // ── SKILLED ────────────────────────────────────────────────
  Skilled: {
    name: 'Skilled',
    source: 'PHB_2024',
    description:
      'You have exceptionally broad learning. You gain proficiency in any combination of three Skills or Tools of your choice.',
    effects: [
      {
        type: 'extra_proficiency',
        value: 3,
        note: 'Gain 3 proficiencies (Skills or Tools, in any combination).',
      },
    ],
    requires_choice: {
      type: 'skill',
      count: 3,
      pool: [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
        'Deception', 'History', 'Insight', 'Intimidation',
        'Investigation', 'Medicine', 'Nature', 'Perception',
        'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
        'Stealth', 'Survival',
        // Tools also valid — note in UI
        "Alchemist's Supplies", "Brewer's Supplies", "Carpenter's Tools",
        "Cook's Utensils", "Herbalism Kit", "Navigator's Tools",
        "Poisoner's Kit", "Smith's Tools", "Thieves' Tools", "Tinker's Tools",
      ],
      note: 'Choose 3 Skills or Tools in any combination.',
    },
  },

  // ── TAVERN BRAWLER ─────────────────────────────────────────
  'Tavern Brawler': {
    name: 'Tavern Brawler',
    source: 'PHB_2024',
    description:
      'Accustomed to rough-and-tumble fighting, you gain the following benefits.',
    effects: [
      {
        type: 'other',
        note:
          'Enhanced Unarmed Strike: When you hit with an Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 + your Strength modifier instead of the normal damage.',
      },
      {
        type: 'other',
        note:
          'Improvised Weaponry: You have proficiency with improvised weapons. On a hit with one, the damage die is a d4.',
      },
      {
        type: 'other',
        note:
          'Retaliation: When you take damage from a creature within 5 feet of you, you can use a Reaction to make one Unarmed Strike against that creature.',
      },
    ],
  },

  // ── TOUGH ──────────────────────────────────────────────────
  Tough: {
    name: 'Tough',
    source: 'PHB_2024',
    description:
      'Your hit point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    effects: [
      {
        type: 'hp_bonus',
        value: 2,
        note: '+2 HP per character level (past and future). Applied at creation: +2 × level.',
      },
    ],
  },
}

// ── Helpers ────────────────────────────────────────────────
export const ORIGIN_FEAT_NAMES = Object.keys(ORIGIN_FEATS) as (keyof typeof ORIGIN_FEATS)[]

export function getOriginFeat(name: string): OriginFeat | undefined {
  return ORIGIN_FEATS[name]
}

export function featRequiresChoice(name: string): boolean {
  return !!ORIGIN_FEATS[name]?.requires_choice
}
