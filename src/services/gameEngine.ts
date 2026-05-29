/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SKILL_ATTRIBUTES, DUNGEON_THEMES, SETTLEMENT_NAMES, SETTLEMENT_TYPES, WILDERNESS_TERRAINS, WILDERNESS_WEATHER, SETTLEMENT_EVENTS, WILDERNESS_BIOMES, NPC_NAMES, NPC_ROLES, NPC_RACES, NPC_ALIGNMENTS, NPC_DISPOSITIONS, NPC_TRAITS, NPC_GOALS, NPC_SECRETS, SETTLEMENT_CONFIG, DISTRICT_TYPES, DISTRICT_LOCATIONS, DISTRICT_DISTURBANCES, LOCATION_NAME_TEMPLATES, URBAN_ENCOUNTERS, FACTION_TYPES, FACTION_ALIGNMENTS, FACTION_INFLUENCE, FACTION_GOALS, FACTION_MOTTOS, CAMP_DISTURBANCE_CATEGORIES, DUNGEON_NPC_INTROS } from '../constants';
import { RANDOM_EVENTS, SKILL_CHALLENGES, BOON, BANE, DungeonEvent, DungeonType, TRAPS, Trap } from '../data/DungeonEvent';
import { OracleResult, Room, RoomRolls, Enemy, Item, Character, Skill, Settlement, WildernessTravel, Location, NPC, SettlementType, District, DistrictType, DistrictDisturbance, LootItem, Attribute, Ability, Faction, EncounterSuggestion, ItemQuest, LootResult, VendorMap, VendorProfile, Encounter, DungeonNPCIntro, DungeonClue, QuestTone, Quest, Situation } from '../types';
import { 
  FACTION_DESCRIPTION_TEMPLATES, 
  FACTION_HOOK_TEMPLATES,
  FACTION_SECRET_TEMPLATES,
  FACTION_GOAL_NARRATIVE
} from '../data/faction-templates';
import ITEMS_DATA from '../data/items.json';
import BESTIARY_DATA from '../data/bestiary.json';
import ITEM_QUEST_DATA from '../data/item_quest_tables.json';
import LOOT_DATA from '../data/loot_tables.json';
import VENDOR_MAP_DATA from '../data/vendor_map.json';
import ENCOUNTERS_DATA from '../data/encounters.json';
import { SITUATIONS, CRACKS, COSTS_OF_INACTION, HIDDEN_TWISTS, OPEN_QUEST_INCIPTS } from '../data/quests';

export const ENCOUNTER_BUDGETS: Record<number, Record<string, number>> = {
  1: { Easy: 0.125, Medium: 0.25, Hard: 0.5, Deadly: 1 },
  2: { Easy: 0.25, Medium: 0.5, Hard: 1, Deadly: 2 },
  3: { Easy: 0.5, Medium: 1, Hard: 2, Deadly: 3 },
  4: { Easy: 1, Medium: 2, Hard: 3, Deadly: 4 },
  5: { Easy: 2, Medium: 3, Hard: 5, Deadly: 7 },
  6: { Easy: 2, Medium: 3, Hard: 6, Deadly: 8 },
  7: { Easy: 3, Medium: 4, Hard: 7, Deadly: 9 },
  8: { Easy: 3, Medium: 5, Hard: 8, Deadly: 10 },
  9: { Easy: 4, Medium: 6, Hard: 9, Deadly: 12 },
  10: { Easy: 5, Medium: 7, Hard: 10, Deadly: 13 },
  11: { Easy: 6, Medium: 8, Hard: 11, Deadly: 15 },
  12: { Easy: 6, Medium: 9, Hard: 12, Deadly: 16 },
  13: { Easy: 7, Medium: 10, Hard: 13, Deadly: 17 },
  14: { Easy: 8, Medium: 11, Hard: 14, Deadly: 18 },
  15: { Easy: 9, Medium: 12, Hard: 15, Deadly: 19 },
  16: { Easy: 10, Medium: 13, Hard: 16, Deadly: 20 },
  17: { Easy: 11, Medium: 14, Hard: 17, Deadly: 21 },
  18: { Easy: 12, Medium: 15, Hard: 18, Deadly: 22 },
  19: { Easy: 13, Medium: 16, Hard: 19, Deadly: 23 },
  20: { Easy: 14, Medium: 17, Hard: 20, Deadly: 24 },
};

export const generateEncounterSuggestions = (
  playerLevel: number,
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly',
  availableEnemies: Omit<Enemy, 'id'>[],
  typeFilter?: string,
  environmentFilter?: string
): EncounterSuggestion[] => {
  const budget = ENCOUNTER_BUDGETS[playerLevel]?.[difficulty] || 1;
  const suggestions: EncounterSuggestion[] = [];
  const usedNames = new Set<string>();

  // Filter and shuffle enemies
  let filteredEnemies = [...availableEnemies];
  if (typeFilter && typeFilter !== 'All') {
    filteredEnemies = filteredEnemies.filter(e => e.type === typeFilter);
  }
  if (environmentFilter && environmentFilter !== 'All') {
    filteredEnemies = filteredEnemies.filter(e => e.environment?.includes(environmentFilter));
  }
  
  // Shuffle
  filteredEnemies.sort(() => Math.random() - 0.5);

  const getEffectiveCR = (totalRawCR: number, count: number): number => {
    let multiplier = 1.0;
    if (count === 2) multiplier = 1.5;
    else if (count >= 3 && count <= 6) multiplier = 2.0;
    else if (count >= 7) multiplier = 2.5;
    return totalRawCR * multiplier;
  };

  const isValid = (effectiveCR: number, budget: number): boolean => {
    return effectiveCR >= budget * 0.85 && effectiveCR <= budget * 1.15;
  };

  const getCalculationCR = (cr: number): number => (cr === 0 ? 0.1 : cr);

  // Patterns
  const patterns = [
    { name: 'Single', count: 1 },
    { name: 'Twin', count: 2 },
    { name: 'Small Group', count: 3 },
    { name: 'Horde', count: 5 }, // 4-6, using 5 as representative
  ];

  for (const pattern of patterns) {
    if (suggestions.length >= 5) break;
    if (pattern.name === 'Horde' && budget < 2) continue;

    for (const enemy of filteredEnemies) {
      if (suggestions.length >= 5) break;
      if (usedNames.has(enemy.name)) continue;

      const rawCR = getCalculationCR(enemy.cr) * pattern.count;
      const effectiveCR = getEffectiveCR(rawCR, pattern.count);

      if (isValid(effectiveCR, budget)) {
        suggestions.push({
          enemies: [{ name: enemy.name, cr: enemy.cr, count: pattern.count }],
          totalCR: rawCR,
          effectiveCR,
          budget,
          label: `${pattern.count}× ${enemy.name}`
        });
        usedNames.add(enemy.name);
        break; // Move to next pattern or next enemy for different suggestion
      }
    }
  }

  // Mixed Group Pattern (1 Strong + 1-2 Weak)
  if (suggestions.length < 5) {
    for (const strong of filteredEnemies) {
      if (suggestions.length >= 5) break;
      if (usedNames.has(strong.name)) continue;

      for (const weak of filteredEnemies) {
        if (strong.name === weak.name) continue;
        
        // Try 1 strong + 1 weak
        let count = 2;
        let rawCR = getCalculationCR(strong.cr) + getCalculationCR(weak.cr);
        let effectiveCR = getEffectiveCR(rawCR, count);
        
        if (isValid(effectiveCR, budget)) {
          suggestions.push({
            enemies: [
              { name: strong.name, cr: strong.cr, count: 1 },
              { name: weak.name, cr: weak.cr, count: 1 }
            ],
            totalCR: rawCR,
            effectiveCR,
            budget,
            label: `1× ${strong.name} + 1× ${weak.name}`
          });
          usedNames.add(strong.name);
          break;
        }

        // Try 1 strong + 2 weak
        count = 3;
        rawCR = getCalculationCR(strong.cr) + (getCalculationCR(weak.cr) * 2);
        effectiveCR = getEffectiveCR(rawCR, count);

        if (isValid(effectiveCR, budget)) {
          suggestions.push({
            enemies: [
              { name: strong.name, cr: strong.cr, count: 1 },
              { name: weak.name, cr: weak.cr, count: 2 }
            ],
            totalCR: rawCR,
            effectiveCR,
            budget,
            label: `1× ${strong.name} + 2× ${weak.name}`
          });
          usedNames.add(strong.name);
          break;
        }
      }
    }
  }

  return suggestions.slice(0, 5);
};

export const crToNumber = (cr: string): number => {
  if (!cr) return 0;
  if (cr.includes('/')) {
    const [num, den] = cr.split('/');
    return parseInt(num) / parseInt(den);
  }
  return parseFloat(cr) || 0;
};

