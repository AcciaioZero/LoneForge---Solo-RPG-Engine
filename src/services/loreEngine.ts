/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LORE_TEMPLATES_DATA from '../data/lore_engine_templates.json';

export interface LoreModule {
  tone: string;
  titles: string[] | Record<string, string[]>;
  voices: string[] | Record<string, string[]>;
  hooks: string[];
  tables: Record<string, any>;
  connections: {
    probability: number;
    possible_modules: string[];
  };
}

export interface LoreResult {
  id: string;
  title: string;
  voice: string;
  hook: string;
  module: string;
  subType?: string;
  templates: {
    title: string;
    voices: string[];
    hook: string;
  };
  resolvedSlots: Record<string, string>;
  connection?: {
    module: string;
    label: string;
  };
}

const templates = LORE_TEMPLATES_DATA as any;

export const LORE_MODULES = Object.keys(templates.modules).filter(m => m !== 'version' && m !== 'shared_slots');

export function generateLore(moduleName: string, subType?: string, context: Record<string, string> = {}): LoreResult {
  const module = templates.modules[moduleName];
  if (!module) throw new Error(`Module ${moduleName} not found`);

  let finalSubType = subType;

  // Fase 1: Selezione del sotto-tipo (se non fornito)
  if (!finalSubType) {
    if (moduleName === 'gods_planes') {
      finalSubType = Math.random() > 0.5 ? 'deity' : 'plane';
    } else if (moduleName === 'lost_civilizations_history') {
      finalSubType = 'combined'; // civilization + event
    } else if (moduleName === 'prophecies_omens') {
      const delivery = drawFromTable(module.tables.delivery_type);
      if (delivery.includes('written') || delivery.includes('prophecy')) finalSubType = 'prophecy';
      else if (delivery.includes('vision')) finalSubType = 'vision';
      else finalSubType = 'omen';
    }
  }

  const resolvedSlots: Record<string, string> = { ...context };

  // Fase 2: Selezione dei template
  let titleTemplate = '';
  let voiceTemplates: string[] = [];
  let hookTemplate = drawFromList(module.hooks);

  if (moduleName === 'lost_civilizations_history') {
    if (finalSubType === 'civilization') {
      titleTemplate = drawFromList(module.titles?.civilization);
      voiceTemplates = [drawFromList(module.voices?.civilization)];
    } else if (finalSubType === 'event') {
      titleTemplate = drawFromList(module.titles?.event);
      voiceTemplates = [drawFromList(module.voices?.event)];
    } else {
      // Combined case
      titleTemplate = drawFromList(module.titles?.civilization); // Base title
      voiceTemplates = [
        drawFromList(module.voices?.civilization),
        drawFromList(module.voices?.event)
      ];
    }
  } else if (moduleName === 'gods_planes') {
    const sub = module[finalSubType || 'deity'];
    titleTemplate = drawFromList(sub?.titles);
    voiceTemplates = [drawFromList(sub?.voices)];
  } else {
    // Decoupled selection for modules with asymmetrical structures
    if (finalSubType && module.titles && !Array.isArray(module.titles) && (module.titles as any)[finalSubType]) {
      titleTemplate = drawFromList((module.titles as any)[finalSubType]);
    } else {
      titleTemplate = drawFromList(module.titles);
    }

    if (finalSubType && module.voices && !Array.isArray(module.voices) && (module.voices as any)[finalSubType]) {
      voiceTemplates = [drawFromList((module.voices as any)[finalSubType])];
    } else {
      voiceTemplates = [drawFromList(module.voices)];
    }
  }

  // Fase 3: Risoluzione degli slot
  // Troviamo tutti gli slot unici nei template
  const allTemplates = [titleTemplate, ...voiceTemplates, hookTemplate].join(' ');
  const slotRegex = /\{([a-z_]+)\}/g;
  let match;
  const slotsToResolve: string[] = [];
  while ((match = slotRegex.exec(allTemplates)) !== null) {
    if (!resolvedSlots[match[1]] && !slotsToResolve.includes(match[1])) {
      slotsToResolve.push(match[1]);
    }
  }

  // Risoviamo gli slot uno per uno
  slotsToResolve.forEach(slot => {
    resolvedSlots[slot] = resolveSlot(slot, moduleName, finalSubType);
  });

  // Fase 4: Applicazione dei valori ai template
  const applySlots = (text: string, slots: Record<string, string>) => {
    if (typeof text !== 'string') return '';
    return text.replace(/\{([a-z_]+)\}/g, (_, slot) => {
      return slots[slot] || `{${slot}}`;
    });
  };

  const finalTitle = applySlots(titleTemplate, resolvedSlots);
  const finalVoice = voiceTemplates.map(v => applySlots(v, resolvedSlots)).join('\n\n---\n\n');
  const finalHook = applySlots(hookTemplate, resolvedSlots);

  // Fase 5: Connessioni
  let connection;
  if (module.connections && Math.random() * 100 < module.connections.probability) {
    const nextModule = drawFromList(module.connections.possible_modules);
    if (nextModule) {
      connection = {
        module: nextModule,
        label: `Roll on ${(nextModule || '').replace(/_/g, ' ')}?`
      };
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: finalTitle,
    voice: finalVoice,
    hook: finalHook,
    module: moduleName,
    subType: finalSubType,
    templates: {
      title: titleTemplate,
      voices: voiceTemplates,
      hook: hookTemplate
    },
    resolvedSlots,
    connection
  };
}

export function updateLoreTexts(lore: LoreResult): LoreResult {
  const applySlots = (text: string, slots: Record<string, string>) => {
    if (typeof text !== 'string') return '';
    return text.replace(/\{([a-z_]+)\}/g, (_, slot) => {
      return slots[slot] || `{${slot}}`;
    });
  };

  return {
    ...lore,
    title: applySlots(lore.templates.title, lore.resolvedSlots),
    voice: lore.templates.voices.map(v => applySlots(v, lore.resolvedSlots)).join('\n\n---\n\n'),
    hook: applySlots(lore.templates.hook, lore.resolvedSlots)
  };
}

function resolveSlot(slot: string, moduleName: string, subType?: string): string {
  const module = templates.modules[moduleName];
  if (!module) return `{${slot}}`;
  
  // Priorità 1: Tabelle locali
  let table = module.tables ? module.tables[slot] : undefined;
  if (!table && subType && module.tables && module.tables[subType] && module.tables[subType][slot]) {
    table = module.tables[subType][slot];
  }

  if (table) {
    return drawFromList(table);
  }

  // Priorità 2: Shared slots (non generatori)
  if (templates.shared_slots && templates.shared_slots[slot] && !templates.shared_slots.name_generators?.[slot]) {
    return drawFromList(templates.shared_slots[slot]);
  }

  // Eccezione: {deity_name}
  if (slot === 'deity_name' && templates.modules?.gods_planes?.tables?.deity?.deity_name) {
    return drawFromList(templates.modules.gods_planes.tables.deity.deity_name);
  }

  // Priorità 3: Name Generators
  const gen = templates.shared_slots.name_generators[slot];
  if (gen) {
    if (slot === 'entity') {
      if (Math.random() > 0.4) {
        return drawFromList(gen.fixed_options);
      } else {
        const subGen = drawFromList(gen.generated_from);
        return resolveSlot(subGen, moduleName, subType);
      }
    }

    if (slot === 'object_name') {
       return `${drawFromList(gen.prefix)}${drawFromList(gen.adjective)} ${drawFromList(gen.noun)}`;
    }

    const prefix = drawFromList(gen.prefix || [""]);
    const root = drawFromList(gen.root || [""]);
    const suffix = drawFromList(gen.suffix || [""]);
    return `${prefix}${root}${suffix}`;
  }

  return `{${slot}}`;
}

function drawFromList(list: string[]): string {
  if (!list || list.length === 0) return "";
  return list[Math.floor(Math.random() * list.length)];
}

function drawFromTable(table: any): string {
  if (Array.isArray(table)) return drawFromList(table);
  return "";
}

export function randomizeSlot(lore: LoreResult, slotName: string): LoreResult {
  const newValue = resolveSlot(slotName, lore.module, lore.subType);
  const newResolvedSlots = { ...lore.resolvedSlots, [slotName]: newValue };
  
  return updateLoreTexts({
    ...lore,
    resolvedSlots: newResolvedSlots,
  });
}

export function updateSlotValue(lore: LoreResult, slotName: string, newValue: string): LoreResult {
  const newResolvedSlots = { ...lore.resolvedSlots, [slotName]: newValue };
  
  return updateLoreTexts({
    ...lore,
    resolvedSlots: newResolvedSlots,
  });
}
