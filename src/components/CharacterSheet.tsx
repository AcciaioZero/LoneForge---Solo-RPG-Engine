import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Zap, Wind, Dices, Heart, Sword, Coins, Minus, Plus, 
  Package, ShieldOff, Trash2, Sparkles, ArrowUpCircle, PawPrint,
  UserMinus, Edit2, Check, X, PlusCircle, Search, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  GameState, Attribute, Skill, Ability, Character, Companion, Item 
} from '../types';
import { 
  getModifier, getProficiencyBonus, getSkillModifier 
} from '../services/gameEngine';
import { 
  SKILL_ATTRIBUTES, SPECIES_TEMPLATES 
} from '../constants';
import ITEMS_DATA from '../data/items.json';
import { ItemsList } from './ItemsList';

interface CharacterSheetProps {
  gameState: GameState;
  handlers: {
    canLevelUp: boolean;
    nextXp: number;
    xpProgress: number;
    currentAc: number;
    handleLevelUp: () => void;
    handleAttributeCheck: (stat: Attribute, mod: number) => void;
    handleUpdateAttribute: (stat: Attribute, delta: number) => void;
    handleUpdateAcBonus: (delta: number) => void;
    handleUpdateInitiativeBonus: (delta: number) => void;
    handleUpdateSpeedBonus: (delta: number) => void;
    handleSavingThrow: (stat: Attribute, mod: number) => void;
    handleSkillCheck: (skill: Skill, mod: number) => void;
    handleToggleSavingThrowProficiency: (stat: Attribute) => void;
    handleToggleSkillProficiency: (skill: Skill) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setInspectedEntity: (entity: { type: 'item' | 'npc' | 'enemy' | 'spell', data: any } | null) => void;
    handleUseItem: (itemId: string) => void;
    handleToggleEquip: (itemId: string) => void;
    handleDropItem: (itemId: string) => void;
    handleAddTreasureItem: (itemName: string) => void;
    handleRemoveTreasureItem: (itemId: string) => void;
    handleMoveTreasureToInventory: (itemId: string) => void;
    handleMoveInventoryToTreasure: (itemId: string) => void;
    setActiveTab: (tab: string) => void;
    handleToggleSpellSlot: (level: number, delta: number) => void;
    handleToggleSpellPrepared: (spellName: string) => void;
    handleRemoveSpell: (spellName: string) => void;
    handleAddCompanion: (companion: Companion) => void;
    handleRemoveCompanion: (companionId: string) => void;
    handleUpdateCompanionHp: (companionId: string, newHp: number) => void;
    handleUpdateCompanion: (companionId: string, updates: Partial<Companion>) => void;
    handleAddCompanionAbility: (companionId: string, abilityId: string, ability: Ability) => void;
    handleRemoveCompanionAbility: (companionId: string, abilityId: string) => void;
    handleAddCustomAbility: (ability: Ability) => void;
    handleRemoveCustomAbility: (abilityId: string) => void;
  };
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, handlers }) => {
  const {
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
  } = handlers;

  const [isAddingCompanion, setIsAddingCompanion] = React.useState(false);
  const [isAddingCustomAbility, setIsAddingCustomAbility] = React.useState(false);
  const [editingCompanionId, setEditingCompanionId] = React.useState<string | null>(null);
  const [isAddingTreasure, setIsAddingTreasure] = React.useState(false);
  const [treasureSearchOpen, setTreasureSearchOpen] = React.useState(false);
  const [manualTreasureName, setManualTreasureName] = React.useState('');
  const [newCustomAbility, setNewCustomAbility] = React.useState<Partial<Ability>>({
    name: '',
    description: '',
    type: 'passive'
  });
  const [newAbility, setNewAbility] = React.useState<Partial<Ability>>({
    name: '',
    description: '',
    type: 'passive'
  });
  const [newCompanion, setNewCompanion] = React.useState<Partial<Companion>>({
    name: '',
    type: '',
    hp: 10,
    maxHp: 10,
    ac: 10,
    speed: 30,
    stats: {
      Strength: 10,
      Dexterity: 10,
      Constitution: 10,
      Intelligence: 10,
      Wisdom: 10,
      Charisma: 10
    },
    abilities: []
  });

  const renderSpellLevel = (level: string, label: string) => {
    const getLevelNum = (lvl: string) => lvl === 'Cantrip' ? 0 : parseInt(lvl);
    const targetLevelNum = getLevelNum(level);
    const levelSpells = (gameState.character.knownSpells || []).filter(s => getLevelNum(s.level) === targetLevelNum);
    const slotLevel = level === 'Cantrip' ? 0 : parseInt(level);
    const slot = gameState.character.spellSlots?.find(s => s.level === slotLevel);

    return (
      <div key={level} className="space-y-4">
        {/* Level Header with Hexagonal Style */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-dnd-ink rotate-45 rounded-sm" />
            <span className="relative z-10 text-white font-display font-black text-lg">
              {level === 'Cantrip' ? '0' : level}
            </span>
          </div>
          <div className="flex-1 border-b-2 border-dnd-gold pb-1 flex items-end justify-between">
            <span className="text-xs font-black uppercase text-dnd-ink tracking-widest">{label}</span>
            {level !== 'Cantrip' && slot && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-dnd-gold uppercase leading-none">Total</span>
                  <span className="text-xs font-mono font-bold text-dnd-ink">{slot.total}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-dnd-gold uppercase leading-none mb-1">Slots</span>
                  <div className="flex gap-1">
                    {[...Array(slot.total)].map((_, i) => {
                      const isUsed = i < (slot.total - slot.current);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSpellSlot(slot.level, isUsed ? 1 : -1);
                          }}
                          className={cn(
                            "w-3 h-3 rounded-sm border border-dnd-gold/30 transition-all",
                            isUsed ? "bg-dnd-red shadow-[0_0_5px_rgba(140,22,22,0.3)]" : "bg-transparent hover:bg-dnd-red/10"
                          )}
                          title={isUsed ? "Mark as available" : "Mark as used"}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spell List with Prepared Circles */}
        <div className="space-y-1 pl-2">
          {levelSpells.map((spell, idx) => (
            <div 
              key={`${spell.name}-${idx}`} 
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => setInspectedEntity({ type: 'spell', data: spell })}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSpellPrepared(spell.name);
                }}
                className={cn(
                  "w-3 h-3 rounded-full border border-dnd-gold/50 flex-shrink-0 transition-all",
                  spell.isPrepared ? "bg-dnd-red shadow-[0_0_8px_rgba(140,22,22,0.4)]" : "bg-transparent hover:bg-dnd-red/10"
                )}
                title={spell.isPrepared ? "Unprepare spell" : "Prepare spell"}
              />
              <div className="flex-1 border-b border-dnd-gold/10 pb-1 group-hover:border-dnd-gold/30 transition-colors">
                <span className="text-xs font-serif italic text-dnd-ink group-hover:text-dnd-red transition-colors">{spell.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveSpell(spell.name); }}
                className="opacity-0 group-hover:opacity-100 text-dnd-red hover:text-dnd-red/80 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {levelSpells.length === 0 && (
            <div className="h-20 border-b border-dnd-gold/10 flex items-center justify-center">
              <span className="text-[10px] text-dnd-ink/20 italic">No spells known</span>
            </div>
          )}
          {/* Add some empty lines to match the sheet look */}
          {[...Array(Math.max(0, 3 - levelSpells.length))].map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 opacity-20">
              <div className="w-3 h-3 rounded-full border border-dnd-gold/50 flex-shrink-0" />
              <div className="flex-1 border-b border-dnd-gold/10 pb-1" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      key="character"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Character Sheet Header */}
      <header className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-red" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-display font-black tracking-tighter text-dnd-ink uppercase">{gameState.character.name}</h1>
            </div>
            <div className="h-1 w-20 bg-dnd-gold" />
            <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-red">Legendary Adventurer</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Class & Level</p>
              <p className="text-sm font-bold font-serif">
                {gameState.character.subclass ? `${gameState.character.subclass} ` : ''}
                {gameState.character.class} {gameState.character.level}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Species</p>
              <p className="text-sm font-bold font-serif">{gameState.character.species}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Background</p>
              <p className="text-sm font-bold font-serif">{gameState.character.background}</p>
            </div>
            <div className="space-y-1 w-full">
              <div className="flex justify-between items-end">
                <p className={`text-[10px] uppercase font-black tracking-widest ${canLevelUp ? 'text-emerald-600 animate-pulse' : 'text-dnd-gold'}`}>
                  {canLevelUp ? 'Ready to Level Up!' : 'Experience'}
                </p>
                <p className="text-[10px] font-bold font-mono text-dnd-ink/60">
                  {canLevelUp ? 'Click Bar to Advance' : `${gameState.character.xp} / ${nextXp} XP`}
                </p>
              </div>
              
              {canLevelUp ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLevelUp}
                  className="h-4 w-full bg-emerald-600 rounded-full overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center relative group cursor-pointer"
                >
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                  <span className="relative z-10 text-[8px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-1">
                    <ArrowUpCircle className="w-2 h-2" />
                    Level Up!
                  </span>
                </motion.button>
              ) : (
                <div className="h-2 w-full bg-dnd-ink/10 rounded-full overflow-hidden border border-dnd-gold/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Combat Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-xl p-4 flex flex-col items-center justify-center shadow-md relative group">
          <Shield className="w-8 h-8 text-dnd-gold/20 absolute group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateAcBonus(-1); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Minus size={8} />
              </button>
              <span className="text-2xl font-display font-black text-dnd-ink">{currentAc}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateAcBonus(1); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Plus size={8} />
              </button>
            </div>
            <span className="text-[10px] uppercase font-black text-dnd-gold tracking-tighter">Armor Class</span>
          </div>
        </div>
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-xl p-4 flex flex-col items-center justify-center shadow-md relative group">
          <Zap className="w-8 h-8 text-dnd-gold/20 absolute group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateInitiativeBonus(-1); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Minus size={8} />
              </button>
              <span className="text-2xl font-display font-black text-dnd-ink">
                {(() => {
                  const initiative = getModifier(gameState.character.stats.Dexterity) + (gameState.character.initiativeBonus || 0);
                  return (initiative >= 0 ? '+' : '') + initiative;
                })()}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateInitiativeBonus(1); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Plus size={8} />
              </button>
            </div>
            <span className="text-[10px] uppercase font-black text-dnd-gold tracking-tighter">Initiative</span>
          </div>
        </div>
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-xl p-4 flex flex-col items-center justify-center shadow-md relative group">
          <Wind className="w-8 h-8 text-dnd-gold/20 absolute group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateSpeedBonus(-5); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Minus size={8} />
              </button>
              <span className="text-2xl font-display font-black text-dnd-ink">
                {gameState.character.speed + (gameState.character.speedBonus || 0)}ft
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateSpeedBonus(5); }}
                className="w-4 h-4 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
              >
                <Plus size={8} />
              </button>
            </div>
            <span className="text-[10px] uppercase font-black text-dnd-gold tracking-tighter">Speed</span>
          </div>
        </div>
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-xl p-4 flex flex-col items-center justify-center shadow-md relative group">
          <Dices className="w-8 h-8 text-dnd-gold/20 absolute group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-display font-black text-dnd-ink z-10">{gameState.character.level}{gameState.character.hitDie}</span>
          <span className="text-[10px] uppercase font-black text-dnd-gold tracking-tighter z-10">Hit Dice</span>
        </div>
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-xl p-4 flex flex-col items-center justify-center shadow-md md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-full bg-emerald-500/5 transition-all duration-500" style={{ width: `${(gameState.character.hp / gameState.character.maxHp) * 100}%` }} />
          <Heart className="w-8 h-8 text-dnd-red/10 absolute right-4 group-hover:scale-110 transition-transform" />
          <div className="flex items-baseline gap-1 z-10">
            <span className="text-2xl font-display font-black text-dnd-ink">{gameState.character.hp}</span>
            <span className="text-sm font-bold text-dnd-ink/40">/ {gameState.character.maxHp}</span>
          </div>
          <span className="text-[10px] uppercase font-black text-dnd-red tracking-tighter z-10">Hit Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ability Scores */}
        <div className="lg:col-span-3 space-y-4">
          {(Object.keys(gameState.character.stats) as Attribute[]).map(stat => {
            const score = gameState.character.stats[stat];
            const mod = getModifier(score);
            return (
              <div key={stat} className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-4 flex flex-col items-center shadow-md relative group hover:border-dnd-red transition-colors cursor-pointer" onClick={() => handleAttributeCheck(stat, mod)}>
                <span className="text-[10px] uppercase font-black text-dnd-gold tracking-widest mb-1">{stat}</span>
                <div className="w-16 h-16 rounded-xl bg-dnd-parchment border-2 border-dnd-gold/30 flex items-center justify-center mb-2 group-hover:border-dnd-red/50 transition-colors">
                  <span className="text-3xl font-display font-black text-dnd-ink">
                    {mod >= 0 ? '+' : ''}{mod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateAttribute(stat, -1); }}
                    className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                  >
                    <Minus size={10} />
                  </button>
                  <div className="px-3 py-1 bg-dnd-ink text-dnd-parchment rounded-full text-xs font-bold font-mono min-w-[32px] text-center">
                    {score}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateAttribute(stat, 1); }}
                    className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                  >
                    <Plus size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Column: Proficiency, Saves, Skills */}
        <div className="lg:col-span-4 space-y-6">
          {/* Proficiency Bonus */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dnd-red flex items-center justify-center text-white font-display font-black text-lg shadow-lg">
                +{getProficiencyBonus(gameState.character.level)}
              </div>
              <span className="text-xs uppercase font-black text-dnd-ink tracking-widest">Proficiency Bonus</span>
            </div>
          </div>

          {/* Saving Throws */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] mb-4 border-b border-dnd-gold/20 pb-2">Saving Throws</h3>
            <div className="space-y-2">
              {(Object.keys(gameState.character.stats) as Attribute[]).map(stat => {
                const isProficient = gameState.character.savingThrowProficiencies.includes(stat);
                const profBonus = getProficiencyBonus(gameState.character.level);
                const mod = getModifier(gameState.character.stats[stat]) + (isProficient ? profBonus : 0);
                return (
                  <div key={stat} className="flex items-center justify-between group cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors" onClick={() => handleSavingThrow(stat, mod)}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSavingThrowProficiency(stat);
                        }}
                        className={cn(
                          "w-2 h-2 rounded-full border border-dnd-gold/30 transition-all",
                          isProficient ? "bg-dnd-red shadow-[0_0_8px_rgba(140,22,22,0.4)]" : "bg-dnd-parchment hover:bg-dnd-red/20"
                        )}
                        title={isProficient ? "Remove proficiency" : "Add proficiency"}
                      />
                      <span className="text-xs font-serif italic text-dnd-ink/70 group-hover:text-dnd-ink transition-colors">{stat}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-dnd-ink">
                      {mod >= 0 ? '+' : ''}{mod}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] mb-4 border-b border-dnd-gold/20 pb-2">Skills</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {(Object.keys(SKILL_ATTRIBUTES) as Skill[]).sort().map(skill => {
                const isProficient = gameState.character.proficiencies.includes(skill);
                const mod = getSkillModifier(gameState.character, skill);
                return (
                  <div key={skill} className="flex items-center justify-between group cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors" onClick={() => handleSkillCheck(skill, mod)}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSkillProficiency(skill);
                        }}
                        className={cn(
                          "w-2 h-2 rounded-full border border-dnd-gold/30 transition-all",
                          isProficient ? "bg-dnd-red shadow-[0_0_8px_rgba(140,22,22,0.4)]" : "bg-dnd-parchment hover:bg-dnd-red/20"
                        )}
                        title={isProficient ? "Remove proficiency" : "Add proficiency"}
                      />
                      <span className="text-xs font-serif italic text-dnd-ink/70 group-hover:text-dnd-ink transition-colors">{skill}</span>
                      <span className="text-[8px] text-dnd-gold/50 uppercase font-black">({SKILL_ATTRIBUTES[skill].substring(0, 3)})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-dnd-ink">
                      {mod >= 0 ? '+' : ''}{mod}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Traits, Currency, Inventory */}
        <div className="lg:col-span-5 space-y-6">
          {/* Species Traits */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] mb-4 border-b border-dnd-gold/20 pb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Species Traits
            </h3>
            <div className="space-y-3">
              {SPECIES_TEMPLATES[gameState.character.species].traits.map((trait, idx) => {
                const [name, desc] = trait.split(': ');
                return (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] font-black text-dnd-ink uppercase tracking-wider">{name}</p>
                    <p className="text-[11px] font-serif italic text-dnd-ink/60 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Currency Section */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] flex items-center gap-2 mb-4 border-b border-dnd-gold/20 pb-2">
              <Coins className="w-3 h-3" /> Currency
            </h3>
            <div className="space-y-4">
              {/* Row 1: Copper, Silver, Electrum */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'cp', label: 'Copper (CP)', color: 'text-orange-700' },
                  { key: 'sp', label: 'Silver (SP)', color: 'text-slate-400' },
                  { key: 'ep', label: 'Electrum (EP)', color: 'text-indigo-500' }
                ].map(coin => (
                  <div key={coin.key} className="flex flex-col items-center gap-1">
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", coin.color)}>{coin.label}</span>
                    <div className="flex items-center gap-2 bg-white/50 rounded-lg border border-dnd-gold/10 p-1 w-full justify-between">
                      <button 
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          character: { ...prev.character, [coin.key]: Math.max(0, (prev.character[coin.key as keyof Character] as number) - 1) }
                        }))}
                        className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <input 
                        type="number"
                        value={gameState.character[coin.key as keyof Character] as number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setGameState(prev => ({
                            ...prev,
                            character: { ...prev.character, [coin.key]: Math.max(0, val) }
                          }));
                        }}
                        className="w-full bg-transparent text-center text-xs font-mono font-bold text-dnd-ink focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          character: { ...prev.character, [coin.key]: (prev.character[coin.key as keyof Character] as number) + 1 }
                        }))}
                        className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2: Gold, Platinum */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'gold', label: 'Gold (GP)', color: 'text-amber-500' },
                  { key: 'pp', label: 'Platinum (PP)', color: 'text-blue-400' }
                ].map(coin => (
                  <div key={coin.key} className="flex flex-col items-center gap-1">
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", coin.color)}>{coin.label}</span>
                    <div className="flex items-center gap-2 bg-white/50 rounded-lg border border-dnd-gold/10 p-1 w-full justify-between">
                      <button 
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          character: { ...prev.character, [coin.key]: Math.max(0, (prev.character[coin.key as keyof Character] as number) - 1) }
                        }))}
                        className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <input 
                        type="number"
                        value={gameState.character[coin.key as keyof Character] as number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setGameState(prev => ({
                            ...prev,
                            character: { ...prev.character, [coin.key]: Math.max(0, val) }
                          }));
                        }}
                        className="w-full bg-transparent text-center text-xs font-mono font-bold text-dnd-ink focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          character: { ...prev.character, [coin.key]: (prev.character[coin.key as keyof Character] as number) + 1 }
                        }))}
                        className="w-5 h-5 flex items-center justify-center rounded bg-dnd-gold/10 hover:bg-dnd-gold/20 text-dnd-ink transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-dnd-gold/20 pb-2">
              <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] flex items-center gap-2">
                <Package className="w-3 h-3" /> Equipment
              </h3>
            </div>
            <div className="space-y-2">
              {(gameState.character.inventory || []).map((item, idx) => (
                <div 
                  key={item.id + idx} 
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors"
                  onClick={() => {
                    setInspectedEntity({ type: 'item', data: item });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      item.isEquipped ? "bg-emerald-500" : "bg-dnd-gold/30"
                    )} />
                    <span className={cn(
                      "font-serif italic",
                      item.isEquipped ? "text-dnd-ink font-bold" : "text-dnd-ink/60"
                    )}>{item.name}</span>
                  </div>
                  <div className="flex gap-2">
                    {item.type === 'Consumable' && (
                      <button onClick={(e) => { e.stopPropagation(); handleUseItem(item.id); }} className="text-emerald-600 hover:text-emerald-700"><Zap size={10} /></button>
                    )}
                    {(item.type === 'Weapon' || item.type === 'Armor') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleEquip(item.id); }} 
                        className="text-blue-600 hover:text-blue-700"
                        title={item.isEquipped ? "Unequip" : "Equip"}
                      >
                        {item.isEquipped ? <ShieldOff size={10} /> : <Shield size={10} />}
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMoveInventoryToTreasure(item.id); }} 
                      className="text-emerald-600 hover:text-emerald-700"
                      title="Move to Treasure"
                    >
                      <ArrowRight size={10} className="rotate-180" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDropItem(item.id); }} className="text-dnd-red hover:text-dnd-red/80" title="Drop Item"><Trash2 size={10} /></button>
                  </div>
                </div>
              ))}
              {gameState.character.inventory.length === 0 && (
                <p className="text-[10px] text-dnd-ink/40 italic text-center py-2">No equipment carried.</p>
              )}
            </div>
          </div>

          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4 border-b border-dnd-gold/20 pb-2">
              <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] flex items-center gap-2">
                <Coins className="w-3 h-3" /> Treasure
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTreasureSearchOpen(!treasureSearchOpen)}
                  className="text-dnd-gold hover:text-dnd-red transition-colors"
                  title="Add from Items List"
                >
                  <Search size={14} />
                </button>
                <button 
                  onClick={() => setIsAddingTreasure(!isAddingTreasure)}
                  className="text-dnd-gold hover:text-dnd-red transition-colors"
                  title="Add Manually"
                >
                  <PlusCircle size={14} />
                </button>
              </div>
            </div>

            {isAddingTreasure && (
              <div className="mb-4 p-3 bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Treasure Name (e.g. Ancient Icon)"
                  value={manualTreasureName}
                  onChange={e => setManualTreasureName(e.target.value)}
                  className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-3 py-1.5 text-xs font-serif focus:outline-none focus:border-dnd-gold"
                />
                <button 
                  onClick={() => {
                    if (manualTreasureName.trim()) {
                      handleAddTreasureItem(manualTreasureName.trim());
                      setManualTreasureName('');
                      setIsAddingTreasure(false);
                    }
                  }}
                  className="w-full bg-dnd-ink text-dnd-gold py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-dnd-red hover:text-white transition-all"
                >
                  Add Treasure
                </button>
              </div>
            )}

            {treasureSearchOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dnd-ink/80 backdrop-blur-sm">
                <div className="bg-dnd-paper border-4 border-dnd-gold rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b-2 border-dnd-gold flex justify-between items-center bg-dnd-parchment/30">
                    <h3 className="font-display font-black uppercase text-xl text-dnd-ink tracking-tight flex items-center gap-2">
                      <Search className="w-5 h-5 text-dnd-red" /> Search Treasure
                    </h3>
                    <button onClick={() => setTreasureSearchOpen(false)} className="p-2 hover:bg-dnd-red/10 rounded-full transition-colors">
                      <X className="w-6 h-6 text-dnd-red" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <ItemsList onItemSelect={(name) => {
                      handleAddTreasureItem(name);
                      setTreasureSearchOpen(false);
                    }} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(gameState.character.treasure || []).map((item, idx) => (
                <div 
                  key={item.id + idx} 
                  className="flex items-center justify-between text-xs cursor-pointer hover:bg-dnd-gold/5 p-1 rounded transition-colors group"
                  onClick={() => {
                    setInspectedEntity({ type: 'item', data: item });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-dnd-gold/30" />
                    <span className="font-serif italic text-dnd-ink/60">{item.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMoveTreasureToInventory(item.id); }} 
                      className="text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Move to Equipment"
                    >
                      <ArrowRight size={10} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveTreasureItem(item.id); }} 
                      className="text-dnd-red hover:text-dnd-red/80"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
              {(gameState.character.treasure || []).length === 0 && (
                <p className="text-[10px] text-dnd-ink/40 italic text-center py-2">No treasure found yet.</p>
              )}
            </div>
          </div>

          {/* Feats & Abilities Section */}
          <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-dnd-gold/20 pb-2">
            <h3 className="text-[10px] uppercase font-black text-dnd-red tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Feats & Abilities
            </h3>
            <button 
              onClick={() => setIsAddingCustomAbility(!isAddingCustomAbility)}
              className="text-dnd-gold hover:text-dnd-red transition-colors"
            >
              <PlusCircle size={14} />
            </button>
          </div>

          {isAddingCustomAbility && (
            <div className="mb-4 p-3 bg-dnd-parchment/50 border border-dnd-gold/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                placeholder="Ability Name"
                value={newCustomAbility.name}
                onChange={e => setNewCustomAbility(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-3 py-1.5 text-xs font-serif focus:outline-none focus:border-dnd-gold"
              />
              <textarea 
                placeholder="Description"
                value={newCustomAbility.description}
                onChange={e => setNewCustomAbility(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-3 py-1.5 text-xs font-serif focus:outline-none focus:border-dnd-gold min-h-[60px]"
              />
              <div className="flex gap-2">
                <select 
                  value={newCustomAbility.type}
                  onChange={e => setNewCustomAbility(prev => ({ ...prev, type: e.target.value as any }))}
                  className="flex-1 bg-white/50 border border-dnd-gold/20 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase focus:outline-none focus:border-dnd-gold"
                >
                  <option value="passive">Passive</option>
                  <option value="action">Action</option>
                  <option value="bonus_action">Bonus Action</option>
                  <option value="reaction">Reaction</option>
                </select>
                <button 
                  onClick={() => {
                    if (newCustomAbility.name && newCustomAbility.description) {
                      handleAddCustomAbility({
                        ...newCustomAbility as Ability,
                        id: crypto.randomUUID()
                      });
                      setNewCustomAbility({ name: '', description: '', type: 'passive' });
                      setIsAddingCustomAbility(false);
                    }
                  }}
                  className="bg-dnd-ink text-dnd-gold px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-dnd-red hover:text-white transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {(gameState.character.customAbilities || []).map((ability) => (
              <div key={ability.id} className="group space-y-1 p-2 rounded-lg hover:bg-dnd-gold/5 transition-colors relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-dnd-ink uppercase tracking-wider">{ability.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] uppercase font-bold px-1 py-0.5 rounded bg-dnd-gold/10 text-dnd-gold">
                      {ability.type.replace('_', ' ')}
                    </span>
                    <button 
                      onClick={() => handleRemoveCustomAbility(ability.id)}
                      className="opacity-0 group-hover:opacity-100 text-dnd-red/40 hover:text-dnd-red transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] font-serif italic text-dnd-ink/60 leading-relaxed">{ability.description}</p>
              </div>
            ))}
            {(gameState.character.customAbilities || []).length === 0 && !isAddingCustomAbility && (
              <p className="text-[10px] text-dnd-ink/40 italic text-center py-4">No custom feats or abilities added.</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Class Features Section - Now a full-width block above Spellbook */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-display font-black uppercase text-dnd-ink tracking-tight mb-6 border-b-2 border-dnd-gold pb-4 flex items-center gap-3">
          <Sword className="w-6 h-6 text-dnd-red" /> Class Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(gameState.character.abilities || []).map((ability) => (
            <div key={ability.id} className="bg-dnd-parchment/30 border border-dnd-gold/20 rounded-xl p-4 space-y-2 hover:border-dnd-red/30 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-dnd-ink uppercase tracking-wider">{ability.name}</p>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-dnd-gold/10 text-dnd-gold">
                  {ability.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs font-serif italic text-dnd-ink/70 leading-relaxed">{ability.description}</p>
              {ability.usesPerLongRest && (
                <div className="flex gap-1 mt-2">
                  {[...Array(ability.usesPerLongRest)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-3 h-3 rounded-sm border border-dnd-gold/30",
                        i < (ability.currentUses || 0) ? "bg-dnd-red shadow-[0_0_5px_rgba(140,22,22,0.3)]" : "bg-transparent"
                      )} 
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {(gameState.character.abilities || []).length === 0 && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-dnd-gold/10 rounded-xl">
              <p className="text-sm text-dnd-ink/40 italic font-serif">No class features yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* New 5.5 Style Spellbook Section */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-dnd-gold pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dnd-red/10 rounded-xl border border-dnd-red/20">
              <Sparkles className="w-8 h-8 text-dnd-red" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black uppercase text-dnd-ink tracking-tight">Spellbook</h2>
              <p className="text-[10px] uppercase font-black text-dnd-gold tracking-[0.3em]">5.5 Edition Reference</p>
            </div>
          </div>

          {/* Spellcasting Stats Header */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Spellcasting Ability', value: (() => {
                const charClass = gameState.character.class;
                if (charClass === 'Wizard') return 'INT';
                if (charClass === 'Cleric') return 'WIS';
                if (charClass === 'Bard' || charClass === 'Warlock') return 'CHA';
                return 'WIS';
              })() },
              { label: 'Spell Save DC', value: (() => {
                const charClass = gameState.character.class;
                let attr: Attribute = 'Wisdom';
                if (charClass === 'Wizard') attr = 'Intelligence';
                if (charClass === 'Bard' || charClass === 'Warlock') attr = 'Charisma';
                return 8 + getProficiencyBonus(gameState.character.level) + getModifier(gameState.character.stats[attr]);
              })() },
              { label: 'Spell Attack Bonus', value: (() => {
                const charClass = gameState.character.class;
                let attr: Attribute = 'Wisdom';
                if (charClass === 'Wizard') attr = 'Intelligence';
                if (charClass === 'Bard' || charClass === 'Warlock') attr = 'Charisma';
                const bonus = getProficiencyBonus(gameState.character.level) + getModifier(gameState.character.stats[attr]);
                return (bonus >= 0 ? '+' : '') + bonus;
              })() }
            ].map((stat, i) => (
              <div key={i} className="bg-dnd-parchment border-2 border-dnd-gold rounded-xl px-6 py-2 flex flex-col items-center shadow-sm min-w-[120px]">
                <span className="text-xl font-display font-black text-dnd-ink">{stat.value}</span>
                <span className="text-[8px] uppercase font-black text-dnd-gold tracking-tighter text-center">{stat.label}</span>
              </div>
            ))}
            <button 
              onClick={() => setActiveTab('spells')}
              className="bg-dnd-ink text-dnd-gold px-6 py-2 rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-dnd-red hover:text-white transition-all shadow-md border-2 border-dnd-gold self-center"
            >
              Add Spells
            </button>
          </div>
        </div>

        {/* 3-Column Spell List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Cantrips, Lvl 1, Lvl 2 */}
          <div className="space-y-8">
            {[
              { level: 'Cantrip', label: 'Cantrips' },
              { level: '1', label: 'Level 1' },
              { level: '2', label: 'Level 2' }
            ].map(lvl => renderSpellLevel(lvl.level, lvl.label))}
          </div>

          {/* Column 2: Lvl 3, Lvl 4, Lvl 5 */}
          <div className="space-y-8">
            {[
              { level: '3', label: 'Level 3' },
              { level: '4', label: 'Level 4' },
              { level: '5', label: 'Level 5' }
            ].map(lvl => renderSpellLevel(lvl.level, lvl.label))}
          </div>

          {/* Column 3: Lvl 6, Lvl 7, Lvl 8, Lvl 9 */}
          <div className="space-y-8">
            {[
              { level: '6', label: 'Level 6' },
              { level: '7', label: 'Level 7' },
              { level: '8', label: 'Level 8' },
              { level: '9', label: 'Level 9' }
            ].map(lvl => renderSpellLevel(lvl.level, lvl.label))}
          </div>
        </div>
      </div>

      {/* Companions & Mounts Section */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl space-y-8">
        <div className="flex items-center justify-between border-b-2 border-dnd-gold pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-600/20">
              <PawPrint className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black uppercase text-dnd-ink tracking-tight">Companions & Mounts</h2>
              <p className="text-[10px] uppercase font-black text-dnd-gold tracking-[0.3em]">Animal Allies & Steeds</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingCompanion(!isAddingCompanion)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-emerald-700 transition-all shadow-md border-2 border-emerald-500/50"
          >
            {isAddingCompanion ? 'Cancel' : 'Add Companion'}
          </button>
        </div>

        {isAddingCompanion && (
          <div className="bg-dnd-parchment border-2 border-dnd-gold/30 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-dnd-gold mb-1 block">Name</label>
                  <input 
                    type="text" 
                    value={newCompanion.name}
                    onChange={e => setNewCompanion(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 text-sm font-serif focus:outline-none focus:border-dnd-gold"
                    placeholder="e.g. Shadowfax"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-dnd-gold mb-1 block">Type / Species</label>
                  <input 
                    type="text" 
                    value={newCompanion.type}
                    onChange={e => setNewCompanion(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 text-sm font-serif focus:outline-none focus:border-dnd-gold"
                    placeholder="e.g. Warhorse"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-dnd-gold mb-1 block text-center">HP</label>
                  <input 
                    type="number" 
                    value={newCompanion.maxHp}
                    onChange={e => setNewCompanion(prev => ({ ...prev, hp: Number(e.target.value), maxHp: Number(e.target.value) }))}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 text-sm font-bold text-center focus:outline-none focus:border-dnd-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-dnd-gold mb-1 block text-center">AC</label>
                  <input 
                    type="number" 
                    value={newCompanion.ac}
                    onChange={e => setNewCompanion(prev => ({ ...prev, ac: Number(e.target.value) }))}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 text-sm font-bold text-center focus:outline-none focus:border-dnd-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-dnd-gold mb-1 block text-center">Speed</label>
                  <input 
                    type="number" 
                    value={newCompanion.speed}
                    onChange={e => setNewCompanion(prev => ({ ...prev, speed: Number(e.target.value) }))}
                    className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 text-sm font-bold text-center focus:outline-none focus:border-dnd-gold"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if (newCompanion.name && newCompanion.type) {
                  handleAddCompanion({
                    ...newCompanion as Companion,
                    id: crypto.randomUUID()
                  });
                  setIsAddingCompanion(false);
                  setNewCompanion({
                    name: '',
                    type: '',
                    hp: 10,
                    maxHp: 10,
                    ac: 10,
                    speed: 30,
                    stats: {
                      Strength: 10,
                      Dexterity: 10,
                      Constitution: 10,
                      Intelligence: 10,
                      Wisdom: 10,
                      Charisma: 10
                    },
                    abilities: []
                  });
                }
              }}
              className="w-full bg-dnd-ink text-dnd-gold py-3 rounded-xl font-display uppercase tracking-[0.2em] text-sm font-black hover:bg-emerald-600 hover:text-white transition-all shadow-lg border-2 border-dnd-gold"
            >
              Confirm Companion
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(gameState.character.companions || []).map(companion => {
            const isEditing = editingCompanionId === companion.id;
            
            return (
              <div key={companion.id} className="bg-dnd-parchment border-2 border-dnd-gold rounded-2xl p-6 shadow-md relative group">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingCompanionId(isEditing ? null : companion.id)}
                    className="text-dnd-gold hover:text-dnd-ink transition-colors"
                  >
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                  <button 
                    onClick={() => handleRemoveCompanion(companion.id)}
                    className="text-dnd-red/40 hover:text-dnd-red transition-colors"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-600/20">
                    <PawPrint className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={companion.name}
                          onChange={e => handleUpdateCompanion(companion.id, { name: e.target.value })}
                          className="w-full bg-white/50 border border-dnd-gold/20 rounded px-2 py-1 text-sm font-display font-black uppercase"
                        />
                        <input 
                          type="text" 
                          value={companion.type}
                          onChange={e => handleUpdateCompanion(companion.id, { type: e.target.value })}
                          className="w-full bg-white/50 border border-dnd-gold/20 rounded px-2 py-1 text-[10px] uppercase font-bold text-dnd-gold"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-display font-black uppercase text-dnd-ink leading-none">{companion.name}</h3>
                        <p className="text-[10px] uppercase font-bold text-dnd-gold tracking-widest mt-1">{companion.type}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/50 border border-dnd-gold/20 rounded-xl p-3 text-center">
                    <p className="text-[8px] uppercase font-black text-dnd-gold mb-1">Health</p>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleUpdateCompanionHp(companion.id, companion.hp - 1)}
                        className="text-dnd-red hover:scale-110 transition-transform"
                      >
                        <Minus size={12} />
                      </button>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={companion.maxHp}
                          onChange={e => handleUpdateCompanion(companion.id, { hp: Number(e.target.value), maxHp: Number(e.target.value) })}
                          className="w-12 bg-transparent text-center text-sm font-bold text-dnd-ink focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm font-bold text-dnd-ink">{companion.hp}/{companion.maxHp}</span>
                      )}
                      <button 
                        onClick={() => handleUpdateCompanionHp(companion.id, companion.hp + 1)}
                        className="text-emerald-600 hover:scale-110 transition-transform"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/50 border border-dnd-gold/20 rounded-xl p-3 text-center">
                    <p className="text-[8px] uppercase font-black text-dnd-gold mb-1">Armor</p>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={companion.ac}
                        onChange={e => handleUpdateCompanion(companion.id, { ac: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-sm font-bold text-dnd-ink focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-dnd-ink">{companion.ac}</p>
                    )}
                  </div>
                  <div className="bg-white/50 border border-dnd-gold/20 rounded-xl p-3 text-center">
                    <p className="text-[8px] uppercase font-black text-dnd-gold mb-1">Speed</p>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={companion.speed}
                        onChange={e => handleUpdateCompanion(companion.id, { speed: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-sm font-bold text-dnd-ink focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-dnd-ink">{companion.speed}ft</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1 mb-6">
                  {Object.entries(companion.stats).map(([attr, val]) => (
                    <div key={attr} className="bg-dnd-ink/5 rounded p-1 text-center">
                      <p className="text-[6px] uppercase font-bold text-dnd-ink/40">{attr.slice(0, 3)}</p>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={val}
                          onChange={e => {
                            const newStats = { ...companion.stats, [attr]: Number(e.target.value) };
                            handleUpdateCompanion(companion.id, { stats: newStats });
                          }}
                          className="w-full bg-transparent text-center text-[10px] font-bold text-dnd-ink focus:outline-none"
                        />
                      ) : (
                        <p className="text-[10px] font-bold text-dnd-ink">{val}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Abilities Section */}
                <div className="space-y-3 border-t border-dnd-gold/10 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-black text-dnd-gold">Traits & Abilities</p>
                    {isEditing && (
                      <button 
                        onClick={() => {
                          if (newAbility.name && newAbility.description) {
                            const id = crypto.randomUUID();
                            handleAddCompanionAbility(companion.id, { ...newAbility as Ability, id });
                            setNewAbility({ name: '', description: '', type: 'passive' });
                          }
                        }}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <PlusCircle size={14} />
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="bg-white/30 rounded-lg p-2 space-y-2 border border-dnd-gold/10">
                      <input 
                        type="text" 
                        placeholder="Ability Name"
                        value={newAbility.name}
                        onChange={e => setNewAbility(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/50 border border-dnd-gold/10 rounded px-2 py-1 text-[10px] font-bold"
                      />
                      <textarea 
                        placeholder="Description"
                        value={newAbility.description}
                        onChange={e => setNewAbility(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/50 border border-dnd-gold/10 rounded px-2 py-1 text-[10px] font-serif h-12 resize-none"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {(companion.abilities || []).map(ability => (
                      <div key={ability.id} className="bg-white/50 rounded p-2 border border-dnd-gold/5 relative group/ability">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-dnd-ink">{ability.name}</p>
                          {isEditing && (
                            <button 
                              onClick={() => handleRemoveCompanionAbility(companion.id, ability.id)}
                              className="text-dnd-red/40 hover:text-dnd-red opacity-0 group-hover/ability:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-dnd-ink/60 font-serif italic leading-tight">{ability.description}</p>
                      </div>
                    ))}
                    {(!companion.abilities || companion.abilities.length === 0) && !isEditing && (
                      <p className="text-[9px] text-dnd-ink/30 italic text-center">No special abilities.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {(!gameState.character.companions || gameState.character.companions.length === 0) && !isAddingCompanion && (
            <div className="col-span-full py-12 text-center bg-dnd-parchment/30 border-2 border-dashed border-dnd-gold/20 rounded-2xl">
              <PawPrint className="w-12 h-12 text-dnd-gold/20 mx-auto mb-4" />
              <p className="text-sm font-serif text-dnd-ink/40 italic">No companions or mounts currently following you.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