const parseBestiaryEntry = (entry: any): Omit<Enemy, 'id'> => {
  // Parse HP: "15 (2d8 + 6)" -> 15
  const hpStr = entry.HP?.toString() || "10";
  const hpMatch = hpStr.match(/^(\d+)/);
  const hp = hpMatch ? parseInt(hpMatch[1]) : 10;

  // Parse CR: "1/4 (XP 50; PB +2)"
  const crStr = entry.CR?.toString() || "0";
  const crMatch = crStr.match(/^(\d+\/\d+|\d+)/);
  const cr = crToNumber(crMatch ? crMatch[1] : "0");
  const xpMatch = crStr.match(/XP\s*(\d+)/);
  const xpValue = xpMatch ? parseInt(xpMatch[1]) : 10;

  // Stats
  const stats: Record<Attribute, number> = {
    'Strength': entry.Strength || 10,
    'Dexterity': entry.Dexterity || 10,
    'Constitution': entry.Constitution || 10,
    'Intelligence': entry.Intelligence || 10,
    'Wisdom': entry.Wisdom || 10,
    'Charisma': entry.Charisma || 10
  };

  const abilities: Ability[] = [];

  // Parse Traits
  if (entry.Traits) {
    const traitBlocks = entry.Traits.split('\n\n');
    traitBlocks.forEach((block: string, index: number) => {
      if (!block.trim()) return;
      const nameMatch = block.match(/^([^.]+)\./);
      const name = nameMatch ? nameMatch[1].trim() : 'Trait';
      abilities.push({
        id: `trait-${entry.Name}-${index}`,
        name,
        description: block.trim(),
        type: 'passive'
      });
    });
  }

  // Parse Actions
  let primaryAttackBonus = 0;
  let primaryDamage = '1d6';
  
  if (entry.Actions) {
    const actionBlocks = entry.Actions.split('\n\n');
    actionBlocks.forEach((block: string, index: number) => {
      if (!block.trim()) return;
      const nameMatch = block.match(/^([^.]+)\./);
      const name = nameMatch ? nameMatch[1].trim() : 'Action';
      const description = block.trim();
      
      const attackMatch = block.match(/Attack Roll:\s*\+?(\d+)/);
      const attackBonus = attackMatch ? parseInt(attackMatch[1]) : 0;
      
      const damageMatch = block.match(/Hit:\s*\d+\s*\(([^)]+)\)/);
      const damage = damageMatch ? damageMatch[1].replace(/\s+/g, '') : undefined;

      if (index === 0) {
        primaryAttackBonus = attackBonus;
        primaryDamage = damage || '1d6';
      }

      abilities.push({
        id: `action-${entry.Name}-${index}`,
        name,
        description,
        type: 'action',
        attackBonus,
        damage
      });
    });
  }

  // Bonus Actions and Reactions
  ['Bonus Actions', 'Reactions'].forEach(type => {
    const key = type as keyof any;
    if (entry[key]) {
      const blocks = entry[key].split('\n\n');
      blocks.forEach((block: string, index: number) => {
        if (!block.trim()) return;
        const nameMatch = block.match(/^([^.]+)\./);
        const name = nameMatch ? nameMatch[1].trim() : type.slice(0, -1);
        abilities.push({
          id: `${type.toLowerCase().replace(' ', '-')}-${entry.Name}-${index}`,
          name,
          description: block.trim(),
          type: type === 'Bonus Actions' ? 'bonus_action' : 'reaction'
        });
      });
    }
  });

  return {
    name: entry.Name || 'Unknown',
    hp,
    maxHp: hp,
    ac: entry.AC || 10,
    attackBonus: primaryAttackBonus,
    damage: primaryDamage,
    xpValue,
    cr,
    type: entry.Type || 'Monster',
    size: entry.Size,
    alignment: entry.Alignment,
    stats,
    abilities,
    savingThrows: entry["Saving Throws"],
    skills: entry.Skills,
    vulnerabilities: entry["Damage Vulnerabilities"],
    resistances: entry["Damage Resistances"],
    immunities: entry["Damage Immunities"],
    conditionImmunities: entry["Condition Immunities"],
    senses: entry.Senses,
    languages: entry.Languages,
    environment: entry.Environment,
    treasure: entry.Treasure,
    description: entry.Description
  };
};

export const ALL_BESTIARY_ENEMIES = (() => {
  const bestiaryEnemies = (BESTIARY_DATA as any[]).map(parseBestiaryEntry);
  return bestiaryEnemies;
})();

export const rollDice = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const generateOpenQuest = (): string => {
  return OPEN_QUEST_INCIPTS[rollDice(OPEN_QUEST_INCIPTS.length) - 1];
};

export const rollDiceExpression = (expression: string): number => {
  if (!expression) return 0;
  
  // Handle multiplication like "2d6*10"
  let multiplier = 1;
  let dicePart = expression;
  if (expression.includes('*')) {
    const parts = expression.split('*');
    dicePart = parts[0].trim();
    multiplier = parseInt(parts[1].trim()) || 1;
  }

  const diceRegex = /(\d+)d(\d+)/;
  const match = dicePart.match(diceRegex);
  
  if (match) {
    const numDice = parseInt(match[1]);
    const sides = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += rollDice(sides);
    }
    return total * multiplier;
  }

  return parseInt(expression) || 0;
};

export const getModifier = (stat: number): number => {
  const s = Number(stat) || 10;
  return Math.floor((s - 10) / 2);
};

export const getProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

export const generateItemQuest = (rarity: string): ItemQuest | undefined => {
  if (!rarity) return undefined;
  const rarityKey = rarity.toLowerCase().replace(' ', '_');
  const table = (ITEM_QUEST_DATA.item_quest_tables as any)[rarityKey];
  
  if (!table) return undefined;

  const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    hook: randomFrom(table.hooks),
    origin: randomFrom(table.origins),
    quest_type: randomFrom(table.quest_types),
    steps: randomFrom(table.steps_pools),
    reward_hint: randomFrom(table.reward_hints),
    oracle_seed: randomFrom(table.oracle_seeds)
  };
};

export const calculateAc = (character: Character): number => {
  const dexMod = getModifier(character.stats.Dexterity);
  const armor = character.inventory.find(i => i.type === 'Armor' && !i.subType?.includes('Shield') && i.isEquipped);
  const shield = character.inventory.find(i => i.subType?.includes('Shield') && i.isEquipped);
  
  let ac = character.baseAc || 10;
  if (armor) {
    const armorAc = armor.bonus || 10;
    if (armor.subType?.includes('Heavy')) {
      ac = armorAc;
    } else if (armor.subType?.includes('Medium')) {
      ac = armorAc + Math.min(dexMod, 2);
    } else {
      ac = armorAc + dexMod;
    }
  } else {
    ac += dexMod;
  }
  
  if (shield) {
    ac += shield.bonus || 0;
  }
  
  return ac + (character.acBonus || 0);
};

export const getXpRequired = (level: number): number => {
  const thresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  const idx = Math.max(0, Math.min(level - 1, thresholds.length - 1));
  return thresholds[idx];
};

export const getPrevXpThreshold = (level: number): number => {
  return getXpRequired(level);
};

export const getSuggestedRoleForLocation = (locationType: string): string => {
  const mapping: Record<string, string> = {
    // Artists
    "Painters' Atelier": "Painter",
    'Music School': 'Music Teacher',
    'Theater': 'Actor',
    'Music Shop': 'Luthier',
    'Art Gallery': 'Curator',
    'Runic Tattoo Shop': 'Arcane Tattooist',
    'Performance Plaza': 'Street Performer',
    
    // Arcane
    "Wizard's Tower": "Wizard",
    'Arcane Academy': 'Professor',
    'Arcane Supplies': 'Reagent Merchant',
    'Alchemical Shop': 'Alchemist',
    'Scroll Vendor': 'Scribe',
    'Magic Items Vendor': 'Arcanist',
    
    // Trade
    'Central Market': 'Trader',
    "Adventurer's Shop": "Outfitter",
    'Bank or Exchange House': 'Banker',
    'General Emporium': 'Shopkeeper',
    'Animal Market': 'Beast Handler',
    'Auction House': 'Auctioneer',
    
    // Religious
    'Great Temple': 'High Priest',
    'Minor Chapel': 'Monk',
    'Sacred Garden': 'Gardener',
    'Mausoleum': 'Gravekeeper',
    'Hospital': 'Healer',
    
    // Entertainment
    'Taverns and Inns': 'Innkeeper',
    'Gambling House': 'Croupier',
    'Clandestine Arena': 'Gladiator',
    'Brothel': 'Madam',
    'Smuggling Alleys': 'Smuggler',
    "Thieves' Guild Hideout": "Thief",
    
    // Government
    "Governor's Palace": "Governor",
    'Council Hall': 'Councilor',
    'City Archive': 'Archivist',
    'City Guard Barracks': 'Captain of the Guard',
    'Courthouse': 'Judge',
    'Embassies': 'Diplomat',
    
    // Military
    'Barracks': 'Soldier',
    'Armory': 'Armorer',
    'Training Ground': 'Sergeant',
    'Watchtower': 'Sentinel',
    'Military Stable': 'Ostler',
    'Supply Warehouse': 'Quartermaster',
    
    // Services
    "Blacksmith's Forge": "Blacksmith",
    "Carpenter's Workshop": "Carpenter",
    'Tannery': 'Tanner',
    'Mill': 'Miller',
    "Glassblower's Workshop": "Glassblower",
    "Potter's Workshop": "Potter",
    'Warehouses': 'Warehouse Manager',
    
    // Residential & General
    'Tenement Houses': 'Landlord',
    'Noble Houses': 'Noble',
    'Park or Garden': 'Caretaker',
    'Public Well': 'Water Carrier',
    'School': 'Teacher',
    'Small Family Shops': 'Vendor',
    'Town Square': 'Town Crier',
    'General Store': 'Merchant',
    'Local Inn': 'Host',
    'Small Shrine': 'Lay Priest',

    // Legacy/Fallback aliases
    'Tavern': 'Innkeeper',
    'Blacksmith': 'Blacksmith',
    'Temple': 'Priest',
    'Market': 'Merchant',
    'Library': 'Librarian',
    'Guard Post': 'Guard',
    'Wizard Tower': 'Wizard',
    'Thieves Guild': 'Thief',
    'Farm': 'Farmer',
    'Noble House': 'Noble'
  };
  return mapping[locationType] || 'Commoner';
};

