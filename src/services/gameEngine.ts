/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ADVENTURE_QUESTS, ADVENTURE_HOOKS, NARRATIVE_BLOCKS, SKILL_ATTRIBUTES, DUNGEON_THEMES, SETTLEMENT_NAMES, SETTLEMENT_TYPES, WILDERNESS_TERRAINS, WILDERNESS_WEATHER, SETTLEMENT_EVENTS, WILDERNESS_BIOMES, NPC_NAMES, NPC_ROLES, NPC_RACES, NPC_ALIGNMENTS, NPC_DISPOSITIONS, NPC_TRAITS, NPC_GOALS, NPC_SECRETS, SETTLEMENT_CONFIG, DISTRICT_TYPES, DISTRICT_LOCATIONS, DISTRICT_DISTURBANCES, LOCATION_NAME_TEMPLATES, CAMP_DISTURBANCES, URBAN_ENCOUNTERS, FACTION_TYPES, FACTION_ALIGNMENTS, FACTION_INFLUENCE, FACTION_GOALS, FACTION_SECRETS, FACTION_MOTTOS } from '../constants';
import { OracleResult, Room, RoomRolls, Enemy, Item, Character, Skill, Settlement, WildernessTravel, Location, NPC, SettlementType, District, DistrictType, DistrictDisturbance, LootItem, Attribute, Ability, Faction, EncounterSuggestion, ItemQuest, LootResult, VendorMap, VendorProfile } from '../types';
import ITEMS_DATA from '../data/items.json';
import BESTIARY_DATA from '../data/bestiary.json';
import ITEM_QUEST_DATA from '../data/item_quest_tables.json';
import LOOT_DATA from '../data/loot_tables.json';
import VENDOR_MAP_DATA from '../data/vendor_map.json';

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

export const generateNarrative = (room: Room): string[] => {
  const narrative: string[] = [];
  
  // Intro
  const intro = NARRATIVE_BLOCKS.roomIntro[rollDice(NARRATIVE_BLOCKS.roomIntro.length) - 1];
  narrative.push(intro.replace('{type}', room.type));
  
  // Feature
  const feature = NARRATIVE_BLOCKS.features[rollDice(NARRATIVE_BLOCKS.features.length) - 1];
  narrative.push(feature.replace('{feature}', room.feature));
  
  // Trap
  if (room.trap) {
    narrative.push(`TRAP DETECTED: ${room.trap}`);
  }
  
  // Enemies / Encounter
  if (room.encounterDifficulty) {
    narrative.push(`ENCOUNTER: A ${room.encounterDifficulty} challenge awaits you here.`);
  } else if (room.enemies && room.enemies.length > 0) {
    const enemies = NARRATIVE_BLOCKS.enemies[rollDice(NARRATIVE_BLOCKS.enemies.length) - 1];
    narrative.push(enemies.replace('{count}', room.enemies.length.toString()));
  } else if (!room.loot) {
    // Empty room flavor
    narrative.push(NARRATIVE_BLOCKS.empty[rollDice(NARRATIVE_BLOCKS.empty.length) - 1]);
  }
  
  // Loot (optional, maybe don't reveal immediately in narrative if it's hidden?)
  // But the user asked for encounters too.
  if (room.loot) {
    const loot = NARRATIVE_BLOCKS.loot[rollDice(NARRATIVE_BLOCKS.loot.length) - 1];
    narrative.push(loot.replace('{item}', room.loot.name));
  }
  
  return narrative;
};

