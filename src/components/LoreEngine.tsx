/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  ChevronRight, 
  History, 
  BookOpen, 
  Scroll, 
  Ghost, 
  Cloud, 
  Castle, 
  Sword,
  Search,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { 
  generateLore, 
  LORE_MODULES, 
  LoreResult, 
  randomizeSlot, 
  updateSlotValue 
} from '../services/loreEngine';
import { cn } from '../lib/utils';
import { HelpButton } from './HelpOverlay';

const MODULE_ICONS: Record<string, any> = {
  myths_folklore: History,
  gods_planes: Cloud,
  lost_civilizations_history: Castle,
  relics_artifacts: Sword,
  cultures_factions: BookOpen,
  monster_origins: Ghost,
  prophecies_omens: Scroll,
};

const MODULE_LABELS: Record<string, string> = {
  myths_folklore: "Myths & Folklore",
  gods_planes: "Gods & the Planes",
  lost_civilizations_history: "Lost Civilizations",
  relics_artifacts: "Relics & Artifacts",
  cultures_factions: "Cultures & Factions",
  monster_origins: "Monster Origins",
  prophecies_omens: "Prophecies & Omens",
};

const SUB_TYPES: Record<string, string[]> = {
  gods_planes: ['deity', 'plane'],
  lost_civilizations_history: ['civilization', 'event', 'combined'],
  prophecies_omens: ['prophecy', 'omen', 'vision'],
};

const SUB_TYPE_LABELS: Record<string, string> = {
  deity: "Deity",
  plane: "Plane",
  civilization: "Civilization",
  event: "Historical Event",
  combined: "Civ & Event",
  prophecy: "Prophecy",
  omen: "Omen",
  vision: "Vision",
};

interface LoreEngineProps {
  onAddNote?: (title: string, content: string) => void;
}

