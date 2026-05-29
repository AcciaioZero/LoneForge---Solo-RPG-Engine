/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Item, Character, CharacterClass, Attribute, Skill, Ability, Enemy, Species, Background, SettlementType, DistrictDisturbance, GameState } from './types';
import { SPECIES_DATA } from './data/species';

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
  acBonus: 0,
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
  treasure: [],
  powerState: {
    unlockedPowerIds: [],
    meters: { hunger: 0 },
    completedTrialIds: [],
    activeManifestationIds: []
  }
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
  lastRoomLog: '',
  currentEncounter: null,
  roomsExplored: 0,
  dungeonConfig: null,
  hasUsedAction: false,
  hasUsedBonusAction: false,
  notifications: [],
  notificationsEnabled: true,
  isEditingCombat: false,
  npcHistory: [],
  pendingSubclassSelection: null,
  discoveredCompendiumQuests: {},
  lastLootResult: null
};

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


export const DUNGEON_ROOM_ENTRIES: string[] = [
  "The air shifts as you step inside, revealing a chamber shaped by time and neglect.",
  "Crossing the threshold, you feel the room watching you before you even see it.",
  "Your footsteps echo as the chamber unfolds before you, its secrets waiting in the dim light.",
  "A subtle chill greets you as the next room reveals itself, heavy with unspoken history.",
  "The shadows rearrange themselves as you enter, outlining the room’s strange features.",
  "The atmosphere thickens the moment you step inside, as if the room has been holding its breath.",
  "Dust swirls lazily in the air, disturbed by your arrival as the chamber opens around you.",
  "A faint sound — impossible to place — greets you as the new room comes into view.",
  "The room reveals itself slowly, as though reluctant to show its true shape.",
  "Crossing into the chamber, you sense that something here has been waiting.",
];

export const DUNGEON_ROOM_ENTRIES_WITH_DETAILS: Array<(type: string, feature: string) => string> = [
  (type, feature) => `The chamber ahead emerges from the gloom: a ${type.toLowerCase()}, marked by ${feature.toLowerCase()}.`,
  (_type, feature) => `The first thing you notice is the ${feature.toLowerCase()}. The rest of the room seems to bend around it, as if acknowledging its importance.`,
  (type, feature) => `The room opens before you, a ${type.toLowerCase()} dominated by ${feature.toLowerCase()}, each detail hinting at a story left unfinished.`,
  (_type, feature) => `The chamber reveals itself slowly, but the ${feature.toLowerCase()} stands out at once, anchoring the room’s entire atmosphere.`,
  (_type, feature) => `Even before you fully step inside, the presence of the ${feature.toLowerCase()} defines the space with quiet authority.`,
  (_type, feature) => `A subtle shift in the air draws your attention to the ${feature.toLowerCase()}, the room’s silent centerpiece.`
];

export const DUNGEON_COMPLETION: string[] = [
  "You feel the oppressive weight of the dungeon lift — you've reached its final threshold.",
  "The path ends here. Whatever shaped this place has no more rooms to show you.",
  "A sense of completion settles over you. The dungeon's last secret lies behind you now.",
  "Silence replaces tension. You've reached the dungeon's end.",
];