const CLUES_TABLE = [
  "A scrap of a map showing a hidden passage.",
  "A blood-stained journal entry mentioning a 'Great Eye'.",
  "A set of footprints that suddenly vanish into a wall.",
  "A broken key with a strange symbol on the head.",
  "A faint whispering coming from a nearby crack.",
  "A discarded locket with a portrait of a noble.",
  "A trail of silver dust leading deeper into the dungeon.",
  "A cryptic message carved into the floor: 'Trust the shadows'.",
  "A strange, glowing fungus that reacts to magic.",
  "A pile of bones arranged in a ritualistic pattern.",
  "A rusted shield with the emblem of a forgotten order.",
  "A single, perfectly preserved white feather.",
  "A broken arrow of a distinctive make, snapped recently.",
  "A weapon stained with dried blood, its origin unclear.",
  "A strange odour lingers in the air, impossible to identify.",
  "A faint, unsettling noise echoes from somewhere nearby.",
  "Tracks lead away from this area, ending abruptly.",
  "An embroidered pouch containing 1d10 platinum pieces, stitched with a stranger’s name.",
  "A magical compass that remains inert until the command word is discovered.",
  "A corpse gripping a sealed envelope marked with an unknown sigil.",
  "Fresh blood splatters the wall, one streak still slowly dripping.",
  "A body covered in meticulously drawn map symbols.",
  "A corpse marked with faintly glowing runic tattoos.",
  "A body contorted unnaturally, showing signs of crude surgical implants.",
  "A branded number burned into the back of the neck.",
  "Numerous healed wounds suggesting repeated punishment or torture.",
  "A childhood toy you had forgotten until this moment.",
  "Loud cawing of ravens or crows echoing from somewhere nearby.",
  "A pendant with a missing piece, its design incomplete.",
  "Sacks of bloody corn and wheat stacked against the wall.",
  "A brief flash of purplish light at the edge of your vision.",
  "A thin layer of frost covering the room or the corpse."
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

const BANE_TABLE = [
  "Curse of Shadows: A hidden curse weakens you in your next combat, imposing a 1d6 penalty to attacks and saves until you succeed a Charisma save.",
  "Dark Foreboding: Disadvantage on attacks against a random creature type for the rest of the quest unless you pass a high Wisdom save.",
  "Moment of Weakness: All your damage resistances are suppressed during your next combat.",
  "Stiff Limbs: -1 to all Dexterity checks and saves until your next long rest.",
  "Sickened: -2 to all Constitution checks and saves until your next long rest.",
  "Thieving Rascals: Lose a random item or 1d10 * 10 gp from your pack.",
  "Dancing Lights: Fail a Wisdom save and either lose Inspiration or take 2d6 psychic damage.",
  "Resistance Nullified: All your resistances are disabled until your next long rest.",
  "Cursed Voice: Disadvantage on speech-based Charisma checks; verbal spells require a Constitution check or fail.",
  "Weakest Link: You cannot participate in flanking during your next combat.",
  "Arcane Memory Loss: In your next combat, you may cast only one spell or cantrip per turn, never both.",
  "Brain Fog: –1 to Wisdom and Intelligence checks and saves for the rest of the quest.",
  "Deserted by Luck: Your next three saving throws are made at disadvantage.",
  "Lead in Your Boots: On your next initiative roll, your speed is halved for the first two rounds.",
  "Fear the Reaper: If you must make death saves this quest, you automatically fail the first one.",
  "Clumsy: Disadvantage on all Dexterity checks and saves until your next combat ends.",
  "Slow Healer: Magical healing restores only half its normal amount for the rest of the quest.",
  "Berserker Rage: The next time you're hit, you make an immediate extra attack at disadvantage; that enemy gains advantage on their next attack against you.",
  "Nightmares: Your next encounter with a non-humanoid forces a high Wisdom save or you begin frightened.",
  "Insomniac: Your next long rest may fail, causing reduced healing and loss of one class feature refresh.",
  "Weak Hitter: In your next combat, reduce each of your damage rolls by tier * d4.",
  "Forgetful Caster: Randomly lose access to one spell (not a cantrip) until your next long rest.",
  "Tired in Your Bones: Your maximum HP is reduced by 5 until your next long rest.",
  "Curse of Withering: You age 10 years and gain one level of exhaustion.",
  "Rust Never Sleeps: If wearing metal armor, your AC is reduced by 1 until repaired.",
  "Jammed Crossbow: If you use a crossbow, rolling a natural 1 jams it, requiring an action to clear.",
  "Wild Magic Flux: In your next combat, failed spellcasting checks trigger a wild magic surge.",
  "NPC Exhausted: Your companion gains exhaustion or reduced max HP until their next long rest.",
  "Curse of Madness: Failed Wisdom saves cause short-term madness; rare cases trigger long-term madness.",
  "Vulnerable: You gain vulnerability to a random physical damage type for your next combat.",
  "Magic Susceptibility: Disadvantage on your next three saves against spells or magical effects.",
  "Elemental Susceptibility: Vulnerability to fire, cold, lightning, or force for the rest of the quest.",
  "Unproficient: Lose proficiency in a random skill until the quest ends.",
  "Rusty Weapon: A steel weapon deals -d4 damage and breaks on a natural 1 until repaired.",
  "Kelemvor’s Wrath: A random penalty affecting healing, death saves, or finishing blows.",
  "Unsure Footing: In your next combat, fail a Dexterity save before moving and your speed is halved.",
  "Tainted Potion: One potion triggers a dangerous magical reaction when consumed.",
  "Conspicuous: You have disadvantage on Stealth; enemies detect you more easily for the quest.",
  "Heightened Danger: Your next 6d12 dungeon roll increases each die by +1.",
  "Bestow Curse: A party member suffers a curse-like effect in the next combat.",
  "Darkness Descends: The current area is engulfed in magical darkness affecting only you.",
  "Bane Effect: A party member suffers a bane-like penalty in the next combat.",
  "Command Curse: A random character becomes compelled to perform a mysterious task.",
  "Illusory Area: The current room is an illusion; your next 6d12 roll is modified and enemies surprise you.",
  "Invisible Trap: You trigger a hidden trap; you may still attempt a saving throw.",
  "Hallucinatory Spores: In your next combat, failed Constitution saves impose disadvantage on attacks.",
  "Curse of Hideousness: Disadvantage on all Charisma checks until the curse is removed.",
  "Slow Regeneration: Long rests restore only half your maximum HP.",
  "Speechless: A random character loses the ability to speak until the curse ends.",
  "Arch Enemy: A powerful extraplanar foe marks a character and becomes a recurring threat.",
  "Faltering Focus: Disadvantage on concentration checks until your next long rest.",
  "Shaking Hands: -2 to ranged attack rolls until your next combat ends.",
  "Dull Blade: Your melee attacks deal -2 damage for the next encounter.",
  "Unsteady Mind: Disadvantage on Intelligence saves until your next long rest.",
  "Cursed Luck: Your next attack roll automatically misses.",
  "Heavy Heart: Disadvantage on Wisdom saves for the next encounter.",
  "Sluggish Reflexes: Your initiative roll is reduced by -5 next combat.",
  "Distracted: Disadvantage on Perception checks for the rest of the quest.",
  "Mana Leak: Your next spell cast automatically fails but does not consume a slot.",
  "Shattered Nerves: Disadvantage on all fear-related saves for the quest.",
  "Weak Grip: You drop your weapon on a natural 1 or 2 during your next combat.",
  "Cursed Footfall: Your movement provokes opportunity attacks even when it normally wouldn’t.",
  "Fogged Vision: -2 to attack rolls with ranged or finesse weapons until long rest.",
  "Arcane Disruption: Your next spell has its damage halved.",
  "Broken Focus: You cannot take reactions during your next combat.",
  "Unlucky Step: The next trap you encounter automatically triggers.",
  "Cursed Aim: Your next ranged attack is made at disadvantage.",
  "Shivering Chill: -1 to Constitution saves for the rest of the quest.",
  "Mental Static: Disadvantage on spell attack rolls until your next long rest.",
  "Cursed Burden: Your carrying capacity is halved for the quest.",
  "Dulled Instincts: You cannot benefit from advantage on initiative rolls.",
  "Shadow Weight: Your jump distance is halved until long rest.",
  "Cursed Touch: Healing you receive is reduced by 2d4 once.",
  "Unfocused Mind: You cannot maintain concentration for more than 2 rounds.",
  "Slowed Pulse: Your speed is reduced by 10 ft for the next encounter.",
  "Cursed Sight: You cannot see invisible creatures until long rest.",
  "Jittery: Disadvantage on Stealth checks for the next encounter.",
  "Arcane Backlash: Your next spell deals 1d6 psychic damage to you.",
  "Weak Pulse: Your hit point maximum is reduced by 1d6 until long rest.",
  "Cursed Fortune: Your next saving throw is made at disadvantage.",
  "Unsteady Weapon: Your next melee attack is made at disadvantage.",
  "Dampened Spirit: You cannot gain Inspiration until long rest.",
  "Fading Strength: -1 to Strength checks and saves until long rest.",
  "Fading Agility: -1 to Dexterity checks and saves until long rest.",
  "Fading Will: -1 to Wisdom checks and saves until long rest.",
  "Fading Intellect: -1 to Intelligence checks and saves until long rest.",
  "Fading Presence: -1 to Charisma checks and saves until long rest.",
  "Cursed Echo: Your next spell has its range halved.",
  "Unlucky Draw: Your next loot roll is made at disadvantage.",
  "Cursed Momentum: You cannot Dash during your next combat.",
  "Doomed Step: The next enemy attack against you has advantage.",
  "Frail Spirit: You gain one level of exhaustion.",
  "Cursed Blood: You take +2 damage from the next three hits you suffer.",
  "Unstable Magic: Your next spell triggers a harmless but distracting magical flare.",
  "Cursed Mind: Disadvantage on Insight checks for the quest.",
  "Cursed Body: Disadvantage on Athletics checks for the quest.",
  "Cursed Soul: Disadvantage on death saves until long rest.",
  "Dread Omen: Your next attack roll automatically has disadvantage.",
  "Shadow Sickness: You take 1d6 necrotic damage at the start of your next combat.",
  "Broken Courage: You cannot move toward the first enemy you see in your next encounter.",
  "Cursed Silence: You cannot speak above a whisper until long rest.",
  "Dimming Light: You cannot benefit from magical light sources for the quest.",
  "Fading Echo: Your footsteps become loud; disadvantage on Stealth for the quest.",
  "Cursed Fate: The next time you roll a natural 20, treat it as a natural 1 instead."
];


const BOON_TABLE = [
  "Magic Resistance: Advantage on saving throws against spells and magical effects for the rest of the quest.",
  "Blessing of Torm: Turn one missed melee attack into a hit.",
  "Peerless Aim: Add +20 to a ranged attack roll, twice.",
  "Quickening: Take an extra action on your turn once.",
  "Perfect Health: Immune to disease and poison; advantage on Constitution saves for the quest.",
  "Fitting Armour: Gain +2 AC as a reaction up to 1d4 times.",
  "Revitalising Touch: Instantly gain the benefits of a long rest.",
  "Planar Travel: Cast plane shift on yourself 1d4 times without components.",
  "Animal Insight: Advantage on Animal Handling and +2 to animal-related Perception checks.",
  "Quick Casting: One chosen spell (1st–3rd level) now casts as a bonus action until next long rest.",
  "Night Spirit: Become invisible in dim light or darkness once.",
  "Arcane Blessing: Cast one spell outside your class list once, up to half your level.",
  "Versatile: Make any saving throw with advantage 1d4 times.",
  "Animal Conjuring: Cast conjure animals (3rd level) three times.",
  "Blessing of Protection: +1 AC and saving throws for the quest.",
  "Combat Prowess: Turn a missed melee attack into a hit 1d4 times.",
  "Fortunate Find: Discover a magic item from a loot table.",
  "Feather Charm: Gain feather fall benefits for 1d10 days.",
  "Stormborn: Immune to lightning and thunder; cast thunderwave at will for the quest.",
  "Wound Closure: Gain the benefits of a periapt of wound closure until next long rest.",
  "Heroism Charm: Gain the effects of a potion of heroism once.",
  "Dimensional Step: Cast misty step 1d6 times.",
  "Vitality Charm: Gain the effects of a potion of vitality once.",
  "Weapon Enhancement: One nonmagical weapon becomes +1 while you wield it.",
  "Boon of Luck: Add 1d10 to a roll 1d4 times.",
  "Silver Spoon: Reroll one failed loot presence check.",
  "Recovery: Regain half your max HP as a bonus action once.",
  "Eagle’s Eye: Turn a missed ranged attack into a hit once.",
  "Resilience: Gain resistance to nonmagical physical damage 1d4 times.",
  "Bane of Enemies: Force an enemy to reroll a success three times.",
  "Speed: +30 ft speed and bonus action Dash/Disengage for 1d4 days.",
  "Rogue’s Cunning: Use Cunning Action twice.",
  "Spell Mastery: Cast a chosen 1st-level spell without slots until next long rest.",
  "Highly Attuned: Advantage on all Perception checks until next long rest.",
  "Spell Recall: Cast any known/prepared spell without a slot 1d4 times.",
  "Spectral Form: +2 AC once per encounter for the quest.",
  "Fire Soul: Immune to fire; cast burning hands at will for 1d4 days.",
  "Blessing of Health: Constitution +2 (max 22) for the quest.",
  "Irresistibility: Ignore resistances for 1d4 attacks.",
  "Invincibility: Reduce one instance of damage to 0.",
  "Valhalla: Cast spirit guardians (3rd level) twice.",
  "High Magic: Gain one extra highest-level spell slot for the quest.",
  "Understanding: Wisdom +2 (max 22) for the quest.",
  "Restoration Charm: Cast lesser/greater restoration using 6 total charges.",
  "Truesight: Gain truesight 60 ft for 1d6 days.",
  "Fortitude: Increase max HP by tier × 10 for the quest.",
  "Fate: Add or subtract 1d10 from a creature’s roll once per short rest.",
  "Slayer Charm: One sword becomes a dragon or giant slayer for 1d6 days.",
  "Undetectability: +10 Stealth and immunity to divination for the quest.",
  "Resurrection: The next time you die, you return with half HP and may act immediately."
];


const RANDOM_EVENTS_TABLE = [
  "A ghost appears and asks for a favor.",
  "The room begins to slowly fill with sand.",
  "A mysterious merchant appears for one turn.",
  "A swarm of harmless bats flies through the room.",
  "A strange portal opens briefly, showing another world.",
  "The gravity in the room shifts, making movement difficult.",
  "A sudden chill sweeps through the room, and every torch flickers violently for a few seconds.",
  "You hear distant chanting echoing through the corridors, but it fades the moment you try to follow it.",
  "A faint smell of incense drifts by, as if someone recently passed through this area.",
  "A ghostly afterimage of a figure appears for a heartbeat, then vanishes without a trace.",
  "A soft vibration pulses through the floor, like the heartbeat of something deep below.",
  "A gust of wind blows through the room despite the lack of openings, carrying faint whispers.",
  "A nearby wall briefly glows with runic symbols before fading back to plain stone.",
  "A piece of furniture or debris shifts slightly on its own, as if nudged by an unseen force.",
  "A distant metallic clang echoes through the dungeon, followed by complete silence.",
  "A faint illusion overlays the room, showing how it might have looked centuries ago.",
  "A sudden wave of déjà vu washes over the party, as if they’ve stood here before.",
  "A candle or torch ignites by itself, burning with an unusual color for a few seconds.",
  "A cold mist rolls across the floor, obscuring your feet before dissipating.",
  "A disembodied voice whispers a single word in a language none of you recognize.",
  "A nearby statue or carving seems to shift its gaze when no one is looking directly at it.",
  "A ripple of arcane energy passes through the air, making hair stand on end.",
  "A faint heartbeat-like thumping echoes from behind a wall, then stops abruptly.",
  "A shadow moves independently of its source for a brief moment.",
  "A small object on the ground (a coin, a pebble, a bone) rotates slowly, then stops pointing in a random direction.",
  "The temperature spikes suddenly—either uncomfortably hot or freezing cold—before returning to normal."
];

const SKILL_CHALLENGES_TABLE = [
  "A complex lock bars the way. (Sleight of Hand DC 13)",
  "Ancient runes must be deciphered. (Arcana DC 12)",
  "A narrow ledge must be traversed. (Acrobatics DC 12)",
  "A suspicious NPC must be convinced. (Persuasion DC 13)",
  "A hidden mechanism must be found. (Investigation DC 12)",
  "A section of the ceiling groans and begins to collapse. Make a DC 14 Dexterity check to dive clear before the stones fall.",
  "A heavy iron gate begins to descend behind you. Make a DC 15 Strength check to hold it up long enough for the party to pass.",
  "Ancient runes flicker on a wall, rearranging themselves into a puzzle. Make a DC 16 Intelligence (Arcana) check to stabilize the magic before it detonates.",
  "A terrified NPC refuses to move forward. Make a DC 13 Charisma (Persuasion) check to calm them and keep the group together.",
  "A narrow ledge crumbles beneath your feet. Make a DC 14 Dexterity (Acrobatics) check to maintain balance.",
  "A rope bridge sways violently over a chasm. Make a DC 15 Strength (Athletics) check to anchor it before it snaps.",
  "A magical ward hums with unstable energy. Make a DC 16 Intelligence (Arcana) check to safely discharge it.",
  "A faint clicking sound echoes beneath your boots. Make a DC 15 Wisdom (Perception) check to locate the pressure plate before it triggers.",
  "A psychic whisper claws at your mind. Make a DC 14 Wisdom save to resist its influence.",
  "A wounded ally collapses, bleeding out. Make a DC 13 Wisdom (Medicine) check to stabilize them.",
  "A thick fog hides a sudden drop. Make a DC 15 Wisdom (Survival) check to find a safe path.",
  "A spectral figure materializes, demanding answers. Make a DC 16 Charisma (Intimidation) or (Persuasion) check to avoid provoking it.",
  "A shifting illusion distorts the room’s geometry. Make a DC 15 Intelligence (Investigation) check to determine what is real.",
  "A swarm of bats erupts from the ceiling. Make a DC 14 Dexterity save to avoid being overwhelmed.",
  "A cursed idol radiates malevolent energy. Make a DC 16 Wisdom (Religion) check to contain its influence.",
  "A slick stone ramp sends you sliding toward spikes. Make a DC 15 Dexterity (Acrobatics) check to stop yourself.",
  "A magical storm crackles overhead. Make a DC 16 Intelligence (Arcana) check to shield yourself from the surge.",
  "A hidden alcove contains a strange mechanism. Make a DC 14 Intelligence (Investigation) check to understand its purpose.",
  "A massive stone door seals shut behind you. Make a DC 17 Strength (Athletics) check to force it open."
];

const TRAP_TABLE = [
  "Poison Darts — DC 11 Dex save — +10 attack — damage: (PC level - 3) d6 (min 1d6).",
  "Collapsing Roof — DC 11 Dex save — +10 attack — damage: (PC level - 2) d6 (min 1d6).",
  "Simple Pit — DC 11 Dex save — +11 attack — damage: (PC level - 1) d6 (min 1d6).",
  "Hidden Pit — DC 11 Dex save — +12 attack — damage: (PC level - 1) d6 (min 1d6).",
  "Locking Pit — DC 12 Dex save — +12 attack — damage: (PC level) d6.",
  "Spiked Pit — DC 12 Dex save — +13 attack — damage: (PC level) d6.",
  "Rolling Boulder — DC 12 Dex save — +14 attack — damage: (PC level) d6.",
  "Scything Blade — DC 13 Dex save — +14 attack — damage: (PC level + 1) d6.",
  "Elemental Glyph (fire/cold/force/lightning) — DC 14 save — +15 attack — damage: (PC level + 1) d6.",
  "Magic Bolt Trap — DC 14 Dex save — +15 attack — damage: (PC level + 1) d6.",
  "Poison Gas / Acid Spray — DC 15 Con save — +16 attack — damage: (PC level + 1) d6.",
  "Flooding Chamber — DC 15 Str save — +16 attack — damage: (PC level + 2) d6.",
  "Closing Walls — DC 16 Str save — +17 attack — damage: (PC level + 2) d6.",
  "Floor Spears — DC 17 Dex save — +18 attack — damage: (PC level + 2) d6.",
  "Falling Spiked Grate — DC 17 Dex save — +19 attack — damage: (PC level × 1.5) d6.",
  "Trapdoor Drop (snakes/acid below) — DC 18 Dex save — +20 attack — damage: (PC level × 2) d6.",
  "Arcane Pulse Rune — DC 15 Wis save — +15 attack — damage: (PC level + 1) d6.",
  "Explosive Sigil — DC 16 Dex save — +17 attack — damage: (PC level + 2) d6.",
  "Swinging Log Trap — DC 13 Dex save — +14 attack — damage: (PC level) d6.",
  "Needle Floor — DC 12 Dex save — +12 attack — damage: (PC level - 1) d6 (min 1d6)."
];


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

  let clue: string | undefined;
  if (rolls.blue >= 7) {
    clue = CLUES_TABLE[rollDice(CLUES_TABLE.length) - 1];
  }

  let environmentFeature: string | undefined;
  let trap: string | undefined;
  if (rolls.green >= 7) {
    if (rolls.green === 12) {
      trap = TRAP_TABLE[rollDice(TRAP_TABLE.length) - 1];
      // Replace {PC level} with actual level in trap description if needed
      trap = trap.replace(/\(PC level\)/g, characterLevel.toString());
      trap = trap.replace(/\(PC level - 1\)/g, Math.max(1, characterLevel - 1).toString());
      trap = trap.replace(/\(PC level - 2\)/g, Math.max(1, characterLevel - 2).toString());
      trap = trap.replace(/\(PC level - 3\)/g, Math.max(1, characterLevel - 3).toString());
      trap = trap.replace(/\(PC level \+ 1\)/g, (characterLevel + 1).toString());
      trap = trap.replace(/\(PC level \+ 2\)/g, (characterLevel + 2).toString());
      trap = trap.replace(/\(PC level × 1.5\)/g, Math.floor(characterLevel * 1.5).toString());
      trap = trap.replace(/\(PC level × 2\)/g, (characterLevel * 2).toString());
    } else {
      environmentFeature = ENVIRONMENT_FEATURES_TABLE[rollDice(ENVIRONMENT_FEATURES_TABLE.length) - 1];
    }
  }

  let npc: NPC | undefined;
  if (rolls.red >= 7) {
    npc = generateNPC();
  }

  let event: string | undefined;
  if (rolls.multicolour >= 7) {
    if (rolls.multicolour === 7) event = "Bane: " + BANE_TABLE[rollDice(BANE_TABLE.length) - 1];
    else if (rolls.multicolour === 8) event = "Boon: " + BOON_TABLE[rollDice(BOON_TABLE.length) - 1];
    else if (rolls.multicolour <= 10) event = "Random Event: " + RANDOM_EVENTS_TABLE[rollDice(RANDOM_EVENTS_TABLE.length) - 1];
    else event = "Skill Challenge: " + SKILL_CHALLENGES_TABLE[rollDice(SKILL_CHALLENGES_TABLE.length) - 1];
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
    case 'green': // Environment/Trap
      newRoom.environmentFeature = undefined;
      newRoom.trap = undefined;
      if (newRoll >= 7) {
        if (newRoll === 12) {
          let trap = TRAP_TABLE[rollDice(TRAP_TABLE.length) - 1];
          trap = trap.replace(/\(PC level\)/g, characterLevel.toString());
          trap = trap.replace(/\(PC level - 1\)/g, Math.max(1, characterLevel - 1).toString());
          trap = trap.replace(/\(PC level - 2\)/g, Math.max(1, characterLevel - 2).toString());
          trap = trap.replace(/\(PC level - 3\)/g, Math.max(1, characterLevel - 3).toString());
          trap = trap.replace(/\(PC level \+ 1\)/g, (characterLevel + 1).toString());
          trap = trap.replace(/\(PC level \+ 2\)/g, (characterLevel + 2).toString());
          trap = trap.replace(/\(PC level × 1.5\)/g, Math.floor(characterLevel * 1.5).toString());
          trap = trap.replace(/\(PC level × 2\)/g, (characterLevel * 2).toString());
          newRoom.trap = trap;
        } else {
          newRoom.environmentFeature = ENVIRONMENT_FEATURES_TABLE[rollDice(ENVIRONMENT_FEATURES_TABLE.length) - 1];
        }
      }
      break;
    case 'red': // NPC
      newRoom.npc = undefined;
      if (newRoll >= 7) {
        newRoom.npc = generateNPC();
      }
      break;
    case 'multicolour': // Events
      newRoom.event = undefined;
      if (newRoll >= 7) {
        if (newRoll === 7) newRoom.event = "Bane: " + BANE_TABLE[rollDice(BANE_TABLE.length) - 1];
        else if (newRoll === 8) newRoom.event = "Boon: " + BOON_TABLE[rollDice(BOON_TABLE.length) - 1];
        else if (newRoll <= 10) newRoom.event = "Random Event: " + RANDOM_EVENTS_TABLE[rollDice(RANDOM_EVENTS_TABLE.length) - 1];
        else newRoom.event = "Skill Challenge: " + SKILL_CHALLENGES_TABLE[rollDice(SKILL_CHALLENGES_TABLE.length) - 1];
      }
      break;
  }

  return newRoom;
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

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: template.Name,
    type: itemType,
    subType: template.Type,
    description: template.Text || "",
    value: parseInt(template.Value?.replace(/[^0-9]/g, '') || '0') || 0,
    weight: template.Weight || undefined,
    rarity: template.Rarity,
    cost: template.Value || undefined,
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
  for (let j = 0; j < npcCount; j++) {
    npcs.push(generateNPC());
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

export const generateCampDisturbance = () => {
  return CAMP_DISTURBANCES[rollDice(CAMP_DISTURBANCES.length) - 1];
};

export const generateCampDisturbanceByCategory = (range: [number, number]) => {
  const [min, max] = range;
  const count = max - min + 1;
  const index = min + rollDice(count) - 1;
  return CAMP_DISTURBANCES[index];
};

export const generateAdventure = () => {
  const quest = ADVENTURE_QUESTS[rollDice(ADVENTURE_QUESTS.length) - 1];
  return {
    problem: quest.problem,
    result: quest.result,
    hook: ADVENTURE_HOOKS[rollDice(ADVENTURE_HOOKS.length) - 1]
  };
};

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

export const generateWildernessEvent = (terrain: string) => {
  const biome = WILDERNESS_BIOMES[terrain] || WILDERNESS_BIOMES['Ancient Forest'];
  return biome.events[rollDice(biome.events.length) - 1];
};

export const generateWildernessDiscovery = (terrain: string) => {
  const biome = WILDERNESS_BIOMES[terrain] || WILDERNESS_BIOMES['Ancient Forest'];
  return biome.discoveries[rollDice(biome.discoveries.length) - 1];
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

export const generateFaction = (): Faction => {
  const type = FACTION_TYPES[rollDice(FACTION_TYPES.length) - 1];
  const alignment = FACTION_ALIGNMENTS[rollDice(FACTION_ALIGNMENTS.length) - 1];
  const influence = FACTION_INFLUENCE[rollDice(FACTION_INFLUENCE.length) - 1];
  const goal = FACTION_GOALS[rollDice(FACTION_GOALS.length) - 1];
  const secret = FACTION_SECRETS[rollDice(FACTION_SECRETS.length) - 1];
  const motto = FACTION_MOTTOS[rollDice(FACTION_MOTTOS.length) - 1];
  
  // Generate a name
  const prefixes = ['The', 'Order of the', 'Circle of', 'House', 'Brotherhood of', 'Sons of', 'Daughters of', 'League of', 'Guild of'];
  const nouns = ['Shadow', 'Light', 'Steel', 'Flame', 'Stone', 'Wind', 'Blood', 'Gold', 'Iron', 'Oak', 'Raven', 'Wolf', 'Dragon', 'Serpent', 'Skull', 'Crown', 'Shield', 'Sword'];
  const suffixes = ['Foundry', 'Keep', 'Sanctum', 'Vault', 'Hold', 'Tower', 'Hall', 'Cabal', 'Covenant', 'Alliance', 'Union', 'Syndicate'];
  
  const prefix = prefixes[rollDice(prefixes.length) - 1];
  const noun = nouns[rollDice(nouns.length) - 1];
  const suffix = rollDice(2) === 1 ? suffixes[rollDice(suffixes.length) - 1] : '';
  
  const name = `${prefix} ${noun}${suffix ? ' ' + suffix : ''}`;
  
  // Generate a leader
  const leaderNpc = generateNPC();
  const leader = `${leaderNpc.name} (${leaderNpc.race} ${leaderNpc.role})`;
  
  const headquarters = `${noun} ${suffix || 'Stronghold'}`;
  
  const description = `A ${influence.toLowerCase()} ${type.toLowerCase()} aligned with ${alignment.toLowerCase()}. Their primary objective is to ${goal.toLowerCase()}.`;

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
    headquarters
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
          description: `A powerful item of ${rarity.replace('_', ' ')} quality. Its exact properties are yet to be identified.`,
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
