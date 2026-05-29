// ============================================================
// LoneForge — Feats (5.5e 2024 Compatible)
// All mechanics are system-compatible with D&D 5e 2024.
// Text is original LoneForge writing — not reproduced from
// any published source. CC BY 4.0 where applicable.
// ============================================================

export type FeatCategory =
  | 'Origin Feat'
  | 'General Feat'
  | 'Fighting Style Feat'
  | 'Epic Boon Feat'

export type FeatPrerequisite = {
  level?: number
  ability?: Partial<Record<string, number>>   // e.g. { Strength: 13 }
  ability_or?: Partial<Record<string, number>> // at least one of these
  proficiency?: string                          // e.g. "Medium Armor Training"
  feature?: string                              // e.g. "Fighting Style Feature"
  spellcasting?: boolean
  note?: string
}

export type FeatEffectType =
  | 'ability_score'
  | 'skill_proficiency'
  | 'skill_expertise'
  | 'tool_proficiency'
  | 'weapon_proficiency'
  | 'armor_proficiency'
  | 'language_proficiency'
  | 'spell_access'
  | 'resistance'
  | 'hp_bonus'
  | 'initiative_bonus'
  | 'speed_bonus'
  | 'reroll'
  | 'advantage_on'
  | 'disadvantage_on_enemy'
  | 'saving_throw_bonus'
  | 'damage_bonus'
  | 'carrying_capacity'
  | 'luck_points'
  | 'cant_be_surprised'
  | 'sense'
  | 'other'

export type FeatEffect = {
  type: FeatEffectType
  value?: string | number
  target?: string
  condition?: string
  damage_type?: string
  skill?: string
  note?: string
}

export type FeatChoice = {
  type: 'skill' | 'tool' | 'weapon_type' | 'spell_list' | 'ability' | 'damage_type' | 'language' | 'saving_throw'
  count: number
  pool?: string[]
  note?: string
  grants_effects?: boolean
}

export type Feat = {
  name: string
  category: FeatCategory
  prerequisite?: FeatPrerequisite
  repeatable?: boolean
  description: string
  effects: FeatEffect[]
  requires_choice?: FeatChoice
  choice_note?: string
  source: 'PHB_2024_Compatible' | 'LoneForge'
}

// ── ORIGIN FEATS ────────────────────────────────────────────
// Available at level 1 through Background selection.

const ORIGIN_FEATS: Record<string, Feat> = {

  Alert: {
    name: 'Alert',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'Your senses are constantly attuned to danger. You register threats before others have finished blinking.',
    effects: [
      {
        type: 'initiative_bonus',
        value: 5,
        note: '+5 bonus to Initiative rolls.',
      },
      {
        type: 'cant_be_surprised',
        note: 'You cannot be Surprised while conscious.',
      },
    ],
  },

  Crafter: {
    name: 'Crafter',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'Hours at the workbench have given you an instinct for materials and methods that others spend years trying to acquire.',
    effects: [
      {
        type: 'tool_proficiency',
        value: 3,
        note: 'Gain proficiency with 3 Artisan\'s Tools of your choice.',
      },
      {
        type: 'other',
        note:
          'When you finish a Long Rest in a settlement, you may craft one nonmagical item worth up to 20 gp using a tool you are proficient with. The item is complete at the end of the rest.',
      },
    ],
    requires_choice: {
      type: 'tool',
      count: 3,
      pool: [
        "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies",
        "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools",
        "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools",
        "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies",
        "Potter's Tools", "Smith's Tools", "Tinker's Tools",
        "Weaver's Tools", "Woodcarver's Tools",
      ],
      note: 'Choose 3 Artisan\'s Tools.',
    },
  },

  Healer: {
    name: 'Healer',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'You have a steady hand and the knowledge to use it. When others fall, you are the reason they get back up.',
    effects: [
      {
        type: 'other',
        note:
          'Battle Medic: Using a Healer\'s Kit as a Utilize action, you allow a creature to spend one Hit Die. It rolls the die, adds its Constitution modifier, and regains that many HP. This benefit cannot be used again on that creature until it completes a Short or Long Rest.',
      },
      {
        type: 'reroll',
        condition: 'when rolling dice to restore HP with a spell or this feat',
        note: 'Reroll any 1 result on healing dice; you must use the new roll.',
      },
    ],
  },

  Lucky: {
    name: 'Lucky',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'Fortune has a way of bending in your direction at the moments that count most. You have learned not to question it.',
    effects: [
      {
        type: 'luck_points',
        value: 2,
        note:
          'You have 2 Luck Points per Long Rest. When you fail a d20 Test, spend 1 Luck Point to reroll the d20. You must use the new result.',
      },
    ],
  },

  'Magic Initiate': {
    name: 'Magic Initiate',
    category: 'Origin Feat',
    repeatable: true,
    source: 'PHB_2024_Compatible',
    description:
      'You have reached into a magical tradition and drawn out its first secrets — enough to be useful, enough to be dangerous.',
    effects: [
      {
        type: 'spell_access',
        note:
          'Learn 2 cantrips and 1 level-1 spell from the chosen list. Cast the level-1 spell once per Long Rest without a spell slot. Spellcasting ability: Wisdom (Cleric/Druid) or Intelligence (Wizard).',
      },
    ],
    requires_choice: {
      type: 'spell_list',
      count: 1,
      pool: ['Cleric', 'Druid', 'Wizard'],
      note: 'Choose a spell list, then choose 2 cantrips and 1 level-1 spell from it.',
      grants_effects: true,
    },
  },

  Musician: {
    name: 'Musician',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'Music lives in your hands. You can quiet a crowd, lift a spirit, or tell a story without speaking a word.',
    effects: [
      {
        type: 'tool_proficiency',
        value: 1,
        note: 'Proficiency with one Musical Instrument of your choice.',
      },
      {
        type: 'other',
        note:
          'Inspiring Song: At the end of a Short or Long Rest, play an instrument you are proficient with. Each ally who hears the performance regains one expended use of Bardic Inspiration.',
      },
    ],
    requires_choice: {
      type: 'tool',
      count: 1,
      pool: ['Bagpipes', 'Drum', 'Dulcimer', 'Flute', 'Hand Drum', 'Lute', 'Lyre', 'Horn', 'Pan Flute', 'Shawm', 'Viol'],
      note: 'Choose 1 Musical Instrument.',
    },
  },

  'Savage Attacker': {
    name: 'Savage Attacker',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'When your strike lands, you put everything behind it. The damage that follows is not an accident.',
    effects: [
      {
        type: 'other',
        note:
          'Once per turn when you hit a target with a weapon, roll the weapon\'s damage dice twice and use either result.',
      },
    ],
  },

  Skilled: {
    name: 'Skilled',
    category: 'Origin Feat',
    repeatable: true,
    source: 'PHB_2024_Compatible',
    description:
      'Your range of training is unusually broad. You have picked up proficiencies that most people spend years trying to acquire.',
    effects: [
      {
        type: 'other',
        value: 3,
        note: 'Gain proficiency in any 3 Skills or Tools in any combination.',
      },
    ],
    requires_choice: {
      type: 'skill',
      count: 3,
      pool: [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
        'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
        'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
        'Sleight of Hand', 'Stealth', 'Survival',
        "Alchemist's Supplies", "Brewer's Supplies", "Carpenter's Tools",
        "Cook's Utensils", "Herbalism Kit", "Navigator's Tools",
        "Poisoner's Kit", "Smith's Tools", "Thieves' Tools", "Tinker's Tools",
      ],
      note: 'Choose 3 Skills or Tools in any combination.',
    },
  },

  'Tavern Brawler': {
    name: 'Tavern Brawler',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'You have survived enough close-quarters fights to know that anything in reach is a weapon and anything standing close is a target.',
    effects: [
      {
        type: 'other',
        note:
          'Enhanced Unarmed Strike: When you deal damage with an Unarmed Strike, you may deal 1d4 + Strength modifier Bludgeoning damage instead of the default.',
      },
      {
        type: 'weapon_proficiency',
        note: 'Proficiency with Improvised Weapons. On a hit, an improvised weapon deals 1d4 damage.',
      },
      {
        type: 'other',
        note:
          'Retaliation: When a creature within 5 feet deals damage to you, use your Reaction to make one Unarmed Strike against it.',
      },
    ],
  },

  Tough: {
    name: 'Tough',
    category: 'Origin Feat',
    source: 'PHB_2024_Compatible',
    description:
      'You endure what breaks others. Your body has learned to carry more damage and keep going.',
    effects: [
      {
        type: 'hp_bonus',
        value: 2,
        note: '+2 maximum HP per character level, applied retroactively and ongoing.',
      },
    ],
  },
}

