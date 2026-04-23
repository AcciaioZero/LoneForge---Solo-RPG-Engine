import React, { useState } from 'react';
import { UserPlus, RefreshCw, Trash2, Save, ChevronRight, User, Shield, Briefcase, Heart, Target, Key, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NPC } from '../types';
import { NPC_RACES, NPC_ALIGNMENTS, NPC_ROLES, NPC_DISPOSITIONS, NPC_TRAITS, NPC_GOALS, NPC_SECRETS, NPC_NAMES } from '../constants';
import { generateNPC, rollDice } from '../services/gameEngine';
import { cn } from '../lib/utils';

interface NpcGeneratorProps {
  npcHistory: NPC[];
  onAddNpc: (npc: NPC) => void;
  onRemoveNpc: (id: string) => void;
  onClearHistory: () => void;
  initialRole?: string;
  targetLocationName?: string | null;
}

export const NpcGenerator: React.FC<NpcGeneratorProps> = ({ 
  npcHistory, 
  onAddNpc, 
  onRemoveNpc, 
  onClearHistory,
  initialRole,
  targetLocationName
}) => {
  const [currentNpc, setCurrentNpc] = useState<NPC>(() => generateNPC(initialRole ? { role: initialRole } : {}));
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [viewingNpc, setViewingNpc] = useState<NPC | null>(null);

  // Update NPC if initialRole changes
  React.useEffect(() => {
    if (initialRole) {
      setCurrentNpc(generateNPC({ role: initialRole }));
    }
  }, [initialRole]);

  const handleRandomizeField = (field: keyof NPC) => {
    const randomNpc = generateNPC();
    setCurrentNpc(prev => ({
      ...prev,
      [field]: randomNpc[field]
    }));
  };

  const handleRandomizeAll = () => {
    setIsAutoGenerating(true);
    setTimeout(() => {
      setCurrentNpc(generateNPC());
      setIsAutoGenerating(false);
    }, 300);
  };

  const handleSaveNpc = () => {
    onAddNpc({ ...currentNpc, id: Math.random().toString(36).substr(2, 9) });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Controls */}
        <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl">
          {targetLocationName && (
            <div className="mb-6 p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-600 leading-none">Assigning to Location</p>
                <p className="text-xs font-bold text-dnd-ink">{targetLocationName}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-dnd-red" />
              <h2 className="text-2xl uppercase tracking-widest font-display font-bold text-dnd-red">NPC Generator</h2>
            </div>
            <button 
              onClick={handleRandomizeAll}
              disabled={isAutoGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-dnd-red text-dnd-parchment rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-dnd-red/90 transition-all shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isAutoGenerating && "animate-spin")} />
              Randomize All
            </button>
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Name</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={currentNpc.name}
                  onChange={(e) => setCurrentNpc(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif text-lg focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                />
                <button 
                  onClick={() => handleRandomizeField('name')}
                  className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Race */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Race</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.race}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, race: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_RACES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('race')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Role / Class */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Profession / Class</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.role}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, role: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('role')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Alignment</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.alignment}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, alignment: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('alignment')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Disposition */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Disposition</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.disposition}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, disposition: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_DISPOSITIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('disposition')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Traits */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Traits (Max 3)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentNpc.traits?.map((trait, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-dnd-gold/10 text-dnd-gold px-3 py-1 rounded-full border border-dnd-gold/20 text-[10px] font-bold uppercase">
                      {trait}
                      <button onClick={() => setCurrentNpc(prev => ({ ...prev, traits: prev.traits.filter((_, i) => i !== idx) }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!currentNpc.traits || currentNpc.traits.length < 3) && (
                    <select 
                      onChange={(e) => {
                        if (e.target.value && !currentNpc.traits.includes(e.target.value)) {
                          setCurrentNpc(prev => ({ ...prev, traits: [...prev.traits, e.target.value] }));
                        }
                        e.target.value = "";
                      }}
                      className="bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase focus:outline-none"
                    >
                      <option value="">+ Add Trait</option>
                      {NPC_TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )}
                </div>
                <button 
                  onClick={() => handleRandomizeField('traits')}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-dnd-gold hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Randomize Traits
                </button>
              </div>

              {/* Current Goal */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Current Goal</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.goal}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, goal: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('goal')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dark Secret */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40 ml-1">Dark Secret</label>
                <div className="flex gap-2">
                  <select 
                    value={currentNpc.secret}
                    onChange={(e) => setCurrentNpc(prev => ({ ...prev, secret: e.target.value }))}
                    className="flex-1 min-w-0 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-xl px-4 py-3 font-serif focus:outline-none focus:border-dnd-red/50 transition-all shadow-inner"
                  >
                    {NPC_SECRETS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => handleRandomizeField('secret')} className="p-3 bg-dnd-gold/10 border-2 border-dnd-gold/20 rounded-xl text-dnd-gold hover:bg-dnd-gold/20 transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveNpc}
              className="w-full py-4 bg-dnd-gold text-dnd-paper rounded-xl font-display font-bold uppercase tracking-widest text-lg hover:bg-dnd-gold/90 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              Add to NPC History
            </button>
          </div>
        </section>

        {/* NPC Preview Card */}
        <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-dnd-gold/5 rounded-bl-full -mr-16 -mt-16" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentNpc.name + currentNpc.race + currentNpc.role}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-display font-bold text-dnd-ink tracking-tight">{currentNpc.name}</h3>
                <div className="flex items-center justify-center gap-2 text-dnd-red font-serif italic">
                  <span>{currentNpc.race}</span>
                  <span className="w-1 h-1 rounded-full bg-dnd-gold/40" />
                  <span>{currentNpc.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dnd-parchment/30 rounded-xl border border-dnd-gold/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-dnd-gold" />
                    <span className="text-[8px] uppercase tracking-widest font-black text-dnd-ink/40">Alignment</span>
                  </div>
                  <p className="font-serif text-sm font-bold text-dnd-ink">{currentNpc.alignment}</p>
                </div>
                <div className="p-4 bg-dnd-parchment/30 rounded-xl border border-dnd-gold/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-3 h-3 text-dnd-red" />
                    <span className="text-[8px] uppercase tracking-widest font-black text-dnd-ink/40">Disposition</span>
                  </div>
                  <p className="font-serif text-sm font-bold text-dnd-ink">{currentNpc.disposition}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-dnd-gold" />
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Traits</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentNpc.traits?.map(trait => (
                      <span key={trait} className="px-3 py-1 bg-dnd-gold/10 text-dnd-gold rounded-full text-[10px] font-bold uppercase tracking-widest border border-dnd-gold/20">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-dnd-red" />
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Current Goal</h4>
                  </div>
                  <p className="font-serif text-sm text-dnd-ink leading-relaxed italic">"{currentNpc.goal}"</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-dnd-gold" />
                    <h4 className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Dark Secret</h4>
                  </div>
                  <p className="font-serif text-sm text-dnd-ink leading-relaxed opacity-80">{currentNpc.secret}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-dnd-gold/10">
                <p className="text-center font-serif text-dnd-ink/60 italic">
                  "{currentNpc.greeting}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* NPC History */}
      <section className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-dnd-red" />
            <h2 className="text-xl uppercase tracking-widest font-display font-bold text-dnd-red">NPC History</h2>
          </div>
          {npcHistory.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-dnd-red hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {npcHistory.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-dnd-gold/20 rounded-xl">
            <p className="text-dnd-ink/40 font-serif italic">No NPCs generated yet. Start creating your world!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {npcHistory.map(npc => (
              <div 
                key={npc.id}
                onClick={() => setViewingNpc(npc)}
                className="group p-4 bg-dnd-parchment/30 border-2 border-dnd-gold/10 rounded-xl hover:border-dnd-red/40 transition-all relative cursor-pointer"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNpc(npc.id);
                  }}
                  className="absolute top-2 right-2 p-1 text-dnd-ink/20 hover:text-dnd-red transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold uppercase tracking-wider text-dnd-ink">{npc.name}</span>
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/20">
                      {npc.alignment}
                    </span>
                  </div>
                  <p className="text-[10px] italic font-serif text-dnd-ink/60">
                    {npc.race} {npc.role}
                  </p>
                  <div className="pt-2 border-t border-dnd-gold/5">
                    <p className="text-[10px] font-serif text-dnd-ink/80 line-clamp-2">
                      {npc.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NPC Detail Modal */}
      <AnimatePresence>
        {viewingNpc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dnd-ink/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dnd-paper border-4 border-dnd-gold rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-dnd-gold/5 rounded-bl-full -mr-24 -mt-24" />
              
              <button 
                onClick={() => setViewingNpc(null)}
                className="absolute top-6 right-6 p-2 bg-dnd-parchment/50 border-2 border-dnd-gold/20 rounded-full text-dnd-ink/40 hover:text-dnd-red hover:border-dnd-red/40 transition-all z-10"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-5xl font-display font-bold text-dnd-ink tracking-tight">{viewingNpc.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-dnd-red font-serif italic text-xl">
                    <span>{viewingNpc.race}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-dnd-gold/40" />
                    <span>{viewingNpc.role}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-dnd-parchment/30 rounded-2xl border-2 border-dnd-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-dnd-gold" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Alignment</span>
                    </div>
                    <p className="font-serif text-lg font-bold text-dnd-ink">{viewingNpc.alignment}</p>
                  </div>
                  <div className="p-6 bg-dnd-parchment/30 rounded-2xl border-2 border-dnd-gold/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-dnd-red" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/40">Disposition</span>
                    </div>
                    <p className="font-serif text-lg font-bold text-dnd-ink">{viewingNpc.disposition}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-dnd-gold" />
                      <h4 className="text-[12px] uppercase tracking-widest font-black text-dnd-ink/40">Traits</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {viewingNpc.traits?.map(trait => (
                        <span key={trait} className="px-4 py-2 bg-dnd-gold/10 text-dnd-gold rounded-full text-[12px] font-bold uppercase tracking-widest border-2 border-dnd-gold/20">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-dnd-red" />
                      <h4 className="text-[12px] uppercase tracking-widest font-black text-dnd-ink/40">Current Goal</h4>
                    </div>
                    <p className="font-serif text-lg text-dnd-ink leading-relaxed italic border-l-4 border-dnd-red/20 pl-4 bg-dnd-red/5 py-3 rounded-r-xl">
                      "{viewingNpc.goal}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-dnd-gold" />
                      <h4 className="text-[12px] uppercase tracking-widest font-black text-dnd-ink/40">Dark Secret</h4>
                    </div>
                    <p className="font-serif text-lg text-dnd-ink leading-relaxed opacity-80 bg-dnd-gold/5 p-4 rounded-xl border border-dnd-gold/10">
                      {viewingNpc.secret}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t-2 border-dnd-gold/10 text-center">
                  <p className="font-serif text-xl text-dnd-ink/60 italic leading-relaxed">
                    "{viewingNpc.greeting}"
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
              <div className="p-4 bg-dnd-ink/5 border-t border-dnd-gold/20 flex justify-end">
                <button
                  onClick={() => setViewingNpc(null)}
                  className="px-6 py-2 bg-dnd-ink text-dnd-gold rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-dnd-red hover:text-white transition-all shadow-md border-2 border-dnd-gold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
