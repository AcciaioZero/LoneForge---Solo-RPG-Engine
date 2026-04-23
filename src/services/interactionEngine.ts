import { GameState, NPC, Item, Ability, Enemy, Attribute, Skill } from '../types';
import INTERACTION_DATA from '../data/interaction_tables.json';
import BESTIARY_DATA from '../data/bestiary.json';
import ITEMS_DATA from '../data/items.json';
import SPELLS_DATA from '../data/Spells.json';
import { rollDice } from './gameEngine';

export interface InteractionResult {
  text: string;
  type: string;
  data?: any;
}

export function getInteractionResponse(
  interactionName: string,
  locationCategory: string,
  locationName: string,
  gameState: GameState,
  generateNpc: (role?: string) => NPC
): InteractionResult | null {
  const tables = INTERACTION_DATA.interaction_tables;
  
  // 1. Find the source: Specific Location Override or Generic Pool
  // We perform a more robust lookup to handle case sensitivity and suffixes
  const findInteraction = (pool: Record<string, any>, key: string): any => {
    // 1. Exact match
    if (pool[key]) return pool[key];
    
    // 2. Normalized match (without suffixes)
    const normalizedKey = key.replace(/\s*\(.*?\)\s*$/, '').trim();
    if (pool[normalizedKey]) return pool[normalizedKey];
    
    // 3. Case-insensitive search
    const lowerKey = key.toLowerCase();
    const lowerNormalized = normalizedKey.toLowerCase();
    
    const entry = Object.entries(pool).find(([k]) => {
      const kl = k.toLowerCase();
      return kl === lowerKey || kl === lowerNormalized || kl === k.replace(/\s*\(.*?\)\s*$/, '').trim().toLowerCase();
    });
    
    return entry ? entry[1] : null;
  };

  const locOverrides = tables.location_overrides[locationCategory] || {};
  let interaction = findInteraction(locOverrides, interactionName);
  
  if (!interaction) {
    interaction = findInteraction(tables.generic_pools, interactionName);
  }

  if (!interaction) return null;

  // 2. Resolve variables
  const replaceVars = (text: string | null | undefined): string => {
    if (!text) return "";
    let result = text;
    
    // {location}
    if (result.includes('{location}')) {
      const allLocations = (gameState.currentSettlement?.districts || []).flatMap(d => d.locations);
      const randomLoc = allLocations[rollDice(allLocations.length) - 1];
      result = result.replace(/{location}/g, randomLoc?.name || "a nearby shop");
    }

    // {npc_name}, {npc_role}
    if (result.includes('{npc_name}') || result.includes('{npc_role}')) {
      const tempNpc = generateNpc();
      result = result.replace(/{npc_name}/g, tempNpc.name);
      result = result.replace(/{npc_role}/g, tempNpc.role);
    }

    // {amount} - approximation based on character level
    if (result.includes('{amount}')) {
      const level = gameState.character.level || 1;
      let amount = 10;
      if (level < 5) amount = rollDice(20) + 5;
      else if (level < 11) amount = rollDice(100) + 50;
      else if (level < 17) amount = rollDice(500) + 200;
      else amount = rollDice(2000) + 1000;
      result = result.replace(/{amount}/g, amount.toString());
    }

    // {creature}
    if (result.includes('{creature}')) {
      const bestiary = BESTIARY_DATA as any[];
      const randomCreature = bestiary[rollDice(bestiary.length) - 1];
      result = result.replace(/{creature}/g, randomCreature.name || "dangerous beast");
    }

    // {item}
    if (result.includes('{item}')) {
      const items = ITEMS_DATA as any[];
      const randomItem = items[rollDice(items.length) - 1];
      result = result.replace(/{item}/g, randomItem.Name || "mysterious artifact");
    }

    // {spell}
    if (result.includes('{spell}')) {
      const spells = SPELLS_DATA as any[];
      const randomSpell = spells[rollDice(spells.length) - 1];
      result = result.replace(/{spell}/g, randomSpell.name || "secret cantrip");
    }

    // {district}
    if (result.includes('{district}')) {
      const districts = gameState.currentSettlement?.districts || [];
      const currentDistrict = districts.find(d => d.locations.some(l => l.name === locationName));
      result = result.replace(/{district}/g, currentDistrict?.name || "market");
    }

    return result;
  };

  // 3. Handle Types
  if (interaction.type === 'table_result') {
    const results = interaction.results || [];
    if (results.length === 0) return null;
    const rawText = results[rollDice(results.length) - 1];
    return {
      text: replaceVars(rawText),
      type: 'narrative'
    };
  }

  if (interaction.type === 'mechanic') {
    return {
      text: replaceVars(interaction.confirmation || `Executing ${interactionName}...`),
      type: 'mechanic',
      data: {
        function: interaction.function,
        cost: interaction.cost
      }
    };
  }

  if (interaction.type === 'cost_action') {
    const results = interaction.results || [];
    const rawText = results.length > 0 ? results[rollDice(results.length) - 1] : "";
    return {
      text: replaceVars(rawText) || replaceVars(interaction.confirmation),
      type: 'cost_action',
      data: {
        cost: interaction.cost,
        effect: interaction.effect,
        restore_amount: interaction.restore_amount,
        confirmation: replaceVars(interaction.confirmation)
      }
    };
  }

  if (interaction.type === 'skill_check') {
    return {
      text: replaceVars(`Prepare for a ${interaction.skill} check (DC ${interaction.dc}).`),
      type: 'skill_check',
      data: {
        skill: interaction.skill,
        dc: interaction.dc,
        onSuccess: replaceVars(interaction.results.success),
        onFailure: replaceVars(interaction.results.failure)
      }
    };
  }

  return null;
}
