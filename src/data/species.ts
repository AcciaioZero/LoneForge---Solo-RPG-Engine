// ============================================================
// LoneForge — Species Data (PHB 2024 / SRD 5.2)
// Source: SRD 5.2 CC BY 4.0
// ============================================================

export type SpeciesTraitEffectType =
  | 'darkvision'
  | 'resistance'
  | 'skill_proficiency'
  | 'advantage_on'
  | 'reroll_ones'
  | 'speed_bonus'
  | 'carrying_capacity'
  | 'temp_hp_on_dash'
  | 'once_per_rest_survive'
  | 'damage_reduction'
  | 'extra_skill_proficiency'
  | 'inspiration_on_long_rest'
  | 'unhindered_movement'
  | 'fly_speed'
  | 'breath_weapon'
  | 'elemental_resistance'
  | 'innate_spellcasting'
  | 'other'

export type SpeciesTraitEffect = {
  type: SpeciesTraitEffectType
  value?: string | number
  condition?: string
  damage_type?: string   // for resistance / breath weapon
  skill?: string         // for skill_proficiency / advantage_on
  range_ft?: number      // for darkvision / breath weapon
  note?: string
}

export type SpeciesTrait = {
  name: string
  description: string
  mechanical_effect?: SpeciesTraitEffect
}

export type SpeciesData = {
  name: string
  description: string
  flavor: string           // one evocative sentence for the UI
  traits: SpeciesTrait[]
  speed: number
  size: 'Small' | 'Medium'
  languages: string[]
  source: 'SRD_5_2' | 'LoneForge'
}

// ── Breath Weapon helper type ───────────────────────────────
// Dragonborn choose their draconic ancestry at creation.
export type DraconicAncestry = {
  dragon: string
  damage_type: string
  breath_shape: 'Line or Cone' | string
}

export const DRACONIC_ANCESTRIES: DraconicAncestry[] = [
  { dragon: 'Black',  damage_type: 'Acid',      breath_shape: 'Line or Cone' },
  { dragon: 'Blue',   damage_type: 'Lightning', breath_shape: 'Line or Cone' },
  { dragon: 'Brass',  damage_type: 'Fire',      breath_shape: 'Line or Cone' },
  { dragon: 'Bronze', damage_type: 'Lightning', breath_shape: 'Line or Cone' },
  { dragon: 'Copper', damage_type: 'Acid',      breath_shape: 'Line or Cone' },
  { dragon: 'Gold',   damage_type: 'Fire',      breath_shape: 'Line or Cone' },
  { dragon: 'Green',  damage_type: 'Poison',    breath_shape: 'Line or Cone' },
  { dragon: 'Red',    damage_type: 'Fire',      breath_shape: 'Line or Cone' },
  { dragon: 'Silver', damage_type: 'Cold',      breath_shape: 'Line or Cone' },
  { dragon: 'White',  damage_type: 'Cold',      breath_shape: 'Line or Cone' },
]