// ── GENERAL FEATS ───────────────────────────────────────────
// Available at level 4+ through Ability Score Improvement slots.

const GENERAL_FEATS: Record<string, Feat> = {

  'Ability Score Improvement': {
    name: 'Ability Score Improvement',
    category: 'General Feat',
    prerequisite: { level: 4 },
    repeatable: true,
    source: 'PHB_2024_Compatible',
    description:
      'You focus your training, pushing one area of natural ability further than most achieve.',
    effects: [
      {
        type: 'ability_score',
        note: 'Increase one ability score by 2, or two different ability scores by 1 each. No score can exceed 20.',
      },
    ],
    requires_choice: {
      type: 'ability',
      count: 1,
      pool: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
      note: 'Choose: +2 to one ability, or +1 to two different abilities.',
      grants_effects: true,
    },
  },

  Actor: {
    name: 'Actor',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Charisma: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have studied deception so deeply that your voice, face, and body tell whatever story you choose.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Charisma',
        note: '+1 Charisma (max 20).',
      },
      {
        type: 'other',
        note:
          'Impersonation: You can mimic the voice of another person or a non-human creature if you have heard them speak for at least 1 minute. A successful Insight check contested by your Deception check is required to detect the mimicry.',
      },
      {
        type: 'advantage_on',
        target: 'Deception and Performance checks',
        condition: 'when passing yourself off as another person',
      },
    ],
  },

  Athlete: {
    name: 'Athlete',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'Your body is a precision instrument. You have honed it beyond ordinary limits through relentless physical discipline.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note: 'Climbing no longer costs extra movement.',
      },
      {
        type: 'other',
        note:
          'When you are Prone, standing up costs only 5 feet of movement instead of half your speed.',
      },
      {
        type: 'other',
        note: 'You can make a running long jump or high jump after moving only 5 feet, rather than 10.',
      },
    ],
  },

  Charger: {
    name: 'Charger',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You lead with momentum. When you move into a fight, your first strike carries the full force of your approach.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Improved Dash: When you take the Dash action and then make an attack on the same turn, you may add 1d8 to the damage of that attack, or push the target 10 feet directly away from you if it is Large or smaller.',
      },
      {
        type: 'other',
        note:
          'Charge through: While Dashing, moving through the space of an enemy of your size or smaller costs no extra movement.',
      },
    ],
  },

  Chef: {
    name: 'Chef',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have a talent for preparing food that does more than fill a stomach. A meal made by your hands leaves people genuinely restored.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Constitution or Wisdom',
        note: '+1 to Constitution or Wisdom (max 20).',
      },
      {
        type: 'tool_proficiency',
        note: 'Gain proficiency with Cook\'s Utensils if you don\'t already have it.',
      },
      {
        type: 'other',
        note:
          'Nourishing Meals: When you finish a Short Rest and have Cook\'s Utensils, you can prepare a number of portions equal to your Proficiency Bonus. Creatures that eat a portion and spend Hit Dice during that rest regain additional HP equal to your Proficiency Bonus.',
      },
      {
        type: 'other',
        note:
          'Fortifying Treats: After a Long Rest, you can prepare treats equal to your Proficiency Bonus. A creature that eats one gains temporary HP equal to your Proficiency Bonus.',
      },
    ],
  },

  'Crossbow Expert': {
    name: 'Crossbow Expert',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have drilled with crossbows until loading them is as automatic as breathing.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Dexterity',
        note: '+1 Dexterity (max 20).',
      },
      {
        type: 'other',
        note: 'You ignore the Loading property of all crossbows.',
      },
      {
        type: 'other',
        note:
          'You do not suffer Disadvantage on ranged attack rolls from being within 5 feet of a hostile creature.',
      },
      {
        type: 'other',
        note:
          'When you use the Attack action with a crossbow, you can use a Bonus Action to make one additional hand crossbow attack.',
      },
    ],
  },

  Crusher: {
    name: 'Crusher',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You hit with weight and force. When your strikes land, they leave enemies off-balance and hurting.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Constitution',
        note: '+1 to Strength or Constitution (max 20).',
      },
      {
        type: 'other',
        note:
          'Once per turn when you deal Bludgeoning damage, you may push the target 5 feet horizontally if it is Large or smaller.',
      },
      {
        type: 'other',
        note:
          'When you score a Critical Hit with a Bludgeoning attack, attack rolls against the target have Advantage until the start of your next turn.',
      },
    ],
  },

  'Defensive Duelist': {
    name: 'Defensive Duelist',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have trained in the fine art of using a blade\'s reach to turn away what would otherwise be a solid hit.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Dexterity',
        note: '+1 Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Parry: When you are wielding a Finesse weapon and a creature hits you with an attack roll, use your Reaction to add your Proficiency Bonus to your AC for that attack, potentially turning the hit into a miss.',
      },
    ],
  },

  'Dual Wielder': {
    name: 'Dual Wielder',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'Two weapons, one motion. You have trained until the coordination required feels like a single action.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note: 'You can use Two-Weapon Fighting even when neither weapon has the Light property.',
      },
      {
        type: 'other',
        note: 'You gain a +1 bonus to AC while wielding a separate melee weapon in each hand.',
      },
      {
        type: 'other',
        note: 'You can draw or stow two weapons when you would normally be able to draw or stow only one.',
      },
    ],
  },

  Durable: {
    name: 'Durable',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You recover quickly. Where others stay down, you are already getting back up.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Constitution',
        note: '+1 Constitution (max 20).',
      },
      {
        type: 'other',
        note:
          'Defy Death: When you succeed on a Death Saving Throw, you regain 1 HP and can immediately stand up if Prone. Once used, this requires a Long Rest to recharge.',
      },
      {
        type: 'other',
        note:
          'Speedy Recovery: As a Bonus Action, you can spend one of your Hit Dice to recover HP.',
      },
    ],
  },

  'Elemental Adept': {
    name: 'Elemental Adept',
    category: 'General Feat',
    prerequisite: { level: 4, spellcasting: true },
    repeatable: true,
    source: 'PHB_2024_Compatible',
    description:
      'You have pushed your affinity for one element until it bends toward you even when others resist it.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to your spellcasting ability (max 20).',
      },
      {
        type: 'other',
        note:
          'Choose one damage type: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance to that damage type. When you roll a 1 on a damage die for a spell dealing that type, treat it as a 2 instead.',
      },
    ],
    requires_choice: {
      type: 'damage_type',
      count: 1,
      pool: ['Acid', 'Cold', 'Fire', 'Lightning', 'Thunder'],
      note: 'Each time you take this feat, choose a different damage type.',
    },
  },

  'Fey-Touched': {
    name: 'Fey-Touched',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'Something from the Feywild left a mark on you — a brush with the uncanny that changed how magic flows through you.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to chosen ability (max 20).',
      },
      {
        type: 'spell_access',
        note:
          'Learn Misty Step and one level-1 Divination or Enchantment spell of your choice. You can cast each once per Long Rest without a spell slot. You may also cast them using spell slots if you have them. Spellcasting ability is the one increased by this feat.',
      },
    ],
    requires_choice: {
      type: 'ability',
      count: 1,
      pool: ['Intelligence', 'Wisdom', 'Charisma'],
      note: 'Choose your spellcasting ability for these spells.',
    },
  },

  Grappler: {
    name: 'Grappler',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You close distance and hold on. Once your hands find an enemy, letting go is their problem.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'advantage_on',
        target: 'attack rolls',
        condition: 'against creatures you are grappling',
      },
      {
        type: 'other',
        note:
          'Shove and Grapple: You can attempt to Grapple or Shove a creature that is up to two sizes larger than you.',
      },
      {
        type: 'other',
        note:
          'Pin: When you Grapple a creature, you can use a Bonus Action to Restrain it. The Restrained condition ends if the Grapple ends. The Grappler is also Restrained while using this feature.',
      },
    ],
  },

  'Great Weapon Master': {
    name: 'Great Weapon Master',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Strength: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You wield heavy weapons with a control that others mistake for recklessness. The weight is the point.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength',
        note: '+1 Strength (max 20).',
      },
      {
        type: 'other',
        note:
          'Heavy Hitter: When you hit with a Heavy weapon, you can forgo the normal result and deal damage equal to the weapon\'s damage die + the modifier used. You can use this feature a number of times equal to your Proficiency Bonus per Long Rest.',
      },
      {
        type: 'other',
        note:
          'Cleave: When you reduce a creature to 0 HP with a Heavy weapon melee attack, you can use a Bonus Action to make a melee attack against another creature within reach.',
      },
    ],
  },

  'Heavily Armored': {
    name: 'Heavily Armored',
    category: 'General Feat',
    prerequisite: { level: 4, proficiency: 'Medium Armor Training' },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to move in full plate as if it were a second skin.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Constitution or Strength',
        note: '+1 to Constitution or Strength (max 20).',
      },
      {
        type: 'armor_proficiency',
        value: 'Heavy Armor',
        note: 'Gain proficiency with Heavy Armor.',
      },
    ],
  },

  'Heavy Armor Master': {
    name: 'Heavy Armor Master',
    category: 'General Feat',
    prerequisite: { level: 4, proficiency: 'Heavy Armor Training' },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to use the weight of full plate not just as protection but as damage reduction.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Constitution or Strength',
        note: '+1 to Constitution or Strength (max 20).',
      },
      {
        type: 'other',
        note:
          'Damage Reduction: While wearing Heavy Armor, reduce any Bludgeoning, Piercing, or Slashing damage you take by an amount equal to your Proficiency Bonus.',
      },
    ],
  },

  'Inspiring Leader': {
    name: 'Inspiring Leader',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Wisdom: 13, Charisma: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'When you speak before a fight, people listen. And when they listen, they fight better.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Wisdom or Charisma',
        note: '+1 to Wisdom or Charisma (max 20).',
      },
      {
        type: 'other',
        note:
          'Rallying Speech: When you finish a Short or Long Rest, give a speech of at least 1 minute. Up to 10 creatures of your choice who hear you gain Temporary HP equal to your level + your Charisma modifier (minimum 1).',
      },
    ],
  },

  'Keen Mind': {
    name: 'Keen Mind',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Intelligence: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'Your mind is an instrument you have sharpened to a fine edge. Details others miss are simply data to you.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence',
        note: '+1 Intelligence (max 20).',
      },
      {
        type: 'other',
        note: 'You always know which way is north.',
      },
      {
        type: 'other',
        note:
          'You can accurately recall anything you have seen or heard within the last month.',
      },
      {
        type: 'other',
        note:
          'Quick Study: As a Bonus Action, study a book, creature, or object within 5 feet. You gain Advantage on your next check related to what you studied. You can use this feature a number of times equal to your Proficiency Bonus per Long Rest.',
      },
    ],
  },

  'Lightly Armored': {
    name: 'Lightly Armored',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description: 'You have trained in the basics of wearing armor without it slowing you down.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'armor_proficiency',
        value: 'Light Armor',
        note: 'Gain proficiency with Light Armor. If already proficient, gain Medium Armor proficiency instead.',
      },
    ],
  },

  'Mage Slayer': {
    name: 'Mage Slayer',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have studied how spellcasters work and how to make them stop. Distance does not protect them from you.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Concentration Breaker: When you deal damage to a creature that is Concentrating on a spell, it has Disadvantage on the Constitution saving throw to maintain Concentration.',
      },
      {
        type: 'other',
        note:
          'Guarded Mind: You have Advantage on saving throws against spells.',
      },
    ],
  },

  'Martial Weapon Training': {
    name: 'Martial Weapon Training',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description: 'You have drilled with the full range of martial arms until their use is second nature.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'weapon_proficiency',
        note: 'Gain proficiency with all Martial weapons.',
      },
    ],
  },

  'Medium Armor Master': {
    name: 'Medium Armor Master',
    category: 'General Feat',
    prerequisite: { level: 4, proficiency: 'Medium Armor Training' },
    source: 'PHB_2024_Compatible',
    description:
      'You move in medium armor without the compromises it imposes on others.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Your Dexterity modifier contributes up to +3 (instead of +2) to AC while wearing Medium Armor.',
      },
      {
        type: 'other',
        note: 'You do not suffer Disadvantage on Stealth checks while wearing Medium Armor.',
      },
    ],
  },

  'Moderately Armored': {
    name: 'Moderately Armored',
    category: 'General Feat',
    prerequisite: { level: 4, proficiency: 'Light Armor Training' },
    source: 'PHB_2024_Compatible',
    description: 'You have extended your armor training into medium protection and shield use.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'armor_proficiency',
        value: 'Medium Armor and Shields',
        note: 'Gain proficiency with Medium Armor and Shields.',
      },
    ],
  },

  'Mounted Combatant': {
    name: 'Mounted Combatant',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You and your mount move as one. The height and speed it gives you become tactical advantages in your hands.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength, Dexterity, or Wisdom',
        note: '+1 to Strength, Dexterity, or Wisdom (max 20).',
      },
      {
        type: 'other',
        note:
          'Mounted Strike: While mounted, you have Advantage on melee attack rolls against any Unmounted creature that is smaller than your mount.',
      },
      {
        type: 'other',
        note:
          'Leap Aside: If your mount is subjected to an effect that allows a Dexterity saving throw for half damage, your mount takes no damage on a success and half damage on a failure.',
      },
      {
        type: 'other',
        note:
          'Veer: While mounted, if you would take damage from an attack, you can use your Reaction to have your mount take that damage instead.',
      },
    ],
  },

  Observant: {
    name: 'Observant',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Intelligence: 13, Wisdom: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You notice what others overlook. Lips moving across a room, a lock that was not picked from the outside, a shadow with the wrong shape.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence or Wisdom',
        note: '+1 to Intelligence or Wisdom (max 20).',
      },
      {
        type: 'other',
        note:
          'Lip Reading: If you can see a creature\'s mouth while it speaks a language you understand, you can interpret what it is saying without sound.',
      },
      {
        type: 'other',
        note:
          'Keen Observer: You gain a bonus to your passive Perception and passive Investigation scores equal to your Proficiency Bonus.',
      },
    ],
  },

  Piercer: {
    name: 'Piercer',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to place your thrusting attacks precisely, finding gaps in defense with practiced efficiency.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'reroll',
        condition: 'when rolling Piercing damage',
        note: 'Once per turn, reroll one Piercing damage die. You must use the new result.',
      },
      {
        type: 'other',
        note: 'When you score a Critical Hit with a Piercing attack, roll one additional damage die.',
      },
    ],
  },

  Poisoner: {
    name: 'Poisoner',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have mastered the art of extraction, application, and dosage. Poison is not a last resort — it is a first strike.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence or Dexterity',
        note: '+1 to Intelligence or Dexterity (max 20).',
      },
      {
        type: 'tool_proficiency',
        note: 'Proficiency with Poisoner\'s Kit (if not already).',
      },
      {
        type: 'other',
        note:
          'Potent Poison: When you make a poison using a Poisoner\'s Kit, the save DC is 8 + your Proficiency Bonus + your Intelligence modifier.',
      },
      {
        type: 'other',
        note:
          'Quick Application: Applying a poison to a weapon requires only a Bonus Action rather than an action.',
      },
      {
        type: 'other',
        note:
          'Resistant creatures are not immune to your poisons — your prepared toxins bypass Poison Resistance (though not Immunity).',
      },
    ],
  },

  'Polearm Master': {
    name: 'Polearm Master',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You control the space around you with a polearm in a way that makes closing distance a costly decision.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Butt Strike: When you take the Attack action with a Glaive, Halberd, Quarterstaff, or Spear, you can use a Bonus Action to strike with the weapon\'s opposite end. This strike deals 1d4 Bludgeoning damage and uses the same ability modifier as the main attack.',
      },
      {
        type: 'other',
        note:
          'Reactive Strike: While wielding one of the weapons above, you can use your Reaction to make a melee attack against a creature that enters your reach.',
      },
    ],
  },

  Resilient: {
    name: 'Resilient',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have shored up a weakness — a saving throw that used to catch you is now something you are prepared for.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Chosen ability',
        note: '+1 to the chosen ability (max 20).',
      },
      {
        type: 'saving_throw_bonus',
        note: 'Gain proficiency in saving throws for the chosen ability.',
      },
    ],
    requires_choice: {
      type: 'saving_throw',
      count: 1,
      pool: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
      note: 'Choose one ability score. You gain +1 to it and proficiency in its saving throw.',
    },
  },

  'Ritual Caster': {
    name: 'Ritual Caster',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Intelligence: 13, Wisdom: 13, Charisma: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to perform the extended magical rites that produce effects without burning through your reserves.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to chosen ability (max 20).',
      },
      {
        type: 'other',
        note:
          'Ritual Book: You possess a ritual book containing two level-1 spells with the Ritual tag from any class list. Spellcasting ability is the one increased by this feat. You can cast these as rituals only.',
      },
      {
        type: 'other',
        note:
          'Ritual Discovery: When you find a spell with the Ritual tag on a scroll or in a spellbook, you may copy it into your ritual book. The spell must be castable by the chosen class and of a level you can cast.',
      },
    ],
    requires_choice: {
      type: 'ability',
      count: 1,
      pool: ['Intelligence', 'Wisdom', 'Charisma'],
    },
  },

  Sentinel: {
    name: 'Sentinel',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Strength: 13, Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have mastered the technique of standing your ground and forcing enemies to reckon with you before they reach anyone else.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Opportunity Strike: When you hit a creature with an Opportunity Attack, its Speed becomes 0 for the rest of the turn.',
      },
      {
        type: 'other',
        note:
          'Guardian Reach: When a creature within your reach makes an attack against a target other than you, use your Reaction to make a melee weapon attack against that creature.',
      },
      {
        type: 'other',
        note:
          'Engaging Presence: Creatures provoke Opportunity Attacks from you even when they Disengage.',
      },
    ],
  },

  'Shadow-Touched': {
    name: 'Shadow-Touched',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'Your exposure to the Shadowfell left something behind — a residue of dark magic that now answers when you call.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to chosen ability (max 20).',
      },
      {
        type: 'spell_access',
        note:
          'Learn Invisibility and one level-1 Illusion or Necromancy spell of your choice. You can cast each once per Long Rest without a slot. You may also cast them using spell slots.',
      },
    ],
    requires_choice: {
      type: 'ability',
      count: 1,
      pool: ['Intelligence', 'Wisdom', 'Charisma'],
    },
  },

  Sharpshooter: {
    name: 'Sharpshooter',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have turned ranged combat into a discipline. Distance, cover, and moving targets are all just variables you account for.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Dexterity',
        note: '+1 Dexterity (max 20).',
      },
      {
        type: 'other',
        note: 'Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.',
      },
      {
        type: 'other',
        note:
          'Long Shot: Attacking at long range no longer imposes Disadvantage on your ranged weapon attack rolls.',
      },
      {
        type: 'other',
        note:
          'Careful Shot: Before making a ranged weapon attack, you may choose to forgo your Proficiency Bonus on the attack roll. If the attack hits, add +10 to the damage.',
      },
    ],
  },

  'Shield Master': {
    name: 'Shield Master',
    category: 'General Feat',
    prerequisite: { level: 4, proficiency: 'Shield Training' },
    source: 'PHB_2024_Compatible',
    description:
      'A shield in your hands is not passive defense. It is the edge that starts fights and the wall that ends them.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength',
        note: '+1 Strength (max 20).',
      },
      {
        type: 'other',
        note:
          'Shield Bash: When you take the Attack action, you can use a Bonus Action to try to Shove a creature within 5 feet using your shield.',
      },
      {
        type: 'other',
        note:
          'Shield Interpose: When you are subjected to an effect that allows a Dexterity saving throw for half damage, use your Reaction to take no damage on a success.',
      },
      {
        type: 'other',
        note:
          'Covered Defense: You can use your shield to cover an adjacent ally. As a Bonus Action, one creature within 5 feet gains Half Cover (+2 AC) until the start of your next turn.',
      },
    ],
  },

  'Skill Expert': {
    name: 'Skill Expert',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have gone beyond proficiency in one area, developing a depth of skill that makes you the person others come to.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 20).',
      },
      {
        type: 'skill_proficiency',
        value: 1,
        note: 'Gain proficiency in one skill of your choice.',
      },
      {
        type: 'skill_expertise',
        note: 'Gain Expertise (double proficiency bonus) in one skill you are proficient with.',
      },
    ],
    requires_choice: {
      type: 'skill',
      count: 1,
      pool: [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
        'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
        'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
        'Sleight of Hand', 'Stealth', 'Survival',
      ],
      note: 'Choose the skill to gain Expertise in (must be one you are proficient with).',
    },
  },

  Skulker: {
    name: 'Skulker',
    category: 'General Feat',
    prerequisite: { level: 4, ability: { Dexterity: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to use the dark and the crowd as thoroughly as any piece of armor.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Dexterity',
        note: '+1 Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Blindsight in Dim Light: You see in Dim Light within 10 feet of you as if it were Bright Light.',
      },
      {
        type: 'other',
        note:
          'Concealed Shot: When you are Hidden and miss with a ranged weapon attack, the missed attack does not reveal your location.',
      },
      {
        type: 'other',
        note:
          'Fog of War: When you attempt to Hide, Perception checks to detect you have Disadvantage if you are in Lightly Obscured terrain.',
      },
    ],
  },

  Slasher: {
    name: 'Slasher',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'Your cuts leave people slower and worse off. The wound keeps working after the swing ends.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'other',
        note:
          'Once per turn when you deal Slashing damage, reduce the target\'s Speed by 10 feet until the start of your next turn.',
      },
      {
        type: 'other',
        note:
          'When you score a Critical Hit with a Slashing weapon, the target has Disadvantage on attack rolls until the start of your next turn.',
      },
    ],
  },

  Speedy: {
    name: 'Speedy',
    category: 'General Feat',
    prerequisite: { level: 4, ability_or: { Dexterity: 13, Constitution: 13 } },
    source: 'PHB_2024_Compatible',
    description:
      'You have refined your movement until it carries you past most threats before they can respond.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Dexterity or Constitution',
        note: '+1 to Dexterity or Constitution (max 20).',
      },
      {
        type: 'speed_bonus',
        value: 10,
        note: 'Your Speed increases by 10 feet.',
      },
      {
        type: 'other',
        note: 'Opportunity Attacks against you are made with Disadvantage.',
      },
    ],
  },

  'Spell Sniper': {
    name: 'Spell Sniper',
    category: 'General Feat',
    prerequisite: { level: 4, spellcasting: true },
    source: 'PHB_2024_Compatible',
    description:
      'You have learned to extend the reach of your spells and find lines of fire that others cannot.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Your spellcasting ability',
        note: '+1 to Intelligence, Wisdom, or Charisma (max 20).',
      },
      {
        type: 'other',
        note: 'When you cast a spell that requires a ranged attack roll, its range is doubled.',
      },
      {
        type: 'other',
        note: 'Your ranged spell attack rolls ignore Half Cover and Three-Quarters Cover.',
      },
      {
        type: 'spell_access',
        note: 'Learn one cantrip that requires an attack roll from any class list.',
      },
    ],
  },

  Telekinetic: {
    name: 'Telekinetic',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have developed a persistent mental grip on the physical world. Small forces obey your intention.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to chosen ability (max 20).',
      },
      {
        type: 'spell_access',
        note: 'Learn the Mage Hand cantrip or extend its range by 30 feet if you already know it. The hand is invisible.',
      },
      {
        type: 'other',
        note:
          'Telekinetic Shove: As a Bonus Action, push or pull one creature within 30 feet of you by 5 feet. The target must succeed on a Strength saving throw (DC = 8 + your Proficiency Bonus + your spellcasting ability modifier) or be moved.',
      },
    ],
  },

  Telepathic: {
    name: 'Telepathic',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'Your mind reaches outward. You can communicate where words cannot travel and sense what others would rather keep hidden.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Intelligence, Wisdom, or Charisma',
        note: '+1 to chosen ability (max 20).',
      },
      {
        type: 'other',
        note:
          'Silent Speech: You can speak telepathically with any creature you can see within 60 feet. The communication is one-way unless the creature has telepathy of its own.',
      },
      {
        type: 'spell_access',
        note:
          'You can cast Detect Thoughts (using your spellcasting ability modifier or Intelligence if you lack one) once per Long Rest without a spell slot.',
      },
    ],
  },

  'War Caster': {
    name: 'War Caster',
    category: 'General Feat',
    prerequisite: { level: 4, spellcasting: true },
    source: 'PHB_2024_Compatible',
    description:
      'You have trained to cast spells in the chaos of melee. Your hands find the gestures even when holding steel.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Your spellcasting ability',
        note: '+1 to Intelligence, Wisdom, or Charisma (max 20).',
      },
      {
        type: 'advantage_on',
        target: 'Constitution saving throws',
        condition: 'to maintain Concentration on a spell',
      },
      {
        type: 'other',
        note:
          'Reactive Spell: When a creature provokes an Opportunity Attack from you, use your Reaction to cast a spell targeting only that creature instead. The spell must have a casting time of one action.',
      },
      {
        type: 'other',
        note:
          'Somatic Freedom: You can perform somatic components even when you have weapons or a Shield in one or both hands.',
      },
    ],
  },

  'Weapon Master': {
    name: 'Weapon Master',
    category: 'General Feat',
    prerequisite: { level: 4 },
    source: 'PHB_2024_Compatible',
    description:
      'You have dedicated yourself to a particular class of weapon until you understand it better than most understand anything.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 20).',
      },
      {
        type: 'weapon_proficiency',
        value: 4,
        note: 'Gain proficiency with 4 Simple or Martial weapons of your choice.',
      },
    ],
    requires_choice: {
      type: 'weapon_type',
      count: 4,
      pool: [
        'Club', 'Dagger', 'Greatclub', 'Handaxe', 'Javelin', 'Light Hammer',
        'Mace', 'Quarterstaff', 'Sickle', 'Spear', 'Dart', 'Light Crossbow',
        'Shortbow', 'Sling', 'Battleaxe', 'Flail', 'Glaive', 'Greataxe',
        'Greatsword', 'Halberd', 'Lance', 'Longsword', 'Maul', 'Morningstar',
        'Pike', 'Rapier', 'Scimitar', 'Shortsword', 'Trident', 'War Pick',
        'Warhammer', 'Whip', 'Blowgun', 'Hand Crossbow', 'Heavy Crossbow',
        'Longbow', 'Net',
      ],
      note: 'Choose 4 weapons.',
    },
  },
}

