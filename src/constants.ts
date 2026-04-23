/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Item, Character, CharacterClass, Attribute, Skill, Ability, Enemy, Species, Background, SettlementType, DistrictDisturbance, GameState } from './types';

export const SPECIES_TEMPLATES: Record<Species, { description: string, traits: string[], speed: number }> = {
  'Human': {
    description: 'Versatile and ambitious, humans are found in every corner of the world.',
    traits: ['Resourceful: You gain an extra Skill Proficiency.', 'Versatile: You gain a Heroic Inspiration after a Long Rest.'],
    speed: 30
  },
  'Elf': {
    description: 'Graceful and long-lived, elves are attuned to the natural and arcane worlds.',
    traits: ['Darkvision: You can see in darkness as if it were dim light up to 60 feet.', 'Fey Ancestry: Advantage on saves against being Charmed.', 'Keen Senses: Proficiency in Perception.'],
    speed: 30
  },
  'Dwarf': {
    description: 'Stout and resilient, dwarves are masters of stone and metal.',
    traits: ['Darkvision: You can see in darkness as if it were dim light up to 60 feet.', 'Dwarven Resilience: Resistance to Poison damage.', 'Stonecunning: Advantage on History checks related to stone.'],
    speed: 30
  },
  'Halfling': {
    description: 'Small and nimble, halflings are known for their luck and bravery.',
    traits: ['Lucky: Reroll a 1 on an attack, check, or save.', 'Brave: Advantage on saves against being Frightened.', 'Nimble: You can move through larger creatures spaces.'],
    speed: 25
  },
  'Gnome': {
    description: 'Clever and curious, gnomes excel at invention and illusion.',
    traits: ['Darkvision: You can see in darkness as if it were dim light up to 60 feet.', 'Gnome Cunning: Advantage on Int, Wis, and Cha saves against magic.'],
    speed: 25
  },
  'Dragonborn': {
    description: 'Proud and powerful, dragonborn carry the legacy of dragons.',
    traits: ['Breath Weapon: Exhale destructive energy.', 'Draconic Resistance: Resistance to your breath element.'],
    speed: 30
  },
  'Tiefling': {
    description: 'Marked by a fiendish heritage, tieflings are often misunderstood.',
    traits: ['Darkvision: You can see in darkness as if it were dim light up to 60 feet.', 'Otherworldly Gaze: Proficiency in Insight.'],
    speed: 30
  },
  'Orc': {
    description: 'Strong and enduring, orcs are formidable warriors.',
    traits: ['Adrenaline Rush: Dash as a bonus action and gain temporary HP.', 'Relentless Endurance: Drop to 1 HP instead of 0 once per long rest.'],
    speed: 30
  },
  'Goliath': {
    description: 'Massive and powerful, goliaths are born of the high mountains.',
    traits: ['Powerful Build: You count as one size larger for carrying.', 'Stone\'s Endurance: Reduce damage taken as a reaction.'],
    speed: 35
  }
};

export const BACKGROUND_TEMPLATES: Record<Background, { description: string, stats: Partial<Record<Attribute, number>>, proficiencies: Skill[] }> = {
  'Acolyte': {
    description: 'You have spent your life in service to a temple.',
    stats: { 'Wisdom': 2, 'Intelligence': 1 },
    proficiencies: ['Insight', 'Religion']
  },
  'Criminal': {
    description: 'You have a history of breaking the law.',
    stats: { 'Dexterity': 2, 'Constitution': 1 },
    proficiencies: ['Sleight of Hand', 'Stealth']
  },
  'Entertainer': {
    description: 'You thrive in the spotlight.',
    stats: { 'Charisma': 2, 'Dexterity': 1 },
    proficiencies: ['Acrobatics', 'Performance']
  },
  'Farmer': {
    description: 'You have worked the land for years.',
    stats: { 'Constitution': 2, 'Strength': 1 },
    proficiencies: ['Animal Handling', 'Nature']
  },
  'Guard': {
    description: 'You have protected the peace in a settlement.',
    stats: { 'Strength': 2, 'Wisdom': 1 },
    proficiencies: ['Athletics', 'Perception']
  },
  'Guide': {
    description: 'You have led travelers through the wilderness.',
    stats: { 'Wisdom': 2, 'Dexterity': 1 },
    proficiencies: ['Stealth', 'Survival']
  },
  'Hermit': {
    description: 'You have lived a life of seclusion.',
    stats: { 'Wisdom': 2, 'Constitution': 1 },
    proficiencies: ['Medicine', 'Religion']
  },
  'Merchant': {
    description: 'You have traded goods across the land.',
    stats: { 'Charisma': 2, 'Intelligence': 1 },
    proficiencies: ['Animal Handling', 'Persuasion']
  },
  'Noble': {
    description: 'You were born into a life of privilege.',
    stats: { 'Charisma': 2, 'Intelligence': 1 },
    proficiencies: ['History', 'Persuasion']
  },
  'Sage': {
    description: 'You have spent your life in study.',
    stats: { 'Intelligence': 2, 'Wisdom': 1 },
    proficiencies: ['Arcana', 'History']
  },
  'Sailor': {
    description: 'You have sailed the high seas.',
    stats: { 'Dexterity': 2, 'Strength': 1 },
    proficiencies: ['Athletics', 'Perception']
  },
  'Soldier': {
    description: 'You have served in an army.',
    stats: { 'Strength': 2, 'Constitution': 1 },
    proficiencies: ['Athletics', 'Intimidation']
  },
  'Wayfarer': {
    description: 'You have wandered the world.',
    stats: { 'Dexterity': 2, 'Wisdom': 1 },
    proficiencies: ['Investigation', 'Stealth']
  }
};

export const SKILL_ATTRIBUTES: Record<Skill, Attribute> = {
  'Athletics': 'Strength',
  'Acrobatics': 'Dexterity',
  'Sleight of Hand': 'Dexterity',
  'Stealth': 'Dexterity',
  'Arcana': 'Intelligence',
  'History': 'Intelligence',
  'Investigation': 'Intelligence',
  'Nature': 'Intelligence',
  'Religion': 'Intelligence',
  'Animal Handling': 'Wisdom',
  'Insight': 'Wisdom',
  'Medicine': 'Wisdom',
  'Perception': 'Wisdom',
  'Survival': 'Wisdom',
  'Deception': 'Charisma',
  'Intimidation': 'Charisma',
  'Performance': 'Charisma',
  'Persuasion': 'Charisma'
};

export const INITIAL_CHARACTER: Character = {
  name: 'Adventurer',
  class: 'Fighter',
  species: 'Human',
  background: 'Soldier',
  level: 1,
  hp: 12,
  maxHp: 12,
  baseAc: 10,
  stats: {
    'Strength': 12,
    'Dexterity': 10,
    'Constitution': 11,
    'Intelligence': 10,
    'Wisdom': 10,
    'Charisma': 10
  },
  proficiencies: ['Athletics', 'Intimidation'],
  savingThrowProficiencies: ['Strength', 'Constitution'],
  speed: 30,
  hitDie: 'd10',
  inventory: [],
  abilities: [],
  xp: 0,
  gold: 10,
  cp: 0,
  sp: 0,
  ep: 0,
  pp: 0,
  notes: '',
  knownSpells: [],
  subclass: undefined,
  companions: [],
  treasure: []
};

export const INITIAL_GAME_STATE: GameState = {
  character: INITIAL_CHARACTER,
  logs: [],
  context: 'Narrative',
  currentRoom: null,
  currentSettlement: null,
  travel: null,
  activeDowntime: null,
  isCombatActive: false,
  combatTurn: 1,
  initiativeOrder: [],
  activeCombatantIndex: 0,
  adventureHook: null,
  isGameOver: false,
  isCreatingCharacter: true,
  isSelectingDungeon: false,
  isSelectingTravel: false,
  isSelectingUrbanEvent: false,
  isBrowsingSpells: false,
  isCamping: false,
  isDayActive: true,
  lastTravelLog: null,
  roomsExplored: 0,
  dungeonConfig: null,
  hasUsedAction: false,
  hasUsedBonusAction: false,
  notifications: [],
  isEditingCombat: false,
  npcHistory: [],
  pendingSubclassSelection: null,
  discoveredCompendiumQuests: {},
  lastLootResult: null
};

export const ADVENTURE_QUESTS = [
  { problem: "An ally has been wronged", result: "Avenge / make amends" },
  { problem: "An important item was stolen", result: "Retrieve / recover" },
  { problem: "A mysterious figure has disappeared", result: "Investigate / track down" },
  { problem: "A creature threatens a location", result: "Neutralize / drive away" },
  { problem: "Unnatural environmental phenomena", result: "Discover the cause / resolve" },
  { problem: "Unstable or corrupted magic", result: "Seal / purify" },
  { problem: "Someone has been captured", result: "Free / protect" },
  { problem: "An explorer never returned", result: "Search / rescue" },
  { problem: "Rumors of an unknown place", result: "Explore / map" },
  { problem: "Hidden treasure in a guarded site", result: "Infiltrate / plunder" },
  { problem: "Hostile forces are advancing", result: "Defend / divert" },
  { problem: "Someone is hiding a secret", result: "Spy / uncover" },
  { problem: "An item or message must be delivered", result: "Transport / escort" },
  { problem: "A dangerous cargo is in transit", result: "Intercept / destroy" },
  { problem: "An artifact has become accessible", result: "Recover / secure" },
  { problem: "A leader is corrupt", result: "Expose / incriminate" },
  { problem: "Resources are scarce", result: "Acquire / trade" },
  { problem: "An unresolved mystery troubles the community", result: "Research / decipher" },
  { problem: "The PC is in grave danger", result: "Survive / escape" },
  { problem: "A worthy creature is threatened", result: "Protect / eliminate threat" },
  { problem: "An innocent is at risk", result: "Save / prevent" },
  { problem: "A location is under siege", result: "Break the siege" },
  { problem: "War is about to erupt", result: "Mediate / prepare / fight" },
  { problem: "A sacred place promises power", result: "Visit / obtain boon" },
  { problem: "Someone caused trouble by accident", result: "Fix / cover up / repair" }
];

