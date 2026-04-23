import * as React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Character, GameState, Enemy, Room, LogEntry, GameContext, Attribute, Skill, Ability, Item, Background, Species, CharacterClass, Spell, SpellSlot, SettlementType, SettlementEvent, Npc, Faction, Quest, OracleResponse, Notification, RoomRolls, Companion, EncounterSuggestion, ItemQuest, ActiveDowntime, DowntimeEvent
} from '../types';
import { 
  INITIAL_CHARACTER, INITIAL_GAME_STATE, ORACLE_LIKELIHOODS, DIFFICULTY_CLASSES, SETTLEMENT_TYPES, SKILL_ATTRIBUTES, CR_VALUES, SETTLEMENT_EVENTS, WILDERNESS_TERRAINS, WILDERNESS_BIOMES, CAMP_DISTURBANCE_CATEGORIES, URBAN_EVENT_CATEGORIES, SPECIES_TEMPLATES, BACKGROUND_TEMPLATES, SITUATION_VERBS
} from '../constants';
import { 
  generateFaction, generateLoot, rollDice, getModifier, calculateAc, parseDamage, generateRoom, generateNarrative, rerollCategory, getOracleResponse, getPrevXpThreshold, getXpRequired, getSkillModifier, getSuggestedRoleForLocation, crToNumber, generateSettlement, getProficiencyBonus,
  generateWildernessEvent, generateWildernessDiscovery, generateCampDisturbance, generateCampDisturbanceByCategory, generateUrbanEvent, generateUrbanEventByCategory, generateDistrictDisturbance, generateAdventure,
  ALL_BESTIARY_ENEMIES, generateEncounterSuggestions, generateItemQuest, generateNPC
} from '../services/gameEngine';
import { getInteractionResponse } from '../services/interactionEngine';
import ITEMS_DATA from '../data/items.json';
import BESTIARY_DATA from '../data/bestiary.json';
import CLASSES_DATA from '../data/classes.json';
import DOWNTIME_DATA from '../data/downtime_activities.json';