// ── FIGHTING STYLE FEATS ────────────────────────────────────
// Require: Fighting Style class feature.

const FIGHTING_STYLE_FEATS: Record<string, Feat> = {

  Archery: {
    name: 'Archery',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'You have trained relentlessly with ranged weapons. Every shot is measured and deliberate.',
    effects: [
      {
        type: 'damage_bonus',
        value: 2,
        condition: 'with ranged weapons',
        note: '+2 bonus to attack rolls with ranged weapons.',
      },
    ],
  },

  'Blind Fighting': {
    name: 'Blind Fighting',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description:
      'You have trained until sight became optional. You fight as well in darkness as others fight in daylight.',
    effects: [
      {
        type: 'sense',
        value: 10,
        note: 'Blindsight with a range of 10 feet. You can see Invisible creatures within this range.',
      },
    ],
  },

  Defense: {
    name: 'Defense',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'While wearing armor, you carry yourself with the efficiency of someone who has trained to take hits well.',
    effects: [
      {
        type: 'other',
        value: 1,
        note: '+1 bonus to AC while wearing armor.',
      },
    ],
  },

  Dueling: {
    name: 'Dueling',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'One weapon, one hand, complete focus. You have refined single-weapon combat until it outperforms brute force.',
    effects: [
      {
        type: 'damage_bonus',
        value: 2,
        condition: 'wielding a melee weapon in one hand with no other weapon',
        note: '+2 damage when wielding a one-handed melee weapon and no other weapon.',
      },
    ],
  },

  'Great Weapon Fighting': {
    name: 'Great Weapon Fighting',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'You do not accept poor results. When a heavy weapon fails to perform, you make it try again.',
    effects: [
      {
        type: 'reroll',
        condition: 'when rolling a 1 or 2 on a damage die for a two-handed or versatile weapon attack',
        note: 'Reroll 1s and 2s on damage dice for two-handed or versatile weapons. You must use the new roll.',
      },
    ],
  },

  Interception: {
    name: 'Interception',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description:
      'You have trained to put yourself between harm and the people beside you.',
    effects: [
      {
        type: 'other',
        note:
          'When a creature you can see hits a target other than you within 5 feet with an attack, use your Reaction to reduce the damage by 1d10 + your Proficiency Bonus. You must be wielding a weapon or shield.',
      },
    ],
  },

  Protection: {
    name: 'Protection',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'Your shield is not just for you. You use it to extend protection to those fighting beside you.',
    effects: [
      {
        type: 'other',
        note:
          'When a creature you can see attacks a target other than you within 5 feet, use your Reaction to impose Disadvantage on the attack roll. You must be wielding a Shield.',
      },
    ],
  },

  'Thrown Weapon Fighting': {
    name: 'Thrown Weapon Fighting',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'You draw and throw as a single fluid motion, and what you throw hits harder for it.',
    effects: [
      {
        type: 'other',
        note: 'You can draw a weapon with the Thrown property as part of the attack that throws it.',
      },
      {
        type: 'damage_bonus',
        value: 2,
        condition: 'with thrown weapon attacks',
        note: '+2 damage on thrown weapon attacks.',
      },
    ],
  },

  'Two-Weapon Fighting': {
    name: 'Two-Weapon Fighting',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'When you fight with two weapons, both contribute fully to the damage you deal.',
    effects: [
      {
        type: 'other',
        note:
          'When you make an extra attack with a Light weapon as part of the Two-Weapon Fighting rule, you can add your ability modifier to the damage of that attack.',
      },
    ],
  },

  'Unarmed Fighting': {
    name: 'Unarmed Fighting',
    category: 'Fighting Style Feat',
    prerequisite: { feature: 'Fighting Style Feature' },
    source: 'PHB_2024_Compatible',
    description: 'Your hands and body are weapons you have trained with more than any blade.',
    effects: [
      {
        type: 'other',
        note:
          'Your unarmed strikes deal 1d6 Bludgeoning damage, or 1d8 when you have no weapons or shield. At the start of each of your turns while Grappling a creature, you deal 1d4 Bludgeoning damage to it.',
      },
    ],
  },
}