// ── Species Data ────────────────────────────────────────────
export const SPECIES_DATA: Record<string, SpeciesData> = {

  Human: {
    name: 'Human',
    source: 'SRD_5_2',
    description:
      'Versatile and ambitious, humans are found in every corner of the world. Their brief lives drive them to achieve greatness in ways other species rarely attempt.',
    flavor: 'Adaptable survivors who turn ambition into legacy.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'One additional language of your choice'],
    traits: [
      {
        name: 'Versatile',
        description:
          'You gain an Origin feat of your choice. Skilled is recommended.',
        mechanical_effect: {
          type: 'extra_skill_proficiency',
          value: 1,
          note: 'Choose an Origin feat at characyer creation.',
        },
      },
      {
        name: 'Skillful',
        description:
          'You gain proficiency in one Skill of your choice.',
        mechanical_effect: {
          type: 'extra_skill_proficiency',
          value: 1,
          note: 'Choose 1 additional skill proficiency at character creation.',
        },
      },
      {
        name: 'Resourceful',
        description:
          'You gain the Heroic Inspiration benefit whenever you finish a Long Rest.',
        mechanical_effect: {
          type: 'inspiration_on_long_rest',
          note: 'Gain Heroic Inspiration after every Long Rest. You can expend it to reroll any die roll immediately after seeing the result. You must use the new roll',
        },
      },
    ],
  },

  Elf: {
    name: 'Elf',
    source: 'SRD_5_2',
    description:
      'Graceful and long-lived, elves are attuned to the natural and arcane worlds. Their centuries of life grant them patience and perspective that shorter-lived species rarely develop.',
    flavor: 'Ancient observers whose grace hides ageless vigilance.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Elvish'],
    traits: [
      {
        name: 'Darkvision',
        description:
          'You have Darkvision with a range of 60 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 60,
        },
      },
      {
        name: 'Fey Ancestry',
        description:
          'You have Advantage on saving throws you make to avoid or end the Charmed condition.',
        mechanical_effect: {
          type: 'advantage_on',
          skill: 'saving throws',
          condition: 'against being Charmed',
        },
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
        mechanical_effect: {
          type: 'skill_proficiency',
          skill: 'Perception',
        },
      },
      {
        name: 'Trance',
        description:
          'You don\'t need to sleep, and magic can\'t put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.',
        mechanical_effect: {
          type: 'other',
          note: 'Long Rest in 4 hours. Immune to magical sleep.',
        },
      },
            {
      name: 'Elven Lineage',
      description:
        'You are part of an elven lineage that grants you supernatural abilities. Choose a lineage (Drow, High Elf, Wood Elf, Lorwyn Elf, Shadowmoor Elf). You gain its level 1 benefit, and at character levels 3 and 5 you gain additional spells. You always have these spells prepared. You can cast each lineage spell once per Long Rest without a spell slot, or using your own spell slots. Choose Intelligence, Wisdom, or Charisma as your spellcasting ability for these spells.',
      mechanical_effect: {
        type: 'innate_spellcasting',
        note:
          'Drow: L1 Darkvision 120 ft + Dancing Lights. L3 Faerie Fire. L5 Darkness. ' +
          'High Elf: L1 Prestidigitation (can swap after each Long Rest). L3 Detect Magic. L5 Misty Step. ' +
          'Wood Elf: L1 Speed becomes 35 ft + Druidcraft. L3 Longstrider. L5 Pass without Trace. ' +
          'Lorwyn Elf: L1 Thorn Whip (can swap after each Long Rest). L3 Command. L5 Silence. ' +
          'Shadowmoor Elf: L1 Darkvision 120 ft + Starry Wisp cantrip. L3 Heroism. L5 Gentle Repose.',
        },
      },
    ],
  },

  Dwarf: {
    name: 'Dwarf',
    source: 'SRD_5_2',
    description:
      'Stout and resilient, dwarves are masters of stone and metal. Forged by generations of underground living, they carry an endurance that outlasts most hardships.',
    flavor: 'Unyielding craftspeople carved from the bones of mountains.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Dwarvish'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 120 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 120,
        },
      },
      {
        name: 'Dwarven Resilience',
        description:
          'You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.',
        mechanical_effect: {
          type: 'resistance',
          damage_type: 'Poison',
          note: 'Also Advantage on saves against the Poisoned condition.',
        },
      },
      {
        name: 'Stonecunning',
        description:
          'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. The stone can be natural or worked. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
        mechanical_effect: {
          type: 'other',
          note: 'Bonus Action: Tremorsense 60 ft on stone surfaces. Uses = Proficiency Bonus per Long Rest.',
        },
      },
    ],
  },

  Halfling: {
    name: 'Halfling',
    source: 'SRD_5_2',
    description:
      'Small and nimble, halflings are known for their extraordinary luck and quiet bravery. They move through the world with an ease that belies how much attention they quietly pay to everything.',
    flavor: 'Cheerful wanderers whose luck runs deeper than anyone expects.',
    speed: 30,
    size: 'Small',
    languages: ['Common', 'Halfling'],
    traits: [
      {
        name: 'Brave',
        description:
          'You have Advantage on saving throws you make to avoid or end the Frightened condition.',
        mechanical_effect: {
          type: 'advantage_on',
          skill: 'saving throws',
          condition: 'against being Frightened',
        },
      },
      {
        name: 'Halfling Nimbleness',
        description:
          'You can move through the space of any creature that is a size larger than you, but you can\'t stop in the same space.',
        mechanical_effect: {
          type: 'unhindered_movement',
          note: 'Can move through spaces of Medium and larger creatures.',
        },
      },
      {
        name: 'Lucky',
        description:
          'When you roll a 1 on the d20 for a D20 Test, you can reroll the die and you must use the new roll.',
        mechanical_effect: {
          type: 'reroll_ones',
          note: 'Reroll 1s on all D20 Tests.',
        },
      },
      {
        name: 'Naturally Stealthy',
        description:
          'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.',
        mechanical_effect: {
          type: 'other',
          note: 'Hide behind creatures larger than you.',
        },
      },
    ],
  },

  Gnome: {
    name: 'Gnome',
    source: 'SRD_5_2',
    description:
      'Clever and curious, gnomes excel at invention and illusion. Their boundless enthusiasm for experimentation leads them into discoveries — and disasters — that other species never encounter.',
    flavor: 'Tinkering visionaries who treat every problem as a puzzle worth solving.',
    speed: 30,
    size: 'Small',
    languages: ['Common', 'Gnomish'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 60,
        },
      },
      {
        name: 'Gnomish Cunning',
        description:
          'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.',
        mechanical_effect: {
          type: 'advantage_on',
          skill: 'saving throws',
          condition: 'Intelligence, Wisdom, and Charisma saves',
        },
      },
      {
        name: 'Gnomish Lineage',
        description:
          'You are part of a gnomish sub-lineage that grants additional abilities. Forest Gnomes gain Minor Illusion cantrip and can communicate with Small and smaller beasts. Rock Gnomes gain Mending and Prestidigitation cantrips.',
        mechanical_effect: {
          type: 'innate_spellcasting',
          note:
            'Forest Gnome: Minor Illusion + speak with Small/smaller beasts. Rock Gnome: Mending + Prestidigitation.',
        },
      },
    ],
  },

  Dragonborn: {
    name: 'Dragonborn',
    source: 'SRD_5_2',
    description:
      'Proud and powerful, dragonborn carry the legacy of dragons in their blood. Their lineage grants them extraordinary resilience and a weapon that few enemies anticipate.',
    flavor: 'Dragon-blooded warriors whose heritage is written in scales and fire.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Draconic'],
    traits: [
      {
        name: 'Draconic Ancestry',
        description:
          'You trace your origin to a particular kind of dragon. Choose a dragon type, which determines your Breath Weapon damage type and the saving throw your breath weapon calls for.',
        mechanical_effect: {
          type: 'other',
          note:
            'Black: Acid. Blue: Lightning. Brass: Fire. Bronze: Lightning. Copper: Acid. ' +
            'Gold: Fire. Green: Poison. Red: Fire. Silver: Cold. White: Cold.',
        },
      },
      {
        name: 'Breath Weapon',
        description:
          'When you take the Attack action, you can replace one of your attacks with an exhalation of destructive energy as a Bonus Action. Each creature in the area must make a Dexterity or Constitution saving throw (DC = 8 + Con modifier + Proficiency Bonus). A creature takes 1d10 damage on a failed save, or half on a success. The damage type is determined by your Draconic Ancestry. You can use this a number of times equal to your Proficiency Bonus per Long Rest.',
        mechanical_effect: {
          type: 'breath_weapon',
          note:
            'Bonus Action when you Attack. Area = Ancestry shape. Damage: 1d10 of Ancestry type. Uses = Proficiency Bonus per Long Rest.',
        },
      },
      {
        name: 'Draconic Resistance',
        description: 'You have Resistance to the damage type determined by your Draconic Ancestry.',
        mechanical_effect: {
          type: 'elemental_resistance',
          note: 'Resistance to your Ancestry damage type.',
        },
      },
      {
        name: 'Draconic Flight',
        description: 'Starting at 5th level, you can manifest spectral draconic wings as a Bonus Action, gaining a Fly Speed equal to your Speed for 10 minutes. The wings match the energy of your Breath Weapon. Once you use this trait, you can’t use it again until you finish a Long Rest.',
        mechanical_effect: {
          type: 'fly_speed',
          note:
            'From level 5: Bonus Action to gain Fly Speed equal to Speed for 10 minutes. Wings match Breath Weapon energy. 1 use per Long Rest.',
        },
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 60,
        },
      },
    ],
  },

  Tiefling: {
    name: 'Tiefling',
    source: 'SRD_5_2',
    description:
      'Marked by a fiendish heritage, tieflings carry the legacy of the lower planes in their features and their blood. Their infernal lineage grants them resistance and cunning that surprises those who dismiss them.',
    flavor: 'Fiend-touched survivors who wield their cursed heritage as a weapon.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Infernal'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 60,
        },
      },
      {
        name: 'Fiendish Legacy',
        description:
          'You are the recipient of a legacy that grants you supernatural abilities. Choose a legacy — Abyssal, Chthonic, or Infernal — each granting different innate spells.',
        mechanical_effect: {
          type: 'innate_spellcasting',
          note:
            'Abyssal: Poison Spray, Ray of Sickness (1/LR), Hold Person (1/LR). Chthonic: Chill Touch, False Life (1/LR), Ray of Enfeeblement (1/LR). Infernal: Fire Bolt, Hellish Rebuke (1/LR), Darkness (1/LR).',
        },
      },
      {
        name: 'Otherworldly Presence',
        description: 'You know the Thaumaturgy cantrip. Charisma is your spellcasting ability for it.',
        mechanical_effect: {
          type: 'innate_spellcasting',
          note: 'Know Thaumaturgy cantrip. Spellcasting ability: Charisma.',
        },
      },
    ],
  },

  Aasimar: {
    name: 'Aasimar',
    source: 'SRD_5_2',
    description:
      'Aasimars are mortals touched by celestial power, carrying a spark of radiant grace within them. Their presence often feels calm, luminous, or quietly intense, and many discover innate gifts that manifest in moments of need.',
    flavor: 'Bearers of celestial light who walk the world as subtle beacons of hope or judgment.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Celestial'],
    traits: [
      {
        name: 'Celestial Resistance',
        description: 'You have resistance to Radiant damage.',
        mechanical_effect: { type: 'resistance', damage_type: 'Radiant' },
      },
      {
        name: 'Healing Hands',
        description:
          'As an Action, you can touch a creature and restore Hit Points equal to your Proficiency Bonus. Uses = Proficiency Bonus per Long Rest.',
        mechanical_effect: {
          type: 'other',
          note: 'Action: heal PB HP. Uses = Proficiency Bonus per Long Rest.',
        },
      },
      {
        name: 'Light Bearer',
        description: 'You know the Light cantrip. Charisma is your spellcasting ability for it.',
        mechanical_effect: { type: 'innate_spellcasting', note: 'Know Light cantrip. Spellcasting ability: Charisma.' },
      },
      {
        name: 'Celestial Revelation',
        description:
          'Starting at 3rd level, you can unleash your celestial nature as a Bonus Action for 1 minute. Choose a Revelation (e.g., Radiant Soul, Radiant Shield, Radiant Consumption). Uses = 1 per Long Rest.',
        mechanical_effect: {
          type: 'other',
          note: 'Ethereal Flight: Spectral wings manifest from your shoulders, granting you a flying speed equal to your movement for the transformation\'s duration. Solar Flare: Luminous energy pours from your eyes and mouth, illuminating a 20-foot area. At each turn\'s end, the searing heat deals radiant damage (equal to your Proficiency) to all nearby enemies. Abyssal Presence: As your eyes turn pitch black and skeletal wings emerge, a wave of dread washes over your foes. Nearby enemies must resist a Charisma-based DC or become paralyzed by fear until your next turn.',
        },
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
        mechanical_effect: { type: 'darkvision', range_ft: 60 },
      },
    ],
  },

  Orc: {
    name: 'Orc',
    source: 'SRD_5_2',
    description:
      'Strong and enduring, orcs are formidable warriors shaped by generations of conflict and survival. Their physical power is matched by an instinct for finding advantages that others miss.',
    flavor: 'Tireless fighters who treat exhaustion as a challenge to overcome.',
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Orc'],
    traits: [
      {
        name: 'Adrenaline Rush',
        description:
          'You can take the Dash action as a Bonus Action. When you do, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Short or Long Rest.',
        mechanical_effect: {
          type: 'temp_hp_on_dash',
          note:
            'Bonus Action Dash + gain Temp HP = Proficiency Bonus. Uses = Proficiency Bonus per Short or Long Rest.',
        },
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 120 feet.',
        mechanical_effect: {
          type: 'darkvision',
          range_ft: 120,
        },
      },
      {
        name: 'Relentless Endurance',
        description:
          'When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
        mechanical_effect: {
          type: 'once_per_rest_survive',
          note: 'Once per Long Rest: drop to 1 HP instead of 0.',
        },
      },
    ],
  },

  Goliath: {
    name: 'Goliath',
    source: 'SRD_5_2',
    description:
      'Massive and powerful, goliaths are born of the high mountains and shaped by their unforgiving demands. They carry a natural authority in their size and an instinctive drive toward self-reliance.',
    flavor: 'Mountain-born giants who measure themselves against the harshest peaks.',
    speed: 35,
    size: 'Medium',
    languages: ['Common', 'Giant'],
    traits: [
      {
        name: 'Giant Ancestry',
        description:
          'You are descended from giants. Choose a giant ancestry which determines your supernatural ability: Cloud (Misty Step 1/LR), Fire (Fiery Smash 1/LR), Frost (Frost\'s Chill 1/LR), Hill (Hill\'s Tumble 1/LR), Stone (Stone\'s Endurance 1/LR), Storm (Storm\'s Thunder 1/LR).',
        mechanical_effect: {
          type: 'other',
          note:
            'Cloud\'s Jaunt (Cloud Giant): As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see. Fire\'s Burn (Fire Giant): When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target. Frost\'s Chill (Frost Giant): When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn. Hill\'s Tumble (Hill Giant): When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition. Stone\'s Endurance (Stone Giant): When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled and reduce the damage by that total. Storm\'s Thunder (Storm Giant): When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature.',
        },
      },
      {
        name: 'Large Form',
        description:
          'Starting at 5th level, you can change your size to Large as a Bonus Action if you\'re in a big enough space. This transformation lasts for 10 minutes or until you end it (no action required). While Large, your Speed increases by 10 feet and you have Advantage on Strength checks and saves.',
        mechanical_effect: {
          type: 'other',
          note: 'From level 5: Bonus Action to become Large for 10 min. +10 Speed, Advantage on Strength checks/saves.',
        },
      },
      {
        name: 'Powerful Build',
        description:
          'You have Advantage on any saving throw you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.',
        mechanical_effect: {
          type: 'carrying_capacity',
          note: 'Count as one size larger for carrying. Advantage on saves to end Grappled.',
        },
      },
    ],
  },
}

// ── Helpers ─────────────────────────────────────────────────
export const SPECIES_NAMES = Object.keys(SPECIES_DATA) as (keyof typeof SPECIES_DATA)[]

export function getSpeciesData(name: string): SpeciesData | undefined {
  return SPECIES_DATA[name]
}

export function getSpeciesTrait(
  speciesName: string,
  traitName: string,
): SpeciesTrait | undefined {
  return SPECIES_DATA[speciesName]?.traits.find(t => t.name === traitName)
}