export const DUNGEON_NPC_INTROS = [
  {
    text: "A figure emerges from the shadows ahead — not attacking, not fleeing. Watching.",
    context: "They have been here long enough to know which shadows are safe.",
    oracle_suggested: true
  },
  {
    text: "Someone stands at the far wall, back to you, studying something you cannot yet see.",
    context: "Whatever they are looking at, they have not looked away since you entered.",
    oracle_suggested: false
  },
  {
    text: "A startled figure whirls toward you, hand reaching for a weapon before they stop themselves.",
    context: "The instinct to reach for a weapon suggests they have already had reason to use one today.",
    oracle_suggested: false
  },
  {
    text: "A figure stiffens at your approach, assessing — threat or salvation, they have not decided yet.",
    context: "The fact that they are still here suggests the way back is not as open as the way forward.",
    oracle_suggested: true
  },
  {
    text: "Someone sits on the floor, breathing carefully. They look up without surprise, as if they heard you coming.",
    context: "They are injured, or exhausted, or both — and still more alert than someone in that condition should be.",
    oracle_suggested: false
  },
  {
    text: "A lone figure traces something on the wall, stopping the moment your light reaches them.",
    context: "What they were tracing was not already there. They were adding to it.",
    oracle_suggested: true
  },
  {
    text: "Someone crouches near the center of the room, still, as if listening to something below the floor.",
    context: "They do not react to your arrival for three full seconds. Then they stand slowly and face you.",
    oracle_suggested: true
  },
  {
    text: "A figure leans against the wall, arms crossed, as if they have been waiting — specifically for someone, possibly for you.",
    context: "The posture is too relaxed for someone lost and too deliberate for someone resting.",
    oracle_suggested: true
  },
  {
    text: "You find someone already on the other side of the room, examining the exit.",
    context: "They found a way in. Whether they have found a way out is a different question.",
    oracle_suggested: false
  },
  {
    text: "A figure mutters quietly to themselves, stopping only when your presence becomes impossible to ignore.",
    context: "What they were saying was not prayer and not madness — it had the rhythm of something being memorized.",
    oracle_suggested: false
  },
  {
    text: "Someone stands completely still in the dark, visible only because they chose to let your light find them.",
    context: "They could have stayed hidden. They decided not to.",
    oracle_suggested: true
  },
  {
    text: "A wounded figure startles at your arrival, then relaxes — slightly — when they see you are alone.",
    context: "They are relieved you are alone. That implies what they are afraid of travels in groups.",
    oracle_suggested: false
  }
];

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
export const NPC_ROLES = ['Acolyte','Actor','Alchemist','Ambassadors','Apothecary', 'Arcane Tattooist', 'Arcanist', 'Archivist', 'Armorer', 'Astrologer', 'Auctioneer', 'Banker', 'Beast Handler', 'Blacksmith', 'Captain of the Guard', 'Captain of the guard', 'Caretaker', 'Carpenter', 'Charismatic bartender', 'Citizen', 'City guard', 'Cloth merchant', 'Councilor', 'Criminal', 'Croupier', 'Curator', 'Diplomat', 'Drunkard',
 'Eccentric painter', 'Elder wizard', 'Enchanter of magical objects', 'Entertainer', 'Exotic animal merchant', 'Farmer', 'Gambling master', 'Gardener', 'Gladiator', 'Glassblower', 'Governor', 'Governor’s secretary', 'Gravekeeper', 'Guard', 'Guard Captain', 'Gunsmith', 'Healer', 'Hermit', 'Host', 'Informants', 'Innkeeper', 'Judge', 'Landlord', 'Lay Priest', 'Librarian', 'Local Guide', 'Local noble',
 'Luthier', 'Madam', 'Magical calligrapher', 'Master builder', 'Merchant', 'Military equipment vendor', 'Miller', 'Monk', 'Music Teacher', 'Mysterious Stranger', 'Noble', 'Official', 'Ostler', 'Outfitter', 'Painter', 'Patrol guard', 'Peddler', 'Potter', 'Priest', 'Professor', 'Quartermaster', 'Reagent Merchant', 'Recruiting sergeant', 'Relic seller', 'Retired Adventurer', 'Sailor', 'Scholar', 'Scribe', 'Scribe of sacred texts', 'Scroll seller', 'Sculptor of animated statues', 'Secondhand dealer', 'Sentinel', 'Sergeant', 'Shopkeeper', 'Smuggler', 'Soldier', 'Street Performer', 'Tanner', 'Teacher', 'Temple keeper', 'Theater mask maker', 'Thief', 'Town Crier', 'Trader', 'Trainer', 'Vendor', 'Wandering bard','Warehouse Manager', 'Water Carrier','Wayfarer', 'Wizard'];
export const NPC_RACES = ['Aasimar', 'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling', 'Orc', 'Goliath', 'Dhampir', 'Faerie'];
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

export const WILDERNESS_BIOMES = [
  'Ancient Forest',
  'Jagged Mountains',
  'Murky Swamp',
  'Scorching Desert',
  'Open Plains',
  'Frozen Tundra'
];

