/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, Sword, Scroll, Book, BookOpen, Map as MapIcon, 
  Dices, Plus, Minus, Trash2, ChevronRight, 
  History, User, Package, Settings, AlertCircle, AlertTriangle, MapPin,
  Heart, Zap, ShieldOff, Castle, Skull, FlaskConical, Mountain, Coins, Gem,
  ArrowUpAZ, ArrowDownAZ, Filter, Trophy, Sparkles, ArrowUpCircle,
  Layers, CheckCircle2, Wind, PawPrint, Search, Info, X, Hammer, UserPlus,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { NpcGenerator } from './components/NpcGenerator';
import { ItemsList } from './components/ItemsList';
import { SpellBrowser } from './components/SpellBrowser';
import { CharacterSheet } from './components/CharacterSheet';
import { LoreEngine } from './components/LoreEngine';
import { SettlementServices, UrbanEventSelection } from './components/Settlements';
import { ToolPanel } from './components/ToolPanel';
import { CharacterCreation } from './components/CharacterCreation';
import { SubclassSelection } from './components/SubclassSelection';
import { DungeonSelection, TravelSelection, CampSelection } from './components/AdventureSetup';
import { Downtime } from './components/Downtime';
import { useGameState } from './hooks/useGameState';
import { useCombat } from './hooks/useCombat';
import { Character, GameLog, Room, RoomRolls, GameState, Enemy, Item, Attribute, CharacterClass, Skill, Ability, Combatant, GameContext, Settlement, WildernessTravel, Species, Background, SettlementType, DistrictType, NPC, Faction, SpellSlot, Spell, OracleResponse, LootResult } from './types';
import { rollDice, getModifier, parseDamage, getSkillModifier, getProficiencyBonus, calculateAc, getXpRequired, getPrevXpThreshold, crToNumber, getSuggestedRoleForLocation, mapLootItemToItem, getRandomItemByCriteria, getOracleResponse, generateNPC } from './services/gameEngine';
import { getInteractionResponse } from './services/interactionEngine';
import { INITIAL_CHARACTER, SKILL_ATTRIBUTES, SETTLEMENT_EVENTS, WILDERNESS_TERRAINS, WILDERNESS_WEATHER, SPECIES_TEMPLATES, BACKGROUND_TEMPLATES, WILDERNESS_BIOMES, ORACLE_LIKELIHOODS, DIFFICULTY_CLASSES, SITUATION_VERBS, SETTLEMENT_TYPES, URBAN_ENCOUNTERS, CAMP_DISTURBANCE_CATEGORIES, URBAN_EVENT_CATEGORIES, CR_VALUES } from './constants';
import ITEMS_DATA from './data/items.json';
import BESTIARY_DATA from './data/bestiary.json';
import CLASSES_DATA from './data/classes.json';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LoneForgeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Stylized d20 at the bottom */}
    <g transform="translate(-2, 2)">
      <path d="M12 11l4 2.5v5L12 21l-4-2.5v-5L12 11z" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 11v10M8 13.5l8 5M16 13.5l-8 5" strokeWidth="1" />
    </g>
    
    {/* Hammer tilted 45 degrees hitting from above */}
    {/* Head pointing up-left, handle going down-right */}
    <g transform="translate(3, -4) rotate(-45 12 12)">
      {/* Hammer Head */}
      <rect x="9" y="6" width="6" height="4" rx="1" fill="currentColor" />
      {/* Hammer Handle */}
      <path d="M12 10v9" strokeWidth="2.5" />
    </g>
  </svg>
);