// ── EPIC BOON FEATS ─────────────────────────────────────────
// Require: Level 19+.

const EPIC_BOON_FEATS: Record<string, Feat> = {

  'Boon of Combat Prowess': {
    name: 'Boon of Combat Prowess',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Your mastery of combat has elevated to a level that rewrites what is possible in a fight.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'other',
        note:
          'Peerless Aim: When you miss with an attack roll, you can hit instead. Once used, requires a Short or Long Rest to recharge.',
      },
    ],
  },

  'Boon of Dimensional Travel': {
    name: 'Boon of Dimensional Travel',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Space bends around your intention. Moving through it has become as natural as walking.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'spell_access',
        note:
          'Misty Step at will: After taking an action, you can cast Misty Step as part of the same turn. This teleport costs no spell slot.',
      },
    ],
  },

  'Boon of Energy Resistance': {
    name: 'Boon of Energy Resistance',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description:
      'You have endured so much elemental punishment that your body has adapted to absorb it.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'resistance',
        note:
          'Gain Resistance to two damage types of your choice from: Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder. As a Bonus Action, you may swap either resistance to a different type from this list.',
      },
    ],
  },

  'Boon of Fate': {
    name: 'Boon of Fate',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'You have developed an instinct for intervening in the turning points of events.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'other',
        note:
          'Improve Fate: When you or a creature within 60 feet makes a d20 Test, use your Reaction to roll 2d4 and apply the result as a bonus or penalty to the triggering roll. Once used, requires a Short or Long Rest.',
      },
    ],
  },

  'Boon of Fortitude': {
    name: 'Boon of Fortitude',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Your body has reached a point of endurance that most living things never approach.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'hp_bonus',
        value: 40,
        note: 'Your maximum HP increases by 40.',
      },
    ],
  },

  'Boon of Irresistible Offense': {
    name: 'Boon of Irresistible Offense',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description:
      'Your attacks carry a force that bypasses the defenses others rely on.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Strength or Dexterity',
        note: '+1 to Strength or Dexterity (max 30).',
      },
      {
        type: 'other',
        note:
          'Attacks and damage from your weapons and Unarmed Strikes overcome Immunity and Resistance to Bludgeoning, Piercing, and Slashing damage.',
      },
    ],
  },

  'Boon of Recovery': {
    name: 'Boon of Recovery',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description:
      'When the situation becomes desperate, your body finds resources that should not exist.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'other',
        note:
          'Last Stand: When you would be reduced to 0 HP, drop to 1 HP instead and regain HP equal to half your maximum. Once used, requires a Long Rest.',
      },
      {
        type: 'other',
        note:
          'Recover Vitality: As a Bonus Action, spend up to half your total Hit Dice and regain HP accordingly. Once used, requires a Long Rest.',
      },
    ],
  },

  'Boon of Skill': {
    name: 'Boon of Skill',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Your accumulated experience has left you broadly capable in a way that surprises even experts.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'skill_proficiency',
        note: 'Gain proficiency in all skills.',
      },
    ],
  },

  'Boon of Speed': {
    name: 'Boon of Speed',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Movement has become something you do to the world rather than something it does to you.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'speed_bonus',
        value: 30,
        note: '+30 feet to your Speed.',
      },
      {
        type: 'other',
        note:
          'Escape Artist: When a creature ends its turn within 5 feet of you, use your Reaction to move up to half your Speed without provoking Opportunity Attacks.',
      },
    ],
  },

  'Boon of Spell Recall': {
    name: 'Boon of Spell Recall',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19, spellcasting: true },
    source: 'PHB_2024_Compatible',
    description: 'You have so thoroughly internalized your magic that it replenishes itself in ways it should not.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'other',
        note:
          'Free Casting: When you cast a spell using a spell slot, roll a d20. On a 20, the slot is not expended.',
      },
    ],
  },

  'Boon of the Night Spirit': {
    name: 'Boon of the Night Spirit',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description:
      'Darkness has stopped being a limitation. It has become a resource you use more effectively than most use light.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'other',
        note:
          'Merge with Shadows: While in Dim Light or Darkness, you can make yourself Invisible as a Bonus Action. The Invisible condition ends if you move into Bright Light or take any action.',
      },
    ],
  },

  'Boon of Truesight': {
    name: 'Boon of Truesight',
    category: 'Epic Boon Feat',
    prerequisite: { level: 19 },
    source: 'PHB_2024_Compatible',
    description: 'Illusions and disguises have stopped meaning anything to you. What you see is what is there.',
    effects: [
      {
        type: 'ability_score',
        value: 1,
        target: 'Any ability',
        note: '+1 to one ability of your choice (max 30).',
      },
      {
        type: 'sense',
        value: 60,
        note:
          'Truesight with a range of 60 feet: see through magical darkness, invisible creatures, illusions, and shapechangers in their true forms.',
      },
    ],
  },
}