export const ADVENTURE_HOOKS = [
  "A dying messenger collapses at your feet, clutching a blood-stained letter.",
  "You find a map tattooed on the back of a captured outlaw.",
  "A local merchant offers a fortune for the safe return of their kidnapped child.",
  "The town's well has turned to blood, and the elders are terrified.",
  "A mysterious benefactor invites you to a private dinner to discuss a 'lucrative opportunity'.",
  "You discover an ancient coin that whispers secrets in a forgotten language.",
  "A massive shadow passed over the village, and now all the livestock are missing.",
  "A childhood friend sends a desperate plea for help from a distant frontier town.",
  "You wake up with a strange mark on your arm and no memory of the last three days.",
  "The king's crown was stolen during the royal ball, and you're the prime suspect.",
  "A spectral figure appears in your room at night, pointing towards the northern mountains.",
  "The local temple's sacred relic has begun to weep black ichor.",
  "A group of refugees arrives at the gates, claiming their homeland was swallowed by the earth.",
  "You find a clockwork bird that plays a melody only you can hear.",
  "A bounty hunter mistakes you for a high-value target, then realizes their error and offers a partnership."
];

export const DUNGEON_THEMES: Record<string, { roomTypes: string[], features: string[], enemies: string[] }> = {
  'Cave': {
    roomTypes: [
      'Natural Cave',
      'Damp Tunnel',
      'Crystal Chamber',
      'Underground Spring',
      'Echoing Cavern',
      'Collapsed Passage',
      'Mushroom Grove',
      'Subterranean Cliff'
    ],
    features: [
      'Sharp Stalactites',
      'Luminescent Fungus',
      'Icy Water Pool',
      'Animal Bones',
      'Dripping Water',
      'Strange Mineral Veins',
      'Thick Mud Patches',
      'Cold Air Draft'
    ],
    enemies: []
  },

  'Prison': {
    roomTypes: [
      'Stone Cell',
      'Torture Chamber',
      'Guarded Corridor',
      'Guard Office',
      'Interrogation Room',
      'Abandoned Cell Block',
      'Execution Platform',
      'Confiscated Goods Storage'
    ],
    features: [
      'Rusty Chains',
      'Iron Grate',
      'Dirty Straw',
      'Desperate Writings on the Walls',
      'Broken Shackles',
      'Dried Blood Stains',
      'Rotting Wooden Doors',
      'Scattered Keys'
    ],
    enemies: []
  },

  'Laboratory': {
    roomTypes: [
      'Alchemical Hall',
      'Reagent Warehouse',
      'Incubation Chamber',
      'Arcane Library',
      'Experimentation Slab',
      'Potion Distillery',
      'Specimen Vault',
      'Forbidden Research Wing'
    ],
    features: [
      'Smoking Alembics',
      'Pulsing Magic Circle',
      'Glass Jars with Creatures',
      'Forbidden Books',
      'Scattered Notes',
      'Cracked Crystal Containers',
      'Arcane Residue on the Floor',
      'Strange Mechanical Devices'
    ],
    enemies: []
  },

  'Ruin': {
    roomTypes: [
      'Fallen Throne Room',
      'Overgrown Courtyard',
      'Faded Portrait Gallery',
      'Collapsed Tower',
      'Dusty Banquet Hall',
      'Shattered Armory',
      'Crumbling Stairwell',
      'Forgotten Shrine'
    ],
    features: [
      'Broken Statue',
      'Rotten Tapestry',
      'Bulky Rubble',
      'Climbing Ivy',
      'Faded Heraldry',
      'Crumbling Pillars',
      'Ancient Graffiti',
      'Wind Whistling Through Cracks'
    ],
    enemies: []
  },

  'Cemetery': {
    roomTypes: [
      'Family Crypt',
      'Common Ossuary',
      'Royal Mausoleum',
      'Path Between Graves',
      'Sunken Grave Pit',
      'Forgotten Catacomb',
      'Bone Vault',
      'Chapel of Mourning'
    ],
    features: [
      'Loose Tombstone',
      'Cinerary Urn',
      'Creeping Mist',
      'Wrought Iron Gate',
      'Faded Epitaphs',
      'Cold Marble Slabs',
      'Wilted Funeral Flowers',
      'Hollow Echoes'
    ],
    enemies: []
  },

  'Lair': {
    roomTypes: [
      'Central Den',
      'Feeding Pit',
      'Treasure Nest',
      'Guarded Tunnel',
      'Scratched Stone Chamber',
      'Beast Sleeping Hollow',
      'Territorial Marking Grounds',
      'Fresh Kill Pile'
    ],
    features: [
      'Claw Marks on Walls',
      'Pungent Animal Musk',
      'Scattered Bones',
      'Deep Growls Echoing',
      'Fresh Tracks in the Dirt',
      'Warm Air Pockets',
      'Shed Scales or Fur',
      'Half-Eaten Carcasses'
    ],
    enemies: []
  },

  'Tomb / Crypt': {
    roomTypes: [
      'Burial Chamber',
      'Sarcophagus Hall',
      'Ancestor Shrine',
      'Sealed Vault',
      'Funerary Passage',
      'Guardian Statue Room',
      'Dusty Reliquary',
      'Collapsed Catacomb'
    ],
    features: [
      'Ancient Coffins',
      'Sacred Runes',
      'Cold Stale Air',
      'Funeral Urns',
      'Crumbling Stone Reliefs',
      'Lingering Incense Smell',
      'Spiderweb-Covered Corners',
      'Faint Whispering Echoes'
    ],
    enemies: []
  },

  'Temple or Shrine': {
    roomTypes: [
      'Sanctum of Worship',
      'Prayer Hall',
      'Relic Chamber',
      'Meditation Garden',
      'Ritual Platform',
      'Sacred Library',
      'Abbot’s Quarters',
      'Purification Pool'
    ],
    features: [
      'Flickering Candles',
      'Holy Symbols',
      'Incense Smoke Trails',
      'Ancient Scriptures',
      'Chant Echoes',
      'Broken Idols',
      'Blessed Water Basins',
      'Mosaic Floor Patterns'
    ],
    enemies: []
  },

  'Maze': {
    roomTypes: [
      'Twisting Corridor',
      'Dead-End Chamber',
      'Rotating Wall Section',
      'Mirror Hall',
      'Trap-Filled Passage',
      'Illusionary Fork',
      'Looping Path',
      'Central Puzzle Node'
    ],
    features: [
      'Scratched Direction Marks',
      'Repeating Symbols',
      'Shifting Walls',
      'Echoes from Unknown Sources',
      'Faint Footsteps',
      'Illusory Obstacles',
      'Cold Drafts from Nowhere',
      'Strange Geometric Patterns'
    ],
    enemies: []
  },

  'Mine': {
    roomTypes: [
      'Support Beam Tunnel',
      'Ore Extraction Chamber',
      'Collapsed Shaft',
      'Minecart Trackway',
      'Foreman’s Office',
      'Abandoned Dig Site',
      'Underground Lake',
      'Ventilation Shaft'
    ],
    features: [
      'Loose Rocks',
      'Broken Pickaxes',
      'Glittering Ore Veins',
      'Dust Clouds',
      'Rusted Minecarts',
      'Dripping Ceiling Water',
      'Old Lantern Hooks',
      'Echoing Hammer Sounds'
    ],
    enemies: []
  },

  'Guild / Cult Headquarters': {
    roomTypes: [
      'Initiate Hall',
      'Secret Meeting Chamber',
      'Leader’s Quarters',
      'Training Dojo',
      'Hidden Treasury',
      'Forbidden Ritual Room',
      'Armory of the Order',
      'Symbolic Shrine'
    ],
    features: [
      'Inscribed Symbols',
      'Robes on Hooks',
      'Whispered Chants',
      'Secret Compartments',
      'Training Dummies',
      'Locked Ledgers',
      'Strange Ritual Tools',
      'Burning Incense Bowls'
    ],
    enemies: []
  }
};


export const NARRATIVE_BLOCKS = {
  roomIntro: [
    "You cross the threshold of {type}.",
    "You find yourself inside {type}.",
    "Your footsteps echo in {type}.",
    "The darkness thins revealing {type}."
  ],
  features: [
    "In the center of the room, {feature} catches your eye.",
    "You immediately notice {feature} in a corner.",
    "The most unsettling element is definitely {feature}.",
    "Your senses are drawn to {feature}."
  ],
  dangers: [
    "You feel a shiver down your spine: {danger}!",
    "Be careful, you perceive the presence of {danger}.",
    "The danger is palpable: {danger} seems ready to strike.",
    "You cannot ignore the threat of {danger}."
  ],
  enemies: [
    "From the shadows emerge {count} enemies ready to attack!",
    "You are surprised by {count} hostile creatures.",
    "The silence is broken by the growl of {count} adversaries.",
    "You are not alone: {count} enemies block the path."
  ],
  loot: [
    "Among the debris you spot something shiny: {item}.",
    "A stroke of luck! You find {item}.",
    "It seems someone left behind {item}.",
    "Under a layer of dust you recover {item}."
  ],
  empty: [
    "The room seems strangely silent.",
    "For now, an apparent calm reigns.",
    "You see no immediate threats, but you stay on guard.",
    "The air is still and heavy."
  ]
};

export const SETTLEMENT_TYPES = ['Encampment', 'Hamlet', 'Village', 'Town', 'City', 'Metropolis'] as const;

export const CR_VALUES = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

export const SETTLEMENT_CONFIG: Record<SettlementType, { 
  minPop: number, 
  maxPop: number, 
  minDistricts: number, 
  maxDistricts: number,
  minLocationsPerDistrict: number,
  maxLocationsPerDistrict: number
}> = {
  'Encampment': { minPop: 1, maxPop: 200, minDistricts: 1, maxDistricts: 1, minLocationsPerDistrict: 1, maxLocationsPerDistrict: 2 },
  'Hamlet': { minPop: 200, maxPop: 500, minDistricts: 1, maxDistricts: 2, minLocationsPerDistrict: 2, maxLocationsPerDistrict: 3 },
  'Village': { minPop: 500, maxPop: 1500, minDistricts: 2, maxDistricts: 3, minLocationsPerDistrict: 2, maxLocationsPerDistrict: 3 },
  'Town': { minPop: 1500, maxPop: 6000, minDistricts: 3, maxDistricts: 5, minLocationsPerDistrict: 3, maxLocationsPerDistrict: 5 },
  'City': { minPop: 6000, maxPop: 25000, minDistricts: 9, maxDistricts: 9, minLocationsPerDistrict: 1, maxLocationsPerDistrict: 3 },
  'Metropolis': { minPop: 25000, maxPop: 100000, minDistricts: 9, maxDistricts: 9, minLocationsPerDistrict: 2, maxLocationsPerDistrict: 5 }
};

