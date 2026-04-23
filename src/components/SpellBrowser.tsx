import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, BookOpen, ChevronRight, ChevronDown, Sparkles, X, Info } from 'lucide-react';
import { Spell } from '../types';
import { loadSpells } from '../services/spellService';
import { cn } from '../lib/utils';

interface SpellBrowserProps {
  onAddSpell?: (spell: Spell) => void;
  onRemoveSpell?: (spellName: string) => void;
  knownSpells?: Spell[];
}

export const SpellBrowser: React.FC<SpellBrowserProps> = ({ onAddSpell, onRemoveSpell, knownSpells }) => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSchool, setSelectedSchool] = useState<string>('All');
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadSpells();
    setSpells(data);
    setIsLoading(false);
  }, []);

  const levels = useMemo(() => ['All', ...Array.from(new Set(spells.map(s => s.level))).sort((a, b) => {
    if (a === 'Cantrip') return -1;
    if (b === 'Cantrip') return 1;
    return parseInt(a as string) - parseInt(b as string);
  })], [spells]);

  const classes = useMemo(() => {
    const allCls = spells.flatMap(s => s.classes.split(',').map(c => c.trim().split(' ')[0]));
    return ['All', ...Array.from(new Set(allCls)).sort()];
  }, [spells]);

  const schools = useMemo(() => ['All', ...Array.from(new Set(spells.map(s => s.school.split(' ')[0]))).sort()], [spells]);

  const filteredSpells = useMemo(() => {
    return spells.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || spell.level === selectedLevel;
      const matchesClass = selectedClass === 'All' || (spell.classes || "").toLowerCase().includes(selectedClass.toLowerCase());
      const matchesSchool = selectedSchool === 'All' || (spell.school || "").toLowerCase().includes(selectedSchool.toLowerCase());
      return matchesSearch && matchesLevel && matchesClass && matchesSchool;
    });
  }, [spells, searchTerm, selectedLevel, selectedClass, selectedSchool]);

  const isSpellKnown = (name: string) => knownSpells?.some(s => s.name === name);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dnd-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-dnd-parchment border border-dnd-gold/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-dnd-gold/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-dnd-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-dnd-ink tracking-tight">Spell Compendium</h2>
            <p className="text-[10px] font-bold uppercase text-dnd-ink/40 tracking-widest">D&D 5.5 Edition (2024 PHB)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40" />
            <input
              type="text"
              placeholder="Search spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-dnd-gold/20 rounded-xl outline-none focus:border-dnd-red transition-all text-sm font-bold"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-dnd-gold/20 rounded-xl outline-none focus:border-dnd-red transition-all text-sm font-bold appearance-none cursor-pointer"
            >
              <option value="All">All Levels</option>
              {levels.filter(l => l !== 'All').map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-dnd-gold/20 rounded-xl outline-none focus:border-dnd-red transition-all text-sm font-bold appearance-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              {classes.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredSpells.length > 0 ? (
          filteredSpells.slice(0, 50).map((spell, idx) => (
            <div 
              key={`${spell.name}-${idx}`}
              className={cn(
                "bg-dnd-parchment border border-dnd-gold/20 rounded-2xl overflow-hidden transition-all",
                expandedSpell === spell.name ? "ring-2 ring-dnd-red/30 shadow-2xl" : "hover:border-dnd-red/40"
              )}
            >
              <div className="flex items-center">
                <button 
                  onClick={() => setExpandedSpell(expandedSpell === spell.name ? null : spell.name)}
                  className="flex-1 p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-black",
                      spell.level === 'Cantrip' ? "bg-slate-100 text-slate-500" : "bg-dnd-red/10 text-dnd-red"
                    )}>
                      {spell.level === 'Cantrip' ? 'C' : spell.level.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-dnd-ink">{spell.name}</h3>
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-dnd-ink/40">
                        <span>{spell.school}</span>
                        <span className="w-1 h-1 rounded-full bg-dnd-gold/40" />
                        <span>{spell.level === 'Cantrip' ? 'Cantrip' : `Level ${spell.level}`}</span>
                      </div>
                    </div>
                  </div>
                  {expandedSpell === spell.name ? <ChevronDown className="w-5 h-5 text-dnd-gold" /> : <ChevronRight className="w-5 h-5 text-dnd-gold" />}
                </button>
                
                {onAddSpell && (
                  <div className="pr-4">
                    {isSpellKnown(spell.name) ? (
                      <button 
                        onClick={() => onRemoveSpell?.(spell.name)}
                        className="p-2 bg-dnd-red/10 text-dnd-red rounded-lg hover:bg-dnd-red/20 transition-colors"
                        title="Remove from spellbook"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onAddSpell(spell)}
                        className="p-2 bg-emerald-600/10 text-emerald-600 rounded-lg hover:bg-emerald-600/20 transition-colors"
                        title="Add to spellbook"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {expandedSpell === spell.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dnd-gold/10"
                  >
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/40">Casting Time</p>
                          <p className="text-xs font-bold text-dnd-ink">{spell.castingTime}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/40">Range</p>
                          <p className="text-xs font-bold text-dnd-ink">{spell.range}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/40">Components</p>
                          <p className="text-xs font-bold text-dnd-ink">{spell.components}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/40">Duration</p>
                          <p className="text-xs font-bold text-dnd-ink">{spell.duration}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/40">Classes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {spell.classes.split(',').map(cls => (
                            <span key={cls} className="px-2 py-0.5 bg-dnd-gold/10 rounded text-[9px] font-bold uppercase text-dnd-gold">
                              {cls.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none">
                        <div className="text-xs leading-relaxed text-dnd-ink/80 whitespace-pre-wrap font-serif italic">
                          {spell.text}
                        </div>
                      </div>

                      {spell.atHigherLevels && (
                        <div className="p-4 bg-dnd-gold/5 rounded-xl border border-dnd-gold/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3 h-3 text-dnd-gold" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-dnd-gold">At Higher Levels</p>
                          </div>
                          <p className="text-xs leading-relaxed text-dnd-ink/70 italic">
                            {spell.atHigherLevels}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-dnd-gold/10">
                        <p className="text-[9px] font-bold text-dnd-ink/30 uppercase tracking-widest">
                          {spell.source} — Page {spell.page}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="bg-dnd-parchment border border-dnd-gold/20 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-dnd-gold/5 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-dnd-gold/20" />
            </div>
            <div>
              <p className="text-lg font-serif italic text-dnd-ink/60">No spells found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('All');
                  setSelectedClass('All');
                  setSelectedSchool('All');
                }}
                className="text-dnd-red text-xs font-bold uppercase mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
        
        {filteredSpells.length > 50 && (
          <p className="text-center text-[10px] font-bold uppercase text-dnd-ink/40 tracking-widest py-4">
            Showing first 50 of {filteredSpells.length} results. Refine your search to find more.
          </p>
        )}
      </div>
    </div>
  );
};
