import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, CheckCircle2, Coins, Search, X, Trash2 } from 'lucide-react';
import { Character, Attribute, CharacterClass, Species, Background, Ability, SpellSlot, Item, Skill } from '../types';
import { INITIAL_CHARACTER, SPECIES_TEMPLATES, BACKGROUND_TEMPLATES } from '../constants';
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
    const spTemplate = SPECIES_TEMPLATES[species];

    // Apply background bonuses to stats
    const finalStats = { ...stats };
    Object.entries(bgTemplate.stats).forEach(([stat, bonus]) => {
      finalStats[stat as Attribute] += bonus;
    });

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
      background,
      stats: finalStats,
      hp: parseInt(classData.hit_die.replace('d', '')) + getModifier(finalStats['Constitution']),
      maxHp: parseInt(classData.hit_die.replace('d', '')) + getModifier(finalStats['Constitution']),
      baseAc: 10 + getModifier(finalStats['Dexterity']),
      proficiencies: [
        ...(classData.skill_choices.from.slice(0, classData.skill_choices.choose) as Skill[]), // Simplified: just take first N
        ...(bgTemplate.proficiencies || []),
        ...(spTemplate.traits.some(t => t.includes('Keen Senses')) ? ['Perception' as Skill] : [])
      ],
      savingThrowProficiencies: classData.saving_throws as Attribute[],
      speed: spTemplate.speed || 30,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Class */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Class</label>
              <div className="grid grid-cols-2 gap-2">
                {(CLASSES_DATA as any).map((c: any) => (
                  <button 
                    key={c.class.name}
                    onClick={() => setCharClass(c.class.name as CharacterClass)}
                    className={cn(
                      "px-4 py-3 rounded-lg border-2 text-[10px] font-display uppercase tracking-widest font-black transition-all shadow-sm",
                      charClass === c.class.name 
                        ? "bg-dnd-red border-dnd-gold text-dnd-parchment scale-105" 
                        : "bg-white/50 border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                    )}
                  >
                    {c.class.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Species */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Species</label>
              <select 
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-lg px-4 py-3 font-serif text-sm focus:outline-none focus:border-dnd-red transition-all mb-2"
              >
                {(Object.keys(SPECIES_TEMPLATES) as Species[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="bg-dnd-gold/5 border border-dnd-gold/20 rounded-lg p-4 space-y-3">
                <p className="text-[10px] text-dnd-ink/60 italic leading-relaxed font-serif">
                  {SPECIES_TEMPLATES[species].description}
                </p>
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-black text-dnd-gold tracking-widest border-b border-dnd-gold/10 pb-1">Species Traits</p>
                  <div className="grid grid-cols-1 gap-2">
                    {SPECIES_TEMPLATES[species].traits.map((trait, idx) => {
                      const [name, desc] = trait.split(': ');
                      return (
                        <div key={idx} className="flex flex-col">
                          <span className="text-[9px] font-black text-dnd-ink uppercase tracking-tighter">{name}</span>
                          <span className="text-[9px] text-dnd-ink/50 font-serif italic leading-tight">{desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Background</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(BACKGROUND_TEMPLATES) as Background[]).map(bg => (
                <button 
                  key={bg}
                  onClick={() => setBackground(bg)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 text-[9px] font-display uppercase tracking-widest font-black transition-all",
                    background === bg 
                      ? "bg-dnd-gold border-dnd-red text-dnd-ink scale-105" 
                      : "bg-white/50 border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-gold/50"
                  )}
                >
                  {bg}
                </button>
              ))}
            </div>
            <div className="bg-dnd-gold/5 border border-dnd-gold/20 rounded-lg p-4 space-y-2">
              <p className="text-xs font-serif italic text-dnd-ink/70">{BACKGROUND_TEMPLATES[background].description}</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-dnd-red" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
                    {Object.entries(BACKGROUND_TEMPLATES[background].stats).map(([stat, bonus]) => `${stat} +${bonus}`).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
                    {BACKGROUND_TEMPLATES[background].proficiencies.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Point Buy */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-2 border-dnd-gold/20 pb-2">
              <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Attributes (Point Buy)</label>
              <span className="font-display text-sm font-black text-dnd-red">Points Remaining: {points}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(stats) as Attribute[]).map(stat => {
                const bgBonus = BACKGROUND_TEMPLATES[background].stats[stat] || 0;
                return (
                  <div key={stat} className="flex items-center justify-between p-3 bg-white/50 border-2 border-dnd-gold/10 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-display text-[10px] uppercase tracking-widest font-black">{stat}</span>
                      {bgBonus > 0 && <span className="text-[9px] text-dnd-red font-bold">+{bgBonus} from Background</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateStat(stat, -1)}
                        className="w-8 h-8 rounded-full bg-dnd-gold/10 border-2 border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-display text-lg w-6 text-center font-black">{stats[stat]}</span>
                      <button 
                        onClick={() => updateStat(stat, 1)}
                        className="w-8 h-8 rounded-full bg-dnd-gold/10 border-2 border-dnd-gold/20 flex items-center justify-center hover:bg-dnd-red hover:text-white transition-all"
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