export const DISTRICT_TYPES = [
  'Artists', 
  'Arcane', 
  'Trade', 
  'Religious', 
  'Entertainment', 
  'Government', 
  'Military', 
  'Services', 
  'Residential'
] as const;

export const DISTRICT_LOCATIONS: Record<string, string[]> = {
  'Artists': [
    'Painters\' Atelier',
    'Music School',
    'Theater',
    'Music Shop',
    'Art Gallery',
    'Runic Tattoo Shop',
    'Performance Plaza'
  ],
  'Arcane': [
    'Wizard\'s Tower',
    'Arcane Academy',
    'Arcane Supplies',
    'Alchemical Shop',
    'Scroll Vendor',
    'Magic Items Vendor'
  ],
  'Trade': [
    'Central Market',
    'Adventurer\'s Shop',
    'Bank or Exchange House',
    'General Emporium',
    'Animal Market',
    'Auction House'
  ],
  'Religious': [
    'Great Temple',
    'Minor Chapel',
    'Sacred Garden',
    'Mausoleum',
    'Hospital',
  ],
  'Entertainment': [
    'Taverns and Inns',
    'Gambling House',
    'Clandestine Arena',
    'Brothel',
    'Smuggling Alleys',
    'Thieves\' Guild Hideout'
  ],
  'Government': [
    'Governor\'s Palace',
    'Council Hall',
    'City Archive',
    'City Guard Barracks',
    'Courthouse',
    'Embassies'
  ],
  'Military': [
    'Barracks',
    'Armory',
    'Training Ground',
    'Watchtower',
    'Military Stable',
    'Supply Warehouse'
  ],
  'Services': [
    'Blacksmith\'s Forge',
    'Carpenter\'s Workshop',
    'Tannery',
    'Mill',
    'Glassblower\'s Workshop',
    'Potter\'s Workshop',
    'Warehouses'
  ],
  'Residential': [
    'Tenement Houses',
    'Noble Houses',
    'Park or Garden',
    'Public Well',
    'School',
    'Small Family Shops'
  ],
  'General': [
    'Town Square',
    'Public Well',
    'General Store',
    'Local Inn',
    'Small Shrine'
  ]
};

export const LOCATION_NAME_TEMPLATES: Record<string, string[]> = {
  "Painters' Atelier": ["Atelier of a Thousand Colors", "The Golden Brush", "Whispering Canvases Studio", "Studio of the Shadowmaster"],
  "Music School": ["Ancient Harmony Conservatory", "Silver Strings Academy", "School of the Wind Singers", "Hall of Wandering Notes"],
  "Theater": ["Red Moon Theater", "Masquerade Stage", "Whispering Hall", "Paper Dragon Theater"],
  "Music Shop": ["Wood & String Luthiery", "Lost Notes Shop", "Wandering Bard Instruments", "Old Master’s Sounds"],
  "Art Gallery": ["Gallery of Visions", "Hall of Living Portraits", "Sunset Collection", "Painted Dreams Gallery"],
  "Runic Tattoo Shop": ["Thalor’s Runic Inks", "Skin & Runes", "Shadow Sigils", "Marks of the Ancients"],
  "Performance Plaza": ["Artists’ Square", "Dancers’ Plaza", "Voices’ Rotunda", "Free Arts Court"],
  "Wizard's Tower": ["Tower of the Arcane Eye", "Pinnacle of Stars", "Runekeeper’s Spire", "Ethereal Beacon"],
  "Arcane Academy": ["Academy of the Azure Mages", "College of Occult Arts", "School of the Arcane Ring", "Academy of the Three Tomes"],
  "Arcane Supplies": ["Essence Emporium", "Arcane Crystal Shop", "Wandering Mage Supplies", "Arcana & Alembics"],
  "Alchemical Shop": ["Basilisk’s Alembic", "Green Smoke Laboratory", "Rare Essences Distillery", "Vials & Secrets"],
  "Scroll Vendor": ["Sage’s Scrolls", "Wanderer’s Library", "Golden Eye Manuscripts", "Enchanter’s Scrolls"],
  "Magic Items Vendor": ["Arcanist’s Wonders", "Mana Relics", "Mystical Emporium Treasures", "Portalbound Artifacts"],
  "Central Market": ["Market of a Thousand Stalls", "Barter Square", "High Sun Market", "Peoples’ Bazaar"],
  "Adventurer's Shop": ["Pack & Blade", "Wanderer’s Emporium", "Pathway Provisions", "Adventurer’s Outfitter"],
  "Bank or Exchange House": ["Three Keys Exchange", "Golden Lion Bank", "Merchants’ Vault", "Harbor Credit House"],
  "General Emporium": ["Crossroads Emporium", "Necessities Shop", "Traveler’s Warehouse", "Thousand Things Store"],
  "Animal Market": ["Beast Fair", "Hoof Market", "Traders’ Pens", "Creature Yard"],
  "Auction House": ["Red Hammer Auction Hall", "Silver Dragon Auctions", "Hall of Precious Goods", "Shadow Merchant Auctions"],
  "Great Temple": ["Temple of the Eternal Flame", "Basilica of the Keeper", "Sanctuary of the Thousand Gods", "Temple of the High Light"],
  "Minor Chapel": ["Pilgrim’s Chapel", "Oak Oratory", "Whispered Prayers Chapel", "Dawn Altar"],
  "Sacred Garden": ["Garden of Peace", "Whispering Grove", "Blessed Clearing", "Garden of Souls"],
  "Mausoleum": ["Noble Crypt", "White Stone Mausoleum", "Guardians’ Rest", "Sepulcher of Silence"],
  "Hospital": ["House of Healing", "Gentle Hand Hospital", "Healers’ Hall", "Refuge of Hope"],
  "Taverns and Inns": ["Laughing Boar Tavern", "Full Moon Inn", "Broken Tankard Tavern", "Weary Wanderer Inn"],
  "Gambling House": ["Dice of Fate", "Coin Hall", "Serpent’s Luck", "House of Risk"],
  "Clandestine Arena": ["Blood Pit", "Shadow Arena", "Circle of Fighters", "Minotaur’s Pit"],
  "Brothel": ["Velvet Shadows House", "Black Roses Salon", "Whispering Refuge", "Crimson Veil House"],
  "Smuggling Alleys": ["Smugglers’ Lanes", "Shadow Passages", "Outlaw Paths", "Black Market Backstreets"],
  "Thieves' Guild Hideout": ["Dagger’s Den", "Whisperers’ Refuge", "Thieves’ Nest", "Light Hand Hideout"],
  "Governor's Palace": ["Palace of the Sun", "Governor’s Residence", "Three Towers Palace", "House of the Seal"],
  "Council Hall": ["Hall of the Wise Council", "Chamber of Voices", "Palace of Decisions", "Representatives’ Hall"],
  "City Archive": ["Chronicle Archives", "Library of the Ages", "Ancient Records Vault", "Hall of Memories"],
  "City Guard Barracks": ["City Guard Barracks", "Vigilant Keep", "Blue Blades Headquarters", "Bastion Barracks"],
  "Courthouse": ["Court of the Scales", "High Justice Hall", "Hammer Court", "Judgment Palace"],
  "Embassies": ["Embassies of the Realms", "Diplomatic Pavilions", "Houses of the Peoples", "Envoys’ Residences"],
  "Barracks": ["Iron Barracks", "Soldiers’ Quarters", "Spearhold", "Dragon Barracks"],
  "Armory": ["Hammer Armory", "Weapons Vault", "Knight’s Armory", "Blade Depot"],
  "Training Ground": ["Wolf Training Field", "Recruits’ Arena", "Trial Grounds", "Discipline Yard"],
  "Watchtower": ["Guard Tower", "Wind Watch", "Vigilant Eye Tower", "Sentinels’ Beacon"],
  "Military Stable": ["Warhorse Stables", "Destrier Stables", "Command Stables", "Swiftwind Stables"],
  "Supply Warehouse": ["Reserve Warehouse", "Supply Depot", "Logistics Arsenal", "Command Storehouse"],
  "Blacksmith's Forge": ["Red Hammer Forge", "Master’s Anvil", "Living Fire Forge", "Hammer & Spark"],
  "Carpenter's Workshop": ["Wood & Craft", "Carpenter’s Shop", "Plankworks", "Beam Workshop"],
  "Tannery": ["Sun Tannery", "Hides & Craft", "River Tannery", "Three Blades Tannery"],
  "Mill": ["River Mill", "Grain Wheel", "Valley Mill", "Village Grinder"],
  "Glassblower's Workshop": ["Glass Breath", "Lens Workshop", "Sunlit Glassworks", "Flame & Glass"],
  "Potter's Workshop": ["Potter’s Shop", "Clay & Hands", "Ceramics Kiln", "Earthworks Studio"],
  "Warehouses": ["Harbor Warehouses", "Merchant Depots", "Crossroads Storage", "Goods Warehouses"],
  "Tenement Houses": ["Thousand Tenements", "Alley Quarter", "People’s Homes", "Hill Residences"],
  "Noble Houses": ["Estates of the Ancient Houses", "Noble Residences", "High Families’ Palace", "Wind Manors"],
  "Park or Garden": ["Oak Park", "Brook Garden", "Cherry Park", "Resting Garden"],
  "Public Well": ["Market Well", "Town Fountain", "Whispering Well", "Morning Fountain", "Traveler’s Well", "Square Fountain", "Droplets Well", "Morning Spring"],
  "School": ["Village School", "Youth Academy", "First Letters Hall", "Hill School"],
  "Small Family Shops": ["Rossi Family Shop", "Three Brothers’ Store", "Alley Shop", "Grandma’s Store"],
  "Town Square": ["Market Square", "Bell Square", "People’s Plaza", "Old Tree Square"],
  "General Store": ["Village Emporium", "Necessities Shop", "Crossroads Store", "Old Bridge Emporium"],
  "Local Inn": ["Golden Rooster Inn", "Pathway Inn", "Harbor Tavern", "Oak Inn"],
  "Small Shrine": ["Traveler’s Shrine", "Dawn Altar", "Little Spirit Shrine", "Shrine of Hope"]
};