export const getSkillModifier = (character: Character, skill: Skill): number => {
  const attribute = SKILL_ATTRIBUTES[skill];
  const statValue = character.stats[attribute];
  const attributeMod = getModifier(statValue);
  const isProficient = character.proficiencies.includes(skill);
  const profBonus = isProficient ? getProficiencyBonus(character.level) : 0;
  return attributeMod + profBonus;
};

export const getOracleResponse = (modifier: number = 0): OracleResult => {
  const roll = rollDice(20);
  const total = roll + modifier;
  
  let answer: OracleResult['answer'] = 'No';
  if (total <= 2) answer = 'No, and...';
  else if (total <= 6) answer = 'No';
  else if (total <= 10) answer = 'No, but...';
  else if (total <= 14) answer = 'Yes, but...';
  else if (total <= 18) answer = 'Yes';
  else answer = 'Yes, and...';

  return { answer, roll: total, rawRoll: roll, modifier };
};

const CLUES_TABLE: DungeonClue[] = [
  {
    text: "A section of wall where the stone has been worn smooth — not by water, by repeated contact. Someone stood here often, for a long time, touching this exact spot.",
    implication: "Whatever they were doing or watching from this position, they came back to it.",
    oracle_suggested: true
  },
  {
    text: "A journal, water-damaged beyond reading except for two words that appear on every surviving page — written in different inks, at different times, as if returned to repeatedly.",
    implication: "The words are consistent enough to be significant and ambiguous enough to mean several things.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about lost civilizations and history."
  },
  {
    text: "Footprints in the dust leading to a wall and stopping. No sign of a door, a mechanism, or a seam. The prints face the wall.",
    implication: "Either something went through it or something came from it and walked backward to this point.",
    oracle_suggested: true
  },
  {
    text: "A broken key, the head engraved with a symbol you have seen before — somewhere, recently, in a context you cannot immediately place.",
    implication: "The symbol is not decorative. It appears in too many places for coincidence.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about relics and artifacts."
  },
  {
    text: "A locket, closed, warm to the touch despite the cold of the room. Inside: a portrait, but the face has been carefully scratched away. The scratching took effort — it was done deliberately, not in anger.",
    implication: "Someone wanted the face unrecognizable. Whether to protect the subject or themselves is unclear.",
    oracle_suggested: true
  },
  {
    text: "A trail of something metallic ground into the floor — not spilled, dragged. It leads in one direction and does not return.",
    implication: "Whatever was dragged was heavy enough to mark stone. It was dragged by something, or someone, with a reason.",
    oracle_suggested: false
  },
  {
    text: "A message carved into the floor, letters uneven as if written in haste or pain: two words and a number. The number means nothing to you yet.",
    implication: "The number is specific enough to be a reference. References have referents.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about prophecies and omens."
  },
  {
    text: "A fungus growth that has consumed a section of wall — unusual in itself, except that the growth has avoided a specific area, leaving a shape in the negative space. The shape is not natural.",
    implication: "Something in that area repels it. Something that was there, or that is still there.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about planar phenomena."
  },
  {
    text: "Bones, arranged. Not scattered — each one placed, the configuration too regular to be accidental and too specific to be decorative.",
    implication: "Someone spent time on this after the death. The arrangement was the point, not the killing.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about gods and the planes."
  },
  {
    text: "A shield, rusted but intact, bearing an emblem you do not recognize — and a second emblem beneath it, older, partially obscured by the first as if deliberately covered.",
    implication: "Someone replaced one allegiance with another and kept the original underneath.",
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about cultures and factions."
  },
  {
    text: "A single white feather, perfectly preserved, in a place where no bird could have left it. Not fallen — placed, with the shaft pointing in a specific direction.",
    implication: "Placed by someone who knew what it meant. The direction may be the message.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about myths and folklore."
  },
  {
    text: "A broken arrow of distinctive make — the fletching style is specific to a tradition you may or may not recognize. It was not shot. It was snapped by hand.",
    implication: "Snapping an arrow by hand means something in some traditions. In others it means nothing. The question is which tradition this belongs to.",
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about cultures and factions."
  },
  {
    text: "A sealed envelope gripped by a corpse, addressed to no one, sealed with a sigil that has been partially destroyed — deliberately, after sealing.",
    implication: "Someone wanted it delivered but not read. Or read by one person and not another.",
    oracle_suggested: true
  },
  {
    text: "Fresh blood on the wall — one streak, deliberate, forming a shape that might be a symbol or might be the beginning of one that was not finished.",
    implication: "Recent enough that it matters. Someone was here, was interrupted, or ran out of time.",
    oracle_suggested: true
  },
  {
    text: "A corpse with map symbols drawn across the skin in a fading ink — not tattooed, drawn after death, with care. The symbols correspond to a geography. Whether it is this dungeon or somewhere else requires interpretation.",
    implication: "Someone used this body as a surface. The map was the priority, not the person.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about lost civilizations and history."
  },
  {
    text: "Runic marks on the skin of a corpse, faintly luminescent — not tattooed, grown, as if the marks developed from within rather than being applied from without.",
    implication: "This was done to them over time, not at the moment of death.",
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about gods and the planes."
  },
  {
    text: "A body that has been surgically altered — crude, but deliberate, with a purpose the alterations suggest rather than explain.",
    implication: "Someone was trying to change what this person was capable of, or what they were.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about monster origins."
  },
  {
    text: "A number branded into the skin — not a wound, a mark, applied with the same care as a craftsman's signature.",
    implication: "This person was counted. The question is what they were being counted among.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about cultures and factions."
  },
  {
    text: "A child's toy — specific, handmade, worn with use — in a place where no child should have been. It has not been here long.",
    implication: "Someone carried it here. It was not left behind accidentally — it was placed.",
    oracle_suggested: true
  },
  {
    text: "A pendant missing a piece, the break not recent — old, worn smooth at the edges. The missing piece would complete a symbol. The complete symbol would be recognizable.",
    implication: "The other piece exists somewhere. Whether the two pieces together mean more than either alone is the question.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about relics and artifacts."
  },
  {
    text: "Sacks of preserved food stacked carefully against the wall — enough for several people, for a long time. Not abandoned. Staged.",
    implication: "Someone planned to be here, or planned for others to be here, for longer than a passing visit.",
    oracle_suggested: true
  },
  {
    text: "A thin layer of frost on one surface only — not the floor, not the walls, one specific object in the room, evenly coated as if the cold comes from within it rather than from the air.",
    implication: "Whatever is inside is colder than the environment. It is maintaining that temperature.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about relics and artifacts."
  },
  {
    text: "A smell that does not belong to this place — specific, identifiable, out of context. Not decay, not damp. Something you associate with somewhere else entirely.",
    implication: "Something from outside brought it here, recently enough that it has not faded.",
    oracle_suggested: true
  },
  {
    text: "A section of floor where the dust has been disturbed in a pattern — not footprints, a shape, as if something was placed there and removed. The shape it left is not the shape of any object you can immediately identify.",
    implication: "Something was here and is no longer here. The absence is what remains.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about relics and artifacts."
  },
  {
    text: "A brief flash of light at the edge of your vision — not a reflection, the wrong color for the light sources in the room. When you look directly at the source there is nothing there. When you look away it happens again.",
    implication: "Something is visible only in peripheral vision. This is either a property of the thing or a property of how it wants to be seen.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about planar phenomena."
  },
  {
    text: "A compass that functions normally in every direction except one, where the needle refuses to point regardless of how you orient it — not attracted elsewhere, actively refusing.",
    implication: "Something in that direction is either disrupting the mechanism or the mechanism recognizes something it was built to avoid.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about relics and artifacts."
  },
  {
    text: "Healed wounds on a corpse — old ones, many of them, patterned in a way that suggests they were not accidental. This person survived something that was done to them repeatedly.",
    implication: "They were kept alive through it. The question is by whom and for what purpose.",
    oracle_suggested: true
  },
  {
    text: "A whispering from a crack in the wall — not wind, structured, with the cadence of language rather than sound. It stops when you approach and resumes when you move away.",
    implication: "It is aware of your position. Whether it is reacting to you or performing for you is unclear.",
    oracle_suggested: true,
    lore_trigger: "Use the Situation Table or the Lore Engine to know more about gods and the planes."
  }
];

