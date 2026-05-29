import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, CheckCircle2, Coins, Search, X, Trash2 } from 'lucide-react';
import { Character, Attribute, CharacterClass, Species, Background, Ability, SpellSlot, Item, Skill } from '../types';
import { INITIAL_CHARACTER } from '../constants';
import { SPECIES_DATA } from '../data/species';
import { BACKGROUND_TEMPLATES, BACKGROUND_CUSTOMIZATION_POOLS, CustomBackgroundState, AbilityIncreaseMode } from '../data/backgrounds';
import { ORIGIN_FEATS, OriginFeat } from '../data/origin_feats';
import { getModifier, mapLootItemToItem } from '../services/gameEngine';
import ITEMS_DATA from '../data/items.json';
import CLASSES_DATA from '../data/classes.json';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ItemsList } from './ItemsList';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CharacterCreation({ onFinish }: { onFinish: (char: Character) => void }) {
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState<CharacterClass>('Barbarian');
  const [species, setSpecies] = useState<Species>('Human');
  const [background, setBackground] = useState<Background>('Soldier');
  const [backgroundMode, setBackgroundMode] = useState<'standard' | 'custom'>('standard');
  const [customBackground, setCustomBackground] = useState<CustomBackgroundState>({
    name: 'Custom Background',
    ability_mode: 'two_one',
    ability_increases: {},
    skill_proficiencies: ['Athletics', 'Perception'],
    tool_proficiency: null,
    origin_feat: 'Skilled'
  });
  const [featChoices, setFeatChoices] = useState<Record<string, any>>({});
  const [stats, setStats] = useState<Record<Attribute, number>>({
    'Strength': 8,
    'Dexterity': 8,
    'Constitution': 8,
    'Intelligence': 8,
    'Wisdom': 8,
    'Charisma': 8
  });
  const [points, setPoints] = useState(27);
  const [treasureItems, setTreasureItems] = useState<Item[]>([]);
  const [isAddingTreasure, setIsAddingTreasure] = useState(false);
  const [manualTreasureName, setManualTreasureName] = useState('');
  const [isTreasureSearchOpen, setIsTreasureSearchOpen] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<Record<string, boolean>>({});

  const toggleTrait = (name: string) => {
    setExpandedTraits(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const getStatCost = (val: number) => {
    if (val < 13) return 1;
    if (val < 15) return 2;
    return 0;
  };

  const updateStat = (stat: Attribute, delta: number) => {
    const currentVal = stats[stat];
    const newVal = currentVal + delta;
    
    if (newVal < 8 || newVal > 15) return;
    
    const cost = delta > 0 ? getStatCost(currentVal) : -getStatCost(newVal);
    
    if (points - cost < 0 && delta > 0) return;
    
    setStats(prev => ({ ...prev, [stat]: newVal }));
    setPoints(prev => prev - cost);
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    
    const classData = (CLASSES_DATA as any).find((c: any) => c.class.name === charClass)?.class;
    if (!classData) return;

    const bgTemplate = BACKGROUND_TEMPLATES[background];
    const spData = SPECIES_DATA[species];

    // Apply background bonuses to stats
    const finalStats = { ...stats };
    const abilityIncreases = backgroundMode === 'standard' 
      ? bgTemplate.ability_score_increases 
      : customBackground.ability_increases;

    Object.entries(abilityIncreases).forEach(([stat, bonus]) => {
      if (bonus) finalStats[stat as Attribute] += bonus;
    });

    // Handle Feat
    const selectedFeatName = backgroundMode === 'standard' ? bgTemplate.origin_feat : customBackground.origin_feat;
    const featData = ORIGIN_FEATS[selectedFeatName];
    
    // Get level 1 features from progression table
    const level1Data = classData.levels.find((l: any) => l.level === 1);
    const initialAbilities: Ability[] = (level1Data?.features || []).map((f: any) => ({
      id: `feat-${f.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: f.name,
      description: f.description,
      type: f.mechanics?.activation?.toLowerCase().includes('bonus') ? 'bonus_action' : 
            f.mechanics?.activation?.toLowerCase().includes('reaction') ? 'reaction' : 
            f.mechanics?.activation?.toLowerCase().includes('action') ? 'action' : 'passive'
    }));

    // Add Origin Feat
    if (featData) {
      initialAbilities.push({
        id: `feat-${featData.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: featData.name,
        description: featData.description,
        type: 'passive'
      });
    }

    // Initial spell slots
    let initialSpellSlots: SpellSlot[] | undefined = undefined;
    const spellcasting = classData.spellcasting;
    if (spellcasting && spellcasting.slots_per_level) {
      const slots = spellcasting.slots_per_level["1"];
      if (slots) {
        initialSpellSlots = slots.map((count: number, index: number) => ({
          level: index + 1,
          total: count,
          current: count
        })).filter((s: any) => s.total > 0);
      }
    }

    // Starting equipment and gold
    const startingEquipmentNames = (classData as any).starting_equipment || [];
    const startingGold = (classData as any).starting_gold || 0;
    
    const startingInventory: Item[] = startingEquipmentNames.map((itemName: string) => {
      const itemData = ((ITEMS_DATA as any) as any[]).find((i: any) => i.Name === itemName);
      if (itemData) {
        return mapLootItemToItem(itemData);
      }
      return null;
    }).filter(Boolean) as Item[];

    const finalChar: Character = {
      ...INITIAL_CHARACTER,
      name,
      class: charClass,
      species,
      background: backgroundMode === 'standard' ? background : customBackground.name as Background,
      backgroundMode,
      customBackground: backgroundMode === 'custom' ? customBackground : undefined,
      originFeat: selectedFeatName,
      featChoices,
      toolProficiencies: backgroundMode === 'standard' 
        ? (bgTemplate.tool_proficiency ? [bgTemplate.tool_proficiency] : [])
        : (customBackground.tool_proficiency ? [customBackground.tool_proficiency] : []),
      stats: finalStats,
      hp: parseInt(classData.hit_die.replace('d', '')) + getModifier(finalStats['Constitution']),
      maxHp: parseInt(classData.hit_die.replace('d', '')) + getModifier(finalStats['Constitution']),
      baseAc: 10,
      proficiencies: [
        ...(classData.skill_choices.from.slice(0, classData.skill_choices.choose) as Skill[]), // Simplified: just take first N
        ...(backgroundMode === 'standard' ? bgTemplate.skill_proficiencies : customBackground.skill_proficiencies) as Skill[],
        ...(spData.traits.some(t => t.name === 'Keen Senses') ? ['Perception' as Skill] : [])
      ],
      savingThrowProficiencies: classData.saving_throws as Attribute[],
      speed: spData.speed || 30,
      hitDie: classData.hit_die,
      inventory: startingInventory,
      treasure: treasureItems,
      gold: startingGold,
      abilities: initialAbilities,
      spellSlots: initialSpellSlots
    };
    
    onFinish(finalChar);
  };

  return (
    <div className="min-h-screen bg-dnd-parchment text-dnd-ink font-serif parchment-texture flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-dnd-paper border-2 border-dnd-gold rounded-lg p-10 space-y-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-red" />
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-black tracking-widest uppercase text-dnd-red">Character Creation</h1>
          <div className="w-24 h-1 bg-dnd-gold mx-auto" />
          <p className="text-dnd-ink/60 text-sm italic">Define your destiny before crossing the threshold of adventure.</p>
        </div>

        <div className="space-y-12">
          {/* Name */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Hero's Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a legendary name..."
              className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-lg px-6 py-4 font-serif text-lg focus:outline-none focus:border-dnd-red transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-10">
            {/* Class */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Class</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(CLASSES_DATA as any).map((c: any) => (
                  <button 
                    key={c.class.name}
                    onClick={() => setCharClass(c.class.name as CharacterClass)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2 text-xs font-display uppercase tracking-widest font-black transition-all shadow-sm",
                      charClass === c.class.name 
                        ? "bg-dnd-red border-dnd-gold text-dnd-parchment scale-105" 
                        : "bg-white/50 border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    {c.class.name}
                  </button>
                ))}
              </div>
              <div className="bg-dnd-red/5 border border-dnd-red/20 rounded-lg p-6 space-y-4 mt-4">
                <p className="text-sm text-dnd-ink/80 italic leading-relaxed font-serif">
                  {(CLASSES_DATA as any).find((c: any) => c.class.name === charClass)?.class.flavor}
                </p>
                <div className="flex justify-center pt-4">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/classes/${charClass.toLowerCase()}.png`} 
                    alt={charClass}
                    className="max-h-128 object-contain shadow-xl rounded-lg border border-dnd-gold/20 bg-dnd-paper/50"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Se l'immagine non esiste, nascondiamo l'elemento
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Species */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Species</label>
              <select 
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-lg px-4 py-3 font-serif text-base focus:outline-none focus:border-dnd-red transition-all mb-4"
              >
                {(Object.keys(SPECIES_DATA) as Species[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="bg-dnd-gold/5 border border-dnd-gold/20 rounded-lg p-6 space-y-4">
                <p className="text-sm text-dnd-ink/80 italic leading-relaxed font-serif whitespace-pre-wrap">
                  {SPECIES_DATA[species].description}
                </p>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest border-b border-dnd-gold/10 pb-1">Species Traits</p>
                  <div className="grid grid-cols-1 gap-3">
                    {SPECIES_DATA[species].traits.map((trait, idx) => {
                      const hasNote = trait.mechanical_effect?.note;
                      const isExpanded = expandedTraits[trait.name];
                      
                      return (
                        <div key={idx} className="flex flex-col border-b border-dnd-gold/10 pb-2 last:border-0">
                          <div 
                            className={cn(
                              "flex items-center justify-between group",
                              hasNote ? "cursor-pointer" : ""
                            )}
                            onClick={() => hasNote && toggleTrait(trait.name)}
                          >
                            <span className="text-xs font-black text-dnd-ink uppercase tracking-tighter group-hover:text-dnd-red transition-colors">
                              {trait.name}
                              {hasNote && (
                                <span className="ml-2 text-[9px] text-dnd-gold italic lowercase font-serif group-hover:underline">
                                  (click for more info)
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="text-xs text-dnd-ink/70 font-serif italic leading-tight whitespace-pre-wrap">{trait.description}</span>
                          {hasNote && isExpanded && (
                            <div className="mt-2 pl-2 border-l-2 border-dnd-gold bg-dnd-gold/5 py-1">
                              <p className="text-[11px] font-serif font-bold text-dnd-red leading-tight whitespace-pre-wrap">
                                {trait.mechanical_effect.note}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(SPECIES_DATA[species].languages || []).length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-dnd-gold/20">
                    <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIES_DATA[species].languages.map((lang, idx) => (
                        <span key={idx} className="px-2 py-1 bg-dnd-gold/10 rounded text-[10px] font-black text-dnd-ink uppercase tracking-wider">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center pt-6 border-t border-dnd-gold/10 mt-4">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/species/${species.toLowerCase()}.png`} 
                    alt={species}
                    className="max-h-64 object-contain shadow-xl rounded-lg border border-dnd-gold/20 bg-dnd-paper/50"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Background</label>
              <div className="flex gap-1 bg-dnd-gold/10 p-1 rounded-lg border border-dnd-gold/20">
                <button 
                  onClick={() => setBackgroundMode('standard')}
                  className={cn(
                    "px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                    backgroundMode === 'standard' ? "bg-dnd-gold text-dnd-ink shadow-sm" : "text-dnd-gold/60 hover:text-dnd-gold"
                  )}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setBackgroundMode('custom')}
                  className={cn(
                    "px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                    backgroundMode === 'custom' ? "bg-dnd-gold text-dnd-ink shadow-sm" : "text-dnd-gold/60 hover:text-dnd-gold"
                  )}
                >
                  Customize <Plus size={10} />
                </button>
              </div>
            </div>

            {backgroundMode === 'standard' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(BACKGROUND_TEMPLATES) as Background[]).map(bg => (
                        <button 
                          key={bg}
                          onClick={() => setBackground(bg)}
                          className={cn(
                            "px-3 py-2 rounded-lg border-2 text-sm font-display uppercase tracking-widest font-black transition-all",
                            background === bg 
                              ? "bg-dnd-gold border-dnd-red text-dnd-ink scale-105" 
                              : "bg-white/50 border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                          )}
                        >
                          {bg}
                        </button>
                  ))}
                </div>
                <div className="bg-dnd-paper/50 border-2 border-dnd-gold/20 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-black text-dnd-red tracking-tight">{BACKGROUND_TEMPLATES[background].name}</h3>
                    <p className="text-sm font-serif italic text-dnd-ink/80 leading-relaxed whitespace-pre-wrap">
                      {BACKGROUND_TEMPLATES[background].description}
                    </p>
                    <p className="text-xs font-serif text-dnd-ink/60 border-l-2 border-dnd-gold/30 pl-3 italic whitespace-pre-wrap">
                      {BACKGROUND_TEMPLATES[background].flavor_trait}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-dnd-gold/10">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest mb-1">Ability Score Increases</p>
                        <p className="text-xs font-sans font-bold text-dnd-ink">
                          {Object.entries(BACKGROUND_TEMPLATES[background].ability_score_increases).map(([stat, bonus]) => `${stat} +${bonus}`).join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest mb-1">Skill Proficiencies</p>
                        <p className="text-xs font-sans font-bold text-dnd-ink">
                          {BACKGROUND_TEMPLATES[background].skill_proficiencies.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest mb-1">Tool Proficiency</p>
                        <p className="text-xs font-sans font-bold text-dnd-ink">
                          {BACKGROUND_TEMPLATES[background].tool_proficiency || 'None'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest mb-1">Origin Feat</p>
                      <div className="p-4 bg-dnd-red/5 border border-dnd-red/10 rounded-lg space-y-2">
                        <p className="text-sm font-display font-black text-dnd-red uppercase tracking-tighter">
                          {BACKGROUND_TEMPLATES[background].origin_feat}
                        </p>
                        <p className="text-[11px] font-serif italic text-dnd-ink/70 leading-tight whitespace-pre-wrap">
                          {ORIGIN_FEATS[BACKGROUND_TEMPLATES[background].origin_feat]?.description}
                        </p>
                        <ul className="space-y-1 mt-2">
                          {ORIGIN_FEATS[BACKGROUND_TEMPLATES[background].origin_feat]?.effects.map((effect, i) => (
                            <li key={i} className="text-[10px] font-sans font-bold text-dnd-ink/80 flex items-start gap-2 whitespace-pre-wrap">
                              <span className="text-dnd-red mt-0.5">◈</span>
                              {effect.note || effect.type.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-dnd-paper/80 border-2 border-dnd-gold rounded-xl p-8 space-y-8 shadow-xl">
                <div className="space-y-4">
                  <div className="space-y-2 border-b border-dnd-gold/20 pb-4">
                    <input 
                      type="text"
                      placeholder="Name your background..."
                      className="text-2xl font-display font-black text-dnd-red bg-transparent focus:outline-none w-full placeholder:text-dnd-red/20"
                      value={customBackground.name}
                      onChange={(e) => setCustomBackground(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <p className="text-xs font-serif italic text-dnd-ink/60">Customize your history to match your legend.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Abilities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Ability Score Increases</p>
                        <div className="flex gap-2">
                          {(['two_one', 'three_ones'] as AbilityIncreaseMode[]).map(mode => (
                            <button
                              key={mode}
                              onClick={() => setCustomBackground(prev => ({ 
                                ...prev, 
                                ability_mode: mode,
                                ability_increases: {} // Reset on mode change
                              }))}
                              className={cn(
                                "px-2 py-0.5 rounded border text-[9px] font-black uppercase transition-all",
                                customBackground.ability_mode === mode 
                                  ? "bg-dnd-gold border-dnd-red text-dnd-ink" 
                                  : "border-dnd-gold/20 text-dnd-gold/60"
                              )}
                            >
                              {mode === 'two_one' ? '+2/+1' : '+1x3'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {BACKGROUND_CUSTOMIZATION_POOLS.abilities.map(stat => {
                          const currentBonus = customBackground.ability_increases[stat] || 0;
                          return (
                            <button
                              key={stat}
                              onClick={() => {
                                setCustomBackground(prev => {
                                  const next = { ...prev.ability_increases };
                                  if (currentBonus > 0) {
                                    delete next[stat];
                                  } else {
                                    // Logic based on mode
                                    const usedCount = Object.keys(next).length;
                                    if (prev.ability_mode === 'two_one') {
                                      if (usedCount === 0) next[stat] = 2;
                                      else if (usedCount === 1) next[stat] = 1;
                                    } else {
                                      if (usedCount < 3) next[stat] = 1;
                                    }
                                  }
                                  return { ...prev, ability_increases: next };
                                });
                              }}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                currentBonus > 0 
                                  ? "bg-dnd-red/10 border-dnd-red text-dnd-red shadow-sm" 
                                  : "bg-white/40 border-dnd-gold/10 text-dnd-ink/40 hover:border-dnd-gold/40"
                              )}
                            >
                              {stat}
                              {currentBonus > 0 && <span>+{currentBonus}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Skill Proficiencies (Choose 2)</p>
                      <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto pr-2 scrollbar-thin">
                        {BACKGROUND_CUSTOMIZATION_POOLS.skills.map(skill => {
                          const isSelected = customBackground.skill_proficiencies.includes(skill);
                          return (
                            <button
                              key={skill}
                              onClick={() => {
                                setCustomBackground(prev => {
                                  let next = [...prev.skill_proficiencies];
                                  if (isSelected) next = next.filter(s => s !== skill);
                                  else if (next.length < 2) next.push(skill);
                                  return { ...prev, skill_proficiencies: next as [string, string] };
                                });
                              }}
                              className={cn(
                                "px-2 py-1.5 rounded-md border text-[10px] font-bold text-left transition-all",
                                isSelected 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                                  : "bg-white/40 border-dnd-gold/10 text-dnd-ink/40 hover:border-dnd-gold/40"
                              )}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    {/* Tool */}
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Tool Proficiency</p>
                      <select 
                        className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-3 py-2 text-xs font-serif"
                        value={customBackground.tool_proficiency || ''}
                        onChange={(e) => setCustomBackground(prev => ({ ...prev, tool_proficiency: e.target.value || null }))}
                      >
                        <option value="">None</option>
                        {BACKGROUND_CUSTOMIZATION_POOLS.tools.map(tool => (
                          <option key={tool} value={tool}>{tool}</option>
                        ))}
                      </select>
                    </div>

                    {/* Feat */}
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Origin Feat</p>
                      <select 
                        className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-3 py-2 text-xs font-serif mb-3"
                        value={customBackground.origin_feat}
                        onChange={(e) => {
                          setCustomBackground(prev => ({ ...prev, origin_feat: e.target.value as any }));
                          setFeatChoices({}); // Reset choices
                        }}
                      >
                        {Object.keys(ORIGIN_FEATS).map(feat => (
                          <option key={feat} value={feat}>{feat}</option>
                        ))}
                      </select>
                      
                      {/* Detailed Feat Info for Custom Mode */}
                      <div className="p-4 bg-dnd-red/5 border border-dnd-red/10 rounded-lg space-y-2">
                        <p className="text-[11px] font-serif italic text-dnd-ink/70 leading-tight whitespace-pre-wrap">
                          {ORIGIN_FEATS[customBackground.origin_feat]?.description}
                        </p>
                        <ul className="space-y-1 mt-2">
                          {ORIGIN_FEATS[customBackground.origin_feat]?.effects.map((effect, i) => (
                            <li key={i} className="text-[10px] font-sans font-bold text-dnd-ink/80 flex items-start gap-2 whitespace-pre-wrap">
                              <span className="text-dnd-red mt-0.5">◈</span>
                              {effect.note || effect.type.replace(/_/g, ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Feat Choices (Shared for Standard and Custom) */}
                  {(ORIGIN_FEATS[backgroundMode === 'standard' ? BACKGROUND_TEMPLATES[background].origin_feat : customBackground.origin_feat]?.requires_choice) && (
                    <div className="mt-8 pt-6 border-t-2 border-dnd-gold/20 space-y-6">
                      <div className="bg-dnd-red/5 p-6 rounded-xl border-2 border-dnd-red/20 animate-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-4">
                          <CheckCircle2 className="text-dnd-red" size={20} />
                          <h4 className="font-display font-black text-dnd-red uppercase text-sm tracking-widest">Post‑Creation Selection Required</h4>
                        </div>
                        <div className="space-y-6">
                          {/* We can implement specific selectors here based on feat name */}
                          {/* For now, a generic skilled/magic initiate handle */}
                          <div className="space-y-2">
                             <p className="text-xs font-sans font-bold text-dnd-ink uppercase tracking-tight">Choose options for {backgroundMode === 'standard' ? BACKGROUND_TEMPLATES[background].origin_feat : customBackground.origin_feat}</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                               <p className="text-[10px] italic text-dnd-ink/60 col-span-full">You can add your skills, tools, cantrips, and spells directly in your character sheet under the Character section after creation. Don’t forget to select and add them once your character is complete!</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats Point Buy */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-2 border-dnd-gold/20 pb-2">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Attributes (Point Buy)</label>
              <span className="font-display text-sm font-black text-dnd-red">Points Remaining: {points}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(stats) as Attribute[]).map(stat => {
                const bgBonus = (backgroundMode === 'standard' 
                  ? BACKGROUND_TEMPLATES[background].ability_score_increases[stat] 
                  : customBackground.ability_increases[stat]) || 0;
                return (
                  <div key={stat} className="flex items-center justify-between p-3 bg-white/50 border-2 border-dnd-gold/10 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-display text-[10px] uppercase tracking-widest font-black text-dnd-ink">{stat}</span>
                      {bgBonus > 0 && <span className="text-[9px] text-dnd-red font-bold">+{bgBonus} from Background</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateStat(stat, -1)}
                        className="w-8 h-8 rounded-full bg-dnd-gold/10 border-2 border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-display text-lg w-6 text-center font-black">{stats[stat]}</span>
                      <button 
                        onClick={() => updateStat(stat, 1)}
                        className="w-8 h-8 rounded-full bg-dnd-gold/10 border-2 border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treasure */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-2 border-dnd-gold/20 pb-2">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Starting Treasure</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsTreasureSearchOpen(true)}
                  className="text-dnd-gold hover:text-dnd-red transition-colors"
                  title="Search Items"
                >
                  <Search size={14} />
                </button>
                <button 
                  onClick={() => setIsAddingTreasure(!isAddingTreasure)}
                  className="text-dnd-gold hover:text-dnd-red transition-colors"
                  title="Add Manually"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {isAddingTreasure && (
              <div className="p-4 bg-white/50 border-2 border-dnd-gold/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                <input 
                  type="text" 
                  value={manualTreasureName}
                  onChange={(e) => setManualTreasureName(e.target.value)}
                  placeholder="Treasure name..."
                  className="w-full bg-white border border-dnd-gold/20 rounded-lg px-4 py-2 font-serif focus:outline-none focus:border-dnd-red transition-all"
                />
                <button 
                  onClick={() => {
                    if (manualTreasureName.trim()) {
                      const newItem: Item = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: manualTreasureName.trim(),
                        type: 'Treasure',
                        description: 'Found during background story.',
                        isEquipped: false
                      };
                      setTreasureItems(prev => [...prev, newItem]);
                      setManualTreasureName('');
                      setIsAddingTreasure(false);
                    }
                  }}
                  className="w-full bg-dnd-ink text-dnd-gold py-2 rounded-lg text-xs font-black uppercase hover:bg-dnd-red hover:text-white transition-all shadow-md"
                >
                  Add to Treasure
                </button>
              </div>
            )}

            {isTreasureSearchOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dnd-ink/80 backdrop-blur-sm">
                <div className="bg-dnd-paper border-4 border-dnd-gold rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b-2 border-dnd-gold flex justify-between items-center bg-dnd-parchment/30">
                    <h3 className="font-display font-black uppercase text-xl text-dnd-ink tracking-tight flex items-center gap-2">
                      <Search className="w-5 h-5 text-dnd-red" /> Search Items
                    </h3>
                    <button onClick={() => setIsTreasureSearchOpen(false)} className="p-2 hover:bg-dnd-red/10 rounded-full transition-colors">
                      <X className="w-6 h-6 text-dnd-red" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                    <ItemsList onItemSelect={(name) => {
                      const itemData = ((ITEMS_DATA as any) as any[]).find((i: any) => i.Name === name);
                      if (itemData) {
                        const item = mapLootItemToItem(itemData);
                        item.type = 'Treasure'; // Force into treasure pool
                        setTreasureItems(prev => [...prev, item]);
                      }
                      setIsTreasureSearchOpen(false);
                    }} />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {treasureItems.map((item, idx) => (
                <div key={item.id + idx} className="flex items-center justify-between p-3 bg-white/50 border border-dnd-gold/20 rounded-lg group hover:border-dnd-gold transition-all">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-dnd-gold" />
                    <span className="text-sm font-serif italic text-dnd-ink">{item.name}</span>
                  </div>
                  <button 
                    onClick={() => setTreasureItems(prev => prev.filter(i => i.id !== item.id))}
                    className="text-dnd-red/40 hover:text-dnd-red transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {treasureItems.length === 0 && (
                <div className="col-span-full py-6 text-center border-2 border-dashed border-dnd-gold/10 rounded-xl">
                  <p className="text-sm text-dnd-ink/30 italic">No starting treasure selected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!name.trim() || points > 0}
          className="w-full bg-dnd-red disabled:bg-dnd-ink/10 disabled:text-dnd-ink/20 text-dnd-parchment py-5 rounded-lg font-display uppercase tracking-[0.3em] font-black text-lg hover:bg-red-800 transition-all shadow-xl border-2 border-dnd-gold"
        >
          {points > 0 ? `Distribute points (${points})` : "Start Adventure"}
        </button>
      </motion.div>
    </div>
  );
}