export const DISTRICT_DISTURBANCES: Record<string, DistrictDisturbance[]> = {
  'Artists': [
    { disturbance: 'An artist has created a "too realistic" work that has come to life.', outcome: 'The creature wanders the neighborhood. It must be stopped, calmed, or returned to the painting.' },
    { disturbance: 'A rivalry between two artistic schools degenerates into sabotage.', outcome: 'Adventurers can mediate, discover the culprit, or protect an important work.' },
    { disturbance: 'A city statue has started talking, revealing secrets.', outcome: 'Is it a blessing, a curse, or a divine message? The crowd gathers.' },
    { disturbance: 'A famous bard disappeared before a big show.', outcome: 'Kidnapping? Escape? Adventurers must find him before chaos breaks out.' },
    { disturbance: 'An art dealer sells perfect copies... perhaps too perfect.', outcome: 'Are the copies magical? Cursed? Or stolen from a powerful collector?' },
    { disturbance: 'A mural changes every night, showing future events.', outcome: 'Is it a prophecy? A warning? Or an entity communicating?' },
    { disturbance: 'A group of artists protests against a new tax.', outcome: 'The protest risks becoming violent. Who is behind the rising tension?' },
    { disturbance: 'A public performance triggers uncontrollable emotions in the crowd.', outcome: 'Emotional magic? A hidden caster? Adventurers must calm the situation.' }
  ],
  'Arcane': [
    { disturbance: 'A wandering grimoire flies through the district stealing other books.', outcome: 'It must be captured without destroying the texts it has "eaten".' },
    { disturbance: 'An apprentice has summoned a familiar... that is now multiplying.', outcome: 'Small magical creatures invade the neighborhood.' },
    { disturbance: 'A rain of arcane sparks falls from the sky.', outcome: 'Random effects hit passersby. Adventurers must find the source.' },
    { disturbance: 'An alchemical laboratory explodes, releasing a mutagenic cloud.', outcome: 'Temporary mutations, panic, and an alchemist to be saved.' },
    { disturbance: 'A magical tower changes position every hour.', outcome: 'Is it a malfunction or a defensive spell gone mad?' },
    { disturbance: 'A caster has lost control of an arcane construct.', outcome: 'The golem wanders the streets. Stop it without destroying everything.' },
    { disturbance: 'An unstable portal appears and disappears at random points.', outcome: 'Creatures, objects, or people are sucked in or expelled.' },
    { disturbance: 'A "mana storm" passes through the district.', outcome: 'Spells go wild, objects animate, illusions take shape.' }
  ],
  'Trade': [
    { disturbance: 'A foreign merchant sells "miraculous" items at ridiculous prices.', outcome: 'Are they scams? Cursed items? Or an emissary from a distant people seeking help.' },
    { disturbance: 'An important caravan never arrived in town.', outcome: 'Adventurers are hired to track it down or find out who made it disappear.' },
    { disturbance: 'A dispute between two shops degenerates into nightly sabotage.', outcome: 'Who started it? Adventurers can mediate or discover a third culprit.' },
    { disturbance: 'An invisible thief is robbing the market.', outcome: 'Is it magic? A creature? Or an elaborate trick. Merchants ask for help.' },
    { disturbance: 'A rare commodity is suddenly nowhere to be found.', outcome: 'The cause could be a criminal monopoly, a curse, or a natural disaster.' },
    { disturbance: 'A merchant was found petrified in front of his shop.', outcome: 'Basilisk? Curse? Or a faulty magical item.' },
    { disturbance: 'An angry crowd protests against a new commercial tax.', outcome: 'Tension can explode. Who pushed the people to revolt.' },
    { disturbance: 'An auction of rare items attracts suspicious figures.', outcome: 'Thefts, scams, dangerous items: adventurers can be guards or participants.' }
  ],
  'Religious': [
    { disturbance: 'A sacred statue has started weeping blood.', outcome: 'Miracle, curse, or trick. The crowd gathers and order is needed.' },
    { disturbance: 'A priest disappeared during a nightly ritual.', outcome: 'He was kidnapped, possessed, or discovered something dangerous.' },
    { disturbance: 'A minor cult preaches apocalyptic prophecies.', outcome: 'Are they true? Or are they manipulating the faithful. Adventurers investigate.' },
    { disturbance: 'A sacred object was stolen from the main temple.', outcome: 'Recovering it could require infiltration, negotiation, or combat.' },
    { disturbance: 'A mass pilgrimage blocks the streets.', outcome: 'Someone dangerous or someone seeking help hides among the pilgrims.' },
    { disturbance: 'A sudden miracle has healed dozens of people.', outcome: 'Where does this power come from. Is it a blessing or uncontrolled magic.' },
    { disturbance: 'A ghost appears every night in the district cemetery.', outcome: 'He asks for justice, revenge, or protection.' },
    { disturbance: 'Two rival religious orders argue over sacred territory.', outcome: 'Tension risks turning into violence. Adventurers can mediate.' }
  ],
  'Entertainment': [
    { disturbance: 'A brawl breaks out in a famous tavern, involving important figures.', outcome: 'Adventurers can quell the brawl, protect someone, or find out who provoked it.' },
    { disturbance: 'A beloved street performer has been kidnapped.', outcome: 'Is it an unpaid debt, a revenge, or a kidnapping orchestrated by a rival.' },
    { disturbance: 'A gambling house is accused of cheating with magic.', outcome: 'Players want justice. Adventurers can investigate or infiltrate.' },
    { disturbance: 'An illegal substance spreads rapidly in the neighborhood.', outcome: 'Who produces it? Who distributes it? Adventurers can stop the network.' },
    { disturbance: 'A mysterious figure offers nightly shows that hypnotize the crowd.', outcome: 'Is it magic? Manipulation? Or a hidden ritual.' },
    { disturbance: 'A rival criminal gang tries to take control of the neighborhood.', outcome: 'Adventurers can mediate, fight, or find out who is pulling the strings.' },
    { disturbance: 'An arson attack devastates a popular venue.', outcome: 'Who set it and why. Revenge, insurance, or sabotage.' },
    { disturbance: 'A local celebrity organizes a big event... and then disappears.', outcome: 'Adventurers must find her before the crowd goes crazy.' }
  ],
  'Government': [
    { disturbance: 'Secret documents were stolen from the city archives.', outcome: 'Adventurers must recover them before they are sold or disseminated.' },
    { disturbance: 'A high-ranking official is accused of corruption.', outcome: 'Is it true? A political trap? Adventurers can investigate.' },
    { disturbance: 'A crowd protests in front of the governor\'s palace.', outcome: 'Tension grows. Who is manipulating the situation.' },
    { disturbance: 'A foreign emissary was attacked.', outcome: 'A diplomatic incident could break out. Adventurers must find the culprit.' },
    { disturbance: 'A judge disappeared before an important trial.', outcome: 'Kidnapping, escape, or blackmail. The city is in turmoil.' },
    { disturbance: 'A magical creature was accidentally released in government offices.', outcome: 'Total panic. Adventurers must capture it without destroying everything.' },
    { disturbance: 'A newly passed law triggers chaos and discontent.', outcome: 'Adventurers can mediate, investigate, or protect someone.' },
    { disturbance: 'A council meeting is interrupted by an attack.', outcome: 'Who is the target? Who organized the attack.' }
  ],
  'Military': [
    { disturbance: 'An elite unit returned from the mission... but a soldier is missing.', outcome: 'He is missing, a deserter, or a prisoner. Adventurers are tasked with finding out.' },
    { disturbance: 'An experimental weapon was stolen from the armory.', outcome: 'Who took it and why. It could be unstable or dangerous.' },
    { disturbance: 'A creature trained for war escaped from the enclosure.', outcome: 'It must be captured before it causes damage. It could be scared, not hostile.' },
    { disturbance: 'Two rival commanders argue over a strategy, risking dividing the troops.', outcome: 'Adventurers can mediate or find out who is manipulating the situation.' },
    { disturbance: 'A new recruitment has attracted suspicious individuals.', outcome: 'Spies, criminals, or infiltrati. Adventurers must investigate.' },
    { disturbance: 'A series of supply thefts is weakening the barracks.', outcome: 'Is it an internal thief, an external group, or an intelligent animal.' },
    { disturbance: 'A training session got out of hand, causing chaos in the district.', outcome: 'Adventurers must help contain the situation or save civilians.' },
    { disturbance: 'A respected veteran was found injured in mysterious circumstances.', outcome: 'He was attacked, poisoned, or discovered something dangerous.' }
  ],
  'Services': [
    { disturbance: 'A forge caught fire inexplicably.', outcome: 'Is it sabotage, an accident, or an unstable magical object.' },
    { disturbance: 'A craftsman disappeared leaving an important commission unfinished.', outcome: 'Adventurers must find him or complete the delivery.' },
    { disturbance: 'A series of tools and instruments animate and start attacking workers.', outcome: 'Residual magic, curse, or spiteful spirit.' },
    { disturbance: 'A shipment of essential materials never arrived at the warehouses.', outcome: 'It must be recovered or replaced before production stops.' },
    { disturbance: 'A mill has stopped working and produces an eerie noise.', outcome: 'Inside hides a creature, a saboteur, or a minor portal.' },
    { disturbance: 'A craftsman has created a "too perfect" object that everyone now wants.', outcome: 'Rivalries, thefts, bribery attempts. The object could be magical.' },
    { disturbance: 'A group of workers protests against inhuman conditions.', outcome: 'Adventurers can mediate, discover abuses, or unmask a manipulator.' },
    { disturbance: 'A warehouse is infested with creatures that devour precious materials.', outcome: 'They must be eliminated or captured. Their origin is mysterious.' }
  ],
  'Residential': [
    { disturbance: 'A family reports that their house is "haunted" by noises and shadows.', outcome: 'Is it a ghost, a hidden animal, a thief, or an illusion. Adventurers investigate.' },
    { disturbance: 'A child disappeared while playing in the alleys.', outcome: 'He must be found: he could be lost, kidnapped, or followed a curious creature.' },
    { disturbance: 'A series of nightly thefts hits only specific houses.', outcome: 'The victims have something in common. Adventurers must find the common thread.' },
    { disturbance: 'A neighbor reports strange chants coming from an abandoned house.', outcome: 'Is it a ritual, a secret gathering, or a creature mimicking human voices.' },
    { disturbance: 'A feud between rival families risks turning into violence.', outcome: 'Adventurers can mediate or find out who is fueling the tension.' },
    { disturbance: 'A "too intelligent" pet is causing problems in the neighborhood.', outcome: 'Is it a magical familiar, a mutated creature, or an escaped experiment.' },
    { disturbance: 'A mysterious disease spreads among residents.', outcome: 'Adventurers must find the source: contaminated water, magic, poison, or curse.' },
    { disturbance: 'A house suddenly collapsed for no apparent reason.', outcome: 'Underneath there is a tunnel, a burrowing creature, or an ancient forgotten dungeon.' }
  ],
  'General': [
    { disturbance: 'A weary traveler brings disturbing news from the wilderness.', outcome: 'A danger approaches or an opportunity has been discovered.' },
    { disturbance: 'A lost item was found in the center of the camp.', outcome: 'Who does it belong to and what does it contain?' },
    { disturbance: 'A fight over rations breaks out among the settlers.', outcome: 'Adventurers must mediate or find a new source of food.' },
    { disturbance: 'A wild animal has entered the camp perimeter.', outcome: 'Is it hungry, injured, or carrying a message?' }
  ]
};