// ── Combined export ──────────────────────────────────────────
export const ALL_FEATS: Record<string, Feat> = {
  ...ORIGIN_FEATS,
  ...GENERAL_FEATS,
  ...FIGHTING_STYLE_FEATS,
  ...EPIC_BOON_FEATS,
}

export const FEATS_BY_CATEGORY = {
  'Origin Feat':        ORIGIN_FEATS,
  'General Feat':       GENERAL_FEATS,
  'Fighting Style Feat': FIGHTING_STYLE_FEATS,
  'Epic Boon Feat':     EPIC_BOON_FEATS,
} as const

export const FEAT_NAMES = Object.keys(ALL_FEATS) as (keyof typeof ALL_FEATS)[]

// ── Helpers ──────────────────────────────────────────────────
export function getFeat(name: string): Feat | undefined {
  return ALL_FEATS[name]
}

export function getFeatsByCategory(category: FeatCategory): Feat[] {
  return Object.values(ALL_FEATS).filter(f => f.category === category)
}

export function featIsAvailable(
  feat: Feat,
  characterLevel: number,
  abilities: Record<string, number>,
  hasSpellcasting: boolean,
  hasFightingStyle: boolean,
): boolean {
  const pre = feat.prerequisite
  if (!pre) return true
  if (pre.level && characterLevel < pre.level) return false
  if (pre.spellcasting && !hasSpellcasting) return false
  if (pre.feature === 'Fighting Style Feature' && !hasFightingStyle) return false
  if (pre.ability) {
    for (const [attr, min] of Object.entries(pre.ability)) {
      if ((abilities[attr] ?? 0) < min) return false
    }
  }
  if (pre.ability_or) {
    const meets = Object.entries(pre.ability_or).some(
      ([attr, min]) => (abilities[attr] ?? 0) >= min,
    )
    if (!meets) return false
  }
  return true
}

export function featRequiresChoice(name: string): boolean {
  return !!ALL_FEATS[name]?.requires_choice
}