const ENVIRONMENT_FEATURES_TABLE = [
  "A thick layer of bioluminescent moss covering the walls.",
  "A constant, rhythmic dripping of water from the ceiling.",
  "A sudden, localized drop in temperature.",
  "A faint smell of ozone and burnt sulfur.",
  "A series of intricate, moving gears embedded in the floor.",
  "A dense fog that obscures vision beyond a few feet.",
  "A wall of perfectly smooth, black obsidian.",
  "A cluster of crystalline formations that hum softly.",
  "A patch of slippery, iridescent slime on the ground.",
  "A set of ancient, crumbling statues of weeping figures.",
  "A narrow stone bridge over a bottomless chasm.",
  "A large, ornate fountain filled with stagnant, dark liquid.",
  "Cracked stone pillars support the ceiling, shedding small fragments of dust.",
  "A faint humming vibration pulses through the floor, as if something deep below is stirring.",
  "Ancient murals line the walls, their paint flaking but still depicting forgotten battles.",
  "A cold draft flows from a narrow fissure, carrying whispers that vanish when approached.",
  "The room is filled with broken furniture, arranged as if a fight happened long ago.",
  "A glowing rune is etched into the center of the floor, warm to the touch.",
  "Thick cobwebs hang like curtains, swaying slightly despite the still air.",
  "A shallow pool of murky water reflects distorted versions of those who look into it.",
  "A collapsed ceiling blocks part of the room, leaving only a crawlspace.",
  "A strange metallic scent lingers here, though no source is visible.",
  "A stone statue stands in the corner, its eyes following you when you’re not looking directly at it.",
  "A series of chains hang from the ceiling, some broken, some still swaying.",
  "The walls are carved with tally marks—hundreds of them—scratched by desperate hands.",
  "A soft blue glow emanates from cracks in the stone, pulsing like a heartbeat.",
  "A mosaic floor depicts a creature you’ve never seen before, its eyes made of gemstones.",
  "A thick fog clings to the ground, never rising above your knees.",
  "A large iron door is embedded in the wall, locked and covered in frost.",
  "A pedestal stands in the center of the room, empty but radiating faint warmth.",
  "The air here feels heavy, as if gravity itself is stronger.",
  "A faint chime echoes periodically, though nothing in the room could be making the sound."
];

/**
 * Helper to select and format events from the new structured data.
 */
const selectAndFormatEvent = (category: string, pool: DungeonEvent[], dungeonType?: string): string => {
  const filtered = pool.filter(e => e.dungeon_types === 'all' || (dungeonType && e.dungeon_types.includes(dungeonType as DungeonType)));
  const source = filtered.length > 0 ? filtered : pool;
  const event = source[rollDice(source.length) - 1];
  
  let result = `${category}: ${event.name}\nTrigger: ${event.trigger}\nConsequence: ${event.consequence}`;
  if (event.oracle_seed) {
    result += `\nOracle Seed: ${event.oracle_seed}`;
  }
  return result;
};

/**
 * Helper to generate a trap string with correctly replaced placeholders.
 */
const generateTrapObject = (characterLevel: number): Trap => {
  const selectedTrap = { ...TRAPS[rollDice(TRAPS.length) - 1] };
  
  const replacePlaceholders = (text: string): string => {
    let result = text;
    const trapAttackBonus = Math.floor(8 + (characterLevel * 0.5));
    result = result.replace(/\(8 \+ PC level × 0\.5\)/g, trapAttackBonus.toString());
    result = result.replace(/\(PC level\)/g, characterLevel.toString());
    result = result.replace(/\(PC level - 1\)/g, Math.max(1, characterLevel - 1).toString());
    result = result.replace(/\(PC level - 2\)/g, Math.max(1, characterLevel - 2).toString());
    result = result.replace(/\(PC level - 3\)/g, Math.max(1, characterLevel - 3).toString());
    result = result.replace(/\(PC level \+ 1\)/g, (characterLevel + 1).toString());
    result = result.replace(/\(PC level \+ 2\)/g, (characterLevel + 2).toString());
    result = result.replace(/\(PC level × 1.5\)/g, Math.floor(characterLevel * 1.5).toString());
    result = result.replace(/\(PC level × 2\)/g, (characterLevel * 2).toString());
    return result;
  };

  selectedTrap.damageFormula = replacePlaceholders(selectedTrap.damageFormula);
  selectedTrap.consequences = replacePlaceholders(selectedTrap.consequences);
  
  return selectedTrap;
};

export const generateRoom = (characterLevel: number = 1, dungeonType?: string): Room => {
  const rolls = {
    purple: rollDice(12),
    blue: rollDice(12),
    green: rollDice(12),
    red: rollDice(12),
    gold: rollDice(12),
    multicolour: rollDice(12)
  };

  const theme = (dungeonType && DUNGEON_THEMES[dungeonType]) ? DUNGEON_THEMES[dungeonType] : DUNGEON_THEMES['Cave'];
  
  let encounterDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly' | undefined;
  if (rolls.purple >= 7) {
    if (rolls.purple <= 8) encounterDifficulty = 'Easy';
    else if (rolls.purple <= 10) encounterDifficulty = 'Medium';
    else if (rolls.purple === 11) encounterDifficulty = 'Hard';
    else encounterDifficulty = 'Deadly';
  }

  let lootResult: LootResult | undefined;
  if (rolls.gold >= 7) {
    lootResult = generateLoot(characterLevel, 'exploration');
  }

  let clue: DungeonClue | undefined;
  if (rolls.blue >= 7) {
    clue = CLUES_TABLE[rollDice(CLUES_TABLE.length) - 1];
  }

  let environmentFeature: string | undefined;
  let trap: Trap | undefined;
  if (rolls.green >= 7) {
    environmentFeature = ENVIRONMENT_FEATURES_TABLE[rollDice(ENVIRONMENT_FEATURES_TABLE.length) - 1];
  }

  let npc: NPC | undefined;
  let npcIntro: DungeonNPCIntro | undefined;
  if (rolls.red >= 7) {
    npc = generateNPC();
    npcIntro = DUNGEON_NPC_INTROS[rollDice(DUNGEON_NPC_INTROS.length) - 1];
  }

  let event: string | undefined;
  if (rolls.multicolour >= 7) {
    if (rolls.multicolour === 8) event = selectAndFormatEvent("Bane", BANE, dungeonType);
    else if (rolls.multicolour === 9) event = selectAndFormatEvent("Boon", BOON, dungeonType);
    else if (rolls.multicolour === 10) {
      trap = generateTrapObject(characterLevel);
      event = `Trap Discovered: ${trap.name}`;
    }
    else if (rolls.multicolour === 11 || rolls.multicolour === 7) event = selectAndFormatEvent("Random Event", RANDOM_EVENTS, dungeonType);
    else if (rolls.multicolour === 12) event = selectAndFormatEvent("Skill Challenge", SKILL_CHALLENGES, dungeonType);
  }

  const roomType = theme.roomTypes[rollDice(theme.roomTypes.length) - 1];

  const feature = theme.features[rollDice(theme.features.length) - 1];

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: roomType,
    feature: feature,
    enemies: [],
    encounterDifficulty,
    lootResult,
    rolls,
    clue,
    npc,
    npcIntro,
    event,
    environmentFeature,
    trap
  };
};

export const rerollCategory = (room: Room, category: keyof RoomRolls, characterLevel: number = 1, dungeonType?: string): Room => {
  const newRoom = { ...room, rolls: { ...room.rolls } };
  const newRoll = rollDice(12);
  newRoom.rolls[category] = newRoll;

  const theme = dungeonType && DUNGEON_THEMES[dungeonType] ? DUNGEON_THEMES[dungeonType] : null;

  switch (category) {
    case 'purple': // Monsters
      newRoom.enemies = [];
      newRoom.encounterDifficulty = undefined;
      if (newRoll >= 7) {
        if (newRoll <= 8) newRoom.encounterDifficulty = 'Easy';
        else if (newRoll <= 10) newRoom.encounterDifficulty = 'Medium';
        else if (newRoll === 11) newRoom.encounterDifficulty = 'Hard';
        else newRoom.encounterDifficulty = 'Deadly';
      }
      break;
    case 'gold': // Treasure
      newRoom.lootResult = undefined;
      if (newRoll >= 7) {
        newRoom.lootResult = generateLoot(characterLevel, 'exploration');
      }
      break;
    case 'blue': // Clues
      newRoom.clue = undefined;
      if (newRoll >= 7) {
        newRoom.clue = CLUES_TABLE[rollDice(CLUES_TABLE.length) - 1];
      }
      break;
    case 'green': // Environment
      newRoom.environmentFeature = undefined;
      newRoom.trap = undefined;
      if (newRoll >= 7) {
        newRoom.environmentFeature = ENVIRONMENT_FEATURES_TABLE[rollDice(ENVIRONMENT_FEATURES_TABLE.length) - 1];
      }
      break;
    case 'red': // NPC
      newRoom.npc = undefined;
      newRoom.npcIntro = undefined;
      if (newRoll >= 7) {
        newRoom.npc = generateNPC();
        newRoom.npcIntro = DUNGEON_NPC_INTROS[rollDice(DUNGEON_NPC_INTROS.length) - 1];
      }
      break;
    case 'multicolour': // Events
      newRoom.event = undefined;
      if (newRoll >= 7) {
        if (newRoll === 8) newRoom.event = selectAndFormatEvent("Bane", BANE, dungeonType);
        else if (newRoll === 9) newRoom.event = selectAndFormatEvent("Boon", BOON, dungeonType);
        else if (newRoll === 10) {
          const trapObj = generateTrapObject(characterLevel);
          newRoom.trap = trapObj;
          newRoom.event = `Trap Discovered: ${trapObj.name}`;
        }
        else if (newRoll === 11 || newRoll === 7) newRoom.event = selectAndFormatEvent("Random Event", RANDOM_EVENTS, dungeonType);
        else if (newRoll === 12) newRoom.event = selectAndFormatEvent("Skill Challenge", SKILL_CHALLENGES, dungeonType);
      }
      break;
  }

  return newRoom;
};

/**
 * Heuristic to estimate item value based on rarity when the value is not explicitly provided.
 */