export const SETTLEMENT_NAMES = [
  'Oakhaven', 'Ironcrest', 'Shadowfen', 'Goldcrest', 'Ravenwatch', 'Stonebridge',
  'Mistvale', 'Duskwood', 'Stormpeak', 'Sunspire', 'Emberfall', 'Frosthold',
  'Thornwall', 'Silverbrook', 'Blackhollow', 'Highspire', 'Ashbourne', 'Moonford',
  'Grimharbor', 'Brightmere', 'Hollowgate', 'Starfall', 'Wolfden', 'Eldercrest',
  'Redmarsh', 'Wintermere', 'Stormhollow', 'Oakshield', 'Dragonford', 'Mistwood',
  'Fangridge', 'Goldhaven', 'Nightwell', 'Ironvale', 'Frostmere', 'Ravenscar',
  'Stonewatch', 'Dawnbreak', 'Shadowreach', 'Stormhold', 'Emberwatch', 'Moonspire'
];


export const NPC_NAMES = ['Alaric', 'Bryn', 'Caelum', 'Dara', 'Elowen', 'Finn', 'Gwen', 'Harek', 'Isolde', 'Jace', 'Kael', 'Lia', 'Milo', 'Nora', 'Orin', 'Pippin', 'Quinn', 'Rhea', 'Silas', 'Thalia', 'Valerius', 'Zora', 'Kaelen', 'Lyra', 'Torin', 'Sariel', 'Dorn', 'Mira', 'Kaelith', 'Varis'];
export const NPC_ROLES = ['Acolyte', 'Alchemist', 'Ambassadors', 'Apothecary', 'Astrologer','Blacksmith', 'Captain of the guard', 'Carpenter','Charismatic bartender', 'Citizen', 'City guard', 'Cloth merchant','Criminal', 'Drunkard', 'Eccentric painter', 'Elder wizard','Enchanter of magical objects', 'Entertainer', 'Exotic animal merchant',
'Farmer', 'Gambling master', 'Glassblower', 'Governor’s secretary','Guard Captain', 'Gunsmith', 'Healer', 'Hermit', 'Informants','Innkeeper', 'Judge', 'Librarian', 'Local Guide','Local noble', 'Magical calligrapher', 'Master builder', 'Merchant','Military equipment vendor', 'Mysterious Stranger', 'Noble', 'Official',
'Patrol guard', 'Peddler', 'Potter', 'Priest', 'Recruiting sergeant','Relic seller', 'Retired Adventurer', 'Sailor', 'Scholar', 'Scribe','Scribe of sacred texts', 'Scroll seller', 'Secondhand dealer', 'Smuggler','Soldier', 'Sculptor of animated statues', 'Tanner', 'Teacher','Temple keeper', 'Theater mask maker', 'Thief', 'Trainer', 'Wandering bard','Wayfarer'];
export const NPC_RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling', 'Orc', 'Goliath'];
export const NPC_ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
export const NPC_DISPOSITIONS = ['Friendly', 'Neutral', 'Hostile', 'Suspicious', 'Shy', 'Violent', 'Amused', 'Indifferent', 'Curious', 'Arrogant', 'Humble', 'Nervous', 'Brave', 'Cowardly', 'Greedy', 'Generous'];
export const NPC_TRAITS = ['Scarred face', 'Missing finger', 'Wears expensive jewelry', 'Always whispering', 'Strong smell of lavender', 'Limping', 'Very tall', 'Very short', 'Brightly colored clothes', 'Deep, booming voice', 'Nervous tic', 'Tattooed arms', 'Missing eye', 'Beautiful singing voice', 'Always eating', 'Extremely clean', 'Covered in dirt'];
export const NPC_GOALS = [
  'Find a lost relative',
  'Pay off a debt',
  'Gain political power',
  'Learn a secret spell',
  'Avenge a fallen friend',
  'Protect their family',
  'Become famous',
  'Escape a dangerous past',
  'Find a legendary artifact',
  'Start a new life',
  'Spread their religion',
  'Make a lot of money',
  'Clear their name from false accusations',
  'Recover a stolen heirloom',
  'Break a powerful curse',
  'Prove their worth to a mentor or guild',
  'Uncover the truth behind a mysterious event',
  'Reunite with a former lover',
  'Destroy a forbidden tome or artifact',
  'Earn redemption for past misdeeds',
  'Protect a secret that could change the world',
  'Find a safe place to hide from pursuers',
  'Complete a vow made long ago',
  'Discover the fate of a missing expedition',
  'Gain the favor of a powerful patron',
  'Master a dangerous magical technique',
  'Restore honor to their disgraced family',
  'Sabotage a rival’s plans',
  'Deliver an important message to the right hands',
  'Escape an arranged marriage',
  'Track down someone who betrayed them',
  'Fulfill a prophecy they barely understand',
  'Build a new settlement or community',
  'Recover memories lost to trauma or magic',
  'Protect a child who is not their own',
  'Find a cure for a rare illness',
  'Repay a life‑debt to someone important',
  'Unmask a hidden cult operating nearby',
  'Prove that a legend or myth is real',
  'Destroy a monster that haunts their dreams',
  'Win a prestigious competition',
  'Smuggle something across dangerous territory',
  'Learn the identity of their real parents',
  'Break free from a magical pact',
  'Restore a ruined temple or shrine',
  'Become the leader of their clan or guild',
  'Find someone willing to teach them forbidden knowledge',
  'Retrieve a message left by a deceased loved one',
  'Stop a war before it begins',
  'Expose corruption within a noble house',
  'Protect a sacred site from desecration',
  'Rebuild a relationship with an estranged sibling',
  'Escape servitude or imprisonment',
  'Track down a rare creature for study',
  'Recover a map leading to a hidden treasure',
  'Prevent a disaster they have foreseen',
  'Find a place where they truly belong'];
export const NPC_SECRETS = [
  'Is a spy for a rival city',
  'Has a hidden stash of gold',
  'Is actually a werewolf',
  'Committed a crime they regret',
  'Is a noble in hiding',
  'Knows the location of a hidden dungeon',
  'Is working for the main antagonist',
  'Has a terminal illness',
  'Is a member of a secret society',
  'Has a twin sibling they never mention',
  'Made a pact with a forbidden entity',
  'Is being blackmailed by someone powerful',
  'Stole an artifact that others are hunting for',
  'Is secretly in love with someone dangerous',
  'Is hiding a magical talent they cannot control',
  'Was responsible for a past disaster but no one knows',
  'Is cursed and fears the party will discover it',
  'Has visions of the future they pretend are dreams',
  'Is the last survivor of a destroyed village',
  'Is secretly protecting someone the party considers an enemy',
  'Is wanted for treason in another kingdom',
  'Has a map leading to a place that should not exist',
  'Is slowly turning into a monster',
  'Is immune to a certain type of magic and doesn’t know why',
  'Is the illegitimate child of a famous ruler',
  'Has a hidden child they are trying to keep safe',
  'Knows the true identity of a masked figure in the region',
  'Is secretly wealthy but pretends to be poor',
  'Is being followed by an unseen spirit',
  'Has a forbidden book they cannot let anyone read',
  'Is hiding a bite mark from a dangerous creature',
  'Is the only one who knows how to stop an upcoming catastrophe',
  'Is slowly losing their memories due to a magical effect',
  'Is connected to an ancient prophecy',
  'Has a second identity used for illegal activities',
  'Is secretly sabotaging a local faction',
  'Is bound by an oath they cannot break',
  'Is hiding evidence that could topple a noble house',
  'Is being impersonated by a doppelganger at night',
  'Knows a ritual that could resurrect someone important',
  'Is haunted by the ghost of someone they wronged',
  'Is secretly smuggling magical items',
  'Is the guardian of a sealed portal',
  'Has a deadly poison hidden on them at all times',
  'Is slowly dying due to a magical experiment gone wrong',
  'Is the last member of a forgotten bloodline',
  'Is secretly meeting with a cult',
  'Is hiding a relic that whispers to them',
  'Is being hunted by bounty hunters',
  'Has a tattoo marking them as property of a criminal syndicate',
  'Knows the true history of a local legend',
  'Is immune to aging but doesn’t understand why'
];