export const LoreEngine: React.FC<LoreEngineProps> = ({ onAddNote }) => {
  const [selectedModule, setSelectedModule] = useState(LORE_MODULES[0]);
  const [selectedSubType, setSelectedSubType] = useState<string | undefined>(undefined);
  const [lore, setLore] = useState<LoreResult | null>(null);
  const [activeSlot, setActiveSlot] = useState<{ name: string, value: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [history, setHistory] = useState<LoreResult[]>([]);

  const handleModuleChange = (mod: string) => {
    setSelectedModule(mod);
    setSelectedSubType(undefined);
  };

  const handleGenerate = useCallback((moduleName: string, subType?: string, context?: Record<string, string>) => {
    const result = generateLore(moduleName, subType, context);
    setLore(result);
    setHistory(prev => [result, ...prev].slice(0, 5));
    setActiveSlot(null);
  }, []);

  const handleRandomizeSlot = (slotName: string) => {
    if (!lore) return;
    const updated = randomizeSlot(lore, slotName);
    const newValue = updated.resolvedSlots[slotName];
    setLore(updated);
    setActiveSlot({ name: slotName, value: newValue });
    setEditValue(newValue);
  };

  const handleUpdateSlot = () => {
    if (!lore || !activeSlot) return;
    const updated = updateSlotValue(lore, activeSlot.name, editValue);
    setLore(updated);
    setActiveSlot(null);
  };

  const renderRichText = (template: string, slots: Record<string, string>) => {
    if (typeof template !== 'string') return null;
    const parts = template.split(/(\{.*?\})/g);
    return parts.map((part, i) => {
      const match = part.match(/^\{(.*)\}$/);
      if (match) {
        const slotName = match[1];
        const value = slots[slotName];
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlot({ name: slotName, value });
              setEditValue(value);
            }}
            className="inline-block px-1 rounded-sm border-b border-dashed border-dnd-gold/60 text-dnd-gold hover:bg-dnd-gold/10 transition-colors font-medium"
          >
            {value}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-dnd-ivory/30">
      <div className="p-6 border-b border-dnd-gold/20 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-dnd-gold" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-serif font-bold text-dnd-ink">Lore Engine</h1>
              <HelpButton sectionKey="lore" size="sm" />
            </div>
            <p className="text-sm text-dnd-ink/60 italic">Weaving the threads of forgotten histories...</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {LORE_MODULES.map(mod => {
            const Icon = MODULE_ICONS[mod] || Search;
            const isSelected = selectedModule === mod;
            return (
              <button
                key={mod}
                onClick={() => handleModuleChange(mod)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider",
                  isSelected 
                    ? "bg-dnd-red text-white border-dnd-gold shadow-lg ring-2 ring-dnd-gold/20" 
                    : "bg-white border-dnd-gold/20 text-dnd-ink/70 hover:border-dnd-gold hover:bg-dnd-gold/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isSelected ? "text-dnd-gold" : "text-dnd-gold/60")} />
                <span className="text-center leading-tight whitespace-normal">{MODULE_LABELS[mod]}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {SUB_TYPES[selectedModule] && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-dnd-gold/10"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-gold/80 text-center">Specific focus</span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {SUB_TYPES[selectedModule].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedSubType(type)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                        selectedSubType === type
                          ? "bg-dnd-gold text-white border-dnd-gold shadow-md scale-105"
                          : "bg-white text-dnd-ink/60 border-dnd-gold/20 hover:border-dnd-gold/50 hover:text-dnd-ink"
                      )}
                    >
                      {SUB_TYPE_LABELS[type] || type}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-dnd-gold/20 mx-2" />
                  <button
                    onClick={() => setSelectedSubType(undefined)}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                      selectedSubType === undefined
                        ? "bg-dnd-gold text-white border-dnd-gold shadow-md scale-105"
                        : "bg-white text-dnd-ink/60 border-dnd-gold/20 hover:border-dnd-gold/50 hover:text-dnd-ink"
                    )}
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => handleGenerate(selectedModule, selectedSubType)}
          className="w-full mt-6 py-4 rounded-xl bg-dnd-red text-white font-display uppercase tracking-[0.3em] font-black text-sm flex items-center justify-center gap-3 hover:bg-red-800 transition-all shadow-xl border-2 border-dnd-gold group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-dnd-gold" />
          Generate Threads
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {lore ? (
              <motion.div
                key={lore.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-dnd-gold font-black bg-dnd-ink/5 px-3 py-1 rounded-full border border-dnd-gold/20">
                    {MODULE_LABELS[lore.module]} {lore.subType ? `• ${SUB_TYPE_LABELS[lore.subType] || lore.subType.replace(/_/g, ' ')}` : ''}
                  </span>
                  <h2 className="text-4xl font-display font-black text-dnd-ink leading-tight drop-shadow-sm px-4">
                    {renderRichText(lore.templates.title, lore.resolvedSlots)}
                  </h2>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-6 bg-gradient-to-b from-dnd-gold/10 via-transparent to-dnd-gold/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  <div className="relative p-10 rounded-3xl bg-white/60 border-2 border-dnd-gold/10 backdrop-blur-sm shadow-xl parchment-texture">
                    <div className="space-y-8 text-xl leading-relaxed text-dnd-ink/90 font-serif whitespace-pre-wrap italic text-center">
                      {(lore.templates.voices || []).map((v, idx) => (
                        <div key={idx} className="relative px-4">
                          {idx > 0 && (
                            <div className="my-10 flex items-center justify-center gap-4">
                              <div className="h-px bg-dnd-gold/30 flex-1" />
                              <BookOpen className="w-4 h-4 text-dnd-gold/40" />
                              <div className="h-px bg-dnd-gold/30 flex-1" />
                            </div>
                          )}
                          {renderRichText(v, lore.resolvedSlots)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border-2 border-dnd-gold/20 bg-dnd-gold/5 flex gap-5 items-center relative overflow-hidden group/hook">
                  <div className="absolute inset-0 bg-dnd-gold/5 translate-x-full group-hover/hook:translate-x-0 transition-transform duration-500" />
                  <div className="w-12 h-12 rounded-full bg-dnd-gold/20 flex items-center justify-center shrink-0 border border-dnd-gold/30 relative">
                    <MessageSquare className="w-6 h-6 text-dnd-gold" />
                  </div>
                  <div className="space-y-1 relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-gold">The Narrative Hook</p>
                    <p className="text-base text-dnd-ink/90 font-serif italic leading-relaxed">
                      {renderRichText(lore.templates.hook, lore.resolvedSlots)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 pt-4 pb-12">
                  <button
                    onClick={() => onAddNote?.(lore.title, `${lore.voice}\n\nHOOK: ${lore.hook}`)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-dnd-gold/30 text-xs font-black uppercase tracking-widest text-dnd-gold hover:bg-dnd-gold hover:text-white transition-all shadow-md active:scale-95"
                  >
                    <Scroll className="w-4 h-4" />
                    Archive Lore
                  </button>
                  
                  {lore.connection && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleGenerate(lore.connection!.module, undefined, lore.resolvedSlots)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-dnd-red text-white text-xs font-black uppercase tracking-widest hover:shadow-2xl transition-all shadow-xl border-2 border-dnd-gold active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4 text-dnd-gold" />
                      Follow Thread: {lore.connection.label}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-dnd-gold/10 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="relative p-8 rounded-full border-2 border-dashed border-dnd-gold/20">
                    <Scroll className="w-24 h-24 text-dnd-gold/20" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black text-dnd-ink/40 uppercase tracking-[0.4em]">Oracle Silent</h3>
                  <p className="text-sm text-dnd-ink/30 max-w-sm mx-auto font-serif italic">
                    The tapestries of time await your touch. Select a module and pull the threads of forgotten memory.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeSlot && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setActiveSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border-2 border-dnd-gold/40 p-8 w-full max-w-sm overflow-hidden relative parchment-texture"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-dnd-gold" />
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-dnd-gold/10 rounded-lg">
                    <Search className="w-5 h-5 text-dnd-gold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-dnd-ink/40 block">Editing Fragment</span>
                    <span className="text-xs font-black uppercase text-dnd-gold">
                      {(activeSlot.name || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRandomizeSlot(activeSlot.name)}
                  className="p-2.5 rounded-full bg-dnd-gold/10 text-dnd-gold hover:bg-dnd-gold hover:text-white transition-all shadow-sm group"
                  title="Randomize"
                >
                  <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-dnd-gold/20 rounded-2xl text-dnd-ink font-serif text-lg italic focus:outline-none focus:border-dnd-gold focus:ring-4 focus:ring-dnd-gold/10 transition-all shadow-inner"
                    autoFocus
                  />
                  <Edit3 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dnd-gold/20 group-focus-within:text-dnd-gold transition-colors" />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveSlot(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-dnd-ivory border-2 border-dnd-gold/10 text-xs font-black uppercase tracking-widest text-dnd-ink hover:bg-dnd-gold/5 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleUpdateSlot}
                    className="flex-1 py-3 px-4 rounded-xl bg-dnd-red text-white text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg border-2 border-dnd-gold/20"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Mini Connection Notification if connection exists but wasn't clicked */}
      {lore?.connection && (
        <div className="fixed bottom-6 right-6 z-40">
           <div className="flex items-center gap-3 p-3 bg-white text-dnd-ink rounded-2xl shadow-2xl border-2 border-dnd-gold animate-in slide-in-from-right duration-500">
             <div className="w-8 h-8 rounded-full bg-dnd-gold/20 flex items-center justify-center">
               <AlertCircle className="w-4 h-4 text-dnd-gold" />
             </div>
             <div className="text-xs font-bold mr-2">
               Found a connection!
             </div>
             <button 
              onClick={() => handleGenerate(lore.connection!.module, undefined, lore.resolvedSlots)}
              className="px-3 py-1.5 rounded-lg bg-dnd-red text-white hover:bg-dnd-red/90 transition-colors font-bold text-[10px] whitespace-nowrap shadow-sm"
             >
               Follow the link
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