const estimateValueByRarity = (rarity: string | undefined): number => {
  if (!rarity) return 10;
  const r = rarity.toLowerCase();
  if (r === 'uncommon') return 200;
  if (r === 'rare') return 2000;
  if (r === 'very rare') return 20000;
  if (r === 'legendary') return 50000;
  if (r === 'artifact') return 100000;
  return 10; // default for common/none
};

export const mapLootItemToItem = (template: LootItem): Item => {
  let itemType: Item['type'] = 'Gear';
  const typeStr = (template.Type || "").toLowerCase();
  
  if (typeStr.includes('weapon')) itemType = 'Weapon';
  else if (typeStr.includes('armor') || typeStr.includes('shield')) itemType = 'Armor';
  else if (typeStr.includes('consumable') || typeStr.includes('potion') || typeStr.includes('scroll')) itemType = 'Consumable';
  else if (typeStr.includes('treasure') || typeStr.includes('gemstone') || typeStr.includes('art object')) itemType = 'Treasure';
  else if (typeStr.includes('tool')) itemType = 'Tool';

  let damage = template.Damage || undefined;
  let bonus = 0;

  // Handle AC in Damage field for armor
  if (itemType === 'Armor') {
    if (damage?.includes('AC')) {
      const acMatch = damage.match(/AC\s*[+-]?\s*(\d+)/);
      if (acMatch) {
        bonus = parseInt(acMatch[1]);
      }
    }
    
    // Default base AC for shields if not specified in Damage
    if (typeStr.includes('shield') && bonus === 0) {
      bonus = 2;
    }
  }

  // Parse magic bonus from name if it exists (e.g., "+1 Weapon")
  const magicBonusMatch = template.Name.match(/\+(\d+)/);
  if (magicBonusMatch) {
    const magicBonus = parseInt(magicBonusMatch[1]);
    if (itemType === 'Armor' && bonus > 0) {
      bonus += magicBonus;
    } else if (bonus === 0) {
      bonus = magicBonus;
    }
  }

  // Parse numeric value
  let value = parseInt(template.Value?.replace(/[^0-9]/g, '') || '0') || 0;
  
  // If value is missing and it's a magic item, estimate from text or rarity
  if (value === 0 && template.Text) {
    const textMatch = template.Text.match(/(\d+)\s*GP/i);
    if (textMatch) {
      value = parseInt(textMatch[1]);
    }
  }
  
  if (value === 0) {
    value = estimateValueByRarity(template.Rarity);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: template.Name,
    type: itemType,
    subType: template.Type,
    description: template.Text || "",
    value: value,
    weight: template.Weight || undefined,
    rarity: template.Rarity,
    cost: `${value} gp`,
    damage: damage,
    bonus: bonus
  };
};

export const generateShopInventory = (districtType: DistrictType, locationName: string, characterLevel: number = 1, category?: string): Item[] => {
  const vendorCategory = category || locationName;
  const vendorConfig = (VENDOR_MAP_DATA as any).vendor_map.locations[vendorCategory] as VendorProfile | undefined;
  const allItems = (ITEMS_DATA as any) as LootItem[];

  if (vendorConfig && !vendorConfig.sells) {
    return [];
  }

  // If no config found, fallback to old logic
  if (!vendorConfig) {
    const lowerName = locationName.toLowerCase();
    let theme: 'arcane' | 'martial' | 'general' | 'religious' = 'general';
    
    if (lowerName.includes('alchem') || lowerName.includes('alchim') || lowerName.includes('wizard') || lowerName.includes('tower') || lowerName.includes('magic') || lowerName.includes('scroll') || lowerName.includes('academy') || lowerName.includes('library') || districtType === 'Arcane') {
      theme = 'arcane';
    } else if (lowerName.includes('forge') || lowerName.includes('armeria') || lowerName.includes('armory') || lowerName.includes('blacksmith') || lowerName.includes('weapon') || lowerName.includes('armor') || districtType === 'Military') {
      theme = 'martial';
    } else if (lowerName.includes('temple') || lowerName.includes('shrine') || lowerName.includes('cathedral') || lowerName.includes('hospital') || lowerName.includes('tempio') || lowerName.includes('ospedale') || lowerName.includes('cappelle') || districtType === 'Religious') {
      theme = 'religious';
    }
    
    let filteredItems = allItems.filter(item => {
      const type = (item.Type || "").toLowerCase();
      const text = (item.Text || "").toLowerCase();
      const rarity = (item.Rarity || "").toLowerCase();
      
      if (rarity === 'very rare' && characterLevel < 10) return false;
      if (rarity === 'legendary' && characterLevel < 15) return false;
      if (rarity === 'artifact' && characterLevel < 18) return false;

      switch (theme) {
        case 'arcane':
          return ['potion', 'scroll', 'wand', 'staff', 'rod', 'ring', 'wondrous item', 'spellcasting focus'].some(t => type.includes(t)) || text.includes('magic') || text.includes('arcane');
        case 'martial':
          return type.includes('weapon') || type.includes('armor') || type.includes('shield');
        case 'religious':
          return (['potion', 'scroll', 'wondrous item'].some(t => type.includes(t)) && (text.includes('healing') || text.includes('holy') || text.includes('protection'))) || text.includes('religious') || type.includes('holy symbol');
        case 'general':
        default:
          return ['adventuring gear', 'tool', 'consumable', 'gear'].some(t => type.includes(t)) || rarity === 'none' || rarity === 'common';
      }
    });

    if (filteredItems.length === 0) {
      filteredItems = allItems.filter(item => (item.Rarity || "").toLowerCase() === 'none' || (item.Rarity || "").toLowerCase() === 'common');
    }

    const inventory: Item[] = [];
    const count = rollDice(5) + 3; 
    for (let i = 0; i < count; i++) {
      const template = filteredItems[rollDice(filteredItems.length) - 1];
      if (!template) continue;
      inventory.push(mapLootItemToItem(template));
    }
    return inventory;
  }

  // New Logic based on VendorMap
  const inventory: Item[] = [];
  const minStock = vendorConfig.stock_size?.min ?? 4;
  const maxStock = vendorConfig.stock_size?.max ?? 8;
  const count = rollDice(maxStock - minStock + 1) + minStock - 1;

  const primaryCategories = vendorConfig.primary_categories || [];
  const secondaryCategories = vendorConfig.secondary_categories || [];
  const priceModifier = vendorConfig.price_modifier || 1.0;
  const rarityFilter = vendorConfig.rarity_filter || ['Common', 'Uncommon'];
  const armorSubtypes = vendorConfig.armor_subtypes || [];

  const filterItem = (item: LootItem, categories: string[]) => {
    const rarity = (item.Rarity || "Common").toLowerCase();
    const type = (item.Type || "").toLowerCase();
    
    // Check rarity
    const allowedRarities = rarityFilter.map(r => r.toLowerCase());
    if (allowedRarities.length > 0 && !allowedRarities.includes(rarity)) return false;

    // Additional level-based safety common to both systems
    if (rarity === 'very rare' && characterLevel < 10) return false;
    if (rarity === 'legendary' && characterLevel < 15) return false;

    // Check categories
    const catMatch = categories.some(cat => type.includes(cat.toLowerCase()));
    if (!catMatch) return false;

    // Check armor subtypes
    if (type.includes('armor') && armorSubtypes.length > 0) {
      if (!armorSubtypes.some(sub => type.includes(sub.toLowerCase()))) return false;
    }

    return true;
  };

  const primaryPool = allItems.filter(i => filterItem(i, primaryCategories));
  const secondaryPool = allItems.filter(i => filterItem(i, secondaryCategories));

  for (let i = 0; i < count; i++) {
    const isPrimary = rollDice(100) <= 70 || secondaryPool.length === 0;
    const pool = isPrimary ? primaryPool : secondaryPool;
    
    if (pool.length === 0) {
       // Deep fallback if pools are empty but we should have items
       if (i === 0) {
         return generateShopInventory(districtType, locationName, characterLevel); 
       }
       continue;
    }

    const template = pool[rollDice(pool.length) - 1];
    const item = mapLootItemToItem(template);
    
    if (item.value) {
      item.value = Math.max(1, Math.floor(item.value * priceModifier));
      item.cost = `${item.value} gp`;
    }
    
    inventory.push(item);
  }

  return inventory;
};

export const generateDistrictLocations = (districtType: DistrictType, settlementName: string, districtId: string, characterLevel: number = 1, type: SettlementType): Location[] => {
  const config = SETTLEMENT_CONFIG[type];
  const locationCount = Math.floor(Math.random() * (config.maxLocationsPerDistrict - config.minLocationsPerDistrict + 1)) + config.minLocationsPerDistrict;
  const locations: Location[] = [];
  for (let i = 0; i < locationCount; i++) {
    locations.push(generateLocation(districtType, settlementName, districtId, characterLevel));
  }
  return locations;
};