export const SETTLEMENT_EVENTS = [
  "A wedding procession blocks the street with music and dancing.",
  "A public feast is underway, with free food handed out.",
  "A naming ceremony for a newborn draws a cheerful crowd.",
  "A parade of brightly dressed performers marches past.",
  "A local holiday shuts down most shops.",
  "A street fair pops up with games and vendors.",
  "A religious procession carries sacred relics through the district.",
  "A hero’s triumphant return is being celebrated loudly.",
  "A harvest celebration fills the square with stalls and musicians.",
  "A festival honoring a local deity draws pilgrims from afar.",
  "A town crier announces a new law or decree.",
  "A public debate between two political rivals draws a crowd.",
  "A new civic leader is being sworn into office.",
  "A tax collector arrives with a heavy escort.",
  "A census is being conducted door‑to‑door.",
  "A public vote is taking place in the main square.",
  "A diplomatic envoy from another city arrives.",
  "A proclamation of amnesty is posted on notice boards.",
  "A city council meeting spills into the streets with arguments.",
  "A public speech by a charismatic orator draws hundreds.",
  "A sudden downpour floods the lower streets.",
  "Gale‑force winds tear down banners and signs.",
  "A freak heatwave forces people indoors.",
  "A cold snap freezes fountains solid.",
  "A lightning strike hits a nearby tower.",
  "A dust storm sweeps through the market district.",
  "A rainbow arcs perfectly over the city.",
  "A hailstorm damages roofs and stalls.",
  "A strange fog rolls in, thick and unnatural.",
  "A tremor shakes the city briefly.",
  "A famous playwright debuts a new performance.",
  "A traveling circus sets up in the plaza.",
  "A renowned musician gives a free concert.",
  "A troupe of dancers performs in the street.",
  "A storyteller captivates a large crowd.",
  "A painter unveils a controversial new mural.",
  "A poetry competition draws local talent.",
  "A magical light show illuminates the night sky.",
  "A public reading of ancient texts takes place.",
  "A sculptor reveals a statue of a local hero.",
  "A regiment of soldiers marches through the streets.",
  "A patrol returns from a border conflict.",
  "A duel between two officers draws spectators.",
  "A military parade showcases new equipment.",
  "A recruitment drive urges citizens to enlist.",
  "A captured spy is marched through the city.",
  "A drill involving the city guard causes confusion.",
  "A war mage demonstrates battlefield spells.",
  "A fortified caravan arrives under heavy guard.",
  "A city‑wide alarm sounds, summoning all guards.",
  "A wagon overturns, spilling goods everywhere.",
  "A collision between two carriages causes chaos.",
  "A building partially collapses.",
  "A fire breaks out in a crowded district.",
  "A water main bursts, flooding the street.",
  "A rooftop catches fire from a stray spark.",
  "A balcony collapses during a party.",
  "A chimney explosion sends debris flying.",
  "A bridge cracks under heavy traffic.",
  "A sinkhole opens suddenly in the road.",
  "A wild magic surge erupts in the marketplace.",
  "A wizard’s experiment goes wrong, filling the street with illusions.",
  "A summoned creature escapes and runs amok.",
  "A magical storm crackles above the rooftops.",
  "A portal flickers open briefly, showing another realm.",
  "A ghostly procession drifts silently through the street.",
  "A rain of harmless glowing sparks falls from the sky.",
  "A magical artifact activates unexpectedly.",
  "A familiar or spirit animal darts through the crowd.",
  "A mage’s duel erupts in a nearby alley.",
  "A coordinated robbery hits multiple shops at once.",
  "A political protest blocks the main avenue.",
  "A riot breaks out over food shortages.",
  "A notorious criminal is spotted in the district.",
  "A gang clash spills into the streets.",
  "A masked assassin strikes a public figure.",
  "A smuggling ring is exposed by the guard.",
  "A mob forms around a suspected thief.",
  "A noble’s carriage is attacked by unknown assailants.",
  "A coordinated attack targets guard posts.",
  "A massive fire spreads across several blocks.",
  "A flood forces evacuations.",
  "A plague outbreak is declared; healers rush to respond.",
  "A magical contamination zone appears.",
  "A dimensional rift opens above the city.",
  "A meteor streaks overhead and crashes nearby.",
  "A huge storm batters the city for hours.",
  "A famine warning is issued by city officials.",
  "A large portion of the city loses power or magical wards.",
  "A mysterious blackout of all magic lasts several minutes.",
  "A massive monster breaches the city walls.",
  "A dragon flies overhead, causing panic.",
  "A foreign army camps outside the gates.",
  "A cult performs a ritual in the open streets.",
  "A titan or giant creature is spotted approaching the city.",
  "A powerful mage declares martial law.",
  "A rebellion erupts in multiple districts.",
  "A divine omen appears in the sky.",
  "A planar invasion begins.",
  "A full‑scale siege of the city begins."
];

export const WILDERNESS_BIOMES: Record<string, { events: string[], discoveries: string[] }> = {
  'Ancient Forest': {
    events: [
      'You find a patch of bioluminescent mushrooms.',
      'A group of mischievous pixies leads you in circles.',
      'You encounter a wounded stag with golden antlers.',
      'The trees seem to whisper secrets as you pass.',
      'You find an abandoned druid\'s grove.',
      'A sudden downpour turns the forest floor into a muddy mess.',
      'A trail of glowing spores drifts through the air.',
      'A massive tree root shifts as if the forest were breathing.',
      'A ghostly stag appears briefly before vanishing.',
      'Fireflies form runic shapes in the air.',
      'A fallen tree reveals a hollow filled with blinking eyes.',
      'A sudden hush falls over the forest — even the wind stops.'
    ],
    discoveries: [
      'A hollow tree containing a cache of herbal medicines.',
      'A hidden waterfall with a small cave behind it.',
      'An ancient stone archway covered in glowing runes.',
      'A circle of perfectly white stones in a clearing.',
      'A massive, ancient oak tree with a door carved into its trunk.',
      'A moss-covered stone altar with long-forgotten offerings.',
      'A pool so still it reflects the sky perfectly.',
      'A tree whose bark grows in the shape of faces.',
      'A druidic boundary marker half-buried in roots.',
      'Ancient arrows embedded in a petrified log.'
    ]
  },

  'Jagged Mountains': {
    events: [
      'A sudden rockslide blocks your path.',
      'You find a narrow pass that saves you hours of travel.',
      'The thin air makes every step a struggle.',
      'You spot a majestic eagle soaring above the peaks.',
      'A mountain goat follows you for several miles.',
      'You find a small, warm cave to shelter from the wind.',
      'A distant avalanche echoes through the mountains.',
      'A cold wind carries the sound of chanting.',
      'A mountain lion watches you from a high ledge.',
      'A rope bridge sways violently despite calm weather.',
      'A metallic ringing comes from inside the mountain.',
      'A sudden drop in temperature chills you deeply.'
    ],
    discoveries: [
      'A vein of rare, shimmering ore in a cliffside.',
      'The ruins of a dwarven watchtower.',
      'A high-altitude lake with crystal clear water.',
      'A hidden path leading to a secluded mountain monastery.',
      'A frozen waterfall that never melts.',
      'A cavern filled with glowing mineral veins.',
      'A stone cairn marking a forgotten climber’s grave.',
      'A natural archway framing a breathtaking view.',
      'A dwarven mural carved into the cliff.',
      'A giant eagle nest containing unusual bones.'
    ]
  },

  'Murky Swamp': {
    events: [
      'The ground suddenly gives way to a deep bog.',
      'A thick mist rises, making navigation nearly impossible.',
      'You encounter a friendly lizardfolk hunter.',
      'The constant buzzing of insects is maddening.',
      'You find a strange, glowing flower growing on a rotten log.',
      'A sudden bubbling in the water suggests something large nearby.',
      'Bubbles rise from the muck, releasing a foul smell.',
      'Yellow eyes watch you from beneath the water.',
      'A loud splash suggests something just submerged.',
      'A thick fog rolls in, muffling all sound.',
      'A swarm of insects forms a living cloud around you.',
      'A wooden boardwalk appears but ends abruptly.'
    ],
    discoveries: [
      'A half-sunken boat containing old trade goods.',
      'A circle of twisted trees that seem to be watching you.',
      'A hidden hut on stilts, smelling of strange herbs.',
      'An ancient, moss-covered idol of a forgotten deity.',
      'A patch of rare, medicinal swamp lilies.',
      'A sunken stone obelisk covered in slime.',
      'A floating lantern with no visible flame.',
      'A patch of ground that feels warm to the touch.',
      'A bundle of herbs tied with swampfolk knots.',
      'A fossilized creature half-buried in the mud.'
    ]
  },

  'Scorching Desert': {
    events: [
      'A sudden sandstorm forces you to take cover.',
      'You find a small oasis with a single palm tree.',
      'The heat is oppressive, draining your energy.',
      'You spot a mirage of a distant, beautiful city.',
      'A desert fox leads you to a hidden water source.',
      'You find the bleached bones of a massive, unknown creature.',
      'Heat haze makes the horizon ripple like water.',
      'A distant roar echoes across the dunes.',
      'A caravan skeleton lies half-buried in the sand.',
      'A dust devil dances dangerously close.',
      'A lone vulture circles overhead.',
      'The sand beneath your feet suddenly becomes scorching hot.'
    ],
    discoveries: [
      'The tip of a buried pyramid peeking through the sand.',
      'A hidden cave containing ancient, preserved scrolls.',
      'A field of strange, glass-like formations caused by lightning.',
      'An abandoned nomad camp with a few useful supplies.',
      'A deep well that still contains cool, fresh water.',
      'A buried statue’s face staring up from the sand.',
      'A cracked clay jar containing ancient coins.',
      'A dried-up oasis with carved stones.',
      'A collapsed tent with a half-buried journal.',
      'A shard of black glass formed by magical fire.'
    ]
  },

  'Open Plains': {
    events: [
      'A massive herd of bison thunders across the horizon.',
      'You find a field of vibrant, waist-high wildflowers.',
      'A sudden thunderstorm provides much-needed water.',
      'You encounter a group of nomadic horse-riders.',
      'The vast, open sky makes you feel small and exposed.',
      'You find a lone, ancient tree in the middle of the plains.',
      'A sudden gust bends the grass like waves.',
      'A lone horse gallops past without a rider.',
      'A distant column of smoke rises on the horizon.',
      'A pack of wild dogs watches you from afar.',
      'A warm breeze carries the scent of distant rain.',
      'A hawk circles overhead, screeching loudly.'
    ],
    discoveries: [
      'A hidden burrow containing a small treasure cache.',
      'A circle of standing stones used for ancient rituals.',
      'A small, clear pond teeming with fish.',
      'The remains of a long-forgotten battlefield.',
      'A natural sinkhole leading to an underground stream.',
      'A stone marker with tribal carvings.',
      'A collapsed burrow revealing glittering stones.',
      'A patch of grass growing in a perfect spiral.',
      'A broken spear planted firmly in the ground.',
      'A shallow depression filled with old bones.'
    ]
  },

  'Frozen Tundra': {
    events: [
      'A sudden blizzard reduces visibility to zero.',
      'You find a patch of hardy, edible lichen.',
      'The ground is permanently frozen, making travel difficult.',
      'You spot a massive polar bear in the distance.',
      'The aurora borealis lights up the night sky.',
      'You find a small, sheltered valley where the wind is less fierce.',
      'The ice cracks loudly beneath your feet.',
      'A distant howl echoes across the tundra.',
      'A sudden whiteout forces you to stop.',
      'A lone figure trudges through the snow, then vanishes.',
      'A gust of wind carries needle-like ice shards.',
      'A frozen river groans ominously as you cross.'
    ],
    discoveries: [
      'A perfectly preserved mammoth frozen in a block of ice.',
      'A hidden hot spring that provides a brief respite from the cold.',
      'The ruins of an ancient ice-palace.',
      'A cache of supplies left by a previous, failed expedition.',
      'A strange, glowing crystal embedded in a glacier.',
      'A cluster of ice crystals shaped like flowers.',
      'A snow-covered cairn marking an explorer’s grave.',
      'A cave entrance sealed by a thin sheet of ice.',
      'A frozen campsite with everything preserved.',
      'A metallic object half-buried in the snow.'
    ]
  }
}

