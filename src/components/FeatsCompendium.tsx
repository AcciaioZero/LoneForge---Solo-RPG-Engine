import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Shield, 
  Sword, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  Info,
  Lightbulb,
  Award,
  ExternalLink,
  PlusCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { HelpButton } from './HelpOverlay';
import { 
  ALL_FEATS, 
  FeatCategory, 
  Feat, 
  getFeatsByCategory 
} from '../data/feats';

interface FeatsCompendiumProps {
  onAddFeat?: (feat: Feat) => void;
  characterFeats?: string[]; // Names of feats already owned
}

export function FeatsCompendium({ onAddFeat, characterFeats = [] }: FeatsCompendiumProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeatCategory | 'All'>('All');
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

  const categories: (FeatCategory | 'All')[] = [
    'All',
    'Origin Feat',
    'General Feat',
    'Fighting Style Feat',
    'Epic Boon Feat'
  ];

  const filteredFeats = useMemo(() => {
    let feats = Object.values(ALL_FEATS);

    if (selectedCategory !== 'All') {
      feats = feats.filter(f => f.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      feats = feats.filter(f => 
        f.name.toLowerCase().includes(lowerSearch) || 
        f.description.toLowerCase().includes(lowerSearch)
      );
    }

    return feats.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory]);

  const toggleFeat = (name: string) => {
    setExpandedFeat(expandedFeat === name ? null : name);
  };

  const getCategoryIcon = (category: FeatCategory) => {
    switch (category) {
      case 'Origin Feat': return <Lightbulb className="w-4 h-4" />;
      case 'General Feat': return <BookOpen className="w-4 h-4" />;
      case 'Fighting Style Feat': return <Sword className="w-4 h-4" />;
      case 'Epic Boon Feat': return <Zap className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: FeatCategory) => {
    switch (category) {
      case 'Origin Feat': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'General Feat': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Fighting Style Feat': return 'text-red-600 bg-red-50 border-red-100';
      case 'Epic Boon Feat': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-dnd-gold" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-dnd-gold/10 text-dnd-gold">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-3xl font-display font-black tracking-tighter text-dnd-ink uppercase leading-none">Feat Compendium</h2>
                <HelpButton sectionKey="feats" size="sm" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] font-sans font-black text-dnd-red mt-1">Heroic Training & Abilities</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40 group-focus-within:text-dnd-gold transition-colors" />
              <input 
                type="text"
                placeholder="Search feats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/50 border-2 border-dnd-gold/20 rounded-xl text-sm focus:outline-none focus:border-dnd-gold transition-all w-full sm:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="pl-10 pr-8 py-2 bg-white/50 border-2 border-dnd-gold/20 rounded-xl text-sm focus:outline-none focus:border-dnd-gold appearance-none transition-all cursor-pointer w-full"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(1).map((cat) => {
          const count = Object.values(ALL_FEATS).filter(f => f.category === cat).length;
          return (
            <div
              key={cat as string}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCategory(cat)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategory(cat);
                }
              }}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-1 cursor-pointer",
                selectedCategory === cat 
                  ? "bg-dnd-ink border-dnd-gold text-dnd-parchment shadow-lg scale-105" 
                  : "bg-white border-dnd-gold/10 text-dnd-ink hover:border-dnd-gold/30"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg w-fit",
                selectedCategory === cat ? "bg-dnd-gold/20 text-dnd-gold" : "bg-dnd-gold/10 text-dnd-gold"
              )}>
                {getCategoryIcon(cat as FeatCategory)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{cat}</span>
              <span className="text-xl font-display font-black leading-none">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Feat List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFeats.map((feat) => (
          <motion.div
            layout
            key={feat.name}
            className={cn(
              "bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300",
              expandedFeat === feat.name 
                ? "border-dnd-gold shadow-2xl ring-1 ring-dnd-gold/20" 
                : "border-dnd-gold/10 hover:border-dnd-gold/30 shadow-sm"
            )}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleFeat(feat.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFeat(feat.name);
                }
              }}
              className="w-full p-4 flex items-center justify-between text-left group cursor-pointer select-none"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  expandedFeat === feat.name ? "bg-dnd-gold text-dnd-ink" : "bg-dnd-gold/10 text-dnd-gold group-hover:bg-dnd-gold/20"
                )}>
                  {getCategoryIcon(feat.category)}
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-dnd-ink leading-none">{feat.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border",
                      getCategoryColor(feat.category)
                    )}>
                      {feat.category}
                    </span>
                    {feat.prerequisite && (
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-dnd-red/60 italic flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        Prerequisite: {feat.prerequisite.level ? `Level ${feat.prerequisite.level}+` : 'Specific'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onAddFeat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFeat(feat);
                    }}
                    disabled={characterFeats.includes(feat.name)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      characterFeats.includes(feat.name)
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                        : "bg-dnd-gold text-dnd-ink hover:bg-dnd-red hover:text-white shadow-sm hover:shadow-md"
                    )}
                  >
                    {characterFeats.includes(feat.name) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add to character
                      </>
                    )}
                  </button>
                )}
                <div className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  expandedFeat === feat.name ? "bg-dnd-gold/10 text-dnd-gold rotate-180" : "text-dnd-ink/20 group-hover:text-dnd-ink/40"
                )}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedFeat === feat.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="p-6 pt-0 border-t border-dnd-gold/10 space-y-6">
                    {/* Description */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-dnd-gold/20 rounded-full" />
                      <p className="pl-4 text-sm leading-relaxed text-dnd-ink/80 italic font-serif whitespace-pre-wrap">
                        "{feat.description?.replace(/\\n/g, '\n')}"
                      </p>
                    </div>

                    {/* Requirements & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink opacity-40 flex items-center gap-2">
                          <Info className="w-3 h-3" />
                          Requirements
                        </h4>
                        <div className="bg-dnd-parchment/30 rounded-xl p-4 border border-dnd-gold/5 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-dnd-ink/60 uppercase tracking-wider">Level</span>
                            <span className="font-black text-dnd-ink">{feat.prerequisite?.level || 1}</span>
                          </div>
                          {feat.prerequisite?.ability && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-dnd-ink/60 uppercase tracking-wider">Ability Scores</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(feat.prerequisite.ability).map(([ability, score]) => (
                                  <span key={ability} className="px-2 py-1 bg-white rounded border border-dnd-gold/10 text-[10px] font-black">
                                    {ability} {score}+
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {feat.prerequisite?.ability_or && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-dnd-ink/60 uppercase tracking-wider">Ability Score (Optional)</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(feat.prerequisite.ability_or).map(([ability, score], idx, arr) => (
                                  <React.Fragment key={ability}>
                                    <span className="px-2 py-1 bg-white rounded border border-dnd-gold/10 text-[10px] font-black">
                                      {ability} {score}+
                                    </span>
                                    {idx < arr.length - 1 && <span className="text-[8px] font-black self-center opacity-40">OR</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                          {feat.prerequisite?.proficiency && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-dnd-ink/60 uppercase tracking-wider">Proficiency</span>
                              <span className="font-black text-dnd-ink text-right">{feat.prerequisite.proficiency}</span>
                            </div>
                          )}
                          {!feat.prerequisite && (
                            <div className="text-xs font-black text-dnd-ink/40 uppercase italic">No specific requirements</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink opacity-40 flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          Properties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className={cn(
                            "px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                            feat.repeatable ? "bg-green-50 border-green-100 text-green-700" : "bg-slate-50 border-slate-100 text-slate-500"
                          )}>
                            {feat.repeatable ? 'Repeatable' : 'One-time selection'}
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest">
                            {feat.source === 'PHB_2024_Compatible' ? 'PHB 2024 compatible' : 'LoneForge Original'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Effects */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink opacity-40 flex items-center gap-2">
                         <Sword className="w-3 h-3" />
                         Feat Benefits & Effects
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {feat.effects.map((effect, idx) => (
                          <div key={idx} className="bg-white border border-dnd-gold/10 rounded-xl p-4 flex gap-3 group/effect hover:border-dnd-gold/40 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-dnd-gold/5 text-dnd-gold flex items-center justify-center flex-shrink-0 group-hover/effect:bg-dnd-gold/10 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-dnd-ink uppercase tracking-wider leading-tight">
                                {effect.type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-dnd-ink/70 leading-normal">
                                {effect.note || `${effect.value ? effect.value + ' ' : ''}${effect.target || ''}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Choices */}
                    {feat.requires_choice && (
                      <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-200">
                             <ExternalLink className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest leading-none">Decision Required</h4>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">Multi-choice availability</p>
                          </div>
                        </div>
                        <p className="text-sm text-indigo-800 bg-white/50 p-3 rounded-lg border border-indigo-200/50">
                          {feat.requires_choice.note || `Choose ${feat.requires_choice.count} ${feat.requires_choice.type}(s) from the available pool.`}
                        </p>
                        {feat.requires_choice.pool && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {feat.requires_choice.pool.slice(0, 10).map((item) => (
                              <span key={item} className="text-[10px] font-bold px-2 py-1 bg-white border border-indigo-200 text-indigo-700 rounded shadow-sm">
                                {item}
                              </span>
                            ))}
                            {(feat.requires_choice.pool.length > 10) && (
                              <span className="text-[10px] font-black text-indigo-400 self-center">+ {feat.requires_choice.pool.length - 10} more...</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filteredFeats.length === 0 && (
        <div className="bg-dnd-paper border-2 border-dashed border-dnd-gold/30 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-dnd-gold/10 text-dnd-gold rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 opacity-20" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-dnd-ink/40">No Feats Found</h3>
            <p className="text-sm text-dnd-ink/30 italic">Try adjusting your search or category filters</p>
          </div>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="text-xs font-black uppercase tracking-widest text-dnd-gold hover:text-dnd-red transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
