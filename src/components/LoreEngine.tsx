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
      <div className="p-6 border-b border-dnd-gold/20 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-dnd-gold" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-dnd-ink">Lore Engine</h1>
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
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs font-medium",
                  isSelected 
                    ? "bg-dnd-red text-white border-dnd-gold shadow-lg scale-105" 
                    : "bg-white border-dnd-gold/20 text-dnd-ink/70 hover:border-dnd-gold hover:text-dnd-ink"
                )}
              >
                <Icon className={cn("w-5 h-5", isSelected ? "text-dnd-gold" : "text-dnd-gold/60")} />
                <span className="text-center leading-tight">{MODULE_LABELS[mod]}</span>
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
              className="mt-6 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-dnd-gold/5 rounded-xl border border-dnd-gold/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-dnd-gold/60 ml-2 mr-1">Select Subtype:</span>
                {SUB_TYPES[selectedModule].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedSubType(type)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                      selectedSubType === type
                        ? "bg-dnd-gold text-white shadow-sm"
                        : "bg-white/50 text-dnd-ink/60 hover:bg-white hover:text-dnd-ink"
                    )}
                  >
                    {SUB_TYPE_LABELS[type] || type}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedSubType(undefined)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    selectedSubType === undefined
                      ? "bg-dnd-gold text-white shadow-sm"
                      : "bg-white/50 text-dnd-ink/60 hover:bg-white hover:text-dnd-ink"
                  )}
                >
                  Random
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => handleGenerate(selectedModule, selectedSubType)}
          className="w-full mt-6 py-3 rounded-xl bg-dnd-gold text-white font-bold flex items-center justify-center gap-2 hover:bg-dnd-gold/90 transition-all shadow-md group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Generate {selectedSubType ? SUB_TYPE_LABELS[selectedSubType] : ''} Lore
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
                  <span className="text-[10px] uppercase tracking-widest text-dnd-gold font-bold px-2 py-0.5 rounded bg-dnd-gold/10">
                    {MODULE_LABELS[lore.module]} {(lore.subType || '').length > 0 ? `• ${lore.subType.replace(/_/g, ' ')}` : ''}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-dnd-ink leading-tight">
                    {renderRichText(lore.templates.title, lore.resolvedSlots)}
                  </h2>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-b from-dnd-gold/5 via-transparent to-dnd-gold/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-8 rounded-2xl bg-white/40 border border-dnd-gold/10 backdrop-blur-[2px] shadow-sm">
                    <div className="space-y-6 text-lg leading-relaxed text-dnd-ink/90 font-serif whitespace-pre-wrap italic">
                      {(lore.templates.voices || []).map((v, idx) => (
                        <div key={idx} className="relative">
                          {idx > 0 && <div className="my-6 border-t border-dnd-gold/20 w-1/4 mx-auto" />}
                          {renderRichText(v, lore.resolvedSlots)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-dnd-gold/20 bg-dnd-gold/5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-dnd-gold/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-dnd-gold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-dnd-ink">The Narrative Hook</p>
                    <p className="text-sm text-dnd-ink/80 italic">
                      {renderRichText(lore.templates.hook, lore.resolvedSlots)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <button
                    onClick={() => onAddNote?.(lore.title, `${lore.voice}\n\nHOOK: ${lore.hook}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-dnd-gold/30 text-xs font-bold text-dnd-gold hover:bg-dnd-gold hover:text-white transition-all shadow-sm"
                  >
                    <Scroll className="w-4 h-4" />
                    Record in Chronicles
                  </button>
                  
                  {lore.connection && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleGenerate(lore.connection!.module, undefined, lore.resolvedSlots)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dnd-red text-white text-xs font-bold hover:shadow-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-dnd-gold" />
                      {lore.connection.label}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-dnd-gold/20 blur-3xl rounded-full" />
                  <Scroll className="w-24 h-24 text-dnd-gold/40 relative animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-dnd-ink/60">No Lore Generated</h3>
                  <p className="text-sm text-dnd-ink/40 max-w-xs mx-auto">
                    Select a module and pull the threads of time to reveal hidden truths about the world.
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dnd-ink/40 backdrop-blur-sm"
            onClick={() => setActiveSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-dnd-gold/30 p-6 w-full max-w-sm overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-dnd-gold" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-dnd-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-dnd-ink/60">
                    Modifying: {(activeSlot.name || '').replace(/_/g, ' ')}
                  </span>
                </div>
                <button 
                  onClick={() => handleRandomizeSlot(activeSlot.name)}
                  className="p-1.5 rounded-full hover:bg-dnd-gold/10 text-dnd-gold transition-colors"
                  title="Randomize"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 bg-dnd-ivory/50 border border-dnd-gold/20 rounded-xl text-dnd-ink font-serif italic focus:outline-none focus:ring-2 focus:ring-dnd-gold/40 transition-all"
                    autoFocus
                  />
                  <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-gold/40" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSlot(null)}
                    className="flex-1 py-2 px-4 rounded-lg bg-dnd-ivory border border-dnd-gold/20 text-xs font-bold text-dnd-ink hover:bg-dnd-ivory/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSlot}
                    className="flex-1 py-2 px-4 rounded-lg bg-dnd-red text-white text-xs font-bold hover:bg-dnd-red/90 transition-colors"
                  >
                    Apply Change
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