export const WILDERNESS_TERRAINS = Object.keys(WILDERNESS_BIOMES);
export const WILDERNESS_WEATHER = ['Clear Skies', 'Overcast', 'Light Rain', 'Heavy Storm', 'Thick Mist', 'Scorching Heat'];

export const ORACLE_LIKELIHOODS = [
  { label: 'Impossible', mod: -6 },
  { label: 'Highly Unlikely', mod: -4 },
  { label: 'Unlikely', mod: -2 },
  { label: 'Possible', mod: 0 },
  { label: 'Likely', mod: 2 },
  { label: 'Highly Likely', mod: 4 },
  { label: 'A Certainty', mod: 6 },
] as const;

export const DIFFICULTY_CLASSES = [
  { label: 'Very Easy', dc: 5 },
  { label: 'Easy', dc: 10 },
  { label: 'Moderate', dc: 15 },
  { label: 'Hard', dc: 20 },
  { label: 'Very Hard', dc: 25 },
  { label: 'Nearly Impossible', dc: 30 },
] as const;

export const SITUATION_VERBS = [
  "ambush", "analyze", "approach", "argue", "assist", "attack", "avoid", "bargain", "beg", "betray",
  "block", "bribe", "capture", "chase", "cheat", "conceal", "confront", "confuse", "convince", "create",
  "deceive", "defend", "delay", "deliver", "demand", "destroy", "discover", "distract", "disturb", "evade",
  "examine", "expose", "flee", "follow", "force", "frighten", "gather", "guard", "hide", "hinder",
  "hunt", "ignore", "imprison", "infiltrate", "intimidate", "investigate", "invite", "lure", "manipulate", "mislead",
  "negotiate", "observe", "overwhelm", "persuade", "pursue", "question", "raid", "refuse", "release", "repair",
  "replace", "rescue", "reveal", "sabotage", "search", "seize", "shelter", "silence", "solve", "spy",
  "steal", "summon", "support", "surround", "suspect", "threaten", "track", "trade", "trap", "trick",
  "uncover", "understand", "use", "wait", "warn", "watch", "weaken", "welcome", "withdraw", "wound",
  "ambush", "bind", "break", "calm", "chase", "claim", "climb", "command", "compete", "conceal",
  "connect", "construct", "contaminate", "cooperate", "corrupt", "create", "damage", "debate", "deceive", "declare",
  "defend", "deflect", "deliver", "demand", "deny", "depart", "destroy", "detect", "determine", "disable",
  "disarm", "discover", "disguise", "dismiss", "disrupt", "distract", "divide", "dominate", "drag", "drain",
  "escape", "escort", "examine", "exchange", "execute", "expand", "exploit", "explore", "expose", "extract",
  "fabricate", "flee", "follow", "forbid", "force", "forge", "fortify", "gather", "gift", "grab",
  "guard", "guide", "harm", "harvest", "hide", "hinder", "hunt", "illuminate", "immobilize", "impersonate",
  "imprison", "improve", "incite", "infect", "influence", "inform", "injure", "inspect", "inspire", "intercept",
  "intimidate", "invade", "investigate", "invoke", "involve", "isolate", "judge", "kidnap", "lead", "learn",
  "lure", "maintain", "manipulate", "mark", "mediate", "misdirect", "monitor", "negotiate", "observe", "obstruct",
  "obtain", "oppose", "organize", "overwhelm", "pacify", "patrol", "persuade", "plot", "poison", "prepare",
  "pressure", "protect", "provoke", "pursue", "question", "raid", "rally", "reassure", "recruit", "redirect",
  "reinforce", "release", "relocate", "remove", "repair", "replace", "report", "request", "rescue", "resist",
  "restrain", "retrieve", "reveal", "sabotage", "scatter", "search", "secure", "seize", "shelter", "shift",
  "silence", "smuggle", "solve", "spy", "stabilize", "steal", "strengthen", "subdue", "summon", "supply",
  "support", "suppress", "surround", "suspect", "sway", "threaten", "track", "trade", "trap", "trick",
  "uncover", "understand", "unite", "use", "vanish", "verify", "wait", "warn", "watch", "weaken",
  "welcome", "withdraw", "wound", "ambush", "bind", "break", "calm", "chase", "claim", "climb",
  "command", "compete", "conceal", "confuse", "corrupt", "craft", "crush", "deceive", "defy", "deliver",
  "disrupt", "dominate", "empower", "enchant", "entangle", "escort", "expand", "expose", "flee", "forge",
  "gather", "guide", "hinder", "inspire", "intimidate", "lure", "manipulate", "overwhelm", "reveal", "trap"
];

export const URBAN_EVENT_CATEGORIES = [
  { name: 'Celebrations & Public Gatherings', range: [1, 10] },
  { name: 'Civic & Political Events', range: [11, 20] },
  { name: 'Weather & Natural Events', range: [21, 30] },
  { name: 'Cultural & Artistic Events', range: [31, 40] },
  { name: 'Military & Security Events', range: [41, 50] },
  { name: 'Accidents & Emergencies', range: [51, 60] },
  { name: 'Magical & Supernatural Events', range: [61, 70] },
  { name: 'Crime, Unrest & Conflict', range: [71, 80] },
  { name: 'Disasters & City-Wide Events', range: [81, 90] },
  { name: 'Major Threats & Extraordinary Events', range: [91, 100] }
];