export default function App() {
  const {
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
    npcTab,
    setNpcTab,
    npcGenerationInitialRole,
    setNpcGenerationInitialRole,
    itemTab,
    setItemTab,
    generatedFaction,
    setGeneratedFaction,
    openPanels,
    setOpenPanels,
    logContainerRef,

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
    handleUncoverItemHistory,
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
    ALL_BESTIARY_ENEMIES,

    // UI state
    isCharQuickViewOpen,
    setIsCharQuickViewOpen,
    selectedLocationId,
    setSelectedLocationId,
    npcGenerationTargetLocationId,
    setNpcGenerationTargetLocationId,
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
  } = useGameState();

  const [targetingMode, setTargetingMode] = useState<{ type: 'attack' | 'ability', ability?: Ability } | null>(null);
  const [lastCombatRoomId, setLastCombatRoomId] = useState<string | null>(null);
  const [lootSource, setLootSource] = useState<'enemy_normal' | 'exploration' | 'treasure_room' | 'boss'>('enemy_normal');
  const [bossCreatureType, setBossCreatureType] = useState('');
  const [idCategory, setIdCategory] = useState('Wondrous Item');
  const [idRarity, setIdRarity] = useState('common');
  const [identifiedItem, setIdentifiedItem] = useState<Item | null>(null);

  const {
    handleAttack,
    handleUseAbility,
    handleUpdateCombatantHp,
    startCombat,
    nextTurn,
    handleAddEnemyToCombat,
    handleRemoveEnemyFromCombat,
    handleClearEnemiesFromCombat
  } = useCombat({ gameState, setGameState, addLog });

  // Auto-start combat when enemies appear in dungeon
  useEffect(() => {
    if (
      gameState.context === 'Dungeon' &&
      gameState.currentRoom?.enemies &&
      gameState.currentRoom.enemies.length > 0 &&
      gameState.currentRoom.enemies.some(e => e.hp > 0) &&
      !gameState.isCombatActive &&
      gameState.currentRoom.id !== lastCombatRoomId
    ) {
      startCombat(gameState.currentRoom.enemies);
      setLastCombatRoomId(gameState.currentRoom.id);
      setActiveTab('adventure');
    }
  }, [
    gameState.context,
    gameState.currentRoom?.id,
    gameState.isCombatActive,
    lastCombatRoomId,
    startCombat,
    setActiveTab
  ]);































  return (
    <div className="min-h-screen bg-dnd-parchment text-dnd-ink font-serif parchment-texture selection:bg-dnd-red/20">
      {/* Notification System */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {(gameState.notifications || []).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={cn(
                "mb-2 p-4 rounded-xl border-2 shadow-2xl pointer-events-auto flex items-center gap-3 backdrop-blur-md",
                notification.type === 'narrative' && "bg-dnd-paper/90 border-dnd-gold text-dnd-ink",
                notification.type === 'combat' && "bg-dnd-red/90 border-dnd-gold text-white",
                notification.type === 'roll' && "bg-purple-900/90 border-purple-400 text-white",
                notification.type === 'loot' && "bg-emerald-900/90 border-emerald-400 text-white",
              )}
            >
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">{notification.content}</p>
              </div>
              <button 
                onClick={() => handleDismissNotification(notification.id)}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  notification.type === 'narrative' ? "text-dnd-ink/60 hover:bg-dnd-red/10 hover:text-dnd-red" : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
                aria-label="Dismiss notification"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {gameState.isCreatingCharacter ? (
        <CharacterCreation onFinish={handleFinishCreation} />
      ) : gameState.pendingSubclassSelection ? (
        <SubclassSelection 
          options={gameState.pendingSubclassSelection} 
          onSelect={handleSubclassSelect} 
          characterClass={gameState.character.class}
        />
      ) : gameState.isSelectingDungeon ? (
        <DungeonSelection onFinish={handleFinishDungeonSelection} />
      ) : gameState.isSelectingTravel ? (
        <TravelSelection onFinish={handleFinishTravelSelection} />
      ) : gameState.isSelectingUrbanEvent ? (
        <UrbanEventSelection 
          onSelect={handleUrbanEventSelect}
          onCancel={handleCancelUrbanEvent}
        />
      ) : gameState.isCamping ? (
        <CampSelection 
          onRest={handleCampRest}
          onSkip={handleSkipDisturbance}
          lastLog={gameState.lastTravelLog || ""}
        />
      ) : (
        <>
          {/* Header */}
          <header className="border-b-2 border-dnd-gold bg-dnd-paper/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-dnd-red border-2 border-dnd-gold flex items-center justify-center shadow-md">
              <LoneForgeLogo className="w-8 h-8 text-dnd-parchment" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-widest uppercase font-black text-dnd-red">LoneForge</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-dnd-gold -mt-1">Solo RPG Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {gameState.adventureHook && (
              <button 
                onClick={() => setIsQuestModalOpen(true)}
                className="flex items-center gap-2 bg-dnd-gold/10 hover:bg-dnd-gold/20 border-2 border-dnd-gold/30 px-3 py-1.5 rounded-lg transition-all"
              >
                <Scroll className="w-4 h-4 text-dnd-gold" />
                <span className="text-[10px] uppercase font-black tracking-widest text-dnd-gold">Quest</span>
              </button>
            )}
            <div 
              className="flex flex-col items-end cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors"
              onClick={() => {
                setXpToEdit(gameState.character.xp);
                setIsXpModalOpen(true);
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-sans font-black text-dnd-ink/40">Experience</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-dnd-ink/5 rounded-full overflow-hidden border border-dnd-ink/10">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      width: `${gameState.character.level >= 20 ? 100 : xpProgress}%` 
                    }}
                    className="h-full bg-blue-700"
                  />
                </div>
                <span className="font-mono text-xs font-bold text-blue-800">LV.{gameState.character.level}</span>
              </div>
            </div>
            <div 
              className="flex flex-col items-end cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors"
              onClick={() => {
                setHpToEdit(gameState.character.hp);
                setTempHpToEdit(gameState.character.tempHp || 0);
                setIsHpModalOpen(true);
              }}
            >
              <span className="text-[10px] uppercase tracking-widest font-sans font-black text-dnd-ink/40">Health</span>
              <div className="flex items-center gap-3">
                <div className="w-40 h-2 bg-dnd-ink/5 rounded-full overflow-hidden border border-dnd-ink/10 relative">
                  <motion.div 
                    initial={false}
                    animate={{ width: `${(gameState.character.hp / gameState.character.maxHp) * 100}%` }}
                    className={cn(
                      "h-full transition-colors",
                      gameState.character.hp < (gameState.character.maxHp * 0.25) ? "bg-dnd-red" : "bg-emerald-700"
                    )}
                  />
                  {gameState.character.tempHp !== undefined && gameState.character.tempHp > 0 && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-400/50" 
                      style={{ width: `${Math.min(100, (gameState.character.tempHp / gameState.character.maxHp) * 100)}%` }}
                    />
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm font-bold leading-none">{gameState.character.hp}/{gameState.character.maxHp}</span>
                  {gameState.character.tempHp !== undefined && gameState.character.tempHp > 0 && (
                    <span className="text-[8px] font-bold text-blue-600 leading-none mt-0.5">+{gameState.character.tempHp} TEMP</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Rail */}
        <nav className="lg:col-span-2 flex lg:flex-col gap-4 overflow-x-auto pb-4 lg:pb-0">
          <NavButton active={activeTab === 'adventure'} onClick={() => setActiveTab('adventure')} icon={<MapIcon />} label="Adventure" />
          <NavButton active={activeTab === 'character'} onClick={() => setActiveTab('character')} icon={<User />} label="Character" />
          <NavButton active={activeTab === 'dice'} onClick={() => setActiveTab('dice')} icon={<Dices />} label="Dice" />
          <NavButton active={activeTab === 'bestiary'} onClick={() => setActiveTab('bestiary')} icon={<PawPrint />} label="Bestiary" />
          <NavButton active={activeTab === 'spells'} onClick={() => setActiveTab('spells')} icon={<Sparkles />} label="Spells" />
          <NavButton active={activeTab === 'items'} onClick={() => setActiveTab('items')} icon={<Package />} label="Items" />
          <NavButton active={activeTab === 'npc'} onClick={() => setActiveTab('npc')} icon={<UserPlus />} label="NPCs" />
          <NavButton active={activeTab === 'downtime'} onClick={() => setActiveTab('downtime')} icon={<Clock />} label="Downtime" />
          <NavButton active={activeTab === 'lore'} onClick={() => setActiveTab('lore')} icon={<Scroll />} label="Lore" />
          <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<Book />} label="Notes" />
        </nav>

        {/* Content Area */}
        <div className="lg:col-span-10">
          <AnimatePresence mode="wait">
            {gameState.isGameOver ? (
              <motion.div 
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Game Over</h2>
                  <p className="text-dnd-ink font-serif italic text-lg opacity-80">Your legend ends here. But another hero is ready to rise.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleRestartSameCharacter}
                    className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-bold hover:bg-emerald-400 transition-colors"
                  >
                    Continue with Same Hero
                  </button>
                  <button 
                    onClick={handleResetGame}
                    className="bg-red-500 text-black px-8 py-3 rounded-2xl font-bold hover:bg-red-400 transition-colors"
                  >
                    New Hero (Level 1)
                  </button>
                </div>
              </motion.div>
            ) : !gameState.adventureHook ? (
              <motion.div 
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <Book className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif italic mb-2">Start a New Story</h2>
                  <p className="text-white/40">Establish the origin of your mission before departing.</p>
                </div>
                <button 
                  onClick={handleStartAdventure}
                  className="bg-emerald-500 text-black px-12 py-4 rounded-2xl font-display uppercase tracking-[0.3em] font-black text-lg hover:bg-emerald-400 transition-all shadow-xl border-2 border-white/20"
                >
                  Generate Hook
                </button>
              </motion.div>
            ) : activeTab === 'adventure' && (
              <motion.div 
                key="adventure"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-8"
              >
                {/* Left Column: Toolbox */}
                <div className="xl:col-span-7 space-y-6">
                  {/* Context Switcher - The Player Declares the Situation */}
                  <ContextSwitcher 
                    currentContext={gameState.context} 
                    onContextChange={handleSetContext} 
                  />

                  {/* Tool Panels */}
                  <div className="space-y-4">
                    {/* 1. Narrative & Oracle (Always Relevant) */}
                    <ToolPanel 
                      title="Narrative & Oracle" 
                      icon={<Book className="w-5 h-5" />}
                      isOpen={gameState.context === 'Narrative'}
                      onToggle={() => handleSetContext('Narrative')}
                      accentColor="gold"
                    >
                      <div className="space-y-6">
                        {/* Oracle */}
                        <div className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Ask the Oracle</p>
                            <button 
                              onClick={handleGenerateQuest}
                              className="text-[10px] uppercase font-bold text-dnd-red hover:text-dnd-red/80 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> New Quest
                            </button>
                          </div>
                          <form onSubmit={handleOracle} className="space-y-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={oracleQuestion}
                                onChange={(e) => setOracleQuestion(e.target.value)}
                                placeholder="Is the guard suspicious?"
                                className="flex-1 bg-white/50 border border-dnd-gold/20 rounded-lg px-4 py-2 text-sm font-serif focus:outline-none focus:border-dnd-red transition-all"
                              />
                              <button type="submit" className="bg-dnd-red text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">Ask</button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {ORACLE_LIKELIHOODS.map((l) => (
                                <button
                                  key={l.label}
                                  type="button"
                                  onClick={() => setOracleLikelihood(l)}
                                  className={cn(
                                    "px-2 py-1 rounded text-[8px] font-bold uppercase transition-all border",
                                    oracleLikelihood.label === l.label 
                                      ? "bg-dnd-red text-white border-dnd-red" 
                                      : "bg-white/30 text-dnd-ink/60 border-dnd-gold/10 hover:border-dnd-gold/30"
                                  )}
                                >
                                  {l.label} ({l.mod >= 0 ? '+' : ''}{l.mod})
                                </button>
                              ))}
                            </div>
                          </form>
                        </div>

                        {/* Action */}
                        <div className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 mb-3">Attempt Action</p>
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="I try to pick the lock..."
                                className="flex-1 bg-white/50 border border-dnd-gold/20 rounded-lg px-4 py-2 text-sm font-serif focus:outline-none focus:border-dnd-red transition-all"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.currentTarget;
                                    const action = input.value;
                                    if (!action) return;
                                    const roll = rollDice(20);
                                    const mod = selectedSkill !== 'None' ? getSkillModifier(gameState.character, selectedSkill as Skill) : getModifier(gameState.character.stats['Wisdom']);
                                    const total = roll + mod;
                                    const success = total >= selectedDC.dc;
                                    const result = success ? 'Success!' : 'Failure';
                                    const skillText = selectedSkill !== 'None' ? ` (${selectedSkill})` : '';
                                    addLog('roll', `Action: "${action}"${skillText} vs DC ${selectedDC.dc} -> ${result} (Roll: ${roll} + ${mod} = ${total})`);
                                    input.value = '';
                                  }
                                }}
                              />
                              <button 
                                onClick={(e) => {
                                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                  const action = input.value;
                                  if (!action) return;
                                  const roll = rollDice(20);
                                  const mod = selectedSkill !== 'None' ? getSkillModifier(gameState.character, selectedSkill as Skill) : getModifier(gameState.character.stats['Wisdom']);
                                  const total = roll + mod;
                                  const success = total >= selectedDC.dc;
                                  const result = success ? 'Success!' : 'Failure';
                                  const skillText = selectedSkill !== 'None' ? ` (${selectedSkill})` : '';
                                  addLog('roll', `Action: "${action}"${skillText} vs DC ${selectedDC.dc} -> ${result} (Roll: ${roll} + ${mod} = ${total})`);
                                  input.value = '';
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
                              >
                                Roll
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-dnd-gold shrink-0">Difficulty (DC):</span>
                                <div className="flex flex-wrap gap-1">
                                  {DIFFICULTY_CLASSES.map((d) => (
                                    <button
                                      key={d.label}
                                      onClick={() => setSelectedDC(d)}
                                      className={cn(
                                        "px-2 py-1 rounded text-[8px] font-bold uppercase transition-all border",
                                        selectedDC.label === d.label 
                                          ? "bg-indigo-600 text-white border-indigo-600" 
                                          : "bg-white/30 text-dnd-ink/60 border-dnd-gold/10 hover:border-dnd-gold/30"
                                      )}
                                    >
                                      {d.label} ({d.dc})
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-dnd-gold shrink-0">Skill:</span>
                                <select 
                                  value={selectedSkill}
                                  onChange={(e) => setSelectedSkill(e.target.value as Skill | 'None')}
                                  className="flex-1 bg-white/50 border border-dnd-gold/20 rounded px-2 py-1 text-[10px] font-bold uppercase focus:outline-none"
                                >
                                  <option value="None">None (Wisdom)</option>
                                  {(Object.keys(SKILL_ATTRIBUTES) as Skill[]).sort().map(skill => (
                                    <option key={skill} value={skill}>{skill}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Situations Table */}
                        <div className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl p-4">
                          <p className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 mb-3">Situations Table (Verbs)</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-dnd-gold shrink-0">Roll Count:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button
                                    key={n}
                                    onClick={() => setSituationRollCount(n)}
                                    className={cn(
                                      "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all border",
                                      situationRollCount === n 
                                        ? "bg-emerald-600 text-white border-emerald-600" 
                                        : "bg-white/30 text-dnd-ink/60 border-dnd-gold/10 hover:border-dnd-gold/30"
                                    )}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={handleSituationRoll}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-emerald-700 transition-all"
                            >
                              <Dices className="w-3 h-3" /> Roll
                            </button>
                          </div>
                          <p className="text-[9px] text-dnd-ink/40 mt-2 italic">Get plot ideas by rolling for random action verbs.</p>
                        </div>
                      </div>
                    </ToolPanel>

                    {/* 2. Settlement Tools */}
                    <SettlementServices 
                      gameState={gameState}
                      nextSettlementType={nextSettlementType}
                      selectedLocationId={selectedLocationId}
                      handlers={{
                        handleSetContext,
                        setSelectedLocationId,
                        setNextSettlementType,
                        handleGenerateNewSettlement,
                        handleDistrictDisturbance,
                        handleSettlementEvent,
                        handleTownEncounter,
                        setNpcGenerationTargetLocationId,
                        setNpcGenerationInitialRole,
                        setActiveTab,
                        setInspectedEntity,
                        setGameState,
                        handleLongRest,
                        handleSettlementInteraction,
                        handleBuyItem,
                        handleSellItem,
                        addLog
                      }}
                    />
                    
                    {/* 3. Wilderness & Travel */}
                    <ToolPanel 
                      title="Wilderness & Travel" 
                      icon={<Mountain className="w-5 h-5" />}
                      isOpen={gameState.context === 'Wilderness'}
                      onToggle={() => handleSetContext('Wilderness')}
                      accentColor="emerald"
                    >
                      <div className="space-y-4">
                        {gameState.travel ? (
                          <>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-dnd-ink">To: {gameState.travel.destination}</p>
                              <p className="text-xs font-mono text-emerald-600">{gameState.travel.currentDay} / {gameState.travel.totalDays} Days</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                                <p className="text-[8px] uppercase font-bold text-emerald-600/60">Terrain</p>
                                <p className="text-xs font-bold">{gameState.travel.terrain}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                                <p className="text-[8px] uppercase font-bold text-emerald-600/60">Rations</p>
                                <p className="text-xs font-bold">{gameState.travel.rations} Days</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {gameState.isDayActive ? (
                                <div className="flex-1 space-y-3">
                                  <div className="p-3 rounded-xl bg-white/50 border border-dnd-gold/20 font-serif text-xs italic text-dnd-ink/80 whitespace-pre-wrap">
                                    {gameState.lastTravelLog}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button onClick={handleGenerateWildernessEvent} className="py-2 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 font-bold text-[10px] uppercase">Random Event</button>
                                    <button onClick={handleGenerateWildernessDiscovery} className="py-2 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 font-bold text-[10px] uppercase">Discovery</button>
                                  </div>
                                  <button onClick={handleStartCamping} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                                    <Wind className="w-4 h-4" />
                                    Camping
                                  </button>
                                </div>
                              ) : gameState.travel.currentDay < gameState.travel.totalDays ? (
                                <button onClick={handleTravelDay} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest">Travel Day</button>
                              ) : (
                                <button onClick={handleArriveAtDestination} className="flex-1 py-3 rounded-xl bg-dnd-red text-white font-bold text-xs uppercase tracking-widest">Arrive</button>
                              )}
                              {!gameState.isDayActive && (
                                <button onClick={handleReturnToSettlement} className="px-4 py-3 rounded-xl border border-dnd-gold/20 text-[10px] font-bold uppercase">Return</button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-dnd-gold/10 rounded-xl">
                            <p className="text-xs text-dnd-ink/40 italic mb-4">No active journey.</p>
                            <button onClick={handlePlanJourney} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase">Plan Journey</button>
                          </div>
                        )}
                      </div>
                    </ToolPanel>

                    {/* 4. Dungeon Exploration */}
                    <ToolPanel 
                      title="Dungeon Exploration" 
                      icon={<Skull className="w-5 h-5" />}
                      isOpen={gameState.context === 'Dungeon'}
                      onToggle={() => handleSetContext('Dungeon')}
                      accentColor="indigo"
                    >
                      <div className="space-y-4">
                        {gameState.dungeonConfig ? (
                          <>
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-dnd-ink">{gameState.dungeonConfig.type}</p>
                              <p className="text-xs font-mono text-indigo-600">{gameState.roomsExplored} / {gameState.dungeonConfig.totalRooms} Rooms</p>
                            </div>
                            <div className="w-full h-1.5 bg-dnd-gold/10 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600" style={{ width: `${(gameState.roomsExplored / gameState.dungeonConfig.totalRooms) * 100}%` }} />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={handleExplore} 
                                disabled={gameState.dungeonConfig.isComplete}
                                className={cn(
                                  "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors",
                                  gameState.dungeonConfig.isComplete ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white"
                                )}
                              >
                                {gameState.dungeonConfig.isComplete ? 'Dungeon Complete' : (gameState.currentRoom ? 'Next Room' : 'Enter Dungeon')}
                              </button>
                              <button onClick={handleReturnToSettlement} className="px-4 py-3 rounded-xl border border-dnd-gold/20 text-[10px] font-bold uppercase">Exit</button>
                            </div>
                            {gameState.currentRoom && (
                              <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-indigo-600 mb-1">{gameState.currentRoom.type}</p>
                                  <p className="text-sm font-serif italic text-dnd-ink/80 mb-1">{gameState.currentRoom.feature}</p>
                                </div>

                                {gameState.currentRoom?.rolls && (
                                  <div className="grid grid-cols-6 gap-1 pt-2 border-t border-indigo-500/10">
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('purple')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.purple >= 7 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-300"
                                        )}
                                        title="Click to reroll Monsters"
                                      >
                                        {gameState.currentRoom.rolls.purple}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-purple-600 mt-1 text-center leading-tight">Monsters</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('blue')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.blue >= 7 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-300"
                                        )}
                                        title="Click to reroll Clues"
                                      >
                                        {gameState.currentRoom.rolls.blue}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-blue-600 mt-1 text-center leading-tight">Clues</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('green')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.green >= 7 ? "bg-green-600 text-white" : "bg-green-100 text-green-300"
                                        )}
                                        title="Click to reroll Environment"
                                      >
                                        {gameState.currentRoom.rolls.green}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-green-600 mt-1 text-center leading-tight">Environment</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('red')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.red >= 7 ? "bg-red-600 text-white" : "bg-red-100 text-red-300"
                                        )}
                                        title="Click to reroll NPC"
                                      >
                                        {gameState.currentRoom.rolls.red}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-red-600 mt-1 text-center leading-tight">NPC</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('gold')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.gold >= 7 ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-300"
                                        )}
                                        title="Click to reroll Treasure"
                                      >
                                        {gameState.currentRoom.rolls.gold}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-yellow-600 mt-1 text-center leading-tight">Treasure</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <button 
                                        onClick={() => handleRerollDie('multicolour')}
                                        className={cn(
                                          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 hover:brightness-110", 
                                          gameState.currentRoom.rolls.multicolour >= 7 ? "bg-gradient-to-br from-red-500 via-green-500 to-blue-500 text-white" : "bg-gray-100 text-gray-300"
                                        )}
                                        title="Click to reroll Events"
                                      >
                                        {gameState.currentRoom.rolls.multicolour}
                                      </button>
                                      <span className="text-[7px] uppercase font-bold text-dnd-ink/60 mt-1 text-center leading-tight">Events</span>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2 pt-2 border-t border-indigo-500/10">
                                  {gameState.currentRoom?.clue && (
                                    <div className="flex gap-2 items-start">
                                      <Search className="w-3 h-3 text-blue-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-blue-600">Clue:</span> {gameState.currentRoom.clue}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.npc && (
                                    <div 
                                      className="flex gap-2 items-start cursor-pointer hover:bg-red-50 p-1 rounded transition-colors"
                                      onClick={() => setInspectedEntity({ type: 'npc', data: gameState.currentRoom!.npc })}
                                    >
                                      <User className="w-3 h-3 text-red-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-red-600">NPC:</span> {gameState.currentRoom.npc.name} ({gameState.currentRoom.npc.race} {gameState.currentRoom.npc.role})</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.event && (
                                    <div className="flex gap-2 items-start">
                                      <Zap className="w-3 h-3 text-amber-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-amber-600">Event:</span> {gameState.currentRoom.event}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.environmentFeature && (
                                    <div className="flex gap-2 items-start">
                                      <Wind className="w-3 h-3 text-green-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-green-600">Feature:</span> {gameState.currentRoom.environmentFeature}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.trap && (
                                    <div className="flex gap-2 items-start">
                                      <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-red-600">Trap:</span> {gameState.currentRoom.trap}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.encounterDifficulty && (
                                    <div className="flex gap-2 items-start">
                                      <Skull className="w-3 h-3 text-purple-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-purple-600">Encounter:</span> {gameState.currentRoom.encounterDifficulty}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.enemies && gameState.currentRoom.enemies.length > 0 && (
                                    <div 
                                      className="flex gap-2 items-start cursor-pointer hover:bg-purple-50 p-1 rounded transition-colors"
                                      onClick={() => {
                                        const enemy = gameState.currentRoom!.enemies![0];
                                        const fullBestiaryEntry = ALL_BESTIARY_ENEMIES.find((m: any) => m.name === enemy.name);
                                        setInspectedEntity({ type: 'enemy', data: { ...(fullBestiaryEntry || {}), ...enemy } });
                                      }}
                                    >
                                      <Skull className="w-3 h-3 text-purple-600 mt-0.5" />
                                      <p className="text-[10px] text-dnd-ink/70"><span className="font-bold text-purple-600">Enemies:</span> {gameState.currentRoom.enemies.length}x {gameState.currentRoom.enemies[0].name}</p>
                                    </div>
                                  )}
                                  {gameState.currentRoom?.lootResult && (
                                    <div 
                                      className="flex flex-col gap-2 mt-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                                      onClick={() => {
                                        // Open a summary or just claim
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-yellow-600" />
                                        <p className="text-[10px] text-dnd-ink/70 flex-1 font-bold">Room Loot Found!</p>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleLoot(); }}
                                          className="text-[10px] bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors font-bold uppercase"
                                        >
                                          Claim All
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {gameState.currentRoom.lootResult.magic_items.map((mi, i) => (
                                          <span key={i} className="text-[8px] bg-white border border-yellow-200 px-1.5 py-0.5 rounded text-yellow-800">{mi.name}</span>
                                        ))}
                                        {gameState.currentRoom.lootResult.valuables.map((v, i) => (
                                          <span key={i} className="text-[8px] bg-white border border-yellow-200 px-1.5 py-0.5 rounded text-yellow-800">{v.name}</span>
                                        ))}
                                        {gameState.currentRoom.lootResult.total_gp_value > 0 && (
                                          <span className="text-[8px] font-bold text-yellow-700">+{gameState.currentRoom.lootResult.total_gp_value} GP Value</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-dnd-gold/10 rounded-xl">
                            <p className="text-xs text-dnd-ink/40 italic mb-4">Not currently in a dungeon.</p>
                            <button onClick={handleFindDungeon} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase">Find Dungeon</button>
                          </div>
                        )}
                      </div>
                    </ToolPanel>

                    {/* 5. Combat Tools */}
                    <ToolPanel 
                      title="Combat Tools" 
                      icon={<Sword className="w-5 h-5" />}
                      isOpen={gameState.context === 'Combat' || gameState.isCombatActive}
                      onToggle={() => handleSetContext('Combat')}
                      accentColor="red"
                    >
                      <div className="space-y-4">
                        {gameState.isCombatActive ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-dnd-red/5 p-3 rounded-xl border border-dnd-red/10">
                              <div className="flex flex-col">
                                <p className="text-xs font-black uppercase text-dnd-red">Turn {gameState.combatTurn}</p>
                                <button 
                                  onClick={handleToggleCombatEdit}
                                  className="text-[8px] uppercase font-bold text-dnd-ink/60 hover:text-dnd-red transition-colors flex items-center gap-1"
                                >
                                  {gameState.isEditingCombat ? <X className="w-2 h-2" /> : <Plus className="w-2 h-2" />}
                                  {gameState.isEditingCombat ? 'Close Editor' : 'Manage Encounter'}
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    handleClearEnemiesFromCombat();
                                    handleSetContext('Narrative');
                                  }}
                                  className="text-[10px] bg-white border border-dnd-gold/30 text-dnd-ink px-3 py-1 rounded uppercase font-bold hover:bg-dnd-ink hover:text-white transition-all"
                                >
                                  End Combat
                                </button>
                                <button onClick={nextTurn} className="text-[10px] bg-dnd-red text-white px-3 py-1 rounded uppercase font-bold hover:bg-red-800 transition-all shadow-sm">Next Turn</button>
                              </div>
                            </div>
                            
                            {gameState.isEditingCombat && (
                              <div className="p-3 rounded-xl bg-dnd-red/5 border border-dnd-red/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black uppercase text-dnd-red">Edit Active Battle</p>
                                  <button 
                                    onClick={handleClearEnemiesFromCombat}
                                    className="text-[8px] uppercase font-bold text-dnd-red/60 hover:text-dnd-red"
                                  >
                                    Clear All
                                  </button>
                                </div>

                                {/* Current Enemies to Remove */}
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-bold text-dnd-ink/40">Remove Combatants</p>
                                  <div className="flex flex-wrap gap-1">
                                    {gameState.initiativeOrder.filter(c => c.type === 'enemy').map((c) => (
                                      <div key={c.id} className="flex items-center gap-1.5 bg-white border border-dnd-red/20 px-2 py-1 rounded-md">
                                        <span className="text-[9px] font-bold truncate max-w-[60px]">{c.name}</span>
                                        <button 
                                          onClick={() => handleRemoveEnemyFromCombat(c.id)}
                                          className="text-dnd-red hover:text-red-800"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Add New Enemies */}
                                <div className="space-y-2 pt-2 border-t border-dnd-red/10">
                                  <p className="text-[8px] uppercase font-bold text-dnd-ink/40">Add Reinforcements</p>
                                  
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-dnd-ink/40" />
                                      <input 
                                        type="text"
                                        placeholder="Search Bestiary..."
                                        value={enemySearchQuery}
                                        onChange={(e) => setEnemySearchQuery(e.target.value)}
                                        className="w-full pl-6 pr-3 py-1.5 bg-white border border-dnd-gold/20 rounded-md text-[10px] focus:outline-none focus:ring-1 focus:ring-dnd-red/50"
                                      />
                                    </div>
                                    <select 
                                      value={enemyCrFilter}
                                      onChange={(e) => setEnemyCrFilter(e.target.value)}
                                      className="bg-white border border-dnd-gold/20 rounded-md text-[10px] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-dnd-red/50"
                                    >
                                      <option value="All">All CR</option>
                                      {CR_VALUES.map(cr => (
                                        <option key={cr} value={cr}>CR {cr}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="max-h-40 overflow-y-auto border border-dnd-gold/10 rounded-md bg-white divide-y divide-dnd-gold/5 custom-scrollbar shadow-sm">
                                    {ALL_BESTIARY_ENEMIES
                                      .filter(e => {
                                        const matchesName = e.name.toLowerCase().includes(enemySearchQuery.toLowerCase());
                                        const matchesCr = enemyCrFilter === 'All' || e.cr === crToNumber(enemyCrFilter);
                                        return matchesName && matchesCr;
                                      })
                                      .slice(0, 50)
                                      .map((e, idx) => (
                                        <button 
                                          key={`${e.name}-${idx}`}
                                          onClick={() => handleAddEnemyToCombat(e)}
                                          className="w-full text-left px-2 py-1.5 hover:bg-dnd-red/5 text-[9px] flex justify-between items-center transition-colors group"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-bold group-hover:text-dnd-red">{e.name}</span>
                                            <span className="text-[8px] text-dnd-ink/40">{e.type}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-dnd-ink/40">CR {e.cr < 1 ? (e.cr === 0.125 ? '1/8' : e.cr === 0.25 ? '1/4' : e.cr === 0.5 ? '1/2' : '0') : e.cr}</span>
                                            <Plus className="w-2.5 h-2.5 text-dnd-red opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Column: Your Turn */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-4 bg-dnd-red rounded-full" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink">Your Turn</h4>
                                </div>

                                {/* Dice Palette */}
                                <div className="bg-white/40 border border-dnd-gold/20 rounded-2xl p-4 space-y-4 shadow-sm">
                                  <p className="text-[9px] uppercase font-black text-dnd-ink/40 tracking-tighter">Dice Palette</p>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      onClick={() => handleAttack()}
                                      disabled={gameState.initiativeOrder[gameState.activeCombatantIndex]?.type !== 'player'}
                                      className="flex flex-col items-center justify-center p-3 bg-dnd-red/10 border border-dnd-red/20 rounded-xl hover:bg-dnd-red/20 transition-all group disabled:opacity-30 disabled:grayscale"
                                    >
                                      <Sword className="w-4 h-4 text-dnd-red mb-1 group-hover:scale-110 transition-transform" />
                                      <span className="text-[10px] font-black uppercase text-dnd-red">Attack</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        let total = 0;
                                        for(let i = 0; i < combatDamageDieCount; i++) {
                                          total += rollDice(combatDamageDieSides);
                                        }
                                        total += combatDamageModifier;
                                        const modStr = combatDamageModifier === 0 ? '' : (combatDamageModifier > 0 ? `+${combatDamageModifier}` : combatDamageModifier);
                                        addLog('roll', `Damage Roll (${combatDamageDieCount}d${combatDamageDieSides}${modStr}): ${total}`);
                                      }}
                                      disabled={gameState.initiativeOrder[gameState.activeCombatantIndex]?.type !== 'player'}
                                      className="flex flex-col items-center justify-center p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl hover:bg-emerald-600/20 transition-all group disabled:opacity-30 disabled:grayscale"
                                    >
                                      <FlaskConical className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                                      <span className="text-[10px] font-black uppercase text-emerald-600">Damage</span>
                                    </button>
                                  </div>

                                  <div className="space-y-2 pt-2 border-t border-dnd-gold/10">
                                    <p className="text-[8px] uppercase font-bold text-dnd-ink/40">Damage Settings</p>
                                    <div className="flex gap-2 items-center">
                                      <div className="flex items-center bg-white border border-dnd-gold/10 rounded-lg px-2 py-1">
                                        <select 
                                          value={combatDamageDieCount}
                                          onChange={(e) => setCombatDamageDieCount(parseInt(e.target.value))}
                                          className="bg-transparent text-[9px] font-bold outline-none cursor-pointer"
                                        >
                                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <span className="text-[9px] font-bold text-dnd-ink/40 mx-0.5">d</span>
                                        <select 
                                          value={combatDamageDieSides}
                                          onChange={(e) => setCombatDamageDieSides(parseInt(e.target.value))}
                                          className="bg-transparent text-[9px] font-bold outline-none cursor-pointer"
                                        >
                                          {[4,6,8,10,12,20].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                      </div>
                                      <span className="text-dnd-ink/40 text-xs">+</span>
                                      <div className="flex items-center bg-white border border-dnd-gold/10 rounded-lg pr-1">
                                        <input 
                                          type="number" 
                                          value={combatDamageModifier}
                                          onChange={(e) => setCombatDamageModifier(parseInt(e.target.value) || 0)}
                                          className="w-12 bg-transparent px-2 py-1 text-[9px] font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <div className="flex flex-col border-l border-dnd-gold/10">
                                          <button 
                                            onClick={() => setCombatDamageModifier(prev => prev + 1)}
                                            className="px-1 text-[8px] hover:bg-dnd-gold/10"
                                          >
                                            ▲
                                          </button>
                                          <button 
                                            onClick={() => setCombatDamageModifier(prev => prev - 1)}
                                            className="px-1 text-[8px] hover:bg-dnd-gold/10 border-t border-dnd-gold/10"
                                          >
                                            ▼
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-[8px] uppercase font-bold text-dnd-ink/40">Saving Throws</p>
                                    <div className="grid grid-cols-3 gap-1">
                                      {(['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'] as Attribute[]).map(attr => (
                                        <button 
                                          key={attr}
                                          onClick={() => handleSavingThrow(attr)}
                                          className="py-1.5 bg-white border border-dnd-gold/10 rounded-lg text-[8px] font-bold uppercase hover:border-dnd-red transition-all"
                                        >
                                          {attr.substring(0, 3)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <p className="text-[8px] uppercase font-bold text-dnd-ink/40">Skills</p>
                                    <div className="flex gap-2">
                                      <select 
                                        value={selectedSkill}
                                        onChange={(e) => setSelectedSkill(e.target.value as Skill | 'None')}
                                        className="flex-1 bg-white border border-dnd-gold/10 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase focus:outline-none"
                                      >
                                        <option value="None">Select Skill</option>
                                        {(Object.keys(SKILL_ATTRIBUTES) as Skill[]).sort().map(skill => (
                                          <option key={skill} value={skill}>{skill}</option>
                                        ))}
                                      </select>
                                      <button 
                                        onClick={() => selectedSkill !== 'None' && handleSkillCheck(selectedSkill as Skill)}
                                        disabled={selectedSkill === 'None'}
                                        className="px-3 bg-dnd-ink text-white rounded-lg text-[9px] font-bold uppercase disabled:opacity-30"
                                      >
                                        Roll
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Abilities & Spells */}
                                <div className="space-y-2">
                                  <p className="text-[9px] uppercase font-black text-dnd-ink/40 tracking-tighter">Abilities & Spells</p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {gameState.character.abilities?.map(ability => (
                                      <button 
                                        key={ability.id}
                                        onClick={() => handleUseAbility(ability)}
                                        disabled={
                                          gameState.initiativeOrder[gameState.activeCombatantIndex]?.type !== 'player' ||
                                          (ability.type === 'action' && gameState.hasUsedAction) || 
                                          (ability.type === 'bonus_action' && gameState.hasUsedBonusAction)
                                        }
                                        className="w-full text-left px-3 py-2 bg-white border border-dnd-gold/20 rounded-xl hover:border-dnd-red transition-all flex justify-between items-center group disabled:opacity-50 disabled:grayscale"
                                      >
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-black uppercase group-hover:text-dnd-red">{ability.name}</span>
                                          <span className="text-[8px] text-dnd-ink/40">{ability.type.replace('_', ' ')}</span>
                                        </div>
                                        {ability.usesPerLongRest && (
                                          <span className="text-[9px] font-mono bg-dnd-gold/10 px-1.5 py-0.5 rounded text-dnd-gold">{ability.currentUses}/{ability.usesPerLongRest}</span>
                                        )}
                                      </button>
                                    ))}
                                    {gameState.character.knownSpells && gameState.character.knownSpells.length > 0 && (
                                      <button 
                                        onClick={() => setIsSpellCastModalOpen(true)}
                                        disabled={gameState.initiativeOrder[gameState.activeCombatantIndex]?.type !== 'player'}
                                        className="w-full text-left px-3 py-2 bg-indigo-600/5 border border-indigo-600/20 rounded-xl hover:border-indigo-600 transition-all flex justify-between items-center group disabled:opacity-50 disabled:grayscale"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-3 h-3 text-indigo-600" />
                                          <span className="text-[10px] font-black uppercase text-indigo-600">Cast Spell</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-indigo-600" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {gameState.initiativeOrder[gameState.activeCombatantIndex]?.type === 'player' && (
                                  <button 
                                    onClick={nextTurn}
                                    className="w-full py-3 bg-dnd-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg flex items-center justify-center gap-2 group"
                                  >
                                    End Your Turn <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                )}
                              </div>

                              {/* Right Column: Enemy & Oracle */}
                              <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-4 bg-dnd-gold rounded-full" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink">Enemy & Oracle</h4>
                                </div>

                                {/* Manual HP Tracker */}
                                <div className="space-y-3">
                                  <p className="text-[9px] uppercase font-black text-dnd-ink/40 tracking-tighter">Combatants (Manual HP)</p>
                                  <div className="space-y-2">
                                    {gameState.initiativeOrder.map((c) => (
                                      <div 
                                        key={c.id} 
                                        className={cn(
                                          "p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3",
                                          c.id === gameState.initiativeOrder[gameState.activeCombatantIndex].id 
                                            ? "border-dnd-red bg-dnd-red/5 shadow-md" 
                                            : "border-dnd-gold/10 bg-white/40"
                                        )}
                                      >
                                        <div 
                                          className="flex-1 cursor-pointer"
                                          onClick={() => {
                                            if (c.type === 'enemy' && c.ref) {
                                              const fullBestiaryEntry = ALL_BESTIARY_ENEMIES.find((m: any) => m.name === c.name);
                                              setInspectedEntity({ type: 'enemy', data: { ...(fullBestiaryEntry || {}), ...c.ref } });
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-2 mb-1">
                                            {c.type === 'player' ? <User className="w-3 h-3 text-blue-600" /> : <Skull className="w-3 h-3 text-dnd-red" />}
                                            <span className="text-[10px] font-black uppercase truncate max-w-[100px]">{c.name}</span>
                                            <span className="text-[8px] font-mono text-dnd-ink/40">AC {c.ac}</span>
                                          </div>
                                          <div className="w-full bg-dnd-ink/10 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                              className={cn(
                                                "h-full transition-all duration-500",
                                                (c.currentHp / c.maxHp) > 0.5 ? "bg-green-600" : (c.currentHp / c.maxHp) > 0.2 ? "bg-yellow-600" : "bg-red-600"
                                              )}
                                              style={{ width: `${(c.currentHp / c.maxHp) * 100}%` }}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => handleUpdateCombatantHp(c.id, -1)}
                                            className="w-6 h-6 rounded-full bg-dnd-red/10 text-dnd-red flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="text-[10px] font-mono font-bold w-8 text-center">{c.currentHp}</span>
                                          <button 
                                            onClick={() => handleUpdateCombatantHp(c.id, 1)}
                                            className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Active Enemy Turn Actions */}
                                {gameState.initiativeOrder[gameState.activeCombatantIndex]?.type === 'enemy' && (
                                  <div className="bg-dnd-red/5 border border-dnd-red/20 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Skull className="w-4 h-4 text-dnd-red" />
                                        <p className="text-[10px] uppercase font-black text-dnd-red tracking-widest">Enemy Turn: {gameState.initiativeOrder[gameState.activeCombatantIndex].name}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                      <button 
                                        onClick={() => handleAttack()}
                                        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-dnd-red/20 rounded-xl hover:bg-dnd-red/5 transition-all group"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Sword className="w-3 h-3 text-dnd-red" />
                                          <span className="text-[10px] font-black uppercase">Standard Attack</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[8px] font-mono text-dnd-ink/40">+{ (gameState.initiativeOrder[gameState.activeCombatantIndex].ref as Enemy)?.attackBonus || 0 }</span>
                                          <Dices className="w-3 h-3 text-dnd-red opacity-40 group-hover:opacity-100" />
                                        </div>
                                      </button>

                                      {((gameState.initiativeOrder[gameState.activeCombatantIndex].ref as Enemy)?.abilities || []).map(ability => (
                                        <button 
                                          key={ability.id}
                                          onClick={() => handleUseAbility(ability)}
                                          className="w-full text-left px-3 py-2 bg-white border border-dnd-gold/20 rounded-xl hover:border-dnd-red transition-all flex justify-between items-center group"
                                        >
                                          <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase group-hover:text-dnd-red">{ability.name}</span>
                                            <span className="text-[8px] text-dnd-ink/40 line-clamp-1">{ability.description}</span>
                                          </div>
                                          <Zap className="w-3 h-3 text-dnd-gold opacity-40 group-hover:opacity-100" />
                                        </button>
                                      ))}
                                    </div>
                                    
                                    <button 
                                      onClick={nextTurn}
                                      className="w-full py-2 bg-dnd-ink text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md"
                                    >
                                      End Enemy Turn
                                    </button>
                                  </div>
                                )}

                                {/* Combat Oracle */}
                                <div className="bg-dnd-ink/5 border border-dnd-gold/20 rounded-2xl p-4 space-y-4">
                                  <div className="flex items-center gap-2">
                                    < BookOpen className="w-4 h-4 text-dnd-gold" />
                                    <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Combat Oracle</p>
                                  </div>

                                  <div className="space-y-4 pt-2">
                                    {(() => {
                                      const enemies = gameState.initiativeOrder.filter(c => c.type === 'enemy');
                                      const player = gameState.initiativeOrder.find(c => c.type === 'player');

                                      // Helper thresholds
                                      const anyEnemyLow = enemies.some(e => e.currentHp / e.maxHp < 0.25);
                                      const anyEnemyWounded = enemies.some(e => e.currentHp / e.maxHp < 0.5);
                                      const playerWounded = player && player.currentHp / player.maxHp < 0.5;
                                      const playerCritical = player && player.currentHp / player.maxHp < 0.25;

                                      const oracleCategories = [
                                        {
                                          id: "morale",
                                          label: "Enemy Morale",
                                          questions: [
                                            ...(anyEnemyWounded ? ["Do they become cautious?", "Do they switch to defensive tactics?", "Do they call for help?"] : []),
                                            ...(anyEnemyLow ? ["Do they attempt to flee?", "Do they surrender?", "Do they disengage?"] : [])
                                          ]
                                        },
                                        {
                                          id: "tactics",
                                          label: "Enemy Tactics",
                                          questions: [
                                            "Do they focus the weakest target?", 
                                            "Do they use a special ability?", 
                                            "Do they reposition for advantage?",
                                            "Do they switch targets?",
                                            "Do they try to flank?"
                                          ]
                                        },
                                        {
                                          id: "danger",
                                          label: "Player Danger",
                                          questions: [
                                            ...(playerWounded ? ["Do the enemies sense weakness?", "Do they focus the player?"] : []),
                                            ...(playerCritical ? ["Do they attempt a finishing blow?", "Do they demand surrender?"] : [])
                                          ]
                                        },
                                        {
                                          id: "env",
                                          label: "Environmental / Narrative",
                                          questions: [
                                            "Does the environment shift?", 
                                            "Do reinforcements arrive?", 
                                            "Does a new threat appear?",
                                            "Does something valuable get damaged?"
                                          ]
                                        }
                                      ];

                                      const handleOracleClick = (q: string) => {
                                        setOracleQuestion(q);
                                        // Auto-submit for convenience
                                        const likelihood = ORACLE_LIKELIHOODS.find(l => l.label === 'Possible') || ORACLE_LIKELIHOODS[3];
                                        const response = getOracleResponse(likelihood.mod);
                                        
                                        const modStr = response.modifier !== 0 ? ` ${response.modifier >= 0 ? '+' : ''}${response.modifier}` : '';
                                        addLog('roll', `Oracle: "${q}" (${likelihood.label}) -> ${response.answer} (Roll: ${response.rawRoll}${modStr} = ${response.roll})`);
                                        setOracleQuestion('');
                                      };

                                      return oracleCategories.filter(cat => cat.questions.length > 0).map(cat => (
                                        <div key={cat.id} className="space-y-1.5">
                                          <p className="text-[7px] uppercase font-black text-dnd-gold/60 tracking-wider flex items-center gap-1.5">
                                            <span className="w-1 h-1 bg-dnd-gold/30 rounded-full" />
                                            {cat.label}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {cat.questions.map(q => (
                                              <button
                                                key={q}
                                                onClick={() => handleOracleClick(q)}
                                                className="px-2 py-1 bg-white border border-dnd-gold/10 rounded text-[8px] font-bold text-dnd-ink/60 hover:border-dnd-red hover:text-dnd-red transition-all"
                                              >
                                                {q}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>

                                  <form onSubmit={handleOracle} className="space-y-2">
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={oracleQuestion}
                                        onChange={(e) => setOracleQuestion(e.target.value)}
                                        placeholder="Ask anything..."
                                        className="flex-1 bg-white border border-dnd-gold/20 rounded-lg px-3 py-1.5 text-[10px] font-serif focus:outline-none focus:border-dnd-red"
                                      />
                                      <button type="submit" className="bg-dnd-ink text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">Ask</button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="text-center py-10 border-2 border-dashed border-dnd-gold/10 rounded-2xl bg-white/30">
                              <Skull className="w-10 h-10 text-dnd-gold/20 mx-auto mb-4" />
                              <p className="text-xs text-dnd-ink/40 italic mb-4">The air is quiet... for now.</p>
                              <button 
                                onClick={() => {
                                  if (gameState.currentRoom?.enemies && gameState.currentRoom.enemies.length > 0) {
                                    startCombat(gameState.currentRoom.enemies);
                                  } else {
                                    addLog('narrative', "No enemies here to fight!");
                                  }
                                }} 
                                className="bg-dnd-red text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg"
                              >
                                Start Room Combat
                              </button>
                            </div>

                            <div className="space-y-4 border-t border-dnd-gold/10 pt-6">
                              <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase text-dnd-gold tracking-widest">Custom Encounter Arena</h3>
                                {customCombatEnemies.length > 0 && (
                                  <button 
                                    onClick={() => setCustomCombatEnemies([])}
                                    className="text-[8px] uppercase font-bold text-dnd-red/60 hover:text-dnd-red"
                                  >
                                    Clear Arena
                                  </button>
                                )}
                              </div>
                              
                              {/* Added Enemies */}
                              {customCombatEnemies.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {customCombatEnemies.map((e, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-dnd-gold/20 px-3 py-1.5 rounded-xl shadow-sm">
                                      <span className="text-[10px] font-bold">{e.name}</span>
                                      <button 
                                        onClick={() => setCustomCombatEnemies(prev => prev.filter((_, i) => i !== idx))}
                                        className="text-dnd-red hover:text-red-800"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-3">
                                <button 
                                  onClick={() => startCombat(customCombatEnemies)}
                                  disabled={customCombatEnemies.length === 0}
                                  className="flex-1 bg-dnd-ink text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 shadow-md"
                                >
                                  Enter Arena
                                </button>
                                <button 
                                  onClick={() => setActiveTab('bestiary')}
                                  className="px-4 py-3 rounded-xl border-2 border-dnd-gold/30 text-[10px] font-black uppercase tracking-widest text-dnd-gold hover:bg-dnd-gold/5 transition-all"
                                >
                                  Bestiary
                                </button>
                              </div>
                            </div>

                            {/* Encounter Suggester Section */}
                            <div className="space-y-4 border-t border-dnd-gold/10 pt-4">
                              <h3 className="text-[10px] font-black uppercase text-dnd-gold tracking-widest">Encounter Suggester</h3>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {(['Easy', 'Medium', 'Hard', 'Deadly'] as const).map(diff => (
                                  <button
                                    key={diff}
                                    onClick={() => setSuggesterDifficulty(diff)}
                                    className={cn(
                                      "py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                      suggesterDifficulty === diff 
                                        ? "bg-dnd-ink text-white border-dnd-ink shadow-md" 
                                        : "bg-white text-dnd-ink/60 border-dnd-gold/20 hover:border-dnd-gold/50"
                                    )}
                                  >
                                    {diff}
                                  </button>
                                ))}
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <select 
                                  value={suggesterTypeFilter}
                                  onChange={(e) => setSuggesterTypeFilter(e.target.value)}
                                  className="w-full bg-white border border-dnd-gold/20 rounded-lg text-[10px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                                >
                                  <option value="All">All Types</option>
                                  {monsterTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                                <select 
                                  value={suggesterEnvFilter}
                                  onChange={(e) => setSuggesterEnvFilter(e.target.value)}
                                  className="w-full bg-white border border-dnd-gold/20 rounded-lg text-[10px] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                                >
                                  <option value="All">All Environments</option>
                                  {['Arctic', 'Coastal', 'Desert', 'Forest', 'Grassland', 'Hill', 'Mountain', 'Swamp', 'Underdark', 'Underwater', 'Urban'].map(env => (
                                    <option key={env} value={env}>{env}</option>
                                  ))}
                                </select>
                              </div>

                              <button 
                                onClick={handleSuggestEncounter}
                                className="w-full bg-dnd-gold text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-yellow-700 transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <Dices className="w-3 h-3" /> Suggest Encounter
                              </button>

                              {encounterSuggestions.length > 0 && (
                                <div className="space-y-2 mt-4">
                                  {encounterSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="bg-white border border-dnd-gold/20 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[10px] font-bold text-dnd-ink group-hover:text-indigo-600 transition-colors">{suggestion.label}</h4>
                                        <span className={cn(
                                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                                          suggesterDifficulty === 'Easy' ? "bg-green-100 text-green-700" :
                                          suggesterDifficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                                          suggesterDifficulty === 'Hard' ? "bg-orange-100 text-orange-700" :
                                          "bg-red-100 text-red-700"
                                        )}>
                                          {suggesterDifficulty}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                          <span className="text-[8px] text-dnd-ink/40">Effective CR: {suggestion.effectiveCR.toFixed(2)}</span>
                                          <span className="text-[8px] text-dnd-ink/40">Budget: {suggestion.budget}</span>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            suggestion.enemies.forEach(e => {
                                              for (let i = 0; i < e.count; i++) {
                                                handleAddToArena(e.name);
                                              }
                                            });
                                          }}
                                          className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase hover:bg-indigo-700 transition-all shadow-sm"
                                        >
                                          Add to Arena
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </ToolPanel>
                  </div>
                </div>

                {/* Right Column: Journal/Log (Persistent) */}
                <div className="xl:col-span-5">
                  <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 h-full min-h-[600px] xl:sticky xl:top-24 flex flex-col shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-dnd-gold/20" />
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xs uppercase tracking-widest font-display font-bold text-dnd-red flex items-center gap-2">
                        <History className="w-4 h-4" /> Campaign Journal
                      </h2>
                      <button 
                        onClick={handleClearLogs}
                        className="text-[10px] uppercase font-bold text-dnd-red/60 hover:text-dnd-red transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div 
                      ref={logContainerRef}
                      className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
                    >
                      {(() => {
                        const filteredLogs = activeTab === 'dice' 
                          ? gameState.logs.filter(log => log.type === 'roll')
                          : gameState.logs;

                        const displayLogs = [...filteredLogs].reverse();

                        if (displayLogs.length === 0) {
                          return (
                            <div className="h-full flex items-center justify-center text-center p-8">
                              <p className="text-sm text-dnd-ink/40 italic font-serif">
                                {activeTab === 'dice' 
                                  ? "No rolls recorded." 
                                  : "The journal is empty. Start your adventure to write the story."}
                              </p>
                            </div>
                          );
                        }

                        return displayLogs.map(log => (
                          <motion.div 
                            key={log.id} 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "border-l-4 pl-4 py-2 bg-dnd-parchment/30 rounded-r-lg",
                              log.type === 'narrative' && "border-dnd-gold/40",
                              log.type === 'combat' && "border-dnd-red/40",
                              log.type === 'roll' && "border-purple-800/40",
                              log.type === 'loot' && "border-emerald-800/40",
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-dnd-ink/40">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={cn(
                                "text-[8px] uppercase font-bold px-1.5 rounded",
                                log.type === 'narrative' && "bg-dnd-gold/10 text-dnd-gold",
                                log.type === 'combat' && "bg-dnd-red/10 text-dnd-red",
                                log.type === 'roll' && "bg-purple-800/10 text-purple-800",
                                log.type === 'loot' && "bg-emerald-800/10 text-emerald-800",
                              )}>
                                {log.type}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-dnd-ink font-serif">{log.content}</p>
                          </motion.div>
                        ));
                      })()}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'character' && (
              <CharacterSheet 
                gameState={gameState} 
                handlers={{
                  canLevelUp,
                  nextXp,
                  xpProgress,
                  currentAc,
                  handleLevelUp,
                  handleAttributeCheck,
                  handleUpdateAttribute,
                  handleUpdateAcBonus,
                  handleUpdateInitiativeBonus,
                  handleUpdateSpeedBonus,
                  handleSavingThrow,
                  handleSkillCheck,
                  handleToggleSavingThrowProficiency,
                  handleToggleSkillProficiency,
                  setGameState,
                  setInspectedEntity,
                  handleUseItem,
                  handleToggleEquip,
                  handleDropItem,
                  handleAddTreasureItem,
                  handleRemoveTreasureItem,
                  handleMoveTreasureToInventory,
                  handleMoveInventoryToTreasure,
                  setActiveTab,
                  handleToggleSpellSlot,
                  handleToggleSpellPrepared,
                  handleRemoveSpell,
                  handleAddCompanion,
                  handleRemoveCompanion,
                  handleUpdateCompanionHp,
                  handleUpdateCompanion,
                  handleAddCompanionAbility,
                  handleRemoveCompanionAbility,
                  handleAddCustomAbility,
                  handleRemoveCustomAbility
                }}
              />
            )}

            {activeTab === 'dice' && (
              <motion.div 
                key="dice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6"
              >
                <div className="xl:col-span-7 space-y-6">
                  {/* Dice Selection */}
                  <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Dices className="w-5 h-5 text-dnd-red" />
                        <h2 className="text-xs uppercase tracking-widest font-display font-bold text-dnd-red">Select Dice</h2>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {[4, 6, 8, 10, 12, 20, 100].map(sides => (
                        <button 
                          key={sides}
                          onClick={() => handleAddToPool(sides)}
                          className="flex flex-col items-center justify-center p-4 rounded-xl bg-dnd-parchment border border-dnd-gold/20 hover:bg-dnd-red/5 hover:border-dnd-red/40 transition-all group shadow-sm"
                        >
                          <span className="text-lg font-display font-bold text-dnd-ink group-hover:text-dnd-red transition-colors">d{sides}</span>
                          <Plus className="w-3 h-3 text-dnd-ink/20 mt-1" />
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Dice Pool */}
                  <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-dnd-red" />
                        <h2 className="text-xs uppercase tracking-widest font-display font-bold text-dnd-red">Dice Pool</h2>
                      </div>
                      {dicePool.length > 0 && (
                        <button 
                          onClick={handleClearPool}
                          className="text-[10px] uppercase font-bold text-dnd-red/60 hover:text-dnd-red transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {dicePool.length === 0 ? (
                        <div className="py-8 text-center border-2 border-dashed border-dnd-gold/10 rounded-xl">
                          <p className="text-sm text-dnd-ink/40 italic font-serif">Select dice above to compose your roll.</p>
                        </div>
                      ) : (
                        dicePool.map(dice => (
                          <div key={dice.sides} className="flex items-center justify-between p-4 bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-dnd-red/5 border border-dnd-red/20 flex items-center justify-center font-display font-bold text-dnd-red">
                                d{dice.sides}
                              </div>
                              <span className="text-sm font-bold text-dnd-ink font-serif">Quantity: {dice.count}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleRemoveFromPool(dice.sides)}
                                className="p-2 rounded-lg bg-dnd-paper border border-dnd-gold/20 hover:bg-dnd-red/5 transition-colors text-dnd-ink"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleAddToPool(dice.sides)}
                                className="p-2 rounded-lg bg-dnd-paper border border-dnd-gold/20 hover:bg-dnd-red/5 transition-colors text-dnd-ink"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Roll Controls */}
                  <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-display font-bold text-dnd-red">Modifier</label>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setManualRollModifier(prev => prev - 1)}
                            className="w-10 h-10 rounded-xl bg-dnd-parchment border border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red/5 transition-colors text-dnd-ink"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input 
                            type="number" 
                            value={manualRollModifier}
                            onChange={(e) => setManualRollModifier(parseInt(e.target.value) || 0)}
                            className="w-full bg-dnd-parchment border border-dnd-gold/30 rounded-xl px-4 py-2 text-center font-mono text-lg font-bold text-dnd-ink focus:outline-none focus:border-dnd-red/50"
                          />
                          <button 
                            onClick={() => setManualRollModifier(prev => prev + 1)}
                            className="w-10 h-10 rounded-xl bg-dnd-parchment border border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red/5 transition-colors text-dnd-ink"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <button 
                          onClick={handleRollPool}
                          disabled={dicePool.length === 0 && manualRollModifier === 0}
                          className="w-full h-12 bg-dnd-red hover:bg-red-800 disabled:bg-dnd-ink/10 disabled:text-dnd-ink/20 text-dnd-parchment rounded-xl font-display font-bold transition-all shadow-lg shadow-dnd-red/20 flex items-center justify-center gap-2"
                        >
                          <Dices className="w-5 h-5" /> Roll Dice
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Results (Journal filtered) */}
                <div className="xl:col-span-5">
                  <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 h-full min-h-[600px] xl:sticky xl:top-24 flex flex-col shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xs uppercase tracking-widest font-display font-bold text-dnd-red flex items-center gap-2">
                        <History className="w-4 h-4" /> Recent Results
                      </h2>
                      <button 
                        onClick={handleClearRollLogs}
                        className="text-[10px] uppercase font-bold text-dnd-red/60 hover:text-dnd-red transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div 
                      ref={logContainerRef}
                      className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
                    >
                      {(() => {
                        const rollLogs = gameState.logs.filter(l => l.type === 'roll');
                        if (rollLogs.length === 0) {
                          return (
                            <div className="h-full flex items-center justify-center text-center p-8">
                              <p className="text-sm text-dnd-ink/40 italic font-serif">No rolls recorded.</p>
                            </div>
                          );
                        }
                        return [...rollLogs].reverse().map(log => (
                          <motion.div 
                            key={log.id} 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-l-4 border-purple-800/40 pl-4 py-2 bg-dnd-parchment/30 rounded-r-lg"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono text-dnd-ink/40">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-[8px] uppercase font-bold px-1.5 rounded bg-purple-800/10 text-purple-800">
                                roll
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-dnd-ink font-serif">{log.content}</p>
                          </motion.div>
                        ));
                      })()}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'bestiary' && (
              <motion.div 
                key="bestiary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <PawPrint className="w-8 h-8 text-dnd-red" />
                      <h2 className="text-2xl uppercase tracking-widest font-display font-bold text-dnd-red">Bestiary</h2>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-dnd-ink/40">
                      {ALL_BESTIARY_ENEMIES.length} Creatures Discovered
                    </div>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dnd-ink/40" />
                      <input 
                        type="text" 
                        placeholder="Search the archives for monsters..."
                        value={bestiarySearch}
                        onChange={(e) => setBestiarySearch(e.target.value)}
                        className="w-full bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-2xl pl-12 pr-6 py-4 font-serif text-lg focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Sort By Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/30">Sort By:</span>
                        <button 
                          onClick={() => setBestiarySortBy(prev => prev === 'name' ? 'cr' : 'name')}
                          className="px-3 py-1 bg-dnd-parchment/50 border border-dnd-gold/20 rounded-lg hover:bg-dnd-gold/5 transition-colors text-[10px] font-bold uppercase tracking-widest text-dnd-ink/60"
                        >
                          {bestiarySortBy === 'name' ? 'Name' : 'CR'}
                        </button>
                        <button 
                          onClick={() => setBestiarySortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="p-1 bg-dnd-parchment/50 border border-dnd-gold/20 rounded-lg hover:bg-dnd-gold/5 transition-colors text-dnd-ink/60"
                        >
                          {bestiarySortOrder === 'asc' ? <ArrowUpAZ className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* CR Range Filters */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest font-black text-dnd-ink/30 mb-1">CR Min</span>
                          <select 
                            value={bestiaryCrMin}
                            onChange={(e) => setBestiaryCrMin(e.target.value)}
                            className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-lg text-[10px] font-bold p-1 focus:outline-none"
                          >
                            {CR_VALUES.map(cr => (
                              <option key={cr} value={cr}>{cr}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest font-black text-dnd-ink/30 mb-1">CR Max</span>
                          <select 
                            value={bestiaryCrMax}
                            onChange={(e) => setBestiaryCrMax(e.target.value)}
                            className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-lg text-[10px] font-bold p-1 focus:outline-none"
                          >
                            {CR_VALUES.map(cr => (
                              <option key={cr} value={cr}>{cr}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Type Filters */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-dnd-ink/30 mr-2">
                          <Filter className="w-3 h-3" />
                          Filter by Type:
                        </div>
                        {monsterTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              setBestiaryTypeFilters(prev => 
                                prev.includes(type) 
                                  ? prev.filter(t => t !== type) 
                                  : [...prev, type]
                              );
                            }}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all border",
                              bestiaryTypeFilters.includes(type)
                                ? "bg-dnd-red text-dnd-parchment border-dnd-red shadow-md"
                                : "bg-dnd-parchment/30 text-dnd-ink/40 border-dnd-gold/20 hover:border-dnd-red/40"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                        {bestiaryTypeFilters.length > 0 && (
                          <button 
                            onClick={() => setBestiaryTypeFilters([])}
                            className="text-[10px] font-bold uppercase tracking-tighter text-dnd-red hover:underline ml-2"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Environment Filters */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-dnd-ink/30 mr-2">
                          <MapPin className="w-3 h-3" />
                          Filter by Environment:
                        </div>
                        {['Arctic', 'Coastal', 'Desert', 'Forest', 'Grassland', 'Hill', 'Mountain', 'Swamp', 'Underdark', 'Underwater', 'Urban'].map(env => (
                          <button
                            key={env}
                            onClick={() => {
                              setBestiaryEnvFilters(prev => 
                                prev.includes(env) 
                                  ? prev.filter(e => e !== env) 
                                  : [...prev, env]
                              );
                            }}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all border",
                              bestiaryEnvFilters.includes(env)
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                : "bg-dnd-parchment/30 text-dnd-ink/40 border-dnd-gold/20 hover:border-indigo-400"
                            )}
                          >
                            {env}
                          </button>
                        ))}
                        {bestiaryEnvFilters.length > 0 && (
                          <button 
                            onClick={() => setBestiaryEnvFilters([])}
                            className="text-[10px] font-bold uppercase tracking-tighter text-dnd-red hover:underline ml-2"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ALL_BESTIARY_ENEMIES
                      .filter(m => {
                        const matchesSearch = m.name.toLowerCase().includes(bestiarySearch.toLowerCase());
                        const matchesType = bestiaryTypeFilters.length === 0 || bestiaryTypeFilters.includes(m.type);
                        const matchesEnv = bestiaryEnvFilters.length === 0 || (m.environment && bestiaryEnvFilters.some(env => m.environment.includes(env)));
                        const crVal = m.cr;
                        const matchesCr = crVal >= crToNumber(bestiaryCrMin) && crVal <= crToNumber(bestiaryCrMax);
                        return matchesSearch && matchesType && matchesEnv && matchesCr;
                      })
                      .sort((a, b) => {
                        if (bestiarySortBy === 'name') {
                          return bestiarySortOrder === 'asc' 
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                        } else {
                          const crA = a.cr;
                          const crB = b.cr;
                          return bestiarySortOrder === 'asc' ? crA - crB : crB - crA;
                        }
                      })
                      .map(monster => (
                        <button
                          key={monster.name}
                          onClick={() => setSelectedMonster(monster)}
                          className="flex items-center justify-between p-4 rounded-xl border-2 border-dnd-gold/10 bg-dnd-parchment/30 hover:border-dnd-red/40 hover:bg-dnd-red/5 transition-all group text-left"
                        >
                          <div>
                            <span className="font-display font-bold uppercase tracking-wider text-base text-dnd-ink group-hover:text-dnd-red transition-colors">{monster.name}</span>
                            <p className="text-[10px] mt-1 italic font-serif text-dnd-ink/40">
                              {monster.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono px-2 py-1 rounded bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/20">
                              CR {monster.cr}
                            </span>
                            <ChevronRight className="w-4 h-4 text-dnd-ink/20 group-hover:text-dnd-red group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                  </div>

                  {ALL_BESTIARY_ENEMIES.filter(m => {
                    const matchesSearch = m.name.toLowerCase().includes(bestiarySearch.toLowerCase());
                    const matchesType = bestiaryTypeFilters.length === 0 || bestiaryTypeFilters.includes(m.type);
                    const matchesEnv = bestiaryEnvFilters.length === 0 || (m.environment && bestiaryEnvFilters.some(env => m.environment.includes(env)));
                    const crVal = m.cr;
                    const matchesCr = crVal >= crToNumber(bestiaryCrMin) && crVal <= crToNumber(bestiaryCrMax);
                    return matchesSearch && matchesType && matchesEnv && matchesCr;
                  }).length === 0 && (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-dnd-gold/5 flex items-center justify-center mx-auto mb-4 text-dnd-gold/20">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-dnd-ink/40 font-serif italic">No creatures match your search criteria.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'npc' && (
              <motion.div 
                key="npc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Tab Switcher */}
                <div className="flex justify-center gap-4 mb-6">
                  <button 
                    onClick={() => setNpcTab('npc')}
                    className={cn(
                      "px-6 py-2 rounded-xl border-2 font-display text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2",
                      npcTab === 'npc' 
                        ? "bg-dnd-ink text-dnd-parchment border-dnd-gold shadow-md" 
                        : "bg-dnd-paper border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    <UserPlus className="w-4 h-4" />
                    NPC Generator
                  </button>
                  <button 
                    onClick={() => setNpcTab('faction')}
                    className={cn(
                      "px-6 py-2 rounded-xl border-2 font-display text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2",
                      npcTab === 'faction' 
                        ? "bg-dnd-ink text-dnd-parchment border-dnd-gold shadow-md" 
                        : "bg-dnd-paper border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    <Castle className="w-4 h-4" />
                    Faction Generator
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {npcTab === 'npc' ? (
                    <motion.div
                      key="npc-gen"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <NpcGenerator 
                        npcHistory={gameState.npcHistory}
                        onAddNpc={(npc) => {
                          handleAddNpc(npc);
                          if (npcGenerationTargetLocationId) {
                            setActiveTab('adventure');
                          }
                        }}
                        onRemoveNpc={handleRemoveNpcFromHistory}
                        onClearHistory={handleClearNpcHistory}
                        initialRole={npcGenerationInitialRole}
                        targetLocationName={gameState.currentSettlement?.districts
                          .flatMap(d => d.locations)
                          .find(l => l.id === npcGenerationTargetLocationId)?.name}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="faction-gen"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-gold" />
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-dnd-gold/10 text-dnd-gold">
                              <Castle className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-display font-black tracking-tighter text-dnd-ink uppercase leading-none">Faction Generator</h2>
                              <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-red mt-1">Organizations & Power Groups</p>
                            </div>
                          </div>
                          <button
                            onClick={handleGenerateFaction}
                            className="px-8 py-4 bg-dnd-red text-dnd-paper rounded-xl font-display font-black uppercase tracking-[0.2em] hover:bg-dnd-ink transition-all shadow-lg flex items-center gap-3"
                          >
                            <Sparkles className="w-5 h-5" />
                            Generate Faction
                          </button>
                        </div>

                        <AnimatePresence mode="wait">
                          {generatedFaction ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white border-2 border-dnd-gold/30 rounded-2xl overflow-hidden shadow-inner"
                            >
                              <div className="bg-dnd-ink p-6 text-dnd-gold flex justify-between items-center">
                                <div>
                                  <h3 className="text-2xl font-display font-black uppercase tracking-widest">{generatedFaction.name}</h3>
                                  <p className="text-[10px] font-sans font-black uppercase tracking-[0.3em] opacity-60">{generatedFaction.type}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-sans font-black uppercase tracking-widest opacity-60">Alignment</p>
                                  <p className="font-display font-bold">{generatedFaction.alignment}</p>
                                </div>
                              </div>
                              
                              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-2">Description</h4>
                                    <p className="text-dnd-ink font-serif leading-relaxed">{generatedFaction.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-2">Motto</h4>
                                    <p className="text-dnd-ink font-serif italic text-lg">"{generatedFaction.motto}"</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-1">Influence</h4>
                                      <p className="text-dnd-ink font-bold">{generatedFaction.influence}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-1">Headquarters</h4>
                                      <p className="text-dnd-ink font-bold">{generatedFaction.headquarters}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-6 bg-dnd-gold/5 p-6 rounded-xl border border-dnd-gold/10">
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-2">Leader</h4>
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-dnd-gold/20 rounded-lg text-dnd-gold">
                                        <User className="w-5 h-5" />
                                      </div>
                                      <p className="text-dnd-ink font-bold text-lg">{generatedFaction.leader}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-2">Primary Goal</h4>
                                    <p className="text-dnd-ink font-serif">{generatedFaction.goal}</p>
                                  </div>
                                  <div className="pt-4 border-t border-dnd-gold/20">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-3 h-3" />
                                      Secret
                                    </h4>
                                    <p className="text-dnd-ink font-serif italic text-sm opacity-80">{generatedFaction.secret}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="py-20 text-center border-2 border-dashed border-dnd-gold/20 rounded-2xl">
                              <Castle className="w-12 h-12 text-dnd-gold/20 mx-auto mb-4" />
                              <p className="text-dnd-ink/40 font-serif italic">Generate a faction to populate your world with powerful organizations.</p>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'downtime' && (
              <motion.div 
                key="downtime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Downtime 
                  gameState={gameState}
                  onStartActivity={handleStartDowntimeActivity}
                  onProgressCheck={handleDowntimeProgressCheck}
                  onWaitDay={handleDowntimeWait}
                  onResolve={handleResolveDowntime}
                  onCancel={handleCancelDowntime}
                  onResolveComplication={handleResolveComplication}
                  onToggleModifier={handleToggleDowntimeModifier}
                  onNavigateToSettlement={() => {
                    setActiveTab('adventure');
                    handleSetContext('Settlement');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div 
                key="items"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Tab Switcher */}
                <div className="flex justify-center gap-4 mb-6">
                  <button 
                    onClick={() => setItemTab('compendium')}
                    className={cn(
                      "px-6 py-2 rounded-xl border-2 font-display text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2",
                      itemTab === 'compendium' 
                        ? "bg-dnd-ink text-dnd-parchment border-dnd-gold shadow-md" 
                        : "bg-dnd-paper border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    <Package className="w-4 h-4" />
                    Item Compendium
                  </button>
                  <button 
                    onClick={() => setItemTab('generator')}
                    className={cn(
                      "px-6 py-2 rounded-xl border-2 font-display text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2",
                      itemTab === 'generator' 
                        ? "bg-dnd-ink text-dnd-parchment border-dnd-gold shadow-md" 
                        : "bg-dnd-paper border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    <Trophy className="w-4 h-4" />
                    Loot Generator
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {itemTab === 'generator' ? (
                    <motion.div
                      key="generator"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Loot Generator Section */}
                      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-gold" />
                        <div className="flex flex-col gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-dnd-gold/10 text-dnd-gold">
                              <Trophy className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-display font-black tracking-tighter text-dnd-ink uppercase leading-none">Loot Tool</h2>
                              <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-red mt-1">Generation System</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-dnd-gold/10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-dnd-ink/60 tracking-widest">Loot Source</label>
                              <select 
                                value={lootSource}
                                onChange={(e) => setLootSource(e.target.value as any)}
                                className="w-full bg-white border border-dnd-gold/20 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                              >
                                <option value="enemy_normal">Normal Enemy</option>
                                <option value="exploration">Exploration / Hidden Cache</option>
                                <option value="treasure_room">Treasure Room / Hoard</option>
                                <option value="boss">Boss Encounter</option>
                              </select>
                            </div>

                            {lootSource === 'boss' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-dnd-ink/60 tracking-widest">Boss Creature Type (Optional)</label>
                                <input 
                                  type="text"
                                  value={bossCreatureType}
                                  onChange={(e) => setBossCreatureType(e.target.value)}
                                  placeholder="e.g. Dragon, Undead, Fiend..."
                                  className="w-full bg-white border border-dnd-gold/20 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                                />
                              </div>
                            )}

                            <div className="md:col-span-2">
                              <button
                                onClick={() => handleGenerateLoot(lootSource, bossCreatureType)}
                                className="w-full py-3 bg-dnd-ink text-dnd-paper rounded-xl font-display font-bold uppercase tracking-widest hover:bg-dnd-red transition-colors flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Sparkles className="w-5 h-5" />
                                Generate Loot
                              </button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {gameState.lastLootResult ? (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="space-y-6"
                            >
                              {/* Currency & Summary */}
                              <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-dnd-ink text-dnd-paper rounded-xl">
                                <div className="flex gap-4">
                                  {gameState.lastLootResult.currency.pp && <div className="text-center"><p className="text-[8px] uppercase opacity-60">PP</p><p className="font-mono font-bold text-blue-300">{gameState.lastLootResult.currency.pp}</p></div>}
                                  {gameState.lastLootResult.currency.gp && <div className="text-center"><p className="text-[8px] uppercase opacity-60">GP</p><p className="font-mono font-bold text-dnd-gold">{gameState.lastLootResult.currency.gp}</p></div>}
                                  {gameState.lastLootResult.currency.ep && <div className="text-center"><p className="text-[8px] uppercase opacity-60">EP</p><p className="font-mono font-bold text-gray-300">{gameState.lastLootResult.currency.ep}</p></div>}
                                  {gameState.lastLootResult.currency.sp && <div className="text-center"><p className="text-[8px] uppercase opacity-60">SP</p><p className="font-mono font-bold text-slate-300">{gameState.lastLootResult.currency.sp}</p></div>}
                                  {gameState.lastLootResult.currency.cp && <div className="text-center"><p className="text-[8px] uppercase opacity-60">CP</p><p className="font-mono font-bold text-orange-400">{gameState.lastLootResult.currency.cp}</p></div>}
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] uppercase opacity-60">Total Value</p>
                                  <p className="text-xl font-display font-black text-dnd-gold">{gameState.lastLootResult.total_gp_value} GP</p>
                                </div>
                              </div>

                              {/* Magic Items */}
                              {gameState.lastLootResult.magic_items.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="text-[10px] font-black uppercase text-dnd-gold tracking-widest">Magic Items</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {gameState.lastLootResult.magic_items.map((item, idx) => (
                                      <div key={idx} className="bg-white border border-dnd-gold/20 rounded-xl p-4 hover:border-dnd-gold transition-all shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className={cn(
                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-white",
                                            item.rarity === 'legendary' ? 'bg-orange-500' :
                                            item.rarity === 'very_rare' ? 'bg-purple-600' :
                                            item.rarity === 'rare' ? 'bg-blue-600' :
                                            item.rarity === 'uncommon' ? 'bg-green-600' : 'bg-gray-500'
                                          )}>
                                            {item.rarity.replace('_', ' ')}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold text-dnd-gold">{item.value_gp} GP</span>
                                        </div>
                                        <h4 className="font-display font-bold text-dnd-ink mb-1">{item.name}</h4>
                                        <p className="text-[10px] text-dnd-ink/60 font-serif italic line-clamp-2">{item.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Valuables */}
                              {gameState.lastLootResult.valuables.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="text-[10px] font-black uppercase text-dnd-gold tracking-widest">Valuables</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {gameState.lastLootResult.valuables.map((v, idx) => (
                                      <div key={idx} className="bg-white border border-dnd-gold/10 rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
                                        <Gem className="w-3 h-3 text-blue-400" />
                                        <div>
                                          <p className="text-[10px] font-bold text-dnd-ink">{v.name}</p>
                                          <p className="text-[8px] text-dnd-gold font-mono">{v.value_gp} GP</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={handleClaimLootResult}
                                className="w-full py-4 bg-dnd-red text-white rounded-xl font-display font-bold uppercase tracking-widest hover:bg-dnd-ink transition-all shadow-xl flex items-center justify-center gap-2"
                              >
                                <Package className="w-5 h-5" />
                                Claim All Loot
                              </button>
                            </motion.div>
                          ) : (
                            <div className="py-12 text-center border-2 border-dashed border-dnd-gold/20 rounded-2xl bg-white/30">
                              <Trophy className="w-12 h-12 text-dnd-gold/20 mx-auto mb-4" />
                              <p className="text-dnd-ink/40 font-serif italic">Select a source and generate loot to begin.</p>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Item Identifier Section */}
                      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden mt-8">
                        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-red" />
                        <div className="flex flex-col gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-dnd-red/10 text-dnd-red">
                              <Search className="w-8 h-8" />
                            </div>
                            <div>
                              <h2 className="text-3xl font-display font-black tracking-tighter text-dnd-ink uppercase leading-none">Item Identifier</h2>
                              <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-gold mt-1">Reveal Mysterious Items</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-dnd-gold/10">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-dnd-ink/60 tracking-widest">Category</label>
                              <select 
                                value={idCategory}
                                onChange={(e) => setIdCategory(e.target.value)}
                                className="w-full bg-white border border-dnd-gold/20 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                              >
                                <option value="Wondrous Item">Wondrous Item</option>
                                <option value="Weapon">Weapon</option>
                                <option value="Armor">Armor</option>
                                <option value="Potion">Potion</option>
                                <option value="Ring">Ring</option>
                                <option value="Rod">Rod</option>
                                <option value="Staff">Staff</option>
                                <option value="Wand">Wand</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-dnd-ink/60 tracking-widest">Rarity</label>
                              <select 
                                value={idRarity}
                                onChange={(e) => setIdRarity(e.target.value)}
                                className="w-full bg-white border border-dnd-gold/20 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50"
                              >
                                <option value="common">Common</option>
                                <option value="uncommon">Uncommon</option>
                                <option value="rare">Rare</option>
                                <option value="very_rare">Very Rare</option>
                                <option value="legendary">Legendary</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <button
                                onClick={() => {
                                  const item = getRandomItemByCriteria(idCategory, idRarity);
                                  setIdentifiedItem(item);
                                }}
                                className="w-full py-3 bg-dnd-red text-dnd-paper rounded-xl font-display font-bold uppercase tracking-widest hover:bg-dnd-ink transition-colors flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Hammer className="w-5 h-5" />
                                Identify Item
                              </button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {identifiedItem ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white border-2 border-dnd-gold rounded-xl p-6 shadow-inner"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-3 py-1 rounded-full text-white",
                                  identifiedItem.rarity === 'Legendary' ? 'bg-orange-500' :
                                  identifiedItem.rarity === 'Very Rare' ? 'bg-purple-600' :
                                  identifiedItem.rarity === 'Rare' ? 'bg-blue-600' :
                                  identifiedItem.rarity === 'Uncommon' ? 'bg-green-600' : 'bg-gray-500'
                                )}>
                                  {identifiedItem.rarity}
                                </span>
                                <span className="text-sm font-mono font-bold text-dnd-gold">{identifiedItem.value} GP</span>
                              </div>
                              <h3 className="text-2xl font-display font-black text-dnd-ink mb-2">{identifiedItem.name}</h3>
                              <p className="text-sm text-dnd-ink/70 font-serif italic mb-6 leading-relaxed">{identifiedItem.description}</p>
                              
                              <button
                                onClick={() => {
                                  handleAddItem(identifiedItem);
                                  setIdentifiedItem(null);
                                }}
                                className="w-full py-3 border-2 border-dnd-red text-dnd-red rounded-xl font-display font-bold uppercase tracking-widest hover:bg-dnd-red hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add to Inventory
                              </button>
                            </motion.div>
                          ) : (
                            <div className="py-8 text-center border-2 border-dashed border-dnd-gold/20 rounded-2xl">
                              <p className="text-dnd-ink/40 font-serif italic">Identify a mysterious item to see its true form.</p>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="compendium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-gold" />
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-dnd-gold/10 text-dnd-gold">
                            <Package className="w-8 h-8" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-display font-black tracking-tighter text-dnd-ink uppercase leading-none">Item Compendium</h2>
                            <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-red mt-1">Equipment, Weapons & Magic Items</p>
                          </div>
                        </div>
                        <ItemsList 
                          onUncoverHistory={handleUncoverItemHistory} 
                          discoveredQuests={gameState.discoveredCompendiumQuests} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl min-h-[600px] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-dnd-gold/20" />
                  <div className="flex items-center gap-3 mb-6">
                    <Book className="w-6 h-6 text-dnd-red" />
                    <h2 className="text-xl uppercase tracking-widest font-display font-bold text-dnd-red">Adventurer's Notes</h2>
                  </div>
                  <p className="text-sm text-dnd-ink/60 font-serif italic mb-6 border-b border-dnd-gold/20 pb-4">
                    Note down your achievements, discovered treasures, dark plots, and the names of those you cross paths with.
                  </p>
                  <textarea 
                    value={gameState.character.notes}
                    onChange={(e) => handleUpdateNotes(e.target.value)}
                    placeholder="Write your notes here..."
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 font-serif text-lg leading-relaxed text-dnd-ink placeholder:text-dnd-ink/20 resize-none custom-scrollbar"
                  />
                  <div className="mt-4 flex justify-end">
                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-dnd-ink/30">
                      Notes are saved automatically
                    </span>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'lore' && (
              <motion.div
                key="lore"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <LoreEngine onAddNote={(title, content) => {
                  handleUpdateNotes(`${gameState.character.notes}\n\n### ${title}\n${content}`);
                  addLog('narrative', `Recorded in Chronicles: ${title}`);
                }} />
              </motion.div>
            )}

            {activeTab === 'spells' && (
              <motion.div
                key="spells"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SpellBrowser 
                  onAddSpell={handleAddSpell}
                  onRemoveSpell={handleRemoveSpell}
                  knownSpells={gameState.character.knownSpells}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/20">
          LoneForge Solo RPG Engine v1.0 • Inspired by 5.5 mechanics
        </p>
      </footer>

      {/* Inspect Modal */}
      <AnimatePresence>
        {inspectedEntity && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg max-h-[85vh] bg-dnd-parchment rounded-2xl shadow-2xl border-4 border-dnd-gold overflow-hidden relative flex flex-col"
            >
              <button
                onClick={() => setInspectedEntity(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-dnd-red text-white hover:bg-red-800 transition-colors shadow-md z-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">

                {inspectedEntity.type === 'item' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-white shadow-inner text-dnd-gold border border-dnd-gold/20">
                        {(() => {
                          const cat = inspectedEntity.data.category || inspectedEntity.data.type;
                          switch (cat?.toLowerCase()) {
                            case 'weapon': return <Sword className="w-6 h-6" />;
                            case 'armor': return <Shield className="w-6 h-6" />;
                            case 'potion': return <FlaskConical className="w-6 h-6" />;
                            case 'scroll': return <Scroll className="w-6 h-6" />;
                            case 'tool': return <Hammer className="w-6 h-6" />;
                            default: return <Package className="w-6 h-6" />;
                          }
                        })()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black uppercase text-dnd-ink leading-tight">{inspectedEntity.data.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-xs uppercase font-bold",
                            inspectedEntity.data.rarity?.toLowerCase() === 'common' ? 'text-dnd-ink/60' :
                            inspectedEntity.data.rarity?.toLowerCase() === 'uncommon' ? 'text-green-600' :
                            inspectedEntity.data.rarity?.toLowerCase() === 'rare' ? 'text-blue-600' :
                            inspectedEntity.data.rarity?.toLowerCase() === 'very rare' ? 'text-purple-600' :
                            inspectedEntity.data.rarity?.toLowerCase() === 'legendary' ? 'text-orange-600' :
                            'text-red-600'
                          )}>
                            {inspectedEntity.data.rarity}
                          </span>
                          <span className="text-dnd-ink/20">•</span>
                          <span className="text-xs uppercase font-bold text-dnd-ink/40">
                            {inspectedEntity.data.category || inspectedEntity.data.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/50 border border-dnd-gold/10">
                      <p className="text-sm font-serif italic text-dnd-ink/80 leading-relaxed">
                        {inspectedEntity.data.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Cost / Value</p>
                        <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.cost || inspectedEntity.data.value + ' GP'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Weight</p>
                        <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.weight || '-'}</p>
                      </div>
                      {inspectedEntity.data.damage && (
                        <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                          <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Damage</p>
                          <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.damage}</p>
                        </div>
                      )}
                    </div>

                    {inspectedEntity.data.properties && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Properties</p>
                        <p className="text-xs text-dnd-ink/70">{inspectedEntity.data.properties}</p>
                      </div>
                    )}

                    {inspectedEntity.data.mastery && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Mastery</p>
                        <p className="text-xs text-dnd-ink/70">{inspectedEntity.data.mastery}</p>
                      </div>
                    )}

                    {inspectedEntity.data.itemQuest && (
                      <div className="mt-6 p-4 rounded-xl bg-dnd-gold/5 border border-dnd-gold/20 space-y-4">
                        <div className="flex items-center gap-2 border-b border-dnd-gold/10 pb-2">
                          <Sparkles className="w-4 h-4 text-dnd-gold" />
                          <h3 className="font-display font-black uppercase text-xs tracking-widest text-dnd-gold">Item History & Quest</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">The Hook</p>
                            <p className="text-sm font-serif italic text-dnd-ink/90">{inspectedEntity.data.itemQuest.hook}</p>
                          </div>
                          
                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Origin</p>
                            <p className="text-xs text-dnd-ink/70">{inspectedEntity.data.itemQuest.origin}</p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Quest Type</p>
                            <p className="text-xs font-bold text-dnd-ink">{inspectedEntity.data.itemQuest.quest_type}</p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">The Path</p>
                            <ul className="space-y-1">
                              {inspectedEntity.data.itemQuest.steps.map((step: string, i: number) => (
                                <li key={i} className="text-xs text-dnd-ink/70 flex gap-2">
                                  <span className="text-dnd-gold font-bold">{i + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-dnd-gold/10 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Reward Hint</p>
                              <p className="text-xs italic text-dnd-ink/60">{inspectedEntity.data.itemQuest.reward_hint}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Oracle Seed</p>
                              <p className="text-xs italic text-dnd-ink/60">{inspectedEntity.data.itemQuest.oracle_seed}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inspectedEntity.type === 'npc' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-white shadow-inner text-dnd-red border border-dnd-gold/20">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black uppercase text-dnd-ink leading-tight">{inspectedEntity.data.name}</h2>
                        <p className="text-xs uppercase font-bold text-dnd-ink/40">
                          {inspectedEntity.data.race} • {inspectedEntity.data.role}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/50 border border-dnd-gold/10">
                        <p className="text-sm font-serif italic text-dnd-ink/80 leading-relaxed">
                          "{inspectedEntity.data.greeting}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                          <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Alignment</p>
                          <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.alignment}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                          <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Disposition</p>
                          <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.disposition}</p>
                        </div>
                      </div>

                      {inspectedEntity.data.traits && inspectedEntity.data.traits.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Traits</p>
                          <div className="flex flex-wrap gap-2">
                            {inspectedEntity.data.traits.map((trait: string) => (
                              <span key={trait} className="px-2 py-1 rounded bg-dnd-red/10 text-dnd-red text-[10px] font-bold uppercase">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Goal</p>
                        <p className="text-xs text-dnd-ink/70">{inspectedEntity.data.goal}</p>
                      </div>
                    </div>
                  </div>
                )}

                {inspectedEntity.type === 'enemy' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-white shadow-inner text-purple-600 border border-dnd-gold/20">
                        <Skull className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black uppercase text-dnd-ink leading-tight">{inspectedEntity.data.name}</h2>
                        <p className="text-xs uppercase font-bold text-dnd-ink/40">
                          {inspectedEntity.data.type}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mt-1">
                          CR {inspectedEntity.data.cr} • {inspectedEntity.data.xpValue} XP
                        </p>
                        {inspectedEntity.data.senses && (
                          <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mt-1">
                            Senses: {inspectedEntity.data.senses}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {Object.entries(inspectedEntity.data.stats || {}).map(([attr, val]: [any, any]) => (
                        <div key={attr} className="p-1 rounded bg-dnd-ink/5 border border-dnd-gold/5 text-center">
                          <p className="text-[8px] uppercase font-bold text-dnd-ink/40">{attr.slice(0, 3)}</p>
                          <p className="text-xs font-bold text-dnd-ink">{val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5 text-center">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">HP</p>
                        <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.hp}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5 text-center">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">AC</p>
                        <p className="text-sm font-bold text-dnd-ink">{inspectedEntity.data.ac}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5 text-center">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Attack</p>
                        <p className="text-sm font-bold text-dnd-ink">+{inspectedEntity.data.attackBonus}</p>
                      </div>
                    </div>

                    {inspectedEntity.data.description && (
                      <p className="text-xs text-dnd-ink/70 italic border-l-2 border-dnd-gold/20 pl-3 py-1">
                        {inspectedEntity.data.description}
                      </p>
                    )}

                    {(inspectedEntity.data.skills || inspectedEntity.data.senses || inspectedEntity.data.languages) && (
                      <div className="space-y-1 p-3 rounded-lg bg-dnd-ink/5 border border-dnd-gold/10">
                        {inspectedEntity.data.skills && (
                          <p className="text-[10px] text-dnd-ink/60">
                            <span className="font-bold uppercase">Skills:</span> {
                              typeof inspectedEntity.data.skills === 'object' 
                                ? Object.entries(inspectedEntity.data.skills).map(([k, v]) => `${k} +${v}`).join(', ')
                                : inspectedEntity.data.skills
                            }
                          </p>
                        )}
                        {inspectedEntity.data.senses && (
                          <p className="text-[10px] text-dnd-ink/60">
                            <span className="font-bold uppercase">Senses:</span> {
                              typeof inspectedEntity.data.senses === 'object'
                                ? Object.entries(inspectedEntity.data.senses).map(([k, v]) => `${k} ${v}`).join(', ')
                                : inspectedEntity.data.senses
                            }
                          </p>
                        )}
                        {inspectedEntity.data.languages && (
                          <p className="text-[10px] text-dnd-ink/60">
                            <span className="font-bold uppercase">Languages:</span> {
                              Array.isArray(inspectedEntity.data.languages)
                                ? inspectedEntity.data.languages.join(', ')
                                : inspectedEntity.data.languages
                            }
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Abilities & Actions</p>
                      <div className="space-y-4">
                        {(() => {
                          const abilities = Array.isArray(inspectedEntity.data.abilities) 
                            ? inspectedEntity.data.abilities 
                            : [...(inspectedEntity.data.traits || []), ...(inspectedEntity.data.actions || [])];
                          
                          const traits = abilities.filter((a: any) => a.type === 'passive');
                          const actions = abilities.filter((a: any) => a.type === 'action');
                          const bonusActions = abilities.filter((a: any) => a.type === 'bonus_action');
                          const reactions = abilities.filter((a: any) => a.type === 'reaction');

                          return (
                            <>
                              {traits.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-black text-dnd-gold tracking-tighter">Traits</p>
                                  {traits.map((a: any, idx: number) => (
                                    <div key={a.id || `trait-${idx}`} className="p-2 rounded bg-white/50 border border-dnd-gold/10">
                                      <p className="text-xs font-bold text-dnd-ink">{a.name}</p>
                                      <p className="text-[10px] text-dnd-ink/60 italic">{a.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {actions.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-black text-dnd-red tracking-tighter">Actions</p>
                                  {actions.map((a: any, idx: number) => (
                                    <div key={a.id || `action-${idx}`} className="p-2 rounded bg-white/50 border border-dnd-red/10">
                                      <p className="text-xs font-bold text-dnd-ink">{a.name}</p>
                                      <p className="text-[10px] text-dnd-ink/60 italic">{a.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {bonusActions.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-black text-indigo-600 tracking-tighter">Bonus Actions</p>
                                  {bonusActions.map((a: any, idx: number) => (
                                    <div key={a.id || `ba-${idx}`} className="p-2 rounded bg-white/50 border border-indigo-600/10">
                                      <p className="text-xs font-bold text-dnd-ink">{a.name}</p>
                                      <p className="text-[10px] text-dnd-ink/60 italic">{a.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {reactions.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[8px] uppercase font-black text-amber-600 tracking-tighter">Reactions</p>
                                  {reactions.map((a: any, idx: number) => (
                                    <div key={a.id || `reaction-${idx}`} className="p-2 rounded bg-white/50 border border-amber-600/10">
                                      <p className="text-xs font-bold text-dnd-ink">{a.name}</p>
                                      <p className="text-[10px] text-dnd-ink/60 italic">{a.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {inspectedEntity.type === 'spell' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-white shadow-inner text-dnd-red border border-dnd-gold/20">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black uppercase text-dnd-ink leading-tight">{inspectedEntity.data.name}</h2>
                        <p className="text-xs uppercase font-bold text-dnd-ink/40">
                          {inspectedEntity.data.level === 'Cantrip' ? 'Cantrip' : `Level ${inspectedEntity.data.level}`} • {inspectedEntity.data.school}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Casting Time</p>
                        <p className="text-xs font-bold text-dnd-ink">{inspectedEntity.data.castingTime}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Range</p>
                        <p className="text-xs font-bold text-dnd-ink">{inspectedEntity.data.range}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Components</p>
                        <p className="text-xs font-bold text-dnd-ink">{inspectedEntity.data.components}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Duration</p>
                        <p className="text-xs font-bold text-dnd-ink">{inspectedEntity.data.duration}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/50 border border-dnd-gold/10">
                      <div className="text-xs leading-relaxed text-dnd-ink/80 whitespace-pre-wrap font-serif italic">
                        {inspectedEntity.data.text}
                      </div>
                    </div>

                    {inspectedEntity.data.atHigherLevels && (
                      <div className="p-3 rounded-lg bg-dnd-gold/5 border border-dnd-gold/10">
                        <p className="text-[10px] uppercase font-bold text-dnd-gold mb-1">At Higher Levels</p>
                        <p className="text-[11px] text-dnd-ink/70 italic">{inspectedEntity.data.atHigherLevels}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-dnd-gold/10">
                      <p className="text-[9px] font-bold text-dnd-ink/30 uppercase tracking-widest">
                        {inspectedEntity.data.source} — Page {inspectedEntity.data.page}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-dnd-ink/5 border-t border-dnd-gold/20 flex justify-between items-center">
                {inspectedEntity.type === 'item' && inspectedEntity.data.rarity && inspectedEntity.data.rarity.toLowerCase() !== 'common' && inspectedEntity.data.rarity.toLowerCase() !== 'none' && !inspectedEntity.data.itemQuest && (
                  <button
                    onClick={() => handleUncoverItemHistory(inspectedEntity.data.id || inspectedEntity.data.name)}
                    className="px-4 py-2 bg-dnd-gold text-white rounded-xl font-display uppercase tracking-widest text-[10px] font-black hover:bg-dnd-ink hover:text-dnd-gold transition-all shadow-md border border-dnd-gold/30 flex items-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Uncover History
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => setInspectedEntity(null)}
                  className="px-6 py-2 bg-dnd-ink text-dnd-gold rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-dnd-red hover:text-white transition-all shadow-md border-2 border-dnd-gold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monster Details Modal */}
      <AnimatePresence>
        {selectedMonster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMonster(null)}
              className="absolute inset-0 bg-dnd-ink/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-dnd-paper border-4 border-dnd-gold rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-dnd-red" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedMonster(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dnd-red text-dnd-parchment hover:bg-red-800 transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-dnd-gold/20 pb-6">
                    <div>
                      <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-dnd-red leading-none mb-2">{selectedMonster.name}</h2>
                      <p className="text-sm text-dnd-ink/60 font-serif italic">{selectedMonster.type}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center px-4 py-2 bg-dnd-gold/5 rounded-xl border border-dnd-gold/20">
                        <p className="text-[8px] uppercase font-black text-dnd-gold tracking-widest mb-1">Armor Class</p>
                        <p className="text-xl font-display font-bold text-dnd-ink">{selectedMonster.ac}</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-dnd-red/5 rounded-xl border border-dnd-red/20">
                        <p className="text-[8px] uppercase font-black text-dnd-red tracking-widest mb-1">Hit Points</p>
                        <p className="text-xl font-display font-bold text-dnd-ink">{selectedMonster.hp}</p>
                      </div>
                      <div className="text-center px-4 py-2 bg-dnd-ink/5 rounded-xl border border-dnd-ink/20">
                        <p className="text-[8px] uppercase font-black text-dnd-ink/40 tracking-widest mb-1">CR</p>
                        <p className="text-xl font-display font-bold text-dnd-ink">{selectedMonster.cr}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(selectedMonster.stats).map(([stat, value]) => (
                      <div key={stat} className="bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl p-3 text-center">
                        <p className="text-[8px] uppercase font-black text-dnd-gold tracking-tighter mb-1">{stat.substring(0, 3)}</p>
                        <p className="text-lg font-display font-bold text-dnd-ink">{value as number}</p>
                        <p className="text-[10px] font-mono text-dnd-ink/40">({getModifier(value as number) >= 0 ? '+' : ''}{getModifier(value as number)})</p>
                      </div>
                    ))}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-dnd-red tracking-widest border-b border-dnd-red/10 pb-1">Senses & Languages</h4>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold uppercase text-dnd-ink/40">Senses:</span>
                          <span className="text-[10px] font-serif text-dnd-ink">{selectedMonster.senses || 'None'}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold uppercase text-dnd-ink/40">Languages:</span>
                          <span className="text-[10px] font-serif text-dnd-ink">{selectedMonster.languages || 'None'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-dnd-red tracking-widest border-b border-dnd-red/10 pb-1">Skills & Saves</h4>
                      <div className="space-y-1">
                        <p className="text-[10px] font-serif text-dnd-ink leading-relaxed">
                          <span className="font-bold uppercase text-dnd-ink/40 mr-1">Skills:</span> {selectedMonster.skills || "None"}
                        </p>
                        <p className="text-[10px] font-serif text-dnd-ink leading-relaxed">
                          <span className="font-bold uppercase text-dnd-ink/40 mr-1">Saves:</span> {selectedMonster.savingThrows || "None"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Abilities (Traits & Actions) */}
                  <div className="space-y-6">
                    {selectedMonster.abilities.filter((a: any) => a.type === 'passive').length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-dnd-red tracking-widest border-b border-dnd-red/10 pb-1">Traits</h4>
                        <div className="space-y-4">
                          {selectedMonster.abilities.filter((a: any) => a.type === 'passive').map((trait: any) => (
                            <div key={trait.id} className="bg-dnd-gold/5 border-l-2 border-dnd-gold p-3 rounded-r-lg">
                              <span className="font-display font-bold uppercase text-xs text-dnd-ink mr-2">{trait.name}.</span>
                              <span className="text-xs font-serif text-dnd-ink/80 leading-relaxed">{trait.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMonster.abilities.filter((a: any) => a.type === 'action').length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-dnd-red tracking-widest border-b border-dnd-red/10 pb-1">Actions</h4>
                        <div className="space-y-4">
                          {selectedMonster.abilities.filter((a: any) => a.type === 'action').map((action: any) => (
                            <div key={action.id} className="bg-dnd-red/5 border-l-2 border-dnd-red p-3 rounded-r-lg">
                              <span className="font-display font-bold uppercase text-xs text-dnd-red mr-2">{action.name}.</span>
                              <span className="text-xs font-serif text-dnd-ink/80 leading-relaxed">{action.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMonster.abilities.filter((a: any) => a.type === 'bonus_action').length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-indigo-600 tracking-widest border-b border-indigo-600/10 pb-1">Bonus Actions</h4>
                        <div className="space-y-4">
                          {selectedMonster.abilities.filter((a: any) => a.type === 'bonus_action').map((ba: any) => (
                            <div key={ba.id} className="bg-indigo-600/5 border-l-2 border-indigo-600 p-3 rounded-r-lg">
                              <span className="font-display font-bold uppercase text-xs text-indigo-600 mr-2">{ba.name}.</span>
                              <span className="text-xs font-serif text-dnd-ink/80 leading-relaxed">{ba.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMonster.abilities.filter((a: any) => a.type === 'reaction').length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-black text-amber-600 tracking-widest border-b border-amber-600/10 pb-1">Reactions</h4>
                        <div className="space-y-4">
                          {selectedMonster.abilities.filter((a: any) => a.type === 'reaction').map((reaction: any) => (
                            <div key={reaction.id} className="bg-amber-600/5 border-l-2 border-amber-600 p-3 rounded-r-lg">
                              <span className="font-display font-bold uppercase text-xs text-amber-600 mr-2">{reaction.name}.</span>
                              <span className="text-xs font-serif text-dnd-ink/80 leading-relaxed">{reaction.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="pt-6 border-t border-dnd-gold/20">
                    <p className="text-sm font-serif text-dnd-ink/60 leading-relaxed italic">
                      {selectedMonster.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )}
      {/* Quest Modal */}
      <AnimatePresence>
        {isQuestModalOpen && gameState.adventureHook && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dnd-parchment w-full max-w-2xl rounded-2xl border-4 border-dnd-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-dnd-ink text-dnd-gold p-6 flex justify-between items-center border-b-4 border-dnd-gold">
                <div className="flex items-center gap-3">
                  <Scroll className="w-6 h-6" />
                  <h2 className="text-2xl font-display uppercase tracking-widest font-black">Active Quest</h2>
                </div>
                <button 
                  onClick={() => setIsQuestModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-dnd-gold/10 flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all border-2 border-dnd-gold/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto parchment-texture">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-dnd-gold/30" />
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-dnd-gold">The Situation</span>
                    <div className="h-px flex-1 bg-dnd-gold/30" />
                  </div>
                  <p className="text-2xl font-serif italic text-center leading-relaxed text-dnd-ink">
                    "{gameState.adventureHook.hook}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/40 border-2 border-dnd-gold/20 rounded-xl p-6 space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-dnd-gold">The Problem</p>
                    <p className="text-lg font-display font-black uppercase text-dnd-ink">{gameState.adventureHook.problem}</p>
                  </div>
                  <div className="bg-dnd-red/5 border-2 border-dnd-red/20 rounded-xl p-6 space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-dnd-red">The Objective</p>
                    <p className="text-lg font-display font-black uppercase text-dnd-red">{gameState.adventureHook.result}</p>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <button 
                    onClick={() => setIsQuestModalOpen(false)}
                    className="bg-dnd-ink text-dnd-gold px-12 py-4 rounded-xl font-display uppercase tracking-[0.3em] font-black hover:bg-dnd-red hover:text-white transition-all shadow-lg border-2 border-dnd-gold"
                  >
                    Accept Quest
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spell Cast Modal */}
      <AnimatePresence>
        {isSpellCastModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dnd-ink/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dnd-parchment w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-dnd-gold"
            >
              <div className="p-6 border-b border-dnd-gold/20 flex justify-between items-center bg-dnd-paper">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-dnd-gold" />
                  <h2 className="text-2xl font-display font-black uppercase text-dnd-ink tracking-tight">Cast a Spell</h2>
                </div>
                <button onClick={() => setIsSpellCastModalOpen(false)} className="text-dnd-ink/40 hover:text-dnd-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {/* Spell Slots Summary */}
                <div className="flex flex-wrap gap-2">
                  {gameState.character.spellSlots?.map(slot => (
                    <div key={slot.level} className="px-3 py-1 bg-dnd-gold/10 rounded-full border border-dnd-gold/20 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-dnd-ink/40">Lvl {slot.level}</span>
                      <span className="text-xs font-mono font-bold text-dnd-ink">{slot.current}/{slot.total}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {['Cantrip', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(level => {
                    const getLevelNum = (lvl: string) => lvl === 'Cantrip' ? 0 : parseInt(lvl);
                    const targetLevelNum = getLevelNum(level);
                    const levelSpells = (gameState.character.knownSpells || []).filter(s => getLevelNum(s.level) === targetLevelNum);
                    if (levelSpells.length === 0) return null;
                    return (
                      <div key={level} className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-dnd-gold tracking-widest border-l-2 border-dnd-gold pl-2">
                          {level === 'Cantrip' ? 'Cantrips' : `Level ${level} Spells`}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {levelSpells.map((spell, idx) => {
                            const slotLevel = level === 'Cantrip' ? 0 : parseInt(level);
                            const hasSlot = level === 'Cantrip' || (gameState.character.spellSlots?.find(s => s.level === slotLevel)?.current || 0) > 0;
                            
                            return (
                              <button
                                key={`${spell.name}-${idx}`}
                                disabled={!hasSlot}
                                onClick={() => {
                                  if (level !== 'Cantrip') handleUseSpellSlot(slotLevel);
                                  handleCastSpell(spell);
                                  setIsSpellCastModalOpen(false);
                                }}
                                className="flex items-center justify-between p-3 bg-white border border-dnd-gold/20 rounded-xl hover:border-dnd-red hover:bg-dnd-red/5 transition-all text-left disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-dnd-gold/20"
                              >
                                <div>
                                  <p className="text-sm font-bold text-dnd-ink">{spell.name}</p>
                                  <p className="text-[10px] text-dnd-ink/60 italic">{spell.school} • {spell.castingTime}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase text-dnd-gold">{spell.range}</span>
                                  <ChevronRight className="w-4 h-4 text-dnd-gold" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {(!gameState.character.knownSpells || gameState.character.knownSpells.length === 0) && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-dnd-gold/20 mx-auto mb-4" />
                      <p className="text-sm font-serif italic text-dnd-ink/40">Your spellbook is empty.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* XP Modal */}
      <AnimatePresence>
        {isXpModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dnd-parchment w-full max-w-md rounded-2xl border-4 border-dnd-gold shadow-2xl overflow-hidden relative"
            >
              <div className="bg-dnd-ink text-dnd-gold p-4 flex justify-between items-center border-b-4 border-dnd-gold">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  <h2 className="text-xl font-display uppercase tracking-widest font-black">Edit Experience</h2>
                </div>
                <button onClick={() => setIsXpModalOpen(false)} className="text-dnd-gold hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-dnd-gold">Current XP</label>
                  <input 
                    type="number" 
                    value={xpToEdit}
                    onChange={(e) => setXpToEdit(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-lg px-4 py-2 font-mono text-lg focus:outline-none focus:border-dnd-red transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map(val => (
                    <button 
                      key={val}
                      onClick={() => setXpToEdit(prev => prev + val)}
                      className="flex-1 py-1 bg-dnd-gold/10 border border-dnd-gold/20 rounded text-[10px] font-bold uppercase hover:bg-dnd-gold/20"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => handleUpdateXp(xpToEdit)}
                  className="w-full bg-dnd-red text-white py-3 rounded-xl font-display uppercase tracking-widest font-black shadow-lg"
                >
                  Save XP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HP Modal */}
      <AnimatePresence>
        {isHpModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dnd-parchment w-full max-w-md rounded-2xl border-4 border-dnd-gold shadow-2xl overflow-hidden relative"
            >
              <div className="bg-dnd-ink text-dnd-gold p-4 flex justify-between items-center border-b-4 border-dnd-gold">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <h2 className="text-xl font-display uppercase tracking-widest font-black">Edit Health</h2>
                </div>
                <button onClick={() => setIsHpModalOpen(false)} className="text-dnd-gold hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase font-black tracking-widest text-dnd-gold">Current HP (Max {gameState.character.maxHp})</label>
                    <span className="text-xs font-mono font-bold">{hpToEdit}/{gameState.character.maxHp}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0"
                    max={gameState.character.maxHp}
                    value={hpToEdit}
                    onChange={(e) => setHpToEdit(parseInt(e.target.value))}
                    className="w-full accent-dnd-red h-2 bg-dnd-gold/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHpToEdit(prev => Math.max(0, prev - 1))}
                      className="flex-1 py-1 bg-dnd-gold/10 border border-dnd-gold/20 rounded text-[10px] font-bold uppercase hover:bg-dnd-gold/20"
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => setHpToEdit(prev => Math.min(gameState.character.maxHp, prev + 1))}
                      className="flex-1 py-1 bg-dnd-gold/10 border border-dnd-gold/20 rounded text-[10px] font-bold uppercase hover:bg-dnd-gold/20"
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => setHpToEdit(gameState.character.maxHp)}
                      className="flex-1 py-1 bg-emerald-600/10 border border-emerald-600/20 rounded text-[10px] font-bold uppercase text-emerald-700 hover:bg-emerald-600/20"
                    >
                      Full
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-blue-600">Temporary HP</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={tempHpToEdit}
                      onChange={(e) => setTempHpToEdit(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-white/50 border-2 border-blue-600/20 rounded-lg px-4 py-2 font-mono text-lg focus:outline-none focus:border-blue-600 transition-all"
                    />
                    <button 
                      onClick={() => setTempHpToEdit(0)}
                      className="px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-lg text-[10px] font-bold uppercase text-blue-600 hover:bg-blue-600/20"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => handleUpdateHp(hpToEdit, tempHpToEdit)}
                  className="w-full bg-dnd-red text-white py-3 rounded-xl font-display uppercase tracking-widest font-black shadow-lg"
                >
                  Save Health
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 whitespace-nowrap border-2",
        active 
          ? "bg-dnd-red border-dnd-gold text-dnd-parchment shadow-md translate-x-1" 
          : "text-dnd-ink/60 border-transparent hover:text-dnd-red hover:bg-dnd-red/5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      <span className="font-display text-xs uppercase tracking-widest font-bold">{label}</span>
    </button>
  );
}

function ContextSwitcher({ currentContext, onContextChange }: { currentContext: GameContext, onContextChange: (ctx: GameContext) => void }) {
  const contexts: { id: GameContext, icon: React.ReactNode, label: string, color: string }[] = [
    { id: 'Narrative', icon: <Book />, label: 'Narrative', color: 'gold' },
    { id: 'Settlement', icon: <Castle />, label: 'Settlement', color: 'red' },
    { id: 'Wilderness', icon: <Mountain />, label: 'Wilderness', color: 'emerald' },
    { id: 'Dungeon', icon: <Skull />, label: 'Dungeon', color: 'indigo' },
    { id: 'Combat', icon: <Sword />, label: 'Combat', color: 'red' },
  ];

  return (
    <section className="bg-dnd-paper border-2 border-dnd-gold/30 rounded-2xl p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 mb-4 text-center">Current Context</p>
      <div className="flex flex-wrap justify-center gap-3">
        {contexts.map(ctx => (
          <button
            key={ctx.id}
            onClick={() => onContextChange(ctx.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
              currentContext === ctx.id 
                ? "bg-dnd-ink text-dnd-parchment border-dnd-gold scale-105 shadow-md" 
                : "bg-dnd-parchment/50 border-dnd-gold/10 text-dnd-ink/60 hover:border-dnd-gold/40"
            )}
          >
            {React.cloneElement(ctx.icon as React.ReactElement, { className: "w-4 h-4" })}
            <span className="text-[10px] font-black uppercase tracking-widest">{ctx.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}