export const WILDERNESS_TERRAINS = [...WILDERNESS_BIOMES];
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
  "You witness a pickpocket in action — a swift, practiced motion. The thief’s eyes snap to yours, sharp and assessing, as if weighing whether you’re a threat… or an opportunity.",
  "A runaway cart hurtles down the street, wheels rattling like thunder as pedestrians scatter. Something — or someone — must have set it loose.",
  "A masked figure bursts past you, cloak snapping in the wind, boots striking sparks on the cobblestones. Guards thunder after them, shouting orders you can’t quite make out.",
  "A merchant corners you in the street, eyes wild, clutching a trinket you’ve never seen. He swears you took it from him moments ago, his voice rising as bystanders begin to watch.",
  "A sudden clatter draws your gaze upward — figures sprint across the rooftops, leaping the gaps with desperate speed. One misjudges the jump and crashes down near you in a spray of tiles and dust.",
  "A street brawl erupts from a nearby tavern, spilling bodies and broken furniture into your path. Fists fly, bottles shatter, and the chaos threatens to swallow anyone too slow to step aside.",
  "A noble’s purse slips from their belt and lands at your feet, heavy with coin and sealed with an ornate crest. As you stoop to pick it up — whether to return it or pocket it — shouts ring out. The guards are pushing their way through the crowd, ready to capture you. Their reaction was too quick to be a coincidence",
  "A child bumps into you with practiced clumsiness. Only when their eyes widen in fear do you notice the stolen trinket they’ve slipped into your pack — and the angry shopkeeper barreling toward you, shouting accusations.",
  "A desperate shopkeeper pulls you aside, voice cracking with exhaustion. Each night, someone shatters his windows without leaving a trace. No footprints, no thrown stones, no witnesses — just the sound of breaking glass and the certainty that tonight it will happen again.",
  "A thief collapses at your feet, breath ragged, eyes wide with terror. Blood stains their collar as they clutch your arm and whisper, “Don’t let them find me…” Footsteps echo somewhere behind you — too many, too coordinated — and the thief’s grip tightens as if you’re their last hope.",
  "A cloaked figure lingers at the mouth of a narrow alley, their voice low and urgent as they beckon you closer. They claim to know your future — not in vague omens, but in chilling specifics. The way they speak your name suggests this meeting was never chance.",
  "A frantic man grabs your sleeve, trembling so violently he can barely stand. He insists invisible assassins stalk him, blades drawn, breath cold on his neck. No one else sees anything — yet the air around him feels wrong, as if something unseen shifts just out of sight.",
  "A woman rushes toward you, tears in her eyes, calling you by a name you’ve never heard. She clings to your arm with desperate relief, insisting you’re her long‑lost sibling returned at last. The crowd watches, murmuring — and the way she trembles suggests she’s either mistaken… or hiding something far more complicated.",
  "A street preacher stands atop a crate, voice booming through the marketplace as he declares that the end of days is not coming — it has already begun. He points at you specifically, as if you are a sign, an omen, or a catalyst in whatever prophecy he believes is unfolding.",
  "A drunk noble staggers into your path, wine‑stained and furious, demanding satisfaction for some imagined slight. He challenges you to a duel before a growing audience, and his entourage watches with a mix of amusement and dread — as though this isn’t the first time his pride has dragged someone into danger.",
  "A child tugs at your sleeve, clutching a battered toy that rattles with a life of its own. Wide‑eyed and trembling, they beg you to make it stop talking — though you hear nothing. Yet the toy’s seams pulse faintly, as if something inside is trying to push its way out.",
  "A courier barrels toward you, breathless and terrified, thrusting a sealed letter into your hands before sprinting away without explanation. Moments later, armed figures turn the corner, scanning the crowd — searching for whoever now carries that letter.",
  "A man stands in the middle of the street, shouting and gesturing wildly at empty air. His argument grows heated, one‑sided, and strangely specific — names, dates, accusations. The longer you watch, the more it feels like someone *is* answering him… just not someone you can see.",
  "A performer latches onto your presence with theatrical enthusiasm, trailing behind you while improvising a ballad about your ‘heroic deeds.’ The verses grow oddly specific — details you never shared, moments you never spoke of — as if the performer knows far more about you than a stranger should.",
  "A hooded beggar reaches out with a trembling hand, keeping their face hidden beneath layers of cloth. When they speak, the voice is unmistakably familiar — someone you knew, or someone you thought long gone — and they plead for you not to reveal them.",
  "A vendor waves you over with conspiratorial excitement, unveiling a ‘rare artifact’ that looks like an obvious fake… until it hums faintly in your hand. The vendor swears it’s genuine, but the way they watch your reaction suggests they know more about its true nature than they’re admitting.",
  "A spice merchant collapses at your feet, sweat pouring down his face as he gasps for water. His satchel spills open, releasing an overwhelming mix of exotic scents — and a few vials marked with symbols you don’t recognize. Between ragged breaths, he warns that someone has been sabotaging his stock.",
  "A jeweler frantically waves you over, hands shaking as he displays a case of gems that shimmer strangely. He swears they were real this morning, but now they flicker like illusions. He suspects a rival… or something far more arcane… has replaced them.",
  "A butcher leans across his stall, offering you a cut of meat at a price so low it borders on insulting. The slab looks fresh — too fresh — and he keeps glancing over his shoulder as if afraid someone might see the transaction. He insists you take it quickly, before ‘they’ notice it’s missing.",
  "A potion seller’s stall erupts in a burst of colorful smoke, each plume swirling with impossible hues. Bottles rattle, liquids glow, and the merchant coughs out apologies — or warnings — as onlookers scatter. In the chaos, one unbroken vial rolls to your feet, still warm and humming with unstable energy.",
  "A caravan rumbles into the city, its wagons painted in foreign symbols and pulled by creatures you’ve never seen. Merchants unload exotic goods while whispering stranger rumors — vanished cities, cursed roads, and a name spoken only in fear. They seem eager to trade… and even more eager to leave before nightfall.",
  "A baker leans over his counter and presses a warm pastry into your hands, insisting you look like you need it. His smile is kind, but his eyes flick nervously toward the alley behind his shop. Someone — or something — has been lurking there after dusk, and he clearly hopes you might be the sort who can help.",
  "A trader eyes something you carry — a mundane item by all accounts — and offers an absurdly high price for it. Their hands shake with eagerness, and they refuse to explain why they want it so badly. Other merchants nearby suddenly take interest, whispering among themselves.",
  "A street cook waves you over with a steaming bowl of their ‘famous’ stew. The smell is… questionable, a mix of spices and something you can’t quite place. They watch you intently, as if your reaction will confirm a long‑held suspicion — or break a curse.",
  "A merchant’s cart hits a rut and collapses, spilling crates that crack open to reveal strange contents: sealed jars of shifting liquid, metal pieces etched with runes, and one box that rattles on its own. The merchant panics, insisting you help gather them before anyone else sees.",
  "A parade surges through the street, a riot of color and sound as dancers whirl and musicians pound out a rhythm that shakes the cobblestones. The crowd presses in around you, and amid the celebration you notice masked performers watching you a little too closely — as if you’re the reason the parade stopped here.",
  "A sudden rainstorm crashes down without warning, turning the lower streets into rushing streams. People scramble for higher ground as debris floats past. In the chaos, you spot something unusual carried along by the flood — a sealed box bobbing toward a storm drain.",
  "A cat streaks past your legs, tail high, a shiny ring clenched in its teeth. It glances back at you with unsettling intelligence before darting into a maze of alleys. The ring glitters with an insignia you recognize… and someone nearby is shouting about a theft.",
  "A dog stands in your path, hackles raised, barking not at the crowd but directly at you. Its eyes track your every movement with uncanny focus. Its owner insists it never behaves this way — especially not unless it senses something… unusual.",
  "A group of children swarm around you, each shouting their version of events in a heated dispute over who cheated at their street game. They insist you act as the judge. As they argue, you notice the game pieces are carved with symbols far too intricate for simple play.",
  "A nearby rooftop groans, then collapses in a cloud of dust and shattered tiles. When the debris settles, it reveals a hidden room beneath the roof — untouched, sealed for years, and filled with objects that should not have been forgotten.",
  "A wedding procession winds through the street in a swirl of music and flower petals — until a frantic figure grabs your arm, begging you to stop it. Their voice trembles as they insist the marriage must not happen, hinting at a secret that could shatter more than just the celebration.",
  "A funeral procession passes solemnly by, mourners cloaked in black and carrying lanterns that flicker strangely in daylight. Someone at the rear catches your eye and urgently beckons you to join, whispering that the departed left a final message meant only for you.",
  "A street artist sits on a low stool, charcoal flying across the page as they sketch you without permission. When they turn the portrait around, it shows you not as you are now, but somewhere else — somewhere you haven’t been yet — and the background is unmistakably real.",
  "A city bell tolls without warning, its deep clang cutting through the noise of the streets. People freeze, panic rippling outward as shopkeepers slam shutters and citizens scatter. No one seems to know why it rang — but several glance toward the old bell tower, whispering that it only sounds when something terrible is coming.",
  "A shadow stretches across the wall beside you, moving against the direction of the light. It twists, recoils, and then reaches out as if aware of your presence. When you turn, nothing stands there — yet the shadow lingers a heartbeat longer than it should, as though deciding whether to follow.",
  "A door slams shut behind you with a force that rattles the frame, though the air is still and no wind stirs. The latch clicks on its own. From the other side comes a faint sound — a whisper, a shuffle, or perhaps someone breathing — as if the room you just left is no longer empty.",
  "A statue’s eyes seem to follow you, no matter where you stand. Its gaze feels intentional, almost aware, and you notice faint scratches at its base — as if someone tried to move it recently… or as if it moved itself.",
  "A whisper drifts up from a sewer grate, soft and unmistakably calling your name. The voice is calm, almost conversational, yet the darkness below reveals nothing but cold air and the distant sound of dripping water.",
  "A strange symbol flickers into existence on a nearby wall, glowing faintly as if drawn in light rather than ink. The lines shift when you’re not looking directly at them, and the glow pulses like a heartbeat — as though the mark is waiting for someone to respond.",
  "A raven swoops down from nowhere, landing with uncanny precision before you. It drops an old iron key at your feet, cocks its head as if expecting you to understand, and then takes off with a harsh cry. The key is cold — far colder than the warm air around you — and etched with a symbol you’ve seen only in forgotten stories.",
  "A stranger brushes past you in the crowd, slipping a torn map fragment into your hand without breaking stride. By the time you turn, they’ve vanished completely. The fragment shows only a sliver of a place — a coastline, a tower, a warning — and the edges look burned, as if someone tried to destroy it.",
  "A cold breeze passes straight through you, chilling your bones despite the warm day. The air around you ripples, just for a moment, like heat haze in reverse. People nearby shiver without knowing why, and you’re left with the unsettling sense that something unseen just walked through you.",
  "A hooded figure stands on a nearby rooftop, perfectly still despite the wind tugging at their cloak. Their attention is fixed solely on you — not the street, not the crowd, *you*. When you blink, they’ve shifted position, closer to the edge, as if preparing to leap… or signal.",
  "A lantern beside you sputters violently, its flame stretching unnaturally long before bursting in a shower of sparks. The glass shatters at your feet, and for a heartbeat the smoke curls into a shape — a face, watching — before dissolving into the warm air.",
  "A guild recruiter intercepts your path with a practiced smile and a badge glinting on their chest. They speak quickly, urgently, promising opportunity, coin, and protection. But their eyes keep darting over your shoulder, as though someone else is very interested in whether you accept.",
  "A scholar approaches you with ink‑stained fingers and frantic eyes, begging for help retrieving a lost book. They claim it wasn’t merely misplaced — it was *taken*, and the thief knew exactly what they were stealing. The scholar hints the book contains knowledge that should never be read aloud.",
  "A noble dressed in immaculate finery invites you to a private dinner — tonight, and with surprising urgency. Their smile is polite, but their gaze flickers with something sharper. Servants whisper that the noble only extends such invitations when they need a problem solved… discreetly.",
  "A guard stops you with a weary sigh, asking for your opinion on a local dispute. Two citizens argue nearby, each insisting the law is on their side. The guard seems less interested in justice and more in what *you* decide — as though your answer might influence more than just a neighborhood quarrel.",
  "A priest approaches you with a serene smile, offering a blessing… for a donation. Their holy symbol glints strangely in the light, and their voice carries an urgency that doesn’t match their calm expression. As they raise a hand to bless you, you notice faint scorch marks on their sleeve — as if their rituals have been anything but peaceful lately.",
  "A traveling bard hurries to your side, lute slung over their shoulder and eyes bright with excitement. They ask to accompany you for ‘inspiration,’ claiming your presence sparks melodies they’ve never heard before. Yet every so often, they jot down notes not in musical script, but in coded symbols you can’t decipher.",
  "A courier rushes toward you, clutching a small, tightly wrapped package. They beg for your help delivering it safely, insisting they’re being followed. The parcel is surprisingly heavy for its size, and when you take it, you feel something shift inside — as if whatever’s within is very much awake.",
  "A local artisan approaches you with calloused hands and a spark of excitement in their eyes, offering to craft something for you at a generous discount. As they speak, they keep glancing toward a locked chest in their workshop — a chest that rattles softly, as if something inside is eager to be shaped… or freed.",
  "A tavern owner rushes toward you, wiping their hands on an apron stained with ale and worry. They beg you to deal with a troublesome patron who refuses to leave. The odd part? The patron sits alone, silent, staring into an untouched drink that reflects not the tavern — but a different room entirely.",
  "A group of adventurers waves you over, boasting about their next job and asking if you want to join. Their leader grins confidently, but the others exchange uneasy looks. Their map is marked with a destination that’s been crossed out in three different inks, each with a warning scrawled beside it — and one of those warnings is written in your handwriting.",
  "A floating orb of light drifts lazily down the street, weaving between people as if searching for someone. Its glow shifts colors when it nears you, pulsing like a heartbeat. A few onlookers whisper that such orbs only appear when a message — or a warning — is meant to be delivered.",
  "A spell misfires nearby with a sharp crack, and a startled apprentice stares in horror as their target’s hair turns an electric, impossibly bright blue. The color shimmers with a faint magical aura, refusing to fade. The victim demands help, while the apprentice mutters that this particular spell shouldn’t even *exist* anymore.",
  "A magical creature bursts from a wizard’s workshop, scattering scrolls and alchemical tools as it flees. It’s small, quick, and undeniably mischievous, leaving a trail of sparkling footprints that evaporate seconds later. The wizard shouts after you to catch it — before it finds something even more dangerous to play with.",
  "A ghostly figure drifts across your path, translucent and silent, passing through bustling crowds that don’t react at all. Its hollow eyes lock onto yours with chilling intent before it continues on, pointing toward a distant alley. When you glance back, the alley is suddenly much darker than it should be.",
  "A wizard’s familiar — a small creature with too‑bright eyes and an aura of crackling magic — trots up to you carrying a sealed scroll. It drops the message at your feet, then waits expectantly. The seal bears a sigil you’ve never seen, and the parchment trembles faintly, as if eager to be opened.",
  "A magical storm churns above the rooftops, arcs of violet lightning dancing between swirling clouds. The air hums with raw energy, making your hair stand on end. Locals flee indoors, whispering that such storms only form when a powerful spell goes wrong… or when something ancient is waking.",
  "A cursed object rolls to your feet, stopping with deliberate precision as if it chose you. Its surface is etched with runes that shift when you blink, and a faint whisper curls from within — a voice pleading, bargaining, or warning. People nearby instinctively step back, refusing to even look at it.",
  "A street performer strums a lively tune, juggling sparks of harmless magic — until one spark swells, twists, and tears open a tiny rift. Something small and skittering tumbles out, chittering with too many teeth. The performer freezes in horror, insisting this has *never* happened before, while the creature scampers toward the nearest shadow.",
  "A magical duel erupts between two mages in the middle of the street, spells crackling like thunder as bystanders dive for cover. One mage shouts accusations of betrayal, the other denies everything — but both seem terrified of losing. Their magic warps the air, bending light and sound, and you realize the duel’s outcome might affect far more than their pride.",
  "A portal flickers open for a moment, revealing a place that is unmistakably *elsewhere* — a forest of crystal trees, a burning desert under two moons, or a city floating upside‑down. The edges of the portal crackle as if straining to stay open, and just before it snaps shut, you swear you see a silhouette reaching toward you.",
  "A gang steps out from an alley, blocking your path with smug grins and makeshift weapons. They demand a ‘street tax,’ insisting everyone pays if they want to walk safely. But their leader keeps eyeing something behind you — as though they’re more afraid of what’s following you than you are of them.",
  "A monster breaks free from a cage cart with a roar that shakes the cobblestones. The handlers scatter, shouting warnings about its strength, its hunger, or its unfinished training. The creature’s eyes lock onto you — not with malice, but with recognition, as if it’s seen you before in a place you don’t remember.",
  "A rooftop assassin takes a shot at someone nearby, the arrow slicing through the air with a sharp hiss before embedding itself in a wooden post inches from its intended target. The assassin doesn’t flee — instead, they linger just long enough for you to see a glint of recognition in their eyes, as if the miss was intentional… or a warning meant for you.",
  "A pack of stray dogs suddenly becomes aggressive, hackles raised and teeth bared. Their growls aren’t directed at you at first — they’re staring at an empty patch of street, circling it as though something unseen stands there. When they finally turn toward you, their eyes glow faintly, reflecting a threat you can’t yet see.",
  "A fire elemental bursts free from a forge in a plume of molten sparks, its form shifting between humanoid shape and roaring flame. The blacksmith shouts for help, insisting the creature wasn’t summoned — it was *born* from something hidden deep within the metal. The elemental pauses when it sees you, its flames dimming as if it recognizes your presence.",
  "A criminal mistakes you for their target, grabbing your arm with a mix of triumph and desperation. The moment they see your face, their expression collapses into panic — not fear of you, but fear of whoever they were *supposed* to meet. Before fleeing, they shove a small token into your hand, whispering, 'If they ask… you never saw me.'",
  "A bounty hunter confronts you, claiming you match a description on a high‑value contract. They hold a sketch that looks unsettlingly similar to you — except for one detail that feels almost intentional, as if someone wanted you implicated. The hunter hesitates, watching your reaction closely, as though testing whether you’ll lie.",
  "A group of mercenaries blocks the road, demanding passage fees with the confidence of people who rarely hear ‘no.’ Their banner is unfamiliar, stitched with a symbol that seems recently added. Their leader sizes you up, not just for coin, but for threat — and you get the sense they’re guarding something far more important than a simple toll route.",
  "A wild‑eyed alchemist hurls volatile vials during an argument, each one bursting in flashes of color and acrid smoke. Their rant is half‑nonsense, half‑genius, and the crowd scatters as a vial rolls to your feet, humming with unstable energy. The alchemist freezes when they see you, whispering, 'Don’t let *them* take it back.'",
  "A giant rat swarm erupts from a sewer grate, chittering in a frenzy as they flood the street like a living tide. Their eyes glow with an unnatural sheen, and they move with eerie coordination — not random panic, but purpose. At their center, a larger rat watches you with unsettling intelligence.",
  "Someone leans close and whispers a rumor about a hidden treasure beneath the city, their voice trembling with excitement or fear — it’s hard to tell. They mention sealed tunnels, forgotten vaults, and a guardian that 'doesn’t stay dead.' Before you can ask more, they vanish into the crowd as if they regret speaking at all.",
  "A priest warns you of strange happenings in the catacombs, their voice trembling despite their attempts at calm. They describe whispers echoing through sealed corridors and shadows that move against the torchlight. As they speak, you notice a faint smear of dust on their robes — the kind found only deep underground — and a symbol hastily scratched onto their holy pendant, as if for protection.",
  "A child tugs at your sleeve, claiming their friend vanished near an abandoned house. Their eyes are wide, not with mischief but genuine fear. They insist they heard their friend calling from inside the boarded‑up building, even though no one else did. When you glance toward the house, one of the shutters creaks open on its own.",
  "A tavern patron leans in close, lowering their voice to a conspiratorial whisper as they tell you about a haunted warehouse by the docks. They swear crates move on their own and lanterns flicker even without wind. The patron’s hands shake slightly as they mention a name — someone who went to investigate last week and hasn’t been seen since.",
  "A merchant swears their goods are being stolen by ghosts, waving their arms wildly as they points to crates that have shifted positions on their own. They insist the thefts happen only at night, and only when no one is watching. As they speak, a cold breeze brushes past you — and one of the crates creaks open just a crack, as if something inside is listening.",
  "A guard mentions a bounty on a dangerous fugitive, lowering their voice as though the fugitive might be hiding nearby. They describe a figure who changes appearance frequently, using magic or trickery to stay ahead of pursuit. When the guard studies your face a moment too long, you realize the fugitive’s last known disguise might look uncomfortably familiar.",
  "A noble seeks discreet help with a 'family matter,' choosing their words carefully as they glance around to ensure no one overhears. Their hands tremble slightly despite their polished composure. They hint at a scandal, a curse, or perhaps a missing heir — but whatever the truth is, they promise generous payment… and warn that refusing might draw unwanted attention from their rivals.",
  "A map seller offers a map to a forbidden district, their voice dropping to a conspiratorial murmur as they unroll parchment that smells faintly of ash. The streets on the map twist in ways that don’t match the city you know, and certain areas are marked with symbols that shift when you look away. The seller’s hands tremble slightly — whether from fear or excitement is unclear — as they warn you not to follow the red line unless you’re prepared for what watches from the shadows.",
  "A drunk claims to have seen a monster in the river, slurring their words but clutching your sleeve with desperate strength. They describe glowing eyes beneath the water and a shape that moved against the current. Their breath reeks of ale, yet their fear is unmistakably real. As they speak, a distant splash echoes from the riverbank, far too loud for any fish.",
  "A secret society member mistakes you for an initiate, pressing a small, wax‑sealed token into your hand before you can protest. Their hood hides most of their face, but you catch a glimpse of relief — as if your arrival was expected. They whisper a meeting place and vanish into the crowd. The token grows warm in your palm, pulsing like a heartbeat.",
  "A riot breaks out over food shortages, the crowd surging like a living wave as shouts echo through the streets. People clutch empty baskets and torn ration slips, their desperation boiling into fury. In the chaos, someone grabs your arm and hisses, 'They’re hiding the real stockpiles — follow me if you want proof,' before disappearing into the mob.",
  "A fire spreads rapidly through a nearby block, flames leaping from rooftop to rooftop with unnatural speed. The heat hits you in a sudden, suffocating wave, and panicked citizens scramble to form bucket lines. Amid the smoke, you spot a figure calmly watching the blaze — too calm — their silhouette flickering as if the fire recognizes them.",
  "A magical explosion rocks the district, a shockwave of shimmering energy rippling through the air and rattling windows. The blast leaves behind a crater humming with residual power, arcs of light crackling across its surface. As dust settles, a single object lies at the center — intact, glowing faintly, and pulsing like it’s waiting for someone specific to pick it up.",
  "A noble’s procession demands the streets be cleared, armored guards shouting for citizens to step aside as a lavish carriage rolls through. The curtains are drawn tight, but you catch a glimpse of a pale hand clutching the fabric from within. One guard rides closer than necessary, eyeing you as though checking your face against a description.",
  "A massive creature emerges from the sewers, sludge dripping from its matted fur as it hauls itself onto the street. People scatter in terror, but the creature doesn’t attack — it sniffs the air, confused, as if searching for something it lost. When its gaze lands on you, it freezes, recognition flickering in its eyes.",
  "A plague doctor warns of an outbreak, their beaked mask reflecting the torchlight as they approach with urgent steps. They speak of strange symptoms, sudden disappearances, and a patient who muttered your name before collapsing. As they turn to leave, a faint cough echoes from somewhere behind you — one that wasn’t there a moment ago.",
  "A famous hero arrives in town, drawing huge crowds. People cheer and surge forward, desperate for a glimpse, but the hero’s expression is tense — almost haunted. As they pass, their gaze briefly locks with yours, widening in recognition, as if they’ve seen you in a prophecy… or a warning.",
  "A city-wide alarm sounds — something terrible has happened. Bells ring, horns blare, and enchanted sigils flare to life on every street corner. Citizens rush for shelter while guards sprint toward the disturbance. A messenger shouts that the alarm hasn’t been triggered in decades — not since the last great catastrophe.",
  "A dragon flies overhead, causing panic as its shadow sweeps across the rooftops. Its scales shimmer with unnatural light, and it circles the city as though searching for something — or someone. When it roars, the sound carries a strange resonance, like a voice trying to form words.",
  "A full-scale monster attack erupts in the streets, creatures pouring from alleys, sewers, and even cracks in the cobblestones. Chaos explodes around you as guards struggle to form defensive lines. In the midst of the frenzy, one monster pauses, sniffing the air before turning directly toward you with unsettling purpose."
];