export function useGameState() {
  // --- Bestiary Data ---
  const monsterTypes = useMemo(() => Array.from(new Set(ALL_BESTIARY_ENEMIES.map((m: any) => m.type))).sort(), []);

  const ALL_BESTIARY_ENEMIES_VAL = useMemo(() => ALL_BESTIARY_ENEMIES, []);

  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('loneforge_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Robust merge to handle schema changes and prevent NaN
        const character: Character = {
          ...INITIAL_CHARACTER,
          ...parsed.character,
          species: parsed.character?.species ?? INITIAL_CHARACTER.species,
          background: parsed.character?.background ?? INITIAL_CHARACTER.background,
          stats: {
            ...INITIAL_CHARACTER.stats,
            ...(parsed.character?.stats || {})
          },
          // Handle specific renames or missing fields
          baseAc: parsed.character?.baseAc ?? parsed.character?.ac ?? INITIAL_CHARACTER.baseAc,
          maxHp: parsed.character?.maxHp ?? parsed.character?.hp ?? INITIAL_CHARACTER.maxHp,
          hp: parsed.character?.hp ?? INITIAL_CHARACTER.hp,
          level: parsed.character?.level ?? INITIAL_CHARACTER.level,
          gold: parsed.character?.gold ?? INITIAL_CHARACTER.gold,
          cp: parsed.character?.cp ?? INITIAL_CHARACTER.cp,
          sp: parsed.character?.sp ?? INITIAL_CHARACTER.sp,
          ep: parsed.character?.ep ?? INITIAL_CHARACTER.ep,
          pp: parsed.character?.pp ?? INITIAL_CHARACTER.pp,
          proficiencies: Array.isArray(parsed.character?.proficiencies) ? parsed.character.proficiencies : [],
          savingThrowProficiencies: Array.isArray(parsed.character?.savingThrowProficiencies) ? parsed.character.savingThrowProficiencies : INITIAL_CHARACTER.savingThrowProficiencies,
          speed: parsed.character?.speed ?? INITIAL_CHARACTER.speed,
          hitDie: parsed.character?.hitDie ?? INITIAL_CHARACTER.hitDie,
          inventory: Array.isArray(parsed.character?.inventory) ? parsed.character.inventory : [],
          treasure: Array.isArray(parsed.character?.treasure) ? parsed.character.treasure : [],
          abilities: Array.isArray(parsed.character?.abilities) ? parsed.character.abilities : INITIAL_CHARACTER.abilities,
          customAbilities: Array.isArray(parsed.character?.customAbilities) ? parsed.character.customAbilities : [],
          companions: Array.isArray(parsed.character?.companions) ? parsed.character.companions : []
        };
        
        // Ensure numeric values are actually numbers
        character.hp = Number(character.hp) || 0;
        character.maxHp = Number(character.maxHp) || 20;
        character.baseAc = Number(character.baseAc) || 10;
        character.level = Number(character.level) || 1;
        character.gold = Number(character.gold) || 0;
        character.cp = Number(character.cp) || 0;
        character.sp = Number(character.sp) || 0;
        character.ep = Number(character.ep) || 0;
        character.pp = Number(character.pp) || 0;
        character.xp = Number(character.xp) || 0;
        (Object.keys(character.stats) as Attribute[]).forEach(key => {
          character.stats[key] = Number(character.stats[key]) || 10;
        });

        return {
          ...parsed,
          character,
          logs: Array.isArray(parsed.logs) ? parsed.logs : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
          context: parsed.context || 'Narrative',
          initiativeOrder: Array.isArray(parsed.initiativeOrder) ? parsed.initiativeOrder : [],
          activeCombatantIndex: Number(parsed.activeCombatantIndex) || 0,
          roomsExplored: Number(parsed.roomsExplored) || 0,
          travel: parsed.travel || null,
          activeDowntime: parsed.activeDowntime || null,
          dungeonConfig: parsed.dungeonConfig || null,
          arenaSelection: Array.isArray(parsed.arenaSelection) ? parsed.arenaSelection : [],
          npcHistory: Array.isArray(parsed.npcHistory) ? parsed.npcHistory : [],
          discoveredCompendiumQuests: parsed.discoveredCompendiumQuests || {}
        };
      } catch (e) {
        console.error("Failed to load save:", e);
        return INITIAL_GAME_STATE;
      }
    }
    return INITIAL_GAME_STATE;
  });

  // --- UI State ---
  const [activeTab, setActiveTab] = useState('adventure');
  const [isXpModalOpen, setIsXpModalOpen] = useState(false);
  const [xpToEdit, setXpToEdit] = useState(0);
  const [isHpModalOpen, setIsHpModalOpen] = useState(false);
  const [hpToEdit, setHpToEdit] = useState(0);
  const [tempHpToEdit, setTempHpToEdit] = useState(0);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isSpellCastModalOpen, setIsSpellCastModalOpen] = useState(false);
  const [inspectedEntity, setInspectedEntity] = useState<{ type: 'item' | 'npc' | 'enemy' | 'spell', data: any } | null>(null);

  // Encounter Suggester State
  const [suggesterDifficulty, setSuggesterDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Deadly'>('Medium');
  const [suggesterTypeFilter, setSuggesterTypeFilter] = useState('All');
  const [suggesterEnvFilter, setSuggesterEnvFilter] = useState('All');
  const [encounterSuggestions, setEncounterSuggestions] = useState<EncounterSuggestion[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<any | null>(null);
  const [dicePool, setDicePool] = useState<{ sides: number, count: number }[]>([]);
  const [manualRollModifier, setManualRollModifier] = useState(0);
  const [enemySearchQuery, setEnemySearchQuery] = useState('');
  const [enemyCrFilter, setEnemyCrFilter] = useState('All');
  const [customCombatEnemies, setCustomCombatEnemies] = useState<Enemy[]>([]);
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [bestiaryTypeFilters, setBestiaryTypeFilters] = useState<string[]>([]);
  const [bestiaryEnvFilters, setBestiaryEnvFilters] = useState<string[]>([]);
  const [bestiarySortBy, setBestiarySortBy] = useState<'name' | 'cr'>('name');
  const [bestiarySortOrder, setBestiarySortOrder] = useState<'asc' | 'desc'>('asc');
  const [bestiaryCrMin, setBestiaryCrMin] = useState('0');
  const [bestiaryCrMax, setBestiaryCrMax] = useState('30');
  const [npcTab, setNpcTab] = useState<'npc' | 'faction'>('npc');
  const [npcGenerationInitialRole, setNpcGenerationInitialRole] = useState<string | undefined>(undefined);
  const [itemTab, setItemTab] = useState<'compendium' | 'generator'>('compendium');
  const [generatedFaction, setGeneratedFaction] = useState<Faction | null>(null);
  const [isCharQuickViewOpen, setIsCharQuickViewOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [npcGenerationTargetLocationId, setNpcGenerationTargetLocationId] = useState<string | null>(null);
  const [nextSettlementType, setNextSettlementType] = useState<SettlementType>('Village');
  const [isBossLoot, setIsBossLoot] = useState(false);
  const [oracleQuestion, setOracleQuestion] = useState('');
  const [oracleLikelihood, setOracleLikelihood] = useState<typeof ORACLE_LIKELIHOODS[number]>(ORACLE_LIKELIHOODS[3]); // Possible (mod 0)
  const [selectedDC, setSelectedDC] = useState<typeof DIFFICULTY_CLASSES[number]>(DIFFICULTY_CLASSES[2]); // Moderate (15)
  const [situationRollCount, setSituationRollCount] = useState<number>(1);
  const [selectedSkill, setSelectedSkill] = useState<Skill>('Athletics');
  const [combatDamageDieCount, setCombatDamageDieCount] = useState(1);
  const [combatDamageDieSides, setCombatDamageDieSides] = useState(4);
  const [combatDamageModifier, setCombatDamageModifier] = useState(0);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    narrative: true,
    settlement: true,
    arena: true,
    wilderness: true,
    dungeon: true,
    combat: true
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('loneforge_save', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [gameState.logs]);

  useEffect(() => {
    if (gameState.notifications && gameState.notifications.length > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          notifications: (prev.notifications || []).slice(1)
        }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.notifications]);

  // --- Handlers ---
  const addLog = useCallback((type: LogEntry['type'], content: string) => {
    const timestamp = Date.now();
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      type,
      content
    };
    
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp
    };

    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog],
      notifications: [...(prev.notifications || []), newNotification]
    }));
  }, []);


  const handleLevelUp = useCallback(() => {
    const nextLevel = gameState.character.level + 1;
    const classData = (CLASSES_DATA as any).find((c: any) => c.class.name === gameState.character.class)?.class;
    if (!classData) return;

    const levelData = classData.levels.find((l: any) => l.level === nextLevel);
    if (!levelData) return;

    const newFeatures = levelData.features || [];
    
    // Check if any feature grants a subclass
    const subclassGrantingFeature = newFeatures.find((f: any) => f.subclasses);
    
    const newAbilities: Ability[] = [];
    
    newFeatures.forEach((f: any) => {
      if (f.name === "Subclass Feature" && gameState.character.subclass) {
        const subclassData = classData.subclasses?.find((s: any) => s.name === gameState.character.subclass);
        if (subclassData) {
          const specificFeatures = subclassData.features?.filter((sf: any) => sf.level === nextLevel) || [];
          specificFeatures.forEach((sf: any) => {
            newAbilities.push({
              id: `subfeat-${sf.name.toLowerCase().replace(/\s+/g, '-')}-${nextLevel}`,
              name: sf.name,
              description: sf.description,
              type: sf.mechanics?.activation?.toLowerCase().includes('bonus') ? 'bonus_action' : 
                    sf.mechanics?.activation?.toLowerCase().includes('reaction') ? 'reaction' : 
                    sf.mechanics?.activation?.toLowerCase().includes('action') ? 'action' : 'passive'
            });
          });
        } else {
          // Fallback
          newAbilities.push({
            id: `feat-${f.name.toLowerCase().replace(/\s+/g, '-')}-${nextLevel}`,
            name: f.name,
            description: f.description,
            type: f.mechanics?.activation?.toLowerCase().includes('bonus') ? 'bonus_action' : 
                  f.mechanics?.activation?.toLowerCase().includes('reaction') ? 'reaction' : 
                  f.mechanics?.activation?.toLowerCase().includes('action') ? 'action' : 'passive'
          });
        }
      } else {
        newAbilities.push({
          id: `feat-${f.name.toLowerCase().replace(/\s+/g, '-')}-${nextLevel}`,
          name: f.name,
          description: f.description,
          type: f.mechanics?.activation?.toLowerCase().includes('bonus') ? 'bonus_action' : 
                f.mechanics?.activation?.toLowerCase().includes('reaction') ? 'reaction' : 
                f.mechanics?.activation?.toLowerCase().includes('action') ? 'action' : 'passive'
        });
      }
    });

    const hpIncrease = Math.floor(parseInt(classData.hit_die.replace('d', '')) / 2) + 1 + getModifier(gameState.character.stats.Constitution);
    
    let newSpellSlots = gameState.character.spellSlots;
    if (classData.spellcasting && classData.spellcasting.slots_per_level) {
      const slots = classData.spellcasting.slots_per_level[nextLevel.toString()];
      if (slots) {
        newSpellSlots = slots.map((count: number, index: number) => ({
          level: index + 1,
          total: count,
          current: count
        })).filter((s: any) => s.total > 0);
      }
    }

    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        level: nextLevel,
        maxHp: prev.character.maxHp + hpIncrease,
        hp: prev.character.hp + hpIncrease,
        abilities: [...(prev.character.abilities || []), ...newAbilities],
        spellSlots: newSpellSlots
      },
      pendingSubclassSelection: subclassGrantingFeature && !prev.character.subclass ? (subclassGrantingFeature.subclasses || []) : null
    }));

    addLog('narrative', `Level Up! You are now level ${nextLevel}. Gained ${hpIncrease} HP and new features: ${newAbilities.map((a: any) => a.name).join(', ')}`);
  }, [gameState.character, addLog]);

  const handleSubclassSelect = useCallback((subclassName: string) => {
    const classData = (CLASSES_DATA as any).find((c: any) => c.class.name === gameState.character.class)?.class;
    const subclassData = classData?.subclasses?.find((s: any) => s.name === subclassName);
    
    if (!subclassData) return;

    const subclassFeatures = subclassData.features?.filter((f: any) => f.level <= gameState.character.level) || [];
    const newAbilities: Ability[] = subclassFeatures.map((f: any) => ({
      id: `subfeat-${f.name.toLowerCase().replace(/\s+/g, '-')}-${f.level}`,
      name: f.name,
      description: f.description,
      type: (f.mechanics?.activation?.toLowerCase().includes('bonus') ? 'bonus_action' : 
            f.mechanics?.activation?.toLowerCase().includes('reaction') ? 'reaction' : 
            f.mechanics?.activation?.toLowerCase().includes('action') ? 'action' : 'passive') as Ability['type']
    }));

    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        subclass: subclassName,
        abilities: [...(prev.character.abilities || []), ...newAbilities]
      },
      pendingSubclassSelection: null
    }));

    addLog('narrative', `You have chosen the ${subclassName} subclass! Gained features: ${subclassFeatures.map((f: any) => f.name).join(', ')}`);
  }, [gameState.character, addLog]);

  const handleFinishCreation = useCallback((char: Character) => {
    setGameState(prev => ({
      ...prev,
      character: char,
      isCreatingCharacter: false
    }));
    addLog('narrative', `Welcome, ${char.name} the ${char.species} ${char.class}. Your journey begins!`);
  }, [addLog]);

  const handleResetGame = useCallback(() => {
    localStorage.removeItem('loneforge_save');
    setGameState(INITIAL_GAME_STATE);
    setActiveTab('adventure');
  }, []);

  const handleRestartSameCharacter = useCallback(() => {
    setGameState(prev => ({
      ...INITIAL_GAME_STATE,
      character: {
        ...prev.character,
        hp: prev.character.maxHp,
        xp: 0,
        level: 1,
        inventory: prev.character.inventory.map(i => ({ ...i, isEquipped: i.type === 'Weapon' || i.type === 'Armor' })),
        gold: 10,
        notes: '',
        spellSlots: prev.character.spellSlots?.map(s => ({ ...s, current: s.total }))
      },
      isCharacterCreated: true
    }));
    setActiveTab('adventure');
  }, []);

  const handleLongRest = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        hp: prev.character.maxHp,
        tempHp: 0,
        abilities: prev.character.abilities?.map(a => ({ ...a, currentUses: a.usesPerLongRest })),
        spellSlots: prev.character.spellSlots?.map(s => ({ ...s, current: s.total }))
      }
    }));
    addLog('narrative', "You take a long rest. HP and abilities restored.");
  }, [addLog]);

  const handleStartTravel = useCallback(() => {
    setGameState(prev => ({ ...prev, isSelectingTravel: true }));
  }, []);

  const handleTravelDay = useCallback(() => {
    if (!gameState.travel) return;

    const roll = rollDice(20);
    const hasEvent = roll >= 15;
    const nextDay = gameState.travel.currentDay + 1;
    const isComplete = nextDay > gameState.travel.totalDays;
    
    let event = '';
    if (hasEvent) {
      event = generateWildernessEvent(gameState.travel.terrain);
    }

    setGameState(prev => {
      if (!prev.travel) return prev;
      const log = hasEvent 
        ? `Day ${nextDay}: ${event}` 
        : `Day ${nextDay}: The journey continues uneventfully.`;
      
      return {
        ...prev,
        travel: {
          ...prev.travel,
          currentDay: nextDay
        },
        isDayActive: !isComplete,
        lastTravelLog: log
      };
    });

    if (hasEvent) {
      addLog('narrative', `Day ${nextDay}: ${event}`);
    } else {
      addLog('narrative', `Day ${nextDay}: The journey continues uneventfully.`);
    }

    if (isComplete) {
      addLog('narrative', `You have reached your destination: ${gameState.travel.destination}.`);
    }
  }, [gameState.travel, addLog]);

  const handleGenerateWildernessEvent = useCallback(() => {
    if (!gameState.travel) return;
    const event = generateWildernessEvent(gameState.travel.terrain);
    addLog('narrative', `Wilderness Event: ${event}`);
    setGameState(prev => ({ ...prev, lastTravelLog: `Event: ${event}` }));
  }, [gameState.travel, addLog]);

  const handleGenerateWildernessDiscovery = useCallback(() => {
    if (!gameState.travel) return;
    const discovery = generateWildernessDiscovery(gameState.travel.terrain);
    addLog('narrative', `Discovery: ${discovery}`);
    setGameState(prev => ({ ...prev, lastTravelLog: `Discovery: ${discovery}` }));
  }, [gameState.travel, addLog]);

  const handleStartCamping = useCallback(() => {
    setGameState(prev => ({ ...prev, isCamping: true }));
  }, []);

  const handleCampRest = useCallback((category?: string) => {
    const disturbance = category 
      ? generateCampDisturbanceByCategory([0, 100]) // Simplified
      : generateCampDisturbance();
    addLog('narrative', `Night Disturbance: ${disturbance}`);
    setGameState(prev => ({ 
      ...prev, 
      isCamping: false,
      isDayActive: false,
      lastTravelLog: `Night: ${disturbance}`
    }));
  }, [addLog]);

  const handleSkipDisturbance = useCallback(() => {
    handleLongRest();
    setGameState(prev => ({ 
      ...prev, 
      isCamping: false,
      isDayActive: false,
      lastTravelLog: "The night passed peacefully."
    }));
  }, [handleLongRest]);

  const handleSetContext = useCallback((ctx: GameContext) => {
    setGameState(prev => ({ ...prev, context: ctx }));
  }, []);

  const handleArriveAtDestination = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      context: 'Dungeon',
      travel: null,
      isSelectingDungeon: true
    }));
    addLog('narrative', `You have arrived at your destination.`);
  }, [addLog]);

  const handleReturnToSettlement = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      context: 'Settlement',
      dungeonConfig: null,
      currentRoom: null,
      travel: null
    }));
    addLog('narrative', "You return to the safety of the settlement.");
  }, [addLog]);

  const handleSettlementInteraction = useCallback((interaction: string, locationName: string, locationCategory: string) => {
    const response = getInteractionResponse(
      interaction,
      locationCategory,
      locationName,
      gameState,
      () => generateNPC()
    );

    if (!response) {
      // Fallback for legacy items or things not in tables
      if (interaction.includes('Long Rest')) {
        handleLongRest();
        return;
      }
      if (interaction === 'Gossip') {
        addLog('narrative', `You hear a rumor: ${SETTLEMENT_EVENTS[rollDice(SETTLEMENT_EVENTS.length) - 1]}`);
        return;
      }
      
      addLog('narrative', `You try to ${interaction.toLowerCase()} at ${locationName}, but nothing much happens.`);
      return;
    }

    if (response.type === 'narrative') {
      addLog('narrative', response.text);
    } else if (response.type === 'mechanic') {
      if (response.data.function === 'rest') {
        handleLongRest();
      } else if (response.data.function === 'heal') {
        const rawCost = response.data.cost || 0;
        const cost = typeof rawCost === 'string' ? parseInt(rawCost.replace(/[^0-9]/g, '')) || 0 : rawCost;
        
        if (gameState.character.gold >= cost) {
          setGameState(prev => ({
            ...prev,
            character: { ...prev.character, hp: prev.character.maxHp, gold: prev.character.gold - cost }
          }));
          addLog('narrative', response.text);
        } else {
          addLog('narrative', `You don't have enough gold for healing (${cost} GP required).`);
        }
      } else if (response.data.function === 'gossip') {
        addLog('narrative', response.text);
        addLog('narrative', `Rumor: ${SETTLEMENT_EVENTS[rollDice(SETTLEMENT_EVENTS.length) - 1]}`);
      }
    } else if (response.type === 'cost_action') {
      const rawCost = response.data.cost || 0;
      const cost = typeof rawCost === 'string' ? parseInt(rawCost.replace(/[^0-9]/g, '')) || 0 : rawCost;

      if (gameState.character.gold >= cost) {
        setGameState(prev => {
          const newChar = { ...prev.character, gold: prev.character.gold - cost };
          if (response.data.effect === 'restore_health') {
             newChar.hp = Math.min(newChar.maxHp, newChar.hp + (response.data.restore_amount || 10));
          }
          return { ...prev, character: newChar };
        });
        if (cost > 0) {
          addLog('narrative', `[Cost: ${cost} GP deducted]`);
        }
        addLog('narrative', response.text);
      } else {
        addLog('narrative', `You can't afford that (${cost} GP required).`);
      }
    } else if (response.type === 'skill_check') {
       const skill = response.data.skill as Skill;
       const dc = response.data.dc;
       const roll = rollDice(20);
       const mod = getSkillModifier(gameState.character, skill);
       const total = roll + mod;
       const success = total >= dc;

       addLog('roll', `${skill} check: ${roll} + ${mod} = ${total} (DC ${dc}) -> ${success ? 'Success!' : 'Failure.'}`);
       const resultText = success ? response.data.onSuccess : response.data.onFailure;
       addLog('narrative', resultText);
    }
  }, [gameState, handleLongRest, addLog, setGameState]);

  const handleBuyItem = useCallback((item: Item) => {
    if (gameState.character.gold >= (item.value || 0)) {
      const newItem: Item = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        isEquipped: false
      };
      setGameState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold - (item.value || 0),
          inventory: [...prev.character.inventory, newItem]
        }
      }));
      addLog('narrative', `Bought ${item.name} for ${item.value} GP.`);
    } else {
      addLog('narrative', "Not enough gold!");
    }
  }, [gameState.character.gold, addLog]);

  const handleSellItem = useCallback((itemId: string) => {
    const item = gameState.character.inventory.find(i => i.id === itemId);
    if (item) {
      const sellValue = Math.floor((parseInt(item.cost) || 0) / 2);
      setGameState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          gold: prev.character.gold + sellValue,
          inventory: prev.character.inventory.filter(i => i.id !== itemId)
        }
      }));
      addLog('narrative', `Sold ${item.name} for ${sellValue} GP.`);
    }
  }, [gameState.character.inventory, addLog]);

  const handleSettlementEvent = useCallback(() => {
    const event = generateUrbanEvent();
    addLog('narrative', `Settlement Event: ${event}`);
  }, [addLog]);

  const handleTownEncounter = useCallback(() => {
    const encounter = generateUrbanEvent();
    addLog('narrative', `Encounter: ${encounter}`);
  }, [addLog]);

  const handleUrbanEventSelect = useCallback((category?: string) => {
    const event = category 
      ? generateUrbanEventByCategory([0, 100]) // Simplified
      : generateUrbanEvent();
    addLog('narrative', `Urban Event: ${event}`);
    setGameState(prev => ({ ...prev, isSelectingUrbanEvent: false }));
  }, [addLog]);

  const handleDistrictDisturbance = useCallback(() => {
    const dist = generateDistrictDisturbance('Residential');
    addLog('narrative', `Disturbance: ${dist.disturbance}. Outcome: ${dist.outcome}`);
  }, [addLog]);

  const handleExplore = useCallback(() => {
    if (gameState.dungeonConfig?.isComplete) {
      addLog('narrative', "The dungeon is complete. You should return to the settlement.");
      return;
    }

    const newRoom = generateRoom(gameState.character.level, gameState.dungeonConfig?.type || 'Cave');
    const nextRoomsExplored = gameState.roomsExplored + 1;
    const isComplete = nextRoomsExplored >= (gameState.dungeonConfig?.totalRooms || 5);

    setGameState(prev => ({
      ...prev,
      currentRoom: newRoom,
      roomsExplored: nextRoomsExplored,
      dungeonConfig: prev.dungeonConfig ? {
        ...prev.dungeonConfig,
        isComplete: isComplete
      } : null
    }));
    
    addLog('narrative', `You enter a new room: ${newRoom.type} - ${newRoom.feature}`);
    if (isComplete) {
      addLog('narrative', "You have reached the end of the dungeon!");
    }
  }, [gameState.character.level, gameState.dungeonConfig, gameState.roomsExplored, addLog]);

  const handleOracle = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuestion.trim()) return;

    const response = getOracleResponse(oracleLikelihood.mod);
    const modStr = response.modifier !== 0 ? ` ${response.modifier >= 0 ? '+' : ''}${response.modifier}` : '';
    addLog('roll', `Oracle: ${oracleQuestion} (${oracleLikelihood.label}) -> ${response.answer} (Roll: ${response.rawRoll}${modStr} = ${response.roll})`);
    setOracleQuestion('');
  }, [oracleQuestion, oracleLikelihood, addLog]);

  const handleToggleEquip = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.character.inventory.find(i => i.id === itemId);
      if (!item) return prev;
      
      const isEquipping = !item.isEquipped;
      const isShield = item.subType?.includes('Shield');
      
      const newInventory = prev.character.inventory.map(i => {
        if (i.id === itemId) return { ...i, isEquipped: isEquipping };
        
        if (isEquipping) {
          // If equipping a shield, unequip other shields
          if (isShield && i.subType?.includes('Shield')) return { ...i, isEquipped: false };
          // If equipping armor (not a shield), unequip other armor (not shields)
          if (!isShield && i.type === 'Armor' && !i.subType?.includes('Shield')) return { ...i, isEquipped: false };
          // If equipping a weapon, unequip other weapons
          if (item.type === 'Weapon' && i.type === 'Weapon') return { ...i, isEquipped: false };
        }
        return i;
      });

      return {
        ...prev,
        character: { ...prev.character, inventory: newInventory }
      };
    });
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    const item = gameState.character.inventory.find(i => i.id === itemId);
    if (item && item.type === 'Consumable') {
      addLog('narrative', `Used ${item.name}: ${item.description}`);
      setGameState(prev => ({
        ...prev,
        character: {
          ...prev.character,
          inventory: prev.character.inventory.filter(i => i.id !== itemId)
        }
      }));
    }
  }, [gameState.character.inventory, addLog]);

  const handleDropItem = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        inventory: prev.character.inventory.filter(i => i.id !== itemId)
      }
    }));
  }, []);

  const handleAddTreasureItem = useCallback((itemName: string) => {
    // Check if the item exists in ITEMS_DATA to get its details
    const itemData = (ITEMS_DATA as any[]).find(i => i.Name === itemName);
    
    setGameState(prev => {
      const char = prev.character;
      const treasure = Array.isArray(char.treasure) ? [...char.treasure] : [];
      
      const newTreasureItem: Item = itemData ? {
        id: Math.random().toString(36).substr(2, 9),
        name: itemData.Name,
        type: itemData.Type || 'Treasure',
        description: itemData.Text || itemData.Description || 'A found object.',
        value: parseInt(itemData.Value) || 0,
        rarity: (itemData.Rarity as any) || 'Common',
        isEquipped: false,
        bonus: 0,
        weight: itemData.Weight,
        properties: itemData.Properties,
        mastery: itemData.Mastery,
        damage: itemData.Damage,
        subType: itemData.Type
      } : {
        id: Math.random().toString(36).substr(2, 9),
        name: itemName,
        type: 'Treasure',
        description: 'A manually entered treasure item.',
        value: 0,
        rarity: 'Common',
        isEquipped: false,
        bonus: 0
      };

      return {
        ...prev,
        character: {
          ...char,
          treasure: [...treasure, newTreasureItem]
        }
      };
    });
    addLog('narrative', `Added ${itemName} to treasure.`);
  }, [addLog]);

  const handleRemoveTreasureItem = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        treasure: (prev.character.treasure || []).filter(i => i.id !== itemId)
      }
    }));
  }, []);

  const handleMoveTreasureToInventory = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = (prev.character.treasure || []).find(i => i.id === itemId);
      if (!item) return prev;

      return {
        ...prev,
        character: {
          ...prev.character,
          treasure: (prev.character.treasure || []).filter(i => i.id !== itemId),
          inventory: [...prev.character.inventory, { ...item, isEquipped: false }]
        }
      };
    });
    addLog('narrative', `Moved ${itemId} from treasure to equipment.`);
  }, [addLog]);

  const handleMoveInventoryToTreasure = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.character.inventory.find(i => i.id === itemId);
      if (!item) return prev;

      return {
        ...prev,
        character: {
          ...prev.character,
          inventory: prev.character.inventory.filter(i => i.id !== itemId),
          treasure: [...(prev.character.treasure || []), { ...item, isEquipped: false }]
        }
      };
    });
    addLog('narrative', `Moved ${itemId} from equipment to treasure.`);
  }, [addLog]);

  const handleAddSpell = useCallback((spell: Spell) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        knownSpells: [...(prev.character.knownSpells || []), spell]
      }
    }));
  }, []);

  const handleRemoveSpell = useCallback((spellName: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        knownSpells: (prev.character.knownSpells || []).filter(s => s.name !== spellName)
      }
    }));
  }, []);

  const handleUseSpellSlot = useCallback((level: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        spellSlots: prev.character.spellSlots?.map(s => 
          s.level === level ? { ...s, current: Math.max(0, s.current - 1) } : s
        )
      }
    }));
  }, []);

  const handleToggleSpellSlot = useCallback((level: number, delta: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        spellSlots: prev.character.spellSlots?.map(s => 
          s.level === level ? { ...s, current: Math.max(0, Math.min(s.total, s.current + delta)) } : s
        )
      }
    }));
  }, []);

  const handleToggleSpellPrepared = useCallback((spellName: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        knownSpells: (prev.character.knownSpells || []).map(s => 
          s.name === spellName ? { ...s, isPrepared: !s.isPrepared } : s
        )
      }
    }));
  }, []);

  const handleCastSpell = useCallback((spell: Spell) => {
    addLog('narrative', `Casting ${spell.name}...`);
    // Implement specific spell effects here if needed
  }, [addLog]);

  const handleUpdateHp = useCallback((hp: number, tempHp: number) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, hp, tempHp }
    }));
    setIsHpModalOpen(false);
  }, []);

  const handleLoot = useCallback(() => {
    if (gameState.currentRoom?.lootResult) {
      const result = gameState.currentRoom.lootResult;
      setGameState(prev => {
        const char = prev.character;
        const newInventory = [...char.inventory];
        
        result.magic_items.forEach(mi => {
          newInventory.push({
            id: mi.id,
            name: mi.name,
            type: mi.category as any,
            description: mi.description,
            value: mi.value_gp,
            rarity: mi.rarity as any,
            isEquipped: false,
            bonus: 0
          });
        });

        result.valuables.forEach(v => {
          newInventory.push({
            id: Math.random().toString(36).substr(2, 9),
            name: v.name,
            type: 'Valuable' as any,
            description: v.description,
            value: v.value_gp,
            rarity: 'Common',
            isEquipped: false,
            bonus: 0
          });
        });

        return {
          ...prev,
          character: {
            ...char,
            cp: (char.cp || 0) + (result.currency.cp || 0),
            sp: (char.sp || 0) + (result.currency.sp || 0),
            ep: (char.ep || 0) + (result.currency.ep || 0),
            gold: (char.gold || 0) + (result.currency.gp || 0),
            pp: (char.pp || 0) + (result.currency.pp || 0),
            inventory: newInventory
          },
          currentRoom: prev.currentRoom ? { ...prev.currentRoom, lootResult: undefined } : null
        };
      });
      addLog('loot', `Claimed room loot: ${result.total_gp_value} GP total value.`);
    }
  }, [gameState.currentRoom, addLog]);

  const handleFinishDungeonSelection = useCallback((type: string, rooms: number) => {
    setGameState(prev => ({
      ...prev,
      context: 'Dungeon',
      dungeonConfig: { type, totalRooms: rooms, isComplete: false },
      roomsExplored: 0,
      isSelectingDungeon: false
    }));
    addLog('narrative', `Entering the ${type}. It has ${rooms} rooms.`);
  }, [addLog]);

  const handleFinishTravelSelection = useCallback((terrain: string, duration: number, destination: string) => {
    setGameState(prev => ({
      ...prev,
      context: 'Wilderness',
      travel: {
        destination,
        totalDays: duration,
        currentDay: 0,
        terrain,
        rations: 10 // Default rations
      },
      isSelectingTravel: false,
      isDayActive: false,
      lastTravelLog: null
    }));
    addLog('narrative', `Starting journey to ${destination} through ${terrain}. Estimated duration: ${duration} days.`);
  }, [addLog]);

  const handleAddNpc = useCallback((npc: Npc) => {
    let targetLocationName = '';
    
    setGameState(prev => {
      const nextHistory = [npc, ...prev.npcHistory].slice(0, 50);
      
      if (npcGenerationTargetLocationId && prev.currentSettlement) {
        const updatedDistricts = prev.currentSettlement.districts.map(district => ({
          ...district,
          locations: district.locations.map(location => {
            if (location.id === npcGenerationTargetLocationId) {
              targetLocationName = location.name;
              return {
                ...location,
                npcs: [...(location.npcs || []), npc]
              };
            }
            return location;
          })
        }));

        return {
          ...prev,
          npcHistory: nextHistory,
          currentSettlement: {
            ...prev.currentSettlement,
            districts: updatedDistricts
          }
        };
      }

      return {
        ...prev,
        npcHistory: nextHistory
      };
    });
    
    if (targetLocationName) {
      addLog('narrative', `${npc.name} has been assigned to ${targetLocationName}.`);
    } else {
      addLog('narrative', `Added ${npc.name} to NPC history.`);
    }
    
    // Reset target location after adding
    setNpcGenerationTargetLocationId(null);
  }, [npcGenerationTargetLocationId, addLog]);

  const handleGenerateLoot = useCallback((source: 'enemy_normal' | 'exploration' | 'treasure_room' | 'boss', bossType?: string) => {
    const loot = generateLoot(gameState.character.level, source, bossType);
    setGameState(prev => ({
      ...prev,
      lastLootResult: loot
    }));
  }, [gameState.character.level]);

  const handleClaimLootResult = useCallback(() => {
    if (!gameState.lastLootResult) return;
    
    const result = gameState.lastLootResult;
    setGameState(prev => {
      const char = prev.character;
      const newInventory = [...char.inventory];
      
      result.magic_items.forEach(mi => {
        newInventory.push({
          id: mi.id,
          name: mi.name,
          type: mi.category as any,
          description: mi.description,
          value: mi.value_gp,
          rarity: mi.rarity as any,
          isEquipped: false,
          bonus: 0
        });
      });

      result.valuables.forEach(v => {
        newInventory.push({
          id: Math.random().toString(36).substr(2, 9),
          name: v.name,
          type: 'Valuable' as any,
          description: v.description,
          value: v.value_gp,
          rarity: 'Common',
          isEquipped: false,
          bonus: 0
        });
      });

      return {
        ...prev,
        character: {
          ...char,
          cp: (char.cp || 0) + (result.currency.cp || 0),
          sp: (char.sp || 0) + (result.currency.sp || 0),
          ep: (char.ep || 0) + (result.currency.ep || 0),
          gold: (char.gold || 0) + (result.currency.gp || 0),
          pp: (char.pp || 0) + (result.currency.pp || 0),
          inventory: newInventory
        },
        lastLootResult: null
      };
    });
    addLog('loot', `Claimed loot: ${result.total_gp_value} GP total value.`);
  }, [gameState.lastLootResult, addLog]);

  const handleAddItem = useCallback((item: Item) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        inventory: [...prev.character.inventory, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      }
    }));
    addLog('narrative', `Added ${item.name} to inventory.`);
  }, [addLog]);

  const handleGenerateQuest = useCallback(() => {
    const quest = generateAdventure();
    setGameState(prev => ({ ...prev, adventureHook: quest }));
    setIsQuestModalOpen(true);
    addLog('narrative', `New Quest: ${quest.problem}`);
  }, [addLog]);

  const handleGenerateFaction = useCallback(() => {
    const faction = generateFaction();
    setGeneratedFaction(faction);
  }, []);

  const handleUncoverItemHistory = useCallback((itemId: string, isCompendium: boolean = false) => {
    let generatedQuest: ItemQuest | undefined;
    
    setGameState(prev => {
      // If it's a compendium item, check if we already discovered it
      if (isCompendium) {
        if ((prev.discoveredCompendiumQuests || {})[itemId]) return prev;
        
        const compendiumItem = (ITEMS_DATA as any[]).find(i => i.Name === itemId);
        if (!compendiumItem || !compendiumItem.Rarity) return prev;

        generatedQuest = generateItemQuest(compendiumItem.Rarity);
        if (!generatedQuest) return prev;

        const questNote = `\n\n--- Item History (Compendium): ${itemId} ---\nOrigin: ${generatedQuest.origin}\nHook: ${generatedQuest.hook}\nSteps:\n${generatedQuest.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`;

        return {
          ...prev,
          character: {
            ...prev.character,
            notes: prev.character.notes + questNote
          },
          discoveredCompendiumQuests: {
            ...(prev.discoveredCompendiumQuests || {}),
            [itemId]: generatedQuest
          }
        };
      }

      // Search everywhere for the item
      let targetItem: Item | undefined;
      let location: 'inventory' | 'treasure' | 'loot' | 'settlement' | null = null;
      let settlementLocationRef: { districtId: string, locationId: string } | null = null;

      // 1. Check inventory
      targetItem = prev.character.inventory.find(i => i.id === itemId || i.name === itemId);
      if (targetItem) location = 'inventory';

      // 2. Check treasure
      if (!location) {
        targetItem = (prev.character.treasure || []).find(i => i.id === itemId || i.name === itemId);
        if (targetItem) location = 'treasure';
      }

      // 3. Check loot
      if (!location && prev.currentRoom?.loot && (prev.currentRoom.loot.id === itemId || prev.currentRoom.loot.name === itemId)) {
        targetItem = prev.currentRoom.loot;
        location = 'loot';
      }

      // 4. Check settlements
      if (!location && prev.currentSettlement) {
        for (const district of prev.currentSettlement.districts) {
          for (const loc of district.locations) {
            const found = (loc.inventory || []).find(i => i.id === itemId || i.name === itemId);
            if (found) {
              targetItem = found;
              location = 'settlement';
              settlementLocationRef = { districtId: district.id, locationId: loc.id };
              break;
            }
          }
          if (location) break;
        }
      }

      if (!targetItem || !targetItem.rarity || targetItem.itemQuest) return prev;

      generatedQuest = generateItemQuest(targetItem.rarity);
      if (!generatedQuest) return prev;

      const itemName = targetItem.name;
      const questNote = `\n\n--- Item History: ${itemName} ---\nOrigin: ${generatedQuest.origin}\nHook: ${generatedQuest.hook}\nSteps:\n${generatedQuest.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`;

      // Base state upgrade
      const updatedCharacter = {
        ...prev.character,
        notes: prev.character.notes + questNote
      };

      if (location === 'inventory') {
        return {
          ...prev,
          character: {
            ...updatedCharacter,
            inventory: prev.character.inventory.map(i => 
              (i.id === itemId || i.name === itemId) ? { ...i, itemQuest: generatedQuest } : i
            )
          }
        };
      }

      if (location === 'treasure') {
        return {
          ...prev,
          character: {
            ...updatedCharacter,
            treasure: (prev.character.treasure || []).map(i => 
              (i.id === itemId || i.name === itemId) ? { ...i, itemQuest: generatedQuest } : i
            )
          }
        };
      }

      if (location === 'loot') {
        return {
          ...prev,
          character: updatedCharacter,
          currentRoom: {
            ...prev.currentRoom!,
            loot: { ...targetItem, itemQuest: generatedQuest }
          }
        };
      }

      if (location === 'settlement' && settlementLocationRef) {
        return {
          ...prev,
          character: updatedCharacter,
          currentSettlement: {
            ...prev.currentSettlement!,
            districts: prev.currentSettlement!.districts.map(d => {
              if (d.id !== settlementLocationRef!.districtId) return d;
              return {
                ...d,
                locations: d.locations.map(l => {
                  if (l.id !== settlementLocationRef!.locationId) return l;
                  return {
                    ...l,
                    inventory: (l.inventory || []).map(i => 
                      (i.id === itemId || i.name === itemId) ? { ...i, itemQuest: generatedQuest } : i
                    )
                  };
                })
              };
            })
          }
        };
      }

      return prev;
    });

    // Update inspected entity if it's the same item
    setInspectedEntity(prev => {
      if (prev?.type === 'item' && (prev.data.id === itemId || prev.data.name === itemId) && generatedQuest) {
        return { ...prev, data: { ...prev.data, itemQuest: generatedQuest } };
      }
      return prev;
    });
    
    if (generatedQuest) {
      addLog('narrative', `You have uncovered the history of the item! The details have been added to your notes.`);
    }
  }, [addLog]);

  const handleManualRoll = useCallback((sides: number) => {
    const result = rollDice(sides);
    addLog('roll', `Manual d${sides} roll: ${result}`);
  }, [addLog]);

  const handleAddToPool = useCallback((sides: number) => {
    setDicePool(prev => {
      const existing = prev.find(d => d.sides === sides);
      if (existing) {
        return prev.map(d => d.sides === sides ? { ...d, count: d.count + 1 } : d);
      }
      return [...prev, { sides, count: 1 }];
    });
  }, []);

  const handleRemoveFromPool = useCallback((sides: number) => {
    setDicePool(prev => {
      const existing = prev.find(d => d.sides === sides);
      if (existing && existing.count > 1) {
        return prev.map(d => d.sides === sides ? { ...d, count: d.count - 1 } : d);
      }
      return prev.filter(d => d.sides !== sides);
    });
  }, []);

  const handleClearPool = useCallback(() => setDicePool([]), []);

  const handleRollPool = useCallback(() => {
    let total = 0;
    let details: string[] = [];
    
    dicePool.forEach(dice => {
      for (let i = 0; i < dice.count; i++) {
        const roll = rollDice(dice.sides);
        total += roll;
        details.push(`d${dice.sides}(${roll})`);
      }
    });

    const finalTotal = total + manualRollModifier;
    addLog('roll', `Pool Roll: ${details.join(' + ')} ${manualRollModifier >= 0 ? '+' : ''}${manualRollModifier} = ${finalTotal}`);
    handleClearPool();
    setManualRollModifier(0);
  }, [dicePool, manualRollModifier, addLog, handleClearPool]);

  const handleAttributeCheck = useCallback((stat: Attribute, mod: number) => {
    const roll = rollDice(20);
    addLog('roll', `${stat} Check: Roll ${roll} + ${mod} = ${roll + mod}`);
  }, [addLog]);

  const handleUpdateAttribute = useCallback((stat: Attribute, delta: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        stats: {
          ...prev.character.stats,
          [stat]: Math.max(1, Math.min(30, prev.character.stats[stat] + delta))
        }
      }
    }));
  }, []);

  const handleUpdateAcBonus = useCallback((delta: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        acBonus: (prev.character.acBonus || 0) + delta
      }
    }));
  }, []);

  const handleUpdateInitiativeBonus = useCallback((delta: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        initiativeBonus: (prev.character.initiativeBonus || 0) + delta
      }
    }));
  }, []);

  const handleUpdateSpeedBonus = useCallback((delta: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        speedBonus: (prev.character.speedBonus || 0) + delta
      }
    }));
  }, []);

  const handleSavingThrow = useCallback((stat: Attribute, mod?: number) => {
    const roll = rollDice(20);
    const finalMod = mod !== undefined ? mod : (
      getModifier(gameState.character.stats[stat]) + 
      (gameState.character.savingThrowProficiencies.includes(stat) ? getProficiencyBonus(gameState.character.level) : 0)
    );
    addLog('roll', `${stat} Saving Throw: Roll ${roll} + ${finalMod} = ${roll + finalMod}`);
  }, [addLog, gameState.character]);

  const handleSkillCheck = useCallback((skill: Skill, mod?: number) => {
    const roll = rollDice(20);
    const finalMod = mod !== undefined ? mod : getSkillModifier(gameState.character, skill);
    addLog('roll', `${skill} Check: Roll ${roll} + ${finalMod} = ${roll + finalMod}`);
  }, [addLog, gameState.character]);

  const handleToggleSavingThrowProficiency = useCallback((stat: Attribute) => {
    setGameState(prev => {
      const current = prev.character.savingThrowProficiencies || [];
      const next = current.includes(stat) 
        ? current.filter(s => s !== stat)
        : [...current, stat];
      return {
        ...prev,
        character: { ...prev.character, savingThrowProficiencies: next }
      };
    });
  }, []);

  const handleToggleSkillProficiency = useCallback((skill: Skill) => {
    setGameState(prev => {
      const current = prev.character.proficiencies || [];
      const next = current.includes(skill)
        ? current.filter(s => s !== skill)
        : [...current, skill];
      return {
        ...prev,
        character: { ...prev.character, proficiencies: next }
      };
    });
  }, []);

  const handleRerollDie = useCallback((category: string) => {
    if (!gameState.currentRoom) return;
    
    const newRoom = rerollCategory(
      gameState.currentRoom, 
      category as any, 
      gameState.character.level, 
      gameState.dungeonConfig?.type
    );

    setGameState(prev => ({
      ...prev,
      currentRoom: newRoom
    }));

    const rollValue = newRoom.rolls?.[category as keyof RoomRolls];
    addLog('roll', `Rerolled ${category} die: ${rollValue}`);
  }, [gameState.currentRoom, gameState.character.level, gameState.dungeonConfig, addLog]);

  const handleUpdateXp = useCallback((xp: number) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, xp }
    }));
    setIsXpModalOpen(false);
  }, []);

  // --- Derived State ---
  const canLevelUp = useMemo(() => {
    const nextXp = getXpRequired(gameState.character.level + 1);
    return gameState.character.xp >= nextXp && gameState.character.level < 20;
  }, [gameState.character.level, gameState.character.xp]);

  const xpProgress = useMemo(() => {
    const currentLevelXp = getPrevXpThreshold(gameState.character.level);
    const nextLevelXp = getXpRequired(gameState.character.level + 1);
    const progress = ((gameState.character.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [gameState.character.level, gameState.character.xp]);

  const nextXp = useMemo(() => getXpRequired(gameState.character.level + 1), [gameState.character.level]);

  const currentAc = useMemo(() => calculateAc(gameState.character), [gameState.character]);

  const handleDismissNotification = useCallback((id: string) => {
    setGameState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== id)
    }));
  }, []);

  const handleCancelUrbanEvent = useCallback(() => {
    setGameState(prev => ({ ...prev, isSelectingUrbanEvent: false }));
  }, []);

  const handleGenerateNewSettlement = useCallback((type: SettlementType | 'Random') => {
    setGameState(prev => ({ 
      ...prev, 
      currentSettlement: generateSettlement(type === 'Random' ? undefined : type, prev.character.level) 
    }));
  }, []);

  const handlePlanJourney = useCallback(() => {
    setGameState(prev => ({ ...prev, isSelectingTravel: true }));
  }, []);

  const handleFindDungeon = useCallback(() => {
    setGameState(prev => ({ ...prev, isSelectingDungeon: true }));
  }, []);

  const handleToggleCombatEdit = useCallback(() => {
    setGameState(prev => ({ ...prev, isEditingCombat: !prev.isEditingCombat }));
  }, []);

  const handleClearLogs = useCallback(() => {
    setGameState(prev => ({ ...prev, logs: [] }));
  }, []);

  const handleClearRollLogs = useCallback(() => {
    setGameState(prev => ({ ...prev, logs: prev.logs.filter(l => l.type !== 'roll') }));
  }, []);

  const handleRemoveNpcFromHistory = useCallback((id: string) => {
    setGameState(prev => ({ ...prev, npcHistory: prev.npcHistory.filter(n => n.id !== id) }));
  }, []);

  const handleClearNpcHistory = useCallback(() => {
    setGameState(prev => ({ ...prev, npcHistory: [] }));
  }, []);

  const handleUpdateNotes = useCallback((notes: string) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, notes }
    }));
  }, []);

  const handleAddCompanion = useCallback((companion: Companion) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        companions: [...(prev.character.companions || []), companion]
      }
    }));
    addLog('narrative', `You have gained a new companion: ${companion.name} the ${companion.type}.`);
  }, [addLog]);

  const handleRemoveCompanion = useCallback((companionId: string) => {
    setGameState(prev => {
      const companion = prev.character.companions?.find(c => c.id === companionId);
      return {
        ...prev,
        character: {
          ...prev.character,
          companions: prev.character.companions?.filter(c => c.id !== companionId) || []
        }
      };
    });
  }, []);

  const handleUpdateCompanionHp = useCallback((companionId: string, newHp: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        companions: prev.character.companions?.map(c => 
          c.id === companionId ? { ...c, hp: Math.min(c.maxHp, Math.max(0, newHp)) } : c
        ) || []
      }
    }));
  }, []);

  const handleUpdateCompanion = useCallback((companionId: string, updates: Partial<Companion>) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        companions: prev.character.companions?.map(c => 
          c.id === companionId ? { ...c, ...updates } : c
        ) || []
      }
    }));
  }, []);

  const handleAddCompanionAbility = useCallback((companionId: string, ability: Ability) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        companions: prev.character.companions?.map(c => 
          c.id === companionId ? { ...c, abilities: [...c.abilities, ability] } : c
        ) || []
      }
    }));
  }, []);

  const handleRemoveCompanionAbility = useCallback((companionId: string, abilityId: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        companions: prev.character.companions?.map(c => 
          c.id === companionId ? { ...c, abilities: c.abilities.filter(a => a.id !== abilityId) } : c
        ) || []
      }
    }));
  }, []);

  const handleAddCustomAbility = useCallback((ability: Ability) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        customAbilities: [...(prev.character.customAbilities || []), ability]
      }
    }));
    addLog('narrative', `Gained new ability: ${ability.name}`);
  }, [addLog]);

  const handleSuggestEncounter = useCallback(() => {
    const suggestions = generateEncounterSuggestions(
      gameState.character.level,
      suggesterDifficulty,
      ALL_BESTIARY_ENEMIES,
      suggesterTypeFilter,
      suggesterEnvFilter
    );
    setEncounterSuggestions(suggestions);
  }, [gameState.character.level, suggesterDifficulty, suggesterTypeFilter, suggesterEnvFilter]);

  const handleAddToArena = useCallback((enemyName: string) => {
    const template = ALL_BESTIARY_ENEMIES.find(e => e.name === enemyName);
    if (template) {
      setCustomCombatEnemies(prev => [...prev, { ...template, id: Math.random().toString(36).substr(2, 9) } as Enemy]);
    }
  }, []);

  const handleRemoveCustomAbility = useCallback((abilityId: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        customAbilities: (prev.character.customAbilities || []).filter(a => a.id !== abilityId)
      }
    }));
  }, []);

  const handleSituationRoll = useCallback(() => {
    const verbs: string[] = [];
    for (let i = 0; i < situationRollCount; i++) {
      const verb = SITUATION_VERBS[rollDice(SITUATION_VERBS.length) - 1];
      verbs.push(verb);
    }
    
    addLog('narrative', `Situation Verbs: ${verbs.join(', ').toUpperCase()}`);
  }, [situationRollCount, addLog]);

  const handleStartAdventure = useCallback(() => {
    const quest = generateAdventure();
    setGameState(prev => ({
      ...prev,
      isCreatingCharacter: false,
      adventureHook: quest,
      context: 'Narrative'
    }));
    setIsQuestModalOpen(true);
    addLog('narrative', "Your adventure begins...");
    addLog('narrative', `Initial Quest: ${quest.problem}`);
  }, [addLog]);

  const handleStartDowntimeActivity = useCallback((activityId: string, variantId: string, customName?: string, goalId?: string, materialCost?: number) => {
    const activity = DOWNTIME_DATA.downtime_activities.activities.find((a: any) => a.id === activityId);
    if (!activity) return;

    const variant = activity.variants.find((v: any) => v.id === variantId);
    if (!variant) return;

    let requiredProgress = (variant as any).progress_required || 5;
    let name = customName || activity.name;

    // Handle dynamic progress for mundane crafting
    if (activityId === 'crafting_mundane' && materialCost) {
      const itemValue = materialCost * 2;
      if (variant.id === 'simple') {
        requiredProgress = Math.ceil(itemValue / 55);
      } else if (variant.id === 'standard') {
        requiredProgress = Math.ceil(itemValue / 40);
      } else {
        requiredProgress = Math.ceil(itemValue / 35);
      }
      // Ensure at least 1 progress
      requiredProgress = Math.max(1, requiredProgress);
    }

    // Handle dynamic progress for construction
    if (activityId === 'construction' && materialCost) {
      requiredProgress = Math.ceil(materialCost / 100);
      // Ensure at least 1 progress
      requiredProgress = Math.max(1, requiredProgress);
    }

    if (goalId && activity.training_goals) {
      const goal = activity.training_goals.find((g: any) => g.id === goalId);
      if (goal) {
        requiredProgress = goal.progress_required;
        name = `${name} (${goal.name})`;
      }
    }

    const newDowntime: ActiveDowntime = {
      activityId,
      variantId,
      name,
      currentProgress: 0,
      requiredProgress,
      complications: [],
      opportunities: [],
      isComplete: false,
      materialCost,
      modifiers: {
        dcBonus: 0,
        advantageNext: false,
        disadvantageNext: false,
        skipNextDay: false,
        double_progress_today: false,
        next_check_double_progress: false,
        resolutionBonus: 0
      },
      history: [`Started ${name}.`]
    };

    setGameState(prev => {
      if (materialCost && prev.character.gold < materialCost) {
        addLog('narrative', `You don't have enough gold for the materials (${materialCost} gp).`);
        return prev;
      }

      const updatedChar = { ...prev.character };
      if (materialCost) {
        updatedChar.gold -= materialCost;
      }

      return {
        ...prev,
        character: updatedChar,
        activeDowntime: newDowntime
      };
    });

    addLog('narrative', `You started a new downtime activity: ${name}${materialCost ? ` (Materials: ${materialCost} gp)` : ''}.`);
  }, [addLog]);

  const applyDowntimeEffect = (prev: GameState, ad: ActiveDowntime, effect: any) => {
    if (!effect) return;
    const apply = (eff: any) => {
      switch (eff.type) {
        case 'progress_gain': ad.currentProgress += Number(eff.value); break;
        case 'progress_loss': ad.currentProgress = Math.max(0, ad.currentProgress - Number(eff.value)); break;
        case 'dc_increase': ad.modifiers.dcBonus -= Number(eff.value); break;
        case 'dc_bonus': ad.modifiers.dcBonus += Number(eff.value); break;
        case 'advantage_next': ad.modifiers.advantageNext = true; break;
        case 'disadvantage_next': ad.modifiers.disadvantageNext = true; break;
        case 'skip_next_day': ad.modifiers.skipNextDay = true; break;
        case 'double_progress_today': ad.modifiers.double_progress_today = true; break;
        case 'next_check_double_progress': ad.modifiers.next_check_double_progress = true; break;
        case 'resolution_bonus': ad.modifiers.resolutionBonus += Number(eff.value); break;
        case 'resolution_penalty': ad.modifiers.resolutionBonus -= Number(eff.value); break;
        case 'damage': {
          let dmg = 0;
          if (typeof eff.value === 'string' && eff.value.includes('d')) {
            const parts = eff.value.split('d');
            const count = parseInt(parts[0]) || 1;
            const sides = parseInt(parts[1]);
            for(let i=0; i<count; i++) dmg += rollDice(sides);
          } else {
            dmg = Number(eff.value);
          }
          prev.character.hp = Math.max(0, prev.character.hp - dmg);
          ad.history.push(`Mechanical Effect: You took ${dmg} damage.`);
          break;
        }
      }
    };
    apply(effect);
    if (effect.secondary) apply(effect.secondary);
  };

  const handleDowntimeWait = useCallback(() => {
    setGameState(prev => {
      if (!prev.activeDowntime) return prev;
      const ad: ActiveDowntime = { 
        ...prev.activeDowntime,
        history: [...prev.activeDowntime.history],
        modifiers: { ...prev.activeDowntime.modifiers }
      };
      
      ad.history.push("You spent a day resting or resolving delays. No progress made.");
      
      // Reset one-time modifiers
      ad.modifiers.advantageNext = false;
      ad.modifiers.disadvantageNext = false;
      ad.modifiers.skipNextDay = false;
      ad.modifiers.double_progress_today = false;
      ad.modifiers.next_check_double_progress = false;
      ad.modifiers.dcBonus = 0;

      return { ...prev, activeDowntime: ad };
    });
  }, []);

  const handleDowntimeProgressCheck = useCallback((overrides?: { ability?: Attribute, proficiencyLevel?: 'none' | 'proficient' | 'expertise' }) => {
    setGameState(prev => {
      if (!prev.activeDowntime) return prev;
      
      // Deep copy to avoid mutation issues in StrictMode
      const ad: ActiveDowntime = { 
        ...prev.activeDowntime,
        history: [...prev.activeDowntime.history],
        complications: [...prev.activeDowntime.complications],
        opportunities: [...prev.activeDowntime.opportunities],
        modifiers: { ...prev.activeDowntime.modifiers }
      };

      const activity = DOWNTIME_DATA.downtime_activities.activities.find((a: any) => a.id === ad.activityId);
      const variant = activity?.variants.find((v: any) => v.id === ad.variantId);
      if (!activity || !variant) return prev;

      // 1. Progress Check
      const abilityStr = activity.progress_check.ability;
      let defaultAbility: Attribute = 'Intelligence'; // Default for crafting/tools
      let skillToPoint: Skill | null = null;

      if (abilityStr.includes('Strength')) defaultAbility = 'Strength';
      else if (abilityStr.includes('Dexterity')) defaultAbility = 'Dexterity';
      else if (abilityStr.includes('Constitution')) defaultAbility = 'Constitution';
      else if (abilityStr.includes('Intelligence')) defaultAbility = 'Intelligence';
      else if (abilityStr.includes('Wisdom')) defaultAbility = 'Wisdom';
      else if (abilityStr.includes('Charisma')) defaultAbility = 'Charisma';
      
      const skillMatch = abilityStr.match(/\(([^)]+)\)/);
      if (skillMatch) {
        skillToPoint = skillMatch[1] as Skill;
      }

      const ability = overrides?.ability || defaultAbility;
      const mod = getModifier(prev.character.stats[ability] || 10);
      
      let profBonus = 0;
      const baseProf = getProficiencyBonus(prev.character.level);
      
      if (overrides?.proficiencyLevel) {
        if (overrides.proficiencyLevel === 'proficient') profBonus = baseProf;
        else if (overrides.proficiencyLevel === 'expertise') profBonus = baseProf * 2;
        else profBonus = 0;
      } else {
        const hasSkillProf = skillToPoint ? prev.character.proficiencies.includes(skillToPoint) : false;
        const hasToolProf = activity.progress_check.tool_options?.some((tool: string) => 
          prev.character.inventory?.some(i => i.name.toLowerCase().includes(tool.toLowerCase()) && i.isEquipped)
        ) || false;
        profBonus = (hasSkillProf || hasToolProf) ? baseProf : 0;
      }

      let roll = rollDice(20);
      if (ad.modifiers.advantageNext) {
        const roll2 = rollDice(20);
        roll = Math.max(roll, roll2);
      } else if (ad.modifiers.disadvantageNext) {
        const roll2 = rollDice(20);
        roll = Math.min(roll, roll2);
      }

      const total = roll + mod + profBonus + ad.modifiers.dcBonus;
      const dc = variant.dc;

      let progressGained = 0;
      let profLabel = "";
      if (overrides?.proficiencyLevel) {
        profLabel = overrides.proficiencyLevel === 'expertise' ? " (Expertise)" : 
                    overrides.proficiencyLevel === 'proficient' ? " (Proficient)" : " (No Prof.)";
      }
      
      let logMsg = `Downtime Check (${ability}${profLabel}): ${roll} + ${mod} + ${profBonus} = ${total} vs DC ${dc}. `;

      if (total >= dc) {
        progressGained = 1;
        if (ad.modifiers.double_progress_today || ad.modifiers.next_check_double_progress) {
          progressGained *= 2;
        }
        logMsg += "Success! Progress gained.";
      } else if (total <= dc - 5) {
        progressGained = -1;
        logMsg += "Critical Failure! Progress lost.";
      } else {
        logMsg += "Failure. No progress made.";
      }

      ad.currentProgress = Math.max(0, ad.currentProgress + progressGained);
      ad.history.push(logMsg);

      // Reset one-time modifiers
      ad.modifiers.advantageNext = false;
      ad.modifiers.disadvantageNext = false;
      ad.modifiers.skipNextDay = false;
      ad.modifiers.double_progress_today = false;
      ad.modifiers.next_check_double_progress = false;
      ad.modifiers.dcBonus = 0;

      // 2. Daily Event Roll
      const eventRoll = rollDice(6);
      const eventConfig = activity.daily_event_roll;
      
      if (eventRoll === eventConfig.complication_on) {
        const compRoll = rollDice(8);
        const comp = activity.complications.entries.find((c: any) => c.roll === compRoll);
        if (comp) {
          const compWithId = { ...comp, id: Math.random().toString(36).substr(2, 9), isResolved: false };
          ad.complications.push(compWithId);
          ad.history.push(`Complication: ${comp.name}. ${comp.description}`);
          // Apply mechanical effect
          applyDowntimeEffect(prev, ad, comp.mechanical_effect);
        }
      } else if (eventRoll === eventConfig.opportunity_on) {
        const oppRoll = rollDice(6);
        const opp = activity.opportunities.entries.find((o: any) => o.roll === oppRoll);
        if (opp) {
          ad.opportunities.push(opp);
          ad.history.push(`Opportunity: ${opp.name}. ${opp.description}`);
          // Apply mechanical effect
          applyDowntimeEffect(prev, ad, opp.mechanical_effect);
        }
      }

      if (ad.currentProgress >= ad.requiredProgress) {
        ad.isComplete = true;
        ad.history.push("Project progress complete! Ready for resolution.");
      }

      return { ...prev, activeDowntime: ad };
    });
  }, []);

  const handleResolveDowntime = useCallback(() => {
    setGameState(prev => {
      if (!prev.activeDowntime || !prev.activeDowntime.isComplete) return prev;
      const ad = { ...prev.activeDowntime };
      const activity = DOWNTIME_DATA.downtime_activities.activities.find((a: any) => a.id === ad.activityId);
      if (!activity) return prev;

      // Calculate Resolution Score
      let totalScore = activity.resolution.base_score + ad.modifiers.resolutionBonus;

      // Evaluate Positive Modifiers
      activity.resolution.positive_modifiers?.forEach((mod: any) => {
        let count = 0;
        if (mod.condition === 'per_opportunity_used') count = ad.opportunities.length;
        else if (mod.condition === 'no_complications_occurred') count = ad.complications.length === 0 ? 1 : 0;
        else if (mod.condition === 'tool_proficiency' || mod.condition === 'tool_expertise') {
          count = activity.progress_check.tool_options?.some((t: string) => 
            prev.character.inventory?.some(i => i.name.toLowerCase().includes(t.toLowerCase()) && i.isEquipped)
          ) ? 1 : 0;
        }
        else if (mod.condition === 'arcana_proficiency') count = prev.character.proficiencies.includes('Arcana') ? 1 : 0;
        else if (mod.condition === 'animal_handling_proficiency') count = prev.character.proficiencies.includes('Animal Handling') ? 1 : 0;
        else if (mod.condition === 'creature_naturally_docile') count = ad.variantId === 'docile' ? 1 : 0;
        else if (mod.condition === 'relevant_class_feature') count = 1; // Assume player has it if they are crafting
        
        totalScore += count * mod.value;
      });

      // Evaluate Negative Modifiers
      activity.resolution.negative_modifiers?.forEach((mod: any) => {
        let count = 0;
        if (mod.condition === 'per_unresolved_complication') count = ad.complications.filter(c => !c.isResolved).length;
        else if (mod.condition === 'creature_naturally_aggressive') count = ad.variantId === 'aggressive' ? 1 : 0;
        else if (mod.condition === 'interrupted_more_than_2_days') count = 0; // Hard to track, assume 0
        else if (ad.selectedModifierIds?.includes(mod.condition)) count = 1;
        
        totalScore += count * mod.value;
      });

      // Add manual positive modifiers
      activity.resolution.positive_modifiers?.forEach((mod: any) => {
        if (ad.selectedModifierIds?.includes(mod.condition)) {
          totalScore += mod.value;
        }
      });
      
      const outcome = activity.resolution.outcomes.find((o: any) => totalScore >= o.score_min && totalScore <= o.score_max) 
                   || activity.resolution.outcomes[activity.resolution.outcomes.length - 1];

      addLog('loot', `Resolved ${ad.name}. Final Score: ${totalScore}. Quality: ${outcome.name}. ${outcome.description}`);
      
      return { ...prev, activeDowntime: null };
    });
  }, [addLog]);

  const handleCancelDowntime = useCallback(() => {
    setGameState(prev => ({ ...prev, activeDowntime: null }));
  }, []);

  const handleResolveComplication = useCallback((complicationId: string) => {
    setGameState(prev => {
      if (!prev.activeDowntime) return prev;
      const ad = { ...prev.activeDowntime };
      ad.complications = ad.complications.map(c => 
        c.id === complicationId ? { ...c, isResolved: true } : c
      );
      return { ...prev, activeDowntime: ad };
    });
  }, []);

  const handleToggleDowntimeModifier = useCallback((modifierId: string) => {
    setGameState(prev => {
      if (!prev.activeDowntime) return prev;
      const ad = { ...prev.activeDowntime };
      const current = ad.selectedModifierIds || [];
      if (current.includes(modifierId)) {
        ad.selectedModifierIds = current.filter(id => id !== modifierId);
      } else {
        ad.selectedModifierIds = [...current, modifierId];
      }
      return { ...prev, activeDowntime: ad };
    });
  }, []);

  useEffect(() => {
    if (gameState.isCombatActive && gameState.currentRoom?.enemies && gameState.currentRoom.enemies.length > 0) {
      const allDead = gameState.currentRoom.enemies.every(e => e.hp <= 0);
      if (allDead) {
        addLog('combat', "All enemies defeated! Victory!");
        setGameState(prev => ({
          ...prev,
          isCombatActive: false,
          initiativeOrder: [],
          activeCombatantIndex: 0
        }));
      }
    }
  }, [gameState.isCombatActive, gameState.currentRoom?.enemies, addLog]);

  useEffect(() => {
    if (gameState.character.hp <= 0 && !gameState.isGameOver) {
      addLog('narrative', "You have fallen in battle... Your journey ends here.");
      setGameState(prev => ({ ...prev, isGameOver: true, isCombatActive: false }));
    }
  }, [gameState.character.hp, gameState.isGameOver, addLog]);

  return {
    // State
    gameState,
    setGameState,
    activeTab,
    setActiveTab,
    isXpModalOpen,
    setIsXpModalOpen,
    xpToEdit,
    setXpToEdit,
    isHpModalOpen,
    setIsHpModalOpen,
    hpToEdit,
    setHpToEdit,
    tempHpToEdit,
    setTempHpToEdit,
    isQuestModalOpen,
    setIsQuestModalOpen,
    isSpellCastModalOpen,
    setIsSpellCastModalOpen,
    inspectedEntity,
    setInspectedEntity,
    selectedMonster,
    setSelectedMonster,
    dicePool,
    setDicePool,
    manualRollModifier,
    setManualRollModifier,
    enemySearchQuery,
    setEnemySearchQuery,
    enemyCrFilter,
    setEnemyCrFilter,
    customCombatEnemies,
    setCustomCombatEnemies,
    suggesterDifficulty,
    setSuggesterDifficulty,
    suggesterTypeFilter,
    setSuggesterTypeFilter,
    suggesterEnvFilter,
    setSuggesterEnvFilter,
    encounterSuggestions,
    handleSuggestEncounter,
    handleAddToArena,

    // Derived State
    canLevelUp,
    xpProgress,
    nextXp,
    currentAc,

    // Handlers
    addLog,
    handleLevelUp,
    handleSubclassSelect,
    handleFinishCreation,
    handleResetGame,
    handleRestartSameCharacter,
    handleLongRest,
    handleSettlementInteraction,
    handleStartTravel,
    handleTravelDay,
    handleGenerateWildernessEvent,
    handleGenerateWildernessDiscovery,
    handleStartCamping,
    handleCampRest,
    handleSkipDisturbance,
    handleSetContext,
    handleArriveAtDestination,
    handleReturnToSettlement,
    handleBuyItem,
    handleSellItem,
    handleSettlementEvent,
    handleTownEncounter,
    handleUrbanEventSelect,
    handleDistrictDisturbance,
    handleExplore,
    handleOracle,
    handleToggleEquip,
    handleUseItem,
    handleDropItem,
    handleAddTreasureItem,
    handleRemoveTreasureItem,
    handleMoveTreasureToInventory,
    handleMoveInventoryToTreasure,
    handleAddSpell,
    handleRemoveSpell,
    handleUseSpellSlot,
    handleToggleSpellSlot,
    handleToggleSpellPrepared,
    handleCastSpell,
    handleUpdateHp,
    handleLoot,
    handleFinishDungeonSelection,
    handleFinishTravelSelection,
    handleAddNpc,
    handleGenerateLoot,
    handleClaimLootResult,
    handleAddItem,
    handleGenerateQuest,
    handleGenerateFaction,
    handleManualRoll,
    handleAddToPool,
    handleRemoveFromPool,
    handleClearPool,
    handleRollPool,
    handleAttributeCheck,
    handleUpdateAttribute,
    handleUpdateAcBonus,
    handleUpdateInitiativeBonus,
    handleUpdateSpeedBonus,
    handleSavingThrow,
    handleSkillCheck,
    handleToggleSavingThrowProficiency,
    handleToggleSkillProficiency,
    handleRerollDie,
    handleUpdateXp,
    handleSituationRoll,
    handleDismissNotification,
    handleCancelUrbanEvent,
    handleGenerateNewSettlement,
    handlePlanJourney,
    handleFindDungeon,
    handleToggleCombatEdit,
    handleClearLogs,
    handleClearRollLogs,
    handleRemoveNpcFromHistory,
    handleClearNpcHistory,
    handleUpdateNotes,
    handleStartAdventure,
    handleStartDowntimeActivity,
    handleDowntimeProgressCheck,
    handleDowntimeWait,
    handleResolveDowntime,
    handleCancelDowntime,
    handleResolveComplication,
    handleToggleDowntimeModifier,
    handleAddCompanion,
    handleRemoveCompanion,
    handleUpdateCompanionHp,
    handleUpdateCompanion,
    handleAddCompanionAbility,
    handleRemoveCompanionAbility,
    handleAddCustomAbility,
    handleRemoveCustomAbility,
    
    // Bestiary
    monsterTypes,
    ALL_BESTIARY_ENEMIES: ALL_BESTIARY_ENEMIES_VAL,

    // UI state
    isCharQuickViewOpen,
    setIsCharQuickViewOpen,
    selectedLocationId,
    setSelectedLocationId,
    npcGenerationTargetLocationId,
    setNpcGenerationTargetLocationId,
    npcGenerationInitialRole,
    setNpcGenerationInitialRole,
    nextSettlementType,
    setNextSettlementType,
    isBossLoot,
    setIsBossLoot,
    oracleQuestion,
    setOracleQuestion,
    oracleLikelihood,
    setOracleLikelihood,
    selectedDC,
    setSelectedDC,
    situationRollCount,
    setSituationRollCount,
    selectedSkill,
    setSelectedSkill,
    combatDamageDieCount,
    setCombatDamageDieCount,
    combatDamageDieSides,
    setCombatDamageDieSides,
    combatDamageModifier,
    setCombatDamageModifier,
    npcTab,
    setNpcTab,
    itemTab,
    setItemTab,
    generatedFaction,
    setGeneratedFaction,
    handleUncoverItemHistory,
    bestiarySearch,
    setBestiarySearch,
    bestiaryTypeFilters,
    setBestiaryTypeFilters,
    bestiaryEnvFilters,
    setBestiaryEnvFilters,
    bestiarySortBy,
    setBestiarySortBy,
    bestiarySortOrder,
    setBestiarySortOrder,
    bestiaryCrMin,
    setBestiaryCrMin,
    bestiaryCrMax,
    setBestiaryCrMax,
    openPanels,
    setOpenPanels,
    logContainerRef
  };
}
