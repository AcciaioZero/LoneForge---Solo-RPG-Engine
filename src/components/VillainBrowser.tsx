import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, User, Sword, Shield, Scroll, Zap, 
  Target, Info, Eye, AlertCircle, Quote, MapPin,
  Flame, Crown, Ghost, ChevronDown, ChevronUp
} from 'lucide-react';
import { VILLAINS, Villain, Scope } from '../data/villain';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { HelpButton } from './HelpOverlay';

interface VillainBrowserProps {
  activeScope: Scope;
  onScopeChange: (scope: Scope) => void;
}

export const VillainBrowser: React.FC<VillainBrowserProps> = ({ activeScope, onScopeChange }) => {
  const [dungeonTypeFilter, setDungeonTypeFilter] = useState<string>('all');
  const [crSortOrder, setCrSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  // Reset filters when scope changes
  React.useEffect(() => {
    setDungeonTypeFilter('all');
  }, [activeScope]);

  const dungeonTypes = useMemo(() => {
    const types = new Set<string>();
    VILLAINS.forEach(v => {
      if (v.scope === 'dungeon_boss' && v.dungeon_type) {
        types.add(v.dungeon_type);
      }
    });
    return Array.from(types).sort();
  }, []);

  const filteredAndSortedVillains = useMemo(() => {
    let result = VILLAINS.filter(v => v.scope === activeScope);

    // Apply Dungeon Type Filter
    if (activeScope === 'dungeon_boss' && dungeonTypeFilter !== 'all') {
      result = result.filter(v => v.dungeon_type === dungeonTypeFilter);
    }

    // Apply Sorting
    if (crSortOrder !== 'none') {
      result = [...result].sort((a, b) => {
        const crA = a.cr ?? a.cr_equivalent ?? 0;
        const crB = b.cr ?? b.cr_equivalent ?? 0;
        return crSortOrder === 'asc' ? crA - crB : crB - crA;
      });
    }

    return result;
  }, [activeScope, dungeonTypeFilter, crSortOrder]);

  const scopeInfo = {
    dungeon_boss: {
      label: 'Dungeon Bosses',
      description: 'Powerful foes waiting at the end of a crawl.',
      icon: <Skull className="w-5 h-5" />,
      accent: 'text-red-600',
      bg: 'bg-red-50'
    },
    local_villain: {
      label: 'Local Villains',
      description: 'Regional threats with complex plans and influence.',
      icon: <MapPin className="w-5 h-5" />,
      accent: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    bbeg: {
      label: 'BBEGs',
      description: 'World-level threats and campaign-defining antagonists.',
      icon: <Crown className="w-5 h-5" />,
      accent: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-dnd-ink">
            Villain <span className="text-dnd-red">Compendium</span>
          </h2>
          <HelpButton sectionKey="villain" size="md" />
        </div>
        <p className="text-sm font-serif italic text-dnd-ink/60">
          Potential antagonists for your campaign, from dungeon guardians to world-bending threats.
        </p>
      </div>

      {/* Scope Switcher */}
      <div className="flex flex-wrap justify-center gap-4">
        {(['dungeon_boss', 'local_villain', 'bbeg'] as Scope[]).map(scope => (
          <button
            key={scope}
            onClick={() => onScopeChange(scope)}
            className={cn(
              "px-6 py-3 rounded-2xl border-2 font-display text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-3 shadow-sm",
              activeScope === scope 
                ? "bg-dnd-ink text-dnd-parchment border-dnd-red scale-105 shadow-md" 
                : "bg-dnd-paper border-dnd-gold/20 text-dnd-ink/60 hover:border-dnd-red/40 hover:bg-dnd-red/5"
            )}
          >
            {scopeInfo[scope].icon}
            {scopeInfo[scope].label}
          </button>
        ))}
      </div>

      {/* Filter & Sort Controls */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between bg-dnd-paper p-4 rounded-2xl border-2 border-dnd-gold/20 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {activeScope === 'dungeon_boss' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">Dungeon:</span>
              <select 
                value={dungeonTypeFilter}
                onChange={(e) => setDungeonTypeFilter(e.target.value)}
                className="bg-white border border-dnd-gold/20 rounded-lg px-3 py-1.5 text-xs font-serif focus:outline-none focus:ring-2 focus:ring-dnd-red/20"
              >
                <option value="all">All Locations</option>
                {dungeonTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">Sort CR:</span>
            <div className="flex bg-white border border-dnd-gold/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => setCrSortOrder(crSortOrder === 'asc' ? 'none' : 'asc')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase transition-colors border-r border-dnd-gold/20",
                  crSortOrder === 'asc' ? "bg-dnd-ink text-white" : "hover:bg-dnd-red/5 text-dnd-ink/60"
                )}
              >
                Low
              </button>
              <button 
                onClick={() => setCrSortOrder(crSortOrder === 'desc' ? 'none' : 'desc')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase transition-colors",
                  crSortOrder === 'desc' ? "bg-dnd-ink text-white" : "hover:bg-dnd-red/5 text-dnd-ink/60"
                )}
              >
                High
              </button>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">
          Showing {filteredAndSortedVillains.length} {scopeInfo[activeScope].label}
        </div>
      </div>

      {/* Scope Description */}
      <div className={cn(
        "p-4 rounded-xl border-2 text-center max-w-2xl mx-auto border-dashed",
        activeScope === 'dungeon_boss' ? "border-red-200 bg-red-50/30" :
        activeScope === 'local_villain' ? "border-amber-200 bg-amber-50/30" :
        "border-purple-200 bg-purple-50/30"
      )}>
        <p className={cn("text-xs font-black uppercase tracking-widest mb-1", scopeInfo[activeScope].accent)}>
          {scopeInfo[activeScope].label}
        </p>
        <p className="text-sm font-serif italic text-dnd-ink/70">
          {scopeInfo[activeScope].description}
        </p>
      </div>

      {/* Villain List */}
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedVillains.map((villain) => (
            <VillainCard key={villain.name} villain={villain} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const VillainCard: React.FC<{ villain: Villain }> = ({ villain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isBoss = villain.scope === 'dungeon_boss';
  const isLocal = villain.scope === 'local_villain';
  const isBBEG = villain.scope === 'bbeg';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "bg-dnd-paper border-4 border-dnd-gold rounded-3xl shadow-xl overflow-hidden flex flex-col relative group transition-all duration-300",
        isOpen ? "ring-4 ring-dnd-red/10 border-dnd-red/40" : "hover:border-dnd-red/20"
      )}
    >
      {/* Scope Header */}
      <div className={cn(
        "h-2 w-full",
        isBoss ? "bg-red-600" : isLocal ? "bg-amber-500" : "bg-purple-600"
      )} />

      <div className="p-6 flex-1 flex flex-col">
        {/* Name & Basic Info (Always Visible) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left space-y-1 focus:outline-none"
        >
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "text-2xl font-display font-black uppercase text-dnd-ink tracking-tight transition-colors",
              isOpen ? "text-dnd-red" : "group-hover:text-dnd-red"
            )}>
              {villain.name}
            </h3>
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border",
                isBoss ? "bg-red-50 text-red-700 border-red-200" :
                isLocal ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-purple-50 text-purple-700 border-purple-200"
              )}>
                {isBoss ? `CR ${villain.cr}` : `CR Equiv: ${villain.cr_equivalent}`}
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5 text-dnd-ink/30" /> : <ChevronDown className="w-5 h-5 text-dnd-ink/30" />}
            </div>
          </div>
          <p className="text-sm font-serif italic text-dnd-ink/60">
            {villain.race}{villain.age ? `, ${villain.age}` : ''}
          </p>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-60">
                  {/* Villain Image */}
                  <div className="w-full md:w-48 shrink-0">
                    <div className="w-full aspect-square md:h-100 md:w-100 relative rounded-2xl border-2 border-dnd-gold shadow-md bg-stone-100 overflow-hidden">
                      <img 
                        src={`${import.meta.env.BASE_URL}images/boss/${encodeURIComponent(villain.name)}.png`}
                        alt={villain.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 flex-col items-center justify-center bg-stone-50 text-dnd-ink/20 p-4 text-center">
                        <Skull className="w-12 h-12 mb-2 opacity-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Image Not Found</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {villain.true_name && (
                      <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest mb-1">
                        True Name: {villain.true_name}
                      </p>
                    )}

                    {/* Appearance */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-dnd-gold">
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Appearance</span>
                      </div>
                      <p className="text-sm font-serif leading-relaxed text-dnd-ink/80 bg-white/40 p-4 rounded-xl border border-dnd-gold/10">
                        {villain.description || villain.appearance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speech */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-dnd-gold">
                    <Quote className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Behavior & Speech</span>
                  </div>
                  <p className="text-sm font-serif italic leading-relaxed text-dnd-ink/70 pl-4 border-l-2 border-dnd-gold/20">
                    {villain.speech_pattern}
                  </p>
                </div>

                {/* Motivation & Secret */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Target className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Motivation</span>
                    </div>
                    <p className="text-xs font-serif text-dnd-ink/80 leading-relaxed">
                      {villain.motivation}
                    </p>
                  </div>
                  {villain.secret && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-rose-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dark Secret</span>
                      </div>
                      <p className="text-xs font-serif text-dnd-ink/80 leading-relaxed italic">
                        {villain.secret}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats & Power (Dungeon Boss vs Others) */}
                <div className="space-y-4 pt-4 border-t border-dnd-gold/10">
                  {isBoss && (
                    <div className="space-y-4">
                      {villain.suggested_abilities && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                            <Sword className="w-3.5 h-3.5" /> Suggested Abilities
                          </span>
                          <ul className="space-y-1">
                            {villain.suggested_abilities.map((ability, idx) => (
                              <li key={idx} className="text-xs font-serif text-dnd-ink/80 flex items-start gap-2">
                                <span className="text-red-400 mt-1.5">•</span>
                                <span>{ability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {villain.boss_loot && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5" /> Boss Loot
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {villain.boss_loot.map((loot, idx) => (
                              <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-medium">
                                {loot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(isLocal || isBBEG) && (
                    <div className="space-y-6">
                      {villain.personal_combat && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                            <Sword className="w-3.5 h-3.5" /> Personal Combat
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {villain.personal_combat.map((pc, idx) => (
                              <div key={idx} className="text-xs font-serif text-dnd-ink/80 bg-red-50/50 p-2 rounded border border-red-100 italic">
                                {pc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {villain.structural_power && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> Structural Power
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {villain.structural_power.map((sp, idx) => (
                              <div key={idx} className="text-xs font-serif text-dnd-ink/80 bg-indigo-50/50 p-2 rounded border border-indigo-100">
                                {sp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {villain.plan && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest flex items-center gap-2">
                            <Scroll className="w-3.5 h-3.5" /> The Plan
                          </span>
                          <div className="space-y-3">
                            {villain.plan.map((step, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                                    {idx + 1}
                                  </div>
                                  {idx < villain.plan!.length - 1 && <div className="w-0.5 h-full bg-purple-200 mt-1" />}
                                </div>
                                <p className="text-xs font-serif text-dnd-ink/80 leading-relaxed pb-4">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Weakness & Traces */}
                <div className="space-y-4 pt-4 border-t border-dnd-gold/10">
                  <div className="bg-red-50/30 border border-red-100 rounded-xl p-4 space-y-2">
                    <span className="text-[9px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                      <Target className="w-3 h-3" /> Critical Weakness
                    </span>
                    <p className="text-xs font-serif text-dnd-ink/80 leading-relaxed italic">
                      {villain.weakness}
                    </p>
                  </div>

                  {villain.traces && villain.traces.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] font-black uppercase text-dnd-gold tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Evidence & Traces
                      </span>
                      <div className="space-y-2">
                        {villain.traces.map((trace, idx) => (
                          <div key={idx} className="text-[11px] font-serif text-dnd-ink/60 bg-white shadow-sm border border-dnd-gold/10 p-2 rounded-lg italic">
                            "{trace}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Phase / Arc */}
                {(villain.final_phase || villain.arc) && (
                  <div className="mt-auto pt-6">
                    <div className="bg-dnd-ink text-dnd-parchment p-4 rounded-2xl space-y-3 shadow-lg">
                      <div className="flex items-center gap-2 text-dnd-gold">
                        <Flame className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{villain.arc ? 'Villainous Arc' : 'Final Phase'}</span>
                      </div>
                      <div className="text-xs font-serif leading-relaxed opacity-90 italic">
                        {Array.isArray(villain.arc) ? (
                          <div className="space-y-3">
                            {villain.arc.map((point, idx) => (
                              <p key={idx} className="border-l border-dnd-gold/30 pl-3 py-0.5">
                                {point}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p>{villain.arc || villain.final_phase}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