export const CAMP_DISTURBANCE_CATEGORIES = [
  { name: "Sounds & Environment", range: [1, 15] },
  { name: "Wildlife", range: [16, 35] },
  { name: "Dreams & Visions", range: [36, 50] },
  { name: "Visitors", range: [51, 70] },
  { name: "Threats", range: [71, 90] },
  { name: "Strange & Unexplained", range: [91, 100] }
];

export const FACTION_TYPES = [
  'Mercenary Company', 'Thieves\' Guild', 'Arcane Circle', 'Religious Order', 
  'Merchant Consortium', 'Noble House', 'Secret Society', 'Knightly Order',
  'Druidic Circle', 'Bardic College', 'Criminal Syndicate', 'Cult', 'Assassins\' Brotherhood', 'Inquisition', 'Explorers\' Society', 
  'Underground Railroad', 'Pirate Confederation', 'Alchemists\' Guild'
];

export const FACTION_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good', 
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

export const FACTION_INFLUENCE = [
  'Minimal', 'Local', 'Regional', 'National', 'Continental', 'Global', 'Planar'
];

export const FACTION_GOALS = [
  'Accumulate Wealth',
  'Seize Political Control',
  'Protect the Vulnerable',
  'Uncover Forbidden Knowledge',
  'Spread a Faith by Any Means',
  'Preserve the Existing Order',
  'Overthrow the Current Power',
  'Erase a Rival from History',
  'Achieve Immortality',
  'Monopolize a Critical Resource',
  'Awaken Something That Should Stay Dormant',
  'Survive at All Costs',
  'Reclaim Lost Territory or Status',
  'Prevent a Prophesied Event',
  'Fulfill a Prophesied Event',
  'Find Something That Has Been Hidden Deliberately',
  'Control the Flow of Information'
];

export const FACTION_MOTTOS = [
    'What Is Owed Will Be Collected',
  'The Door Closes Behind You',
  'We Remember What Others Prefer Forgotten',
  'The Work Continues',
  'Ask No Questions You Cannot Afford to Answer',
  'Everything Has a Price — We Know the Price',
  'The Light Shows Too Much',
  'One Way In',
  'We Were Here Before and We Will Be Here After',
  'It Is Already Done',
  'The Second Option Is Always Worse',
  'Name Your Terms',
  'Not Yet',
  'This Is What Was Agreed'
];