export const URBAN_ENCOUNTERS = [
  "You witness a pickpocket in action; the thief notices you noticing.",
  "A runaway cart barrels down the street, scattering pedestrians.",
  "A masked figure sprints past you, chased by guards.",
  "A merchant accuses you of stealing something you’ve never seen before.",
  "A rooftop chase unfolds above you — someone falls dangerously close.",
  "A street brawl spills into your path.",
  "A noble’s purse “accidentally” falls into your hands; guards arrive seconds later.",
  "A child tries to plant stolen goods in your pack to avoid being caught.",
  "A shopkeeper begs for help: someone is smashing his windows nightly.",
  "A thief collapses at your feet, whispering “Don’t let them find me…”",
  "A cloaked figure beckons you into a side alley, claiming to know your future.",
  "A frantic man insists he’s being followed by invisible assassins.",
  "A woman mistakes you for her long‑lost sibling and refuses to let go.",
  "A street preacher loudly proclaims the end of days — today.",
  "A drunk noble loudly challenges you to a duel.",
  "A child insists their toy is haunted and begs you to “make it stop talking.”",
  "A courier shoves a sealed letter into your hands before fleeing.",
  "A man is loudly arguing with… no one.",
  "A performer follows you, improvising a song about your “heroic deeds.”",
  "A hooded beggar hides their face, but their voice sounds strangely familiar.",
  "A vendor offers you a “rare artifact” that is clearly fake… or is it?",
  "A spice merchant collapses from exhaustion, begging for water.",
  "A jeweler claims someone swapped his gems with illusions.",
  "A butcher offers you a suspiciously cheap cut of meat.",
  "A potion seller’s wares explode in colorful smoke.",
  "A caravan arrives with exotic goods and stranger rumors.",
  "A baker gives you a free pastry “because you look like you need it.”",
  "A trader offers to buy something you own for an absurdly high price.",
  "A street cook insists you try their “famous” stew — it’s… questionable.",
  "A merchant’s cart breaks, spilling mysterious crates everywhere.",
  "A parade blocks the street, complete with dancers and musicians.",
  "A sudden rainstorm floods the lower streets.",
  "A cat darts past carrying a shiny ring in its mouth.",
  "A dog won’t stop barking at you specifically.",
  "A group of children ask you to settle a dispute about who cheated at a game.",
  "A rooftop collapses nearby, revealing a hidden room.",
  "A wedding procession passes by — someone begs you to stop it.",
  "A funeral procession passes by — someone begs you to join it.",
  "A street artist sketches you without asking.",
  "A city bell rings unexpectedly, causing panic.",
  "A shadow moves against the light, as if alive.",
  "A door slams shut behind you with no wind.",
  "A statue’s eyes seem to follow you.",
  "A whisper calls your name from a sewer grate.",
  "A strange symbol appears on a nearby wall — glowing faintly.",
  "A raven drops a key at your feet.",
  "A stranger hands you a map fragment before vanishing into the crowd.",
  "A cold breeze passes through you, though the air is warm.",
  "A hooded figure watches you from a rooftop.",
  "A lantern flickers violently as you pass, then shatters.",
  "A guild recruiter tries to convince you to join.",
  "A scholar asks for help retrieving a lost book.",
  "A noble invites you to a private dinner — tonight.",
  "A guard asks for your opinion on a local dispute.",
  "A priest offers you a blessing… for a donation.",
  "A traveling bard asks to accompany you for inspiration.",
  "A courier needs help delivering a package safely.",
  "A local artisan offers to craft something for you at a discount.",
  "A tavern owner begs you to deal with a troublesome patron.",
  "A group of adventurers asks if you want to join their next job.",
  "A floating orb of light drifts down the street.",
  "A spell misfires nearby, turning someone’s hair bright blue.",
  "A magical creature escapes from a wizard’s workshop.",
  "A ghostly figure crosses your path, ignoring everyone else.",
  "A wizard’s familiar approaches you with a message.",
  "A magical storm crackles above the rooftops.",
  "A cursed object rolls to your feet.",
  "A street performer accidentally summons something.",
  "A magical duel erupts between two mages.",
  "A portal flickers open for a moment, showing another place.",
  "A gang corners you, demanding a “street tax.”",
  "A monster breaks free from a cage cart.",
  "A rooftop assassin takes a shot at someone nearby.",
  "A pack of stray dogs becomes aggressive.",
  "A fire elemental escapes from a forge.",
  "A criminal mistakes you for their target.",
  "A bounty hunter confronts you, claiming you match a description.",
  "A group of mercenaries blocks the road, demanding passage fees.",
  "A wild-eyed alchemist throws volatile vials during an argument.",
  "A giant rat swarm bursts from a sewer grate.",
  "Someone whispers a rumor about a hidden treasure beneath the city.",
  "A priest warns you of strange happenings in the catacombs.",
  "A child claims their friend vanished near an abandoned house.",
  "A tavern patron tells you about a haunted warehouse.",
  "A merchant swears their goods are being stolen by ghosts.",
  "A guard mentions a bounty on a dangerous fugitive.",
  "A noble seeks discreet help with a “family matter.”",
  "A map seller offers a map to a forbidden district.",
  "A drunk claims to have seen a monster in the river.",
  "A secret society member mistakes you for an initiate.",
  "A riot breaks out over food shortages.",
  "A fire spreads rapidly through a nearby block.",
  "A magical explosion rocks the district.",
  "A noble’s procession demands the streets be cleared.",
  "A massive creature emerges from the sewers.",
  "A plague doctor warns of an outbreak.",
  "A famous hero arrives in town, drawing huge crowds.",
  "A city-wide alarm sounds — something terrible has happened.",
  "A dragon flies overhead, causing panic.",
  "A full-scale monster attack erupts in the streets."
];

export const CAMP_DISTURBANCES = [
  "A branch snaps loudly nearby.",
  "Something large splashes in a nearby stream.",
  "A tree groans as if shifting under its own weight.",
  "A distant howl echoes across the landscape.",
  "A sudden gust rattles your tent violently.",
  "Rocks tumble down a nearby slope.",
  "A loud screech from an unseen bird jolts you awake.",
  "Something knocks over your cooking pot.",
  "A heavy thud shakes the ground briefly.",
  "A chorus of frogs or insects erupts suddenly.",
  "A loud crack of thunder in the distance.",
  "A tree branch falls dangerously close.",
  "A strange rhythmic tapping echoes through the night.",
  "A distant roar you can’t identify.",
  "A loud splash as something enters the water.",
  "A sudden rustling rushes through the underbrush.",
  "A rock hits your tent from an unknown source.",
  "A loud snort or grunt from a nearby animal.",
  "A flock of birds takes off all at once.",
  "A deep, resonant hum vibrates through the ground.",
  "A deer wanders into camp, sniffing curiously.",
  "A fox steals a piece of food and darts away.",
  "A raccoon rummages through your pack.",
  "A curious owl lands on a branch above you.",
  "A hedgehog bumps into your bedroll.",
  "A family of rabbits hops through camp.",
  "A snake slithers across your boots but ignores you.",
  "A bear sniffs around but leaves when it finds nothing interesting.",
  "A wolf watches from a distance but does not approach.",
  "A boar snorts loudly before wandering off.",
  "A bird lands on your tent and pecks at it.",
  "A herd of elk passes quietly nearby.",
  "A badger digs a hole close to your camp.",
  "A large insect crawls across your gear.",
  "A bat flutters around your firelight.",
  "A wolf growls from the darkness.",
  "A boar charges through camp.",
  "A bear becomes aggressive after smelling food.",
  "A giant spider crawls toward your sleeping area.",
  "A swarm of insects descends on your camp.",
  "A territorial owl dive-bombs you.",
  "A snake coils near your bedroll, ready to strike.",
  "A pack of coyotes circles your camp.",
  "A large cat stalks you from the shadows.",
  "A rabid animal approaches erratically.",
  "A giant rat attempts to bite you.",
  "A wild dog lunges at your pack.",
  "A hawk swoops down, mistaking something for prey.",
  "A moose or elk charges unexpectedly.",
  "A creature rustles violently through your supplies.",
  "You dream of sinking into the earth; you wake gasping.",
  "A voice whispers your name from inside your dream.",
  "You see a forest burning, though you smell no smoke.",
  "A dream of being hunted by something unseen.",
  "You dream of a door in the wilderness that shouldn’t exist.",
  "A vision of someone you know calling for help.",
  "You see glowing eyes watching you from the dark.",
  "A dream of drowning in cold water.",
  "A nightmare of running endlessly through trees.",
  "A dream of a strange symbol carved into stone.",
  "A wandering traveler asks if they may share your fire.",
  "A lost child stumbles into camp, crying.",
  "A hunter approaches, asking if you’ve seen their prey.",
  "A druid silently observes you from the treeline.",
  "A merchant claims to be lost and asks for directions.",
  "A wounded ranger collapses near your camp.",
  "A hermit mutters warnings about forest spirits.",
  "A bard asks if they can rest and play a quiet tune.",
  "A scout from a nearby settlement checks your intentions.",
  "A cloaked figure asks if you’ve seen “the signs.”",
  "A pilgrim seeks shelter from the night.",
  "A thief tries to sneak past but steps on a twig.",
  "A group of travelers asks to borrow your fire.",
  "A mysterious figure leaves a small object near your camp.",
  "A hunter mistakes you for someone else.",
  "A druid warns you that this place is not safe.",
  "A ranger asks if you heard the howls earlier.",
  "A cloaked stranger asks if you’re the one they sent.",
  "A herbalist offers you a strange-smelling salve.",
  "A scout warns you of danger approaching.",
  "A thief tries to steal from your pack.",
  "A bandit demands you hand over your valuables.",
  "A group of raiders approaches quietly.",
  "A highwayman threatens you with a drawn blade.",
  "A desperate outlaw begs for food but may turn violent.",
  "A creature stalks the perimeter of your camp.",
  "A monstrous silhouette appears briefly in the moonlight.",
  "A pair of glowing eyes watches you from the dark.",
  "A creature’s growl echoes from the treeline.",
  "A monster charges into camp, drawn by your fire.",
  "A sudden tremor shakes the ground violently.",
  "A cold rain begins abruptly.",
  "A thunderstorm rolls in with violent lightning.",
  "A heavy fog blankets the area.",
  "A sudden heatwave makes the night unbearable.",
  "A freezing wind cuts through your shelter.",
  "A hailstorm pelts your camp.",
  "A dust storm sweeps through the clearing.",
  "A magical storm crackles overhead.",
  "A sudden downpour floods your campsite."
];

export const CAMP_DISTURBANCE_CATEGORIES = [
  { name: "Loud Noises", range: [0, 19] },
  { name: "Animal (Indifferent)", range: [20, 34] },
  { name: "Animal (Hostile)", range: [35, 49] },
  { name: "Disturbing Dream / Vision", range: [50, 59] },
  { name: "NPC (Curious)", range: [60, 79] },
  { name: "Bandit / Thief", range: [80, 84] },
  { name: "Monster", range: [85, 89] },
  { name: "Natural Disaster", range: [90, 90] },
  { name: "Storm / Weather Change", range: [91, 99] }
];

export const FACTION_TYPES = [
  'Mercenary Company', 'Thieves\' Guild', 'Arcane Circle', 'Religious Order', 
  'Merchant Consortium', 'Noble House', 'Secret Society', 'Knightly Order',
  'Druidic Circle', 'Bardic College', 'Criminal Syndicate', 'Cult'
];

export const FACTION_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good', 
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const FACTION_INFLUENCE = [
  'Minimal', 'Local', 'Regional', 'National', 'Global', 'Planar'
];

export const FACTION_GOALS = [
  'Accumulate Wealth', 'Gain Political Power', 'Protect the Innocent', 
  'Uncover Ancient Secrets', 'Spread a Religion', 'Maintain Order',
  'Overthrow the Government', 'Destroy a Rival Faction', 'Achieve Immortality',
  'Control a Specific Resource', 'Promote a Social Cause', 'Survive at All Costs'
];

export const FACTION_SECRETS = [
  'Led by a Doppelganger', 'Funded by a Demon', 'Infiltrated by Spies',
  'Possesses a Forbidden Artifact', 'Planning a Coup', 'Actually a Front for a Cult',
  'The Leader is Dead (Puppet)', 'Secretly Allied with a Rival', 'Responsible for a Past Disaster',
  'Experimenting on Innocent People'
];

export const FACTION_MOTTOS = [
  'Strength in Unity', 'Knowledge is Power', 'Justice Above All',
  'The Ends Justify the Means', 'By Blood and Iron', 'Silence is Golden',
  'For the Greater Good', 'Wealth is the Only Truth', 'Shadows Protect Us',
  'Faith is Our Shield'
];