export const generateSettlement = (forcedType?: SettlementType, characterLevel: number = 1): Settlement => {
  const name = SETTLEMENT_NAMES[rollDice(SETTLEMENT_NAMES.length) - 1];
  const type = forcedType || SETTLEMENT_TYPES[rollDice(SETTLEMENT_TYPES.length) - 1];
  
  const config = SETTLEMENT_CONFIG[type];
  const population = Math.floor(Math.random() * (config.maxPop - config.minPop + 1)) + config.minPop;
  
  const districts: District[] = [];
  
  if (type === 'Encampment') {
    // Encampments have one "General" district
    const district: District = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Main Camp',
      type: 'General',
      description: 'The core of the encampment, containing essential services.',
      locations: []
    };
    
    const locationCount = Math.floor(Math.random() * (config.maxLocationsPerDistrict - config.minLocationsPerDistrict + 1)) + config.minLocationsPerDistrict;
    for (let i = 0; i < locationCount; i++) {
      district.locations.push(generateLocation('General', name, district.id, characterLevel));
    }
    districts.push(district);
  } else {
    // Other settlements have multiple districts
    const districtCount = Math.floor(Math.random() * (config.maxDistricts - config.minDistricts + 1)) + config.minDistricts;
    
    // Pick random district types
    const availableDistrictTypes = [...DISTRICT_TYPES];
    const selectedDistrictTypes: DistrictType[] = [];
    
    if (districtCount >= 9) {
      selectedDistrictTypes.push(...DISTRICT_TYPES);
    } else {
      for (let i = 0; i < districtCount; i++) {
        const index = Math.floor(Math.random() * availableDistrictTypes.length);
        selectedDistrictTypes.push(availableDistrictTypes.splice(index, 1)[0]);
      }
    }
    
    for (const dType of selectedDistrictTypes) {
      const district: District = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${dType} District`,
        type: dType,
        description: `A district focused on ${dType.toLowerCase()} activities.`,
        locations: []
      };
      
      const locationCount = Math.floor(Math.random() * (config.maxLocationsPerDistrict - config.minLocationsPerDistrict + 1)) + config.minLocationsPerDistrict;
      for (let i = 0; i < locationCount; i++) {
        district.locations.push(generateLocation(dType, name, district.id, characterLevel));
      }
      districts.push(district);
    }
  }

  return {
    name,
    type,
    population,
    description: `A ${type.toLowerCase()} with a population of ${population.toLocaleString()} where adventurers find respite.`,
    districts
  };
};

const generateLocation = (districtType: DistrictType, settlementName: string, districtId: string, characterLevel: number = 1): Location => {
  const possibleCategories = DISTRICT_LOCATIONS[districtType] || DISTRICT_LOCATIONS['General'];
  const category = possibleCategories[rollDice(possibleCategories.length) - 1];
  
  const specificNames = LOCATION_NAME_TEMPLATES[category] || [category];
  const locName = specificNames[rollDice(specificNames.length) - 1];
  
  const npcs: NPC[] = [];
  const npcCount = rollDice(2);
  const suggestedRole = getSuggestedRoleForLocation(category);
  for (let j = 0; j < npcCount; j++) {
    // First NPC usually follows the suggested role, others can be random or also follow it
    const role = j === 0 ? suggestedRole : (rollDice(2) === 1 ? suggestedRole : undefined);
    npcs.push(generateNPC({ role }));
  }

  const vendorConfig = (VENDOR_MAP_DATA as any).vendor_map.locations[category] as VendorProfile | undefined;
  const interactions = vendorConfig?.interactions ? [...vendorConfig.interactions] : [];

  const lowerCategory = category.toLowerCase();
  const lowerName = locName.toLowerCase();
  
  if (lowerCategory.includes('tavern') || lowerCategory.includes('inn') || lowerName.includes('tavern') || lowerName.includes('inn') || lowerName.includes('locande') || lowerName.includes('bordello')) {
    if (!interactions.includes('Long Rest (10 gold)')) interactions.push('Long Rest (10 gold)');
    if (!interactions.includes('Gossip')) interactions.push('Gossip');
  }
  
  if (vendorConfig?.sells || lowerCategory.includes('shop') || lowerCategory.includes('market') || lowerCategory.includes('forge') || lowerCategory.includes('emporium') || lowerCategory.includes('vendor') || lowerCategory.includes('atelier') || lowerCategory.includes('workshop') || lowerCategory.includes('academy') || lowerCategory.includes('library') || lowerCategory.includes('armory') || lowerCategory.includes('bank') || lowerCategory.includes('auction') || lowerName.includes('shop') || lowerName.includes('market') || lowerName.includes('forge') || lowerName.includes('emporium') || lowerName.includes('mercato') || lowerName.includes('botteghe') || lowerName.includes('armeria') || lowerName.includes('armory') || lowerName.includes('venditore') || lowerName.includes('negozio') || lowerName.includes('atelier') || lowerName.includes('workshop') || lowerName.includes('academy') || lowerName.includes('library')) {
    if (!interactions.includes('Trade')) interactions.push('Trade');
  }
  
  if (lowerCategory.includes('temple') || lowerCategory.includes('hospital') || lowerCategory.includes('shrine') || lowerCategory.includes('chapel') || lowerName.includes('temple') || lowerName.includes('hospital') || lowerName.includes('shrine') || lowerName.includes('tempio') || lowerName.includes('ospedale') || lowerName.includes('cappelle')) {
    if (!interactions.includes('Heal (15 gold)')) interactions.push('Heal (15 gold)');
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: locName,
    type: districtType,
    category: category,
    description: `A ${locName.toLowerCase()} located in the ${districtType.toLowerCase()} district of ${settlementName}.`,
    npcs,
    interactions,
    districtId,
    notes: vendorConfig?.notes,
    inventory: (interactions.includes('Trade')) ? generateShopInventory(districtType, locName, characterLevel, category) : undefined
  };
};

export const generateDistrictDisturbance = (districtType: DistrictType): DistrictDisturbance => {
  const disturbances = DISTRICT_DISTURBANCES[districtType] || DISTRICT_DISTURBANCES['General'];
  return disturbances[rollDice(disturbances.length) - 1];
};

export const generateTravel = (destination: string, terrain?: string, duration?: number): WildernessTravel => {
  // If duration is provided, use it as a base and add some randomness (+/- 25%)
  const baseDuration = duration || rollDice(6) + 2;
  const variance = Math.max(1, Math.floor(baseDuration * 0.25));
  const randomOffset = rollDice(variance * 2 + 1) - (variance + 1);
  const finalDuration = Math.max(1, baseDuration + randomOffset);

  return {
    destination,
    totalDays: finalDuration,
    currentDay: 0,
    terrain: terrain || WILDERNESS_TERRAINS[rollDice(WILDERNESS_TERRAINS.length) - 1],
    rations: finalDuration + 1
  };
};

export const generateCampDisturbance = (): Encounter => {
  const categories = Object.keys(ENCOUNTERS_DATA.Camp_encounters);
  const randomCategory = categories[rollDice(categories.length) - 1];
  const list = (ENCOUNTERS_DATA.Camp_encounters as any)[randomCategory];
  return list[rollDice(list.length) - 1] as Encounter;
};

export const generateCampDisturbanceByCategory = (categoryName: string): Encounter => {
  const list = (ENCOUNTERS_DATA.Camp_encounters as any)[categoryName];
  if (!list) return generateCampDisturbance();
  return list[rollDice(list.length) - 1] as Encounter;
};

export const generateAdventure = (tone?: QuestTone): Quest => {
  const filteredSituations = (tone && SITUATIONS) ? SITUATIONS.filter(s => s.tone === tone) : (SITUATIONS || []);
  const situation = (filteredSituations.length > 0) 
    ? filteredSituations[rollDice(filteredSituations.length) - 1] 
    : (SITUATIONS && SITUATIONS.length > 0)
      ? SITUATIONS[rollDice(SITUATIONS.length) - 1]
      : { 
          what: "A mysterious event occurs.", 
          where: "The local tavern", 
          since_when: "The last full moon", 
          tone: 'discovery' as QuestTone,
          involvements: ["You are asked to investigate."],
          antagonist_logics: ["A simple misunderstanding."]
        } as Situation;
  
  return {
    situation,
    crack: (CRACKS && CRACKS.length > 0) ? CRACKS[rollDice(CRACKS.length) - 1] : "Something odd happened.",
    cost_of_inaction: (COSTS_OF_INACTION && COSTS_OF_INACTION.length > 0) ? COSTS_OF_INACTION[rollDice(COSTS_OF_INACTION.length) - 1] : "The opportunity fades.",
    hidden_twist: (HIDDEN_TWISTS && HIDDEN_TWISTS.length > 0) ? HIDDEN_TWISTS[rollDice(HIDDEN_TWISTS.length) - 1] : "Things are as they seem.",
    selectedInvolvement: (situation.involvements && situation.involvements.length > 0) ? situation.involvements[rollDice(situation.involvements.length) - 1] : "You are involved.",
    selectedAntagonistLogic: (situation.antagonist_logics && situation.antagonist_logics.length > 0) ? situation.antagonist_logics[rollDice(situation.antagonist_logics.length) - 1] : "The motive is unclear."
  };
};

export const generateCrack = (): string => CRACKS[rollDice(CRACKS.length) - 1];
export const generateCostOfInaction = (): string => COSTS_OF_INACTION[rollDice(COSTS_OF_INACTION.length) - 1];
export const generateHiddenTwist = (): string => HIDDEN_TWISTS[rollDice(HIDDEN_TWISTS.length) - 1];

export const generateUrbanEvent = () => {
  return URBAN_ENCOUNTERS[rollDice(URBAN_ENCOUNTERS.length) - 1];
};

export const generateUrbanEventByCategory = (range: [number, number]) => {
  const [min, max] = range;
  const count = max - min + 1;
  const index = min + rollDice(count) - 2; // -1 for 1-based to 0-based, another -1 if the range is 1-indexed?
  // User range is 1-10, 11-20, etc.
  // URBAN_ENCOUNTERS has 100 items.
  // 1-10 means indices 0-9.
  // So index = min + rollDice(count) - 2.
  // Wait, rollDice(count) returns 1 to count.
  // If min=1, count=10, rollDice(10) returns 1 to 10.
  // 1 + (1 to 10) - 2 = 0 to 9. Correct.
  return URBAN_ENCOUNTERS[index];
};

export const generateWildernessEvent = (terrain: string): Encounter => {
  const terrainData = (ENCOUNTERS_DATA.Wilderness as any)[terrain] || (ENCOUNTERS_DATA.Wilderness as any)['Ancient Forest'];
  const pool = terrainData.encounters || [];
  if (pool.length === 0) {
    return {
      text: "The journey continues through the silent landscape.",
      prompt: "What do you do?",
      oracle_suggested: true
    };
  }
  return pool[rollDice(pool.length) - 1] as Encounter;
};

export const generateWildernessDiscovery = (terrain: string): Encounter => {
  return generateWildernessEvent(terrain);
};

export const generateWeather = () => {
  return WILDERNESS_WEATHER[rollDice(WILDERNESS_WEATHER.length) - 1];
};

export const generateNPC = (overrides: Partial<NPC> = {}): NPC => {
  const race = overrides.race || NPC_RACES[rollDice(NPC_RACES.length) - 1];
  const role = overrides.role || NPC_ROLES[rollDice(NPC_ROLES.length) - 1];
  const alignment = overrides.alignment || NPC_ALIGNMENTS[rollDice(NPC_ALIGNMENTS.length) - 1];
  const disposition = overrides.disposition || NPC_DISPOSITIONS[rollDice(NPC_DISPOSITIONS.length) - 1];
  
  const traitsCount = rollDice(2);
  const traits: string[] = [];
  for (let i = 0; i < traitsCount; i++) {
    const trait = NPC_TRAITS[rollDice(NPC_TRAITS.length) - 1];
    if (!traits.includes(trait)) traits.push(trait);
  }

  const name = overrides.name || NPC_NAMES[rollDice(NPC_NAMES.length) - 1];
  const goal = overrides.goal || NPC_GOALS[rollDice(NPC_GOALS.length) - 1];
  const secret = overrides.secret || NPC_SECRETS[rollDice(NPC_SECRETS.length) - 1];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    race,
    role,
    alignment,
    disposition,
    traits,
    goal,
    secret,
    description: `A ${disposition.toLowerCase()} ${race.toLowerCase()} ${role.toLowerCase()}.`,
    greeting: `Greetings, traveler. I am ${name}.`
  };
};

export const generateFactionMotto = (): string => {
  return FACTION_MOTTOS[rollDice(FACTION_MOTTOS.length) - 1];
};

export const generateFactionInfluence = (): string => {
  return FACTION_INFLUENCE[rollDice(FACTION_INFLUENCE.length) - 1];
};

export const generateFactionHeadquarters = (type: string): string => {
  const HQ_TYPES: Record<string, string[]> = {
    'Mercenary Company':    ['Barracks', 'Garrison', 'Outpost', 'War Camp', 'Armory'],
    'Thieves\' Guild':      ['Den', 'Underground Vault', 'Safehouse Network', 'The Undercroft'],
    'Arcane Circle':        ['Tower', 'Sanctum', 'Observatory', 'The Athenaeum', 'Sealed Library'],
    'Religious Order':      ['Cathedral', 'Monastery', 'Shrine Complex', 'The Inner Sanctum'],
    'Merchant Consortium':  ['Trading House', 'Counting Hall', 'Warehouse District', 'The Exchange'],
    'Noble House':          ['Manor', 'Estate', 'Ancestral Keep', 'The Seat'],
    'Secret Society':       ['Undisclosed Location', 'Rotating Safehouse', 'The Chamber', 'Unknown'],
    'Knightly Order':       ['Fortress', 'Chapterhouse', 'Citadel', 'The Hold'],
    'Druidic Circle':       ['Sacred Grove', 'Standing Stones', 'The Heartwood', 'Ancient Cairn'],
    'Bardic College':       ['Conservatory', 'The Grand Hall', 'Archive Theatre', 'Song Keep'],
    'Criminal Syndicate':   ['Undisclosed Location', 'The Black Market', 'Smuggler\'s Warren', 'The Pit'],
    'Cult':                 ['Hidden Temple', 'The Sanctum', 'Unmarked Compound', 'The Below'],
    'Assassins\' Brotherhood': ['Hidden Cell', 'The Silent Hall', 'Rooftop Sanctum', 'Shadow Den'],
    'Inquisition':          ['The Purgatory', 'Iron Bastille', 'Hallowed Fortress', 'Confession Hall'],
    'Explorers\' Society':   ['Society Lodge', 'Base Camp', 'The Map Room', 'Outland Station'],
    'Underground Railroad':  ['Safehouse Network', 'Hidden Cellar', 'Secret Waystation', 'Passage Hub'],
    'Pirate Confederation':  ['Cove Hideout', 'Floating Fortress', 'Tavern Port', 'The Reef'],
    'Alchemists\' Guild':    ['Great Laboratory', 'The Crucible', 'Distillery Hall', 'Volatile Sanctum']
  };

  const hqOptions = HQ_TYPES[type] ?? ['Stronghold', 'Keep', 'Hall'];
  const hqType = hqOptions[rollDice(hqOptions.length) - 1];

  const HQ_LOCATIONS = [
    'in the old district', 'beneath the city', 'outside the walls',
    'in the merchant quarter', 'on the outskirts', 'location undisclosed',
    'in the ruins', 'above the harbor', 'in the hills nearby', 'within the citadel'
  ];
  const hqLocation = HQ_LOCATIONS[rollDice(HQ_LOCATIONS.length) - 1];

  return hqLocation === 'location undisclosed' 
    ? `${hqType} — location undisclosed`
    : `${hqType} — ${hqLocation}`;
};

export const generateFactionLeader = (): string => {
  const leaderNpc = generateNPC();
  return `${leaderNpc.name} (${leaderNpc.race} ${leaderNpc.role})`;
};

export const generateFactionGoal = (): string => {
  return FACTION_GOALS[rollDice(FACTION_GOALS.length) - 1];
};

export const generateFactionHook = (name: string, motto: string): string => {
  const duration = ['months', 'years', 'longer than anyone will say'][rollDice(3) - 1];
  const hookTemplate = FACTION_HOOK_TEMPLATES[rollDice(FACTION_HOOK_TEMPLATES.length) - 1];
  return hookTemplate
    .replace(/{name}/g, name)
    .replace(/{motto}/g, motto)
    .replace(/{duration}/g, duration);
};

export const generateFactionSecret = (name: string, leader: string, type: string): string => {
  const secretKeys = Object.keys(FACTION_SECRET_TEMPLATES);
  const secretKey = secretKeys[rollDice(secretKeys.length) - 1];
  return (FACTION_SECRET_TEMPLATES[secretKey] ?? secretKey)
    .replace(/{name}/g, name)
    .replace(/{leader}/g, leader)
    .replace(/{type}/g, type.toLowerCase());
};

export const generateFactionDescription = (name: string, type: string, influence: string, goal: string): string => {
  const article = /^[aeiou]/i.test(type) ? 'an' : 'a';
  const article_cap = article === 'an' ? 'An' : 'A';
  const goal_short = FACTION_GOAL_NARRATIVE[goal] ?? goal.toLowerCase();
  
  const descTemplate = FACTION_DESCRIPTION_TEMPLATES[rollDice(FACTION_DESCRIPTION_TEMPLATES.length) - 1];
  return descTemplate
    .replace(/{name}/g, name)
    .replace(/{type}/g, type.toLowerCase())
    .replace(/{influence}/g, influence.toLowerCase())
    .replace(/{article}/g, article)
    .replace(/{article_cap}/g, article_cap)
    .replace(/{goal_short}/g, goal_short);
};

export const generateFactionName = (): string => {
  const prefixes = ['The', 'Order of the', 'Circle of', 'House', 'Brotherhood of', 'Sons of', 'Daughters of', 'League of', 'Guild of'];
  const nouns = ['Shadow', 'Light', 'Steel', 'Flame', 'Stone', 'Wind', 'Blood', 'Gold', 'Iron', 'Oak', 'Raven', 'Wolf', 'Dragon', 'Serpent', 'Skull', 'Crown', 'Shield', 'Sword'];
  const suffixes = ['Foundry', 'Keep', 'Sanctum', 'Vault', 'Hold', 'Tower', 'Hall', 'Cabal', 'Covenant', 'Alliance', 'Union', 'Syndicate'];
  
  const prefix = prefixes[rollDice(prefixes.length) - 1];
  const noun = nouns[rollDice(nouns.length) - 1];
  const suffix = rollDice(2) === 1 ? suffixes[rollDice(suffixes.length) - 1] : '';
  
  return `${prefix} ${noun}${suffix ? ' ' + suffix : ''}`;
};

export const generateFaction = (): Faction => {
  const type = FACTION_TYPES[rollDice(FACTION_TYPES.length) - 1];
  const alignment = FACTION_ALIGNMENTS[rollDice(FACTION_ALIGNMENTS.length) - 1];
  const name = generateFactionName();
  const influence = generateFactionInfluence();
  const goal = generateFactionGoal();
  const motto = generateFactionMotto();
  const leader = generateFactionLeader();
  const headquarters = generateFactionHeadquarters(type);
  
  const description = generateFactionDescription(name, type, influence, goal);
  const hook = generateFactionHook(name, motto);
  const secret = generateFactionSecret(name, leader, type);

  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type,
    alignment,
    influence,
    leader,
    goal,
    secret,
    description,
    motto,
    headquarters,
    hook
  };
};

export const parseDamage = (damageStr: string): number => {
  if (!damageStr) return 0;
  
  // Try to find dice notation like "1d6+2" or "1d4 - 1" inside the string
  const diceRegex = /(\d+)d(\d+)\s*([+-])\s*(\d+)|(\d+)d(\d+)/;
  const diceMatch = damageStr.match(diceRegex);
  
  if (diceMatch) {
    let numDice = 0;
    let sides = 0;
    let modifier = 0;

    if (diceMatch[1] && diceMatch[2]) {
      numDice = parseInt(diceMatch[1]);
      sides = parseInt(diceMatch[2]);
      const sign = diceMatch[3] === '-' ? -1 : 1;
      modifier = parseInt(diceMatch[4]) * sign;
    } else if (diceMatch[5] && diceMatch[6]) {
      numDice = parseInt(diceMatch[5]);
      sides = parseInt(diceMatch[6]);
    }

    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += rollDice(sides);
    }
    return Math.max(1, total + modifier);
  }

  // Fallback: just look for a plain number
  const numMatch = damageStr.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1]);

  return 0;
};

export const generateLoot = (
  playerLevel: number,
  source: 'enemy_normal' | 'exploration' | 'treasure_room' | 'boss' = 'exploration',
  bossCreatureType?: string
): LootResult => {
  const lootTables = LOOT_DATA.loot_tables;
  
  // Step 1: Determine Tier
  let tier = 'tier_1';
  if (playerLevel >= 17) tier = 'tier_4';
  else if (playerLevel >= 11) tier = 'tier_3';
  else if (playerLevel >= 5) tier = 'tier_2';

  const result: LootResult = {
    currency: {},
    magic_items: [],
    valuables: [],
    total_gp_value: 0
  };

  // Step 2: Roll Currency
  const currencyTable = (lootTables.currency_tables as any)[tier][source];
  if (currencyTable) {
    currencyTable.forEach((entry: any) => {
      if (rollDice(100) <= entry.chance) {
        const amount = rollDiceExpression(entry.dice) * (entry.multiplier || 1);
        result.currency[entry.denomination as keyof typeof result.currency] = (result.currency[entry.denomination as keyof typeof result.currency] || 0) + amount;
      }
    });
  }

  // Step 3: Check for Magic Items
  const magicProb = (lootTables.magic_item_probability as any)[tier][source];
  if (rollDice(100) <= magicProb.chance) {
    // Step 4: Determine Number of Magic Items
    const quantityDice = (lootTables.quantity_rolls.magic_items as any)[source].dice;
    const numItems = quantityDice ? rollDiceExpression(quantityDice) : 1;

    for (let i = 0; i < numItems; i++) {
      // Step 5: Determine Rarity
      let rarity: any = 'common';
      const rarityRoll = rollDice(100);
      const weights = (lootTables.rarity_weights as any)[tier];
      
      if (rarityRoll <= weights.common.cumulative_max) rarity = 'common';
      else if (rarityRoll <= weights.uncommon.cumulative_max) rarity = 'uncommon';
      else if (rarityRoll <= weights.rare.cumulative_max) rarity = 'rare';
      else if (rarityRoll <= weights.very_rare.cumulative_max) rarity = 'very_rare';
      else rarity = 'legendary';

      // Check minimum rarity
      if (magicProb.minimum_rarity) {
        const rarities = ['common', 'uncommon', 'rare', 'very_rare', 'legendary'];
        const minIdx = rarities.indexOf(magicProb.minimum_rarity);
        const currentIdx = rarities.indexOf(rarity);
        if (currentIdx < minIdx) rarity = rarities[minIdx];
      }

      // Step 6: Determine Item Type
      let category = 'Wondrous';
      const typePool = (lootTables.item_type_pools as any)[source];
      
      // Boss bias
      let finalTypePool = typePool;
      let thematicKeywords: string[] = [];
      if (source === 'boss' && bossCreatureType) {
        const bossThematic = (lootTables.boss_thematic_tags as any)[bossCreatureType.toLowerCase()];
        if (bossThematic) {
          thematicKeywords = bossThematic.item_keywords;
          // 50% chance to use preferred category
          if (rollDice(100) <= 50) {
            category = bossThematic.preferred_categories[rollDice(bossThematic.preferred_categories.length) - 1];
          } else {
            const typeRoll = rollDice(100);
            const found = typePool.find((p: any) => typeRoll <= p.cumulative_max);
            category = found ? found.category : 'Wondrous';
          }
        } else {
          const typeRoll = rollDice(100);
          const found = typePool.find((p: any) => typeRoll <= p.cumulative_max);
          category = found ? found.category : 'Wondrous';
        }
      } else {
        const typeRoll = rollDice(100);
        const found = typePool.find((p: any) => typeRoll <= p.cumulative_max);
        category = found ? found.category : 'Wondrous';
      }

      // Select item from database
      const items = (ITEMS_DATA as any[]);
      let possibleItems = items.filter(item => 
        (item.Rarity || "").toLowerCase().replace(' ', '_') === rarity &&
        (item.Type || "").toLowerCase().includes(category.toLowerCase())
      );

      // If keywords available, try to filter further
      if (thematicKeywords.length > 0) {
        const keywordItems = possibleItems.filter(item => 
          thematicKeywords.some(k => (item.Text || "").toLowerCase().includes(k.toLowerCase()) || (item.Name || "").toLowerCase().includes(k.toLowerCase()))
        );
        if (keywordItems.length > 0) possibleItems = keywordItems;
      }

      if (possibleItems.length > 0) {
        const selected = possibleItems[rollDice(possibleItems.length) - 1];
        result.magic_items.push({
          id: Math.random().toString(36).substr(2, 9),
          name: selected.Name,
          category: selected.Type,
          rarity: rarity,
          description: selected.Text || "",
          value_gp: parseInt(selected.Value?.replace(/[^0-9]/g, '') || '0') || 0,
          thematicTags: thematicKeywords.length > 0 ? thematicKeywords : undefined
        });
      } else {
        // Placeholder if no item found
        const placeholderValues: Record<string, number> = {
          'common': 50,
          'uncommon': 200,
          'rare': 2000,
          'very_rare': 20000,
          'legendary': 50000
        };
        result.magic_items.push({
          id: Math.random().toString(36).substr(2, 9),
          name: `Mysterious ${rarity.replace('_', ' ')} ${category}`,
          category: category,
          rarity: rarity,
          description: `A powerful item of ${rarity.replace('_', ' ')} quality. Its exact properties are yet to be identified. Use and Identify spell or pay someone in the settlement to identify it, then use the Item Identifier in the Items section below the Loot Generator`,
          value_gp: placeholderValues[rarity] || 0,
          isPlaceholder: true,
          thematicTags: thematicKeywords.length > 0 ? thematicKeywords : undefined
        });
      }
    }
  }

  // Step 7: Check for Valuables
  const valuableChance = (lootTables.valuables_tables.valuable_presence_chance as any)[tier][source];
  if (rollDice(100) <= valuableChance) {
    // Step 8: Determine Valuables
    const quantityDice = (lootTables.quantity_rolls.valuables as any)[source].dice;
    const numValuables = quantityDice ? rollDiceExpression(quantityDice) : 1;

    for (let i = 0; i < numValuables; i++) {
      const isGem = rollDice(100) <= 50;
      const table = isGem ? (lootTables.valuables_tables.gems as any)[tier] : (lootTables.valuables_tables.art_objects as any)[tier];
      
      const roll = rollDice(100);
      const found = table.find((v: any) => roll <= v.roll_max);
      if (found) {
        result.valuables.push({
          name: found.name,
          type: isGem ? 'gemstone' : 'art_object',
          value_gp: found.value_gp,
          description: found.description
        });
      }
    }
  }

  // Step 9: Assemble Output & Calculate Total GP
  let totalGp = 0;
  if (result.currency.cp) totalGp += result.currency.cp * 0.01;
  if (result.currency.sp) totalGp += result.currency.sp * 0.1;
  if (result.currency.ep) totalGp += result.currency.ep * 0.5;
  if (result.currency.gp) totalGp += result.currency.gp;
  if (result.currency.pp) totalGp += result.currency.pp * 10;

  result.valuables.forEach(v => totalGp += v.value_gp);
  result.magic_items.forEach(m => totalGp += m.value_gp);

  result.total_gp_value = Math.floor(totalGp);

  return result;
};

/**
 * Picks a random item from the database matching category and rarity.
 * Useful for "identifying" mysterious items.
 */
export function getRandomItemByCriteria(category: string, rarity: string): Item | null {
  const possibleItems = (ITEMS_DATA as any[]).filter(item => {
    const itemType = (item.Type || "").toLowerCase();
    const itemRarity = (item.Rarity || "").toLowerCase();
    const targetCategory = category.toLowerCase();
    const targetRarity = rarity.replace('_', ' ').toLowerCase();

    // Match category (e.g. "Weapon" matches "Weapon, +1")
    const categoryMatch = itemType.includes(targetCategory);
    // Match rarity
    const rarityMatch = itemRarity === targetRarity;

    return categoryMatch && rarityMatch;
  });

  if (possibleItems.length === 0) return null;
  
  const selected = possibleItems[rollDice(possibleItems.length) - 1];
  return mapLootItemToItem(selected);
}
