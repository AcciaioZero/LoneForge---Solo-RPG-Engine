import React, { useState, useMemo } from 'react';
import { Hammer, Sparkles, PawPrint, Construction, AlertTriangle, Trophy, History, Plus, ChevronRight, CheckCircle2, Clock, Coins, Heart, Zap, Shield, BookOpen, Castle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import downtimeData from '../data/downtime_activities.json';
import { ActiveDowntime, DowntimeEvent, GameState, Attribute } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DowntimeProps {
  gameState: GameState;
  onStartActivity: (activityId: string, variantId: string, customName?: string, goalId?: string, materialCost?: number) => void;
  onProgressCheck: (overrides?: { ability?: Attribute, proficiencyLevel?: 'none' | 'proficient' | 'expertise' }) => void;
  onWaitDay: () => void;
  onResolve: () => void;
  onCancel: () => void;
  onResolveComplication: (id: string) => void;
  onToggleModifier: (id: string) => void;
  onNavigateToSettlement: () => void;
}

export const Downtime: React.FC<DowntimeProps> = ({ 
  gameState, 
  onStartActivity, 
  onProgressCheck, 
  onWaitDay,
  onResolve, 
  onCancel,
  onResolveComplication,
  onToggleModifier,
  onNavigateToSettlement
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [materialCost, setMaterialCost] = useState<number>(0);

  const activities = downtimeData.downtime_activities.activities;
  const activeDowntime = gameState.activeDowntime;

  const [selectedAbility, setSelectedAbility] = useState<Attribute | ''>('');
  const [selectedProficiency, setSelectedProficiency] = useState<'none' | 'proficient' | 'expertise'>('proficient');

  const activeQualityModifiers = useMemo(() => {
    if (!activeDowntime) return [];
    const activity = activities.find(a => a.id === activeDowntime.activityId);
    if (!activity) return [];

    const mods: { label: string, value: number, isPositive: boolean }[] = [];

    if (activeDowntime.modifiers.resolutionBonus !== 0) {
      mods.push({ 
        label: 'Base Resolution Bonus', 
        value: activeDowntime.modifiers.resolutionBonus, 
        isPositive: activeDowntime.modifiers.resolutionBonus > 0 
      });
    }

    activity.resolution.positive_modifiers?.forEach((mod: any) => {
      let count = 0;
      if (mod.condition === 'per_opportunity_used') count = activeDowntime.opportunities.length;
      else if (mod.condition === 'no_complications_occurred') count = activeDowntime.complications.length === 0 ? 1 : 0;
      else if (mod.condition === 'tool_proficiency' || mod.condition === 'tool_expertise') {
        count = activity.progress_check.tool_options?.some((t: string) => 
          gameState.character.inventory?.some(i => i.name.toLowerCase().includes(t.toLowerCase()) && i.isEquipped)
        ) ? 1 : 0;
      }
      else if (mod.condition === 'arcana_proficiency') count = gameState.character.proficiencies.includes('Arcana') ? 1 : 0;
      else if (mod.condition === 'animal_handling_proficiency') count = gameState.character.proficiencies.includes('Animal Handling') ? 1 : 0;
      else if (mod.condition === 'creature_naturally_docile') count = activeDowntime.variantId === 'docile' ? 1 : 0;
      else if (mod.condition === 'relevant_class_feature') count = 1;
      else if (activeDowntime.selectedModifierIds?.includes(mod.condition)) count = 1;
      
      if (count > 0) {
        mods.push({ label: mod.description || (mod.condition || '').replace(/_/g, ' '), value: count * mod.value, isPositive: true });
      }
    });

    activity.resolution.negative_modifiers?.forEach((mod: any) => {
      let count = 0;
      if (mod.condition === 'per_unresolved_complication') count = activeDowntime.complications.filter(c => !c.isResolved).length;
      else if (mod.condition === 'creature_naturally_aggressive') count = activeDowntime.variantId === 'aggressive' ? 1 : 0;
      else if (activeDowntime.selectedModifierIds?.includes(mod.condition)) count = 1;
      
      if (count > 0) {
        mods.push({ label: mod.description || (mod.condition || '').replace(/_/g, ' '), value: count * mod.value, isPositive: false });
      }
    });

    return mods;
  }, [activeDowntime, activities, gameState.character]);

  const projectedScore = useMemo(() => {
    if (!activeDowntime) return 0;
    const activity = activities.find(a => a.id === activeDowntime.activityId);
    if (!activity) return 0;

    let score = activity.resolution.base_score;
    activeQualityModifiers.forEach(m => score += m.value);
    return score;
  }, [activeDowntime, activities, activeQualityModifiers]);

  const currentOutcome = useMemo(() => {
    if (!activeDowntime) return null;
    const activity = activities.find(a => a.id === activeDowntime.activityId);
    if (!activity) return null;
    return activity.resolution.outcomes.find((o: any) => projectedScore >= o.score_min && projectedScore <= o.score_max) 
           || activity.resolution.outcomes[activity.resolution.outcomes.length - 1];
  }, [projectedScore, activeDowntime, activities]);

  const selectedActivity = useMemo(() => 
    activities.find(a => a.id === selectedActivityId), 
    [selectedActivityId, activities]
  );

  const getActivityIcon = (id: string) => {
    switch (id) {
      case 'mundane_crafting': return <Hammer className="w-5 h-5" />;
      case 'crafting_magic': return <Sparkles className="w-5 h-5" />;
      case 'animal_training': return <PawPrint className="w-5 h-5" />;
      case 'construction': return <Construction className="w-5 h-5" />;
      case 'buying_magic_item': return <Coins className="w-5 h-5" />;
      case 'running_a_business': return <Construction className="w-5 h-5" />;
      case 'skill_training': return <BookOpen className="w-5 h-5" />;
      case 'research': return <Search className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (activeDowntime) {
    const progressPercent = (activeDowntime.currentProgress / activeDowntime.requiredProgress) * 100;
    
    return (
      <div className="space-y-6">
        {/* Active Activity Header */}
        <div className="bg-dnd-paper/80 border-2 border-dnd-gold rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {getActivityIcon(activeDowntime.activityId)}
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-display font-black text-dnd-red uppercase tracking-tight">
                {activeDowntime.name}
              </h2>
              <p className="text-xs font-sans font-bold text-dnd-gold uppercase tracking-widest flex items-center gap-2">
                Active Downtime Activity
                {activeDowntime.materialCost && (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-600/30" />
                    Materials: {activeDowntime.materialCost} GP
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={onCancel}
              className="text-[10px] uppercase font-black tracking-widest text-dnd-red/40 hover:text-dnd-red transition-colors"
            >
              Abandon Project
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-dnd-ink/40">Progress</span>
              <span className="text-dnd-gold">{activeDowntime.currentProgress} / {activeDowntime.requiredProgress}</span>
            </div>
            <div className="h-4 bg-dnd-ink/5 rounded-full border border-dnd-gold/20 overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressPercent)}%` }}
                className="h-full bg-gradient-to-r from-dnd-gold to-yellow-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              />
            </div>
          </div>

          {/* Quality / Resolution Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-dnd-ink/40">Projected Quality</span>
              <span className="text-dnd-red">{currentOutcome?.name} ({projectedScore})</span>
            </div>
            <div className="h-2 bg-dnd-ink/5 rounded-full border border-dnd-gold/10 overflow-hidden relative flex">
              {/* Markers for tiers */}
              <div className="absolute inset-0 flex">
                <div className="h-full border-r border-dnd-gold/20" style={{ width: '25%' }} />
                <div className="h-full border-r border-dnd-gold/20" style={{ width: '25%' }} />
                <div className="h-full border-r border-dnd-gold/20" style={{ width: '25%' }} />
              </div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (projectedScore / 25) * 100)}%` }}
                className={cn(
                  "h-full transition-colors duration-500",
                  projectedScore < 6 ? "bg-red-400" : 
                  projectedScore < 16 ? "bg-emerald-400" : 
                  projectedScore < 21 ? "bg-blue-400" : "bg-purple-400"
                )}
              />
            </div>
            <p className="text-[8px] font-serif italic text-dnd-ink/40 leading-tight">
              {currentOutcome?.description}
            </p>

            {/* Quality Modifiers List */}
            {activeQualityModifiers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dnd-gold/10 space-y-1">
                <div className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/30 mb-1">Active Quality Modifiers</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {activeQualityModifiers.map((mod, i) => (
                    <div key={i} className="flex justify-between items-center text-[9px] font-sans">
                      <span className="text-dnd-ink/60 capitalize">{mod.label}</span>
                      <span className={cn("font-bold", mod.isPositive ? "text-emerald-600" : "text-red-600")}>
                        {mod.value > 0 ? '+' : ''}{mod.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* World Event CTA */}
            <div className="mt-6 p-4 bg-dnd-gold/5 border border-dnd-gold/20 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-dnd-gold/10 rounded-lg">
                  <Castle className="w-4 h-4 text-dnd-gold" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-serif italic text-dnd-ink/70 leading-relaxed">
                    "Downtime activities only make sense if time actually passes in the world. Use the existing Settlement system to generate a minor urban event, town encounter, or disturbance event every 1 or 2 days related to the district you’re in, keeping the world alive while your character is busy."
                  </p>
                </div>
              </div>
              <button 
                onClick={onNavigateToSettlement}
                className="w-full py-2 bg-dnd-gold/10 hover:bg-dnd-gold/20 border border-dnd-gold/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-dnd-gold transition-all flex items-center justify-center gap-2"
              >
                Go to Settlement Services <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Active Modifiers */}
          <div className="mt-6 flex flex-wrap gap-2">
            {activeDowntime.modifiers.advantageNext && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-tighter rounded border border-emerald-200">
                Advantage Next
              </span>
            )}
            {activeDowntime.modifiers.disadvantageNext && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-[8px] font-black uppercase tracking-tighter rounded border border-red-200">
                Disadvantage Next
              </span>
            )}
            {activeDowntime.modifiers.dcBonus !== 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-tighter rounded border border-blue-200">
                DC {activeDowntime.modifiers.dcBonus > 0 ? '+' : ''}{activeDowntime.modifiers.dcBonus}
              </span>
            )}
            {activeDowntime.modifiers.skipNextDay && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter rounded border border-amber-200">
                Delayed
              </span>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!activeDowntime.modifiers.skipNextDay && !activeDowntime.isComplete && (
              <div className="bg-dnd-paper/50 border border-dnd-gold/20 rounded-2xl p-4 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Check Configuration
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/60">Ability</label>
                    <select 
                      value={selectedAbility}
                      onChange={(e) => setSelectedAbility(e.target.value as Attribute)}
                      className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-2 py-1.5 text-xs font-sans focus:outline-none focus:border-dnd-gold transition-colors"
                    >
                      <option value="">Default</option>
                      <option value="Strength">Strength</option>
                      <option value="Dexterity">Dexterity</option>
                      <option value="Constitution">Constitution</option>
                      <option value="Intelligence">Intelligence</option>
                      <option value="Wisdom">Wisdom</option>
                      <option value="Charisma">Charisma</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-dnd-ink/60">Proficiency</label>
                    <select 
                      value={selectedProficiency}
                      onChange={(e) => setSelectedProficiency(e.target.value as any)}
                      className="w-full bg-white/50 border border-dnd-gold/20 rounded-lg px-2 py-1.5 text-xs font-sans focus:outline-none focus:border-dnd-gold transition-colors"
                    >
                      <option value="none">None</option>
                      <option value="proficient">Proficient</option>
                      <option value="expertise">Expertise (x2)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeDowntime.modifiers.skipNextDay ? (
              <button
                onClick={onWaitDay}
                className="w-full group relative overflow-hidden bg-amber-600 text-white p-6 rounded-2xl border-2 border-dnd-gold shadow-lg hover:shadow-amber-600/20 transition-all"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-lg font-display font-black uppercase leading-none">Wait / Recover</div>
                    <div className="text-[10px] font-sans font-bold opacity-60 uppercase tracking-widest">Resolve Delay</div>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onProgressCheck({ 
                  ability: selectedAbility || undefined, 
                  proficiencyLevel: selectedProficiency 
                })}
                disabled={activeDowntime.isComplete}
                className="w-full group relative overflow-hidden bg-dnd-red text-white p-6 rounded-2xl border-2 border-dnd-gold shadow-lg hover:shadow-dnd-red/20 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-lg font-display font-black uppercase leading-none">Work for a Day</div>
                    <div className="text-[10px] font-sans font-bold opacity-60 uppercase tracking-widest">Make Progress Check</div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            )}

            {activeDowntime.isComplete && (
              <button
                onClick={onResolve}
                className="w-full group relative overflow-hidden bg-emerald-600 text-white p-6 rounded-2xl border-2 border-dnd-gold shadow-lg hover:shadow-emerald-600/20 transition-all"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Trophy className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-lg font-display font-black uppercase leading-none">Finalize Project</div>
                    <div className="text-[10px] font-sans font-bold opacity-60 uppercase tracking-widest">Calculate Resolution</div>
                  </div>
                </div>
              </button>
            )}

            {/* History / Log */}
            <div className="bg-dnd-paper/50 border border-dnd-gold/20 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40 flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Project History
                </h3>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {activeDowntime.history.map((entry, i) => (
                  <div key={i} className="text-xs font-serif border-l-2 border-dnd-gold/20 pl-3 py-1">
                    {entry}
                  </div>
                ))}
                {activeDowntime.history.length === 0 && (
                  <p className="text-xs font-serif italic text-dnd-ink/30">No history yet...</p>
                )}
              </div>
            </div>
          </div>

          {/* Events Area */}
          <div className="space-y-4">
            {/* Manual Modifiers / Context */}
            <div className="bg-dnd-paper/50 border border-dnd-gold/20 rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold mb-3 flex items-center gap-2">
                <Plus className="w-3 h-3" />
                Project Context & Modifiers
              </h3>
              <div className="space-y-2">
                {activities.find(a => a.id === activeDowntime.activityId)?.resolution.positive_modifiers?.filter((m: any) => !['per_opportunity_used', 'no_complications_occurred', 'tool_proficiency', 'tool_expertise', 'arcana_proficiency', 'animal_handling_proficiency', 'creature_naturally_docile', 'relevant_class_feature'].includes(m.condition)).map((mod: any) => (
                  <button
                    key={mod.condition}
                    onClick={() => onToggleModifier(mod.condition)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all text-[10px] font-serif",
                      activeDowntime.selectedModifierIds?.includes(mod.condition)
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-white/50 border-dnd-gold/10 text-dnd-ink/60 hover:border-dnd-gold/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{mod.description || (mod.condition || '').replace(/_/g, ' ')}</span>
                      <span className="font-black text-emerald-600">+{mod.value}</span>
                    </div>
                  </button>
                ))}
                {activities.find(a => a.id === activeDowntime.activityId)?.resolution.negative_modifiers?.filter((m: any) => !['per_unresolved_complication', 'creature_naturally_aggressive', 'interrupted_more_than_2_days'].includes(m.condition)).map((mod: any) => (
                  <button
                    key={mod.condition}
                    onClick={() => onToggleModifier(mod.condition)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg border transition-all text-[10px] font-serif",
                      activeDowntime.selectedModifierIds?.includes(mod.condition)
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-white/50 border-dnd-gold/10 text-dnd-ink/60 hover:border-dnd-gold/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{mod.description || (mod.condition || '').replace(/_/g, ' ')}</span>
                      <span className="font-black text-red-600">{mod.value}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-dnd-paper/50 border border-dnd-gold/20 rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Complications
              </h3>
              <div className="space-y-3">
                {activeDowntime.complications.map((comp, i) => (
                  <div key={i} className={cn(
                    "border p-3 rounded-lg transition-all",
                    comp.isResolved 
                      ? "bg-emerald-50/50 border-emerald-100 opacity-60" 
                      : "bg-red-50 border-red-100"
                  )}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-xs text-red-900">{comp.name}</div>
                      {!comp.isResolved && (
                        <button 
                          onClick={() => onResolveComplication(comp.id!)}
                          className="text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {comp.isResolved && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Resolved</span>
                      )}
                    </div>
                    <div className="text-[10px] text-red-700/80 leading-tight mt-1">{comp.description}</div>
                  </div>
                ))}
                {activeDowntime.complications.length === 0 && (
                  <p className="text-xs font-serif italic text-dnd-ink/30">No complications yet.</p>
                )}
              </div>
            </div>

            <div className="bg-dnd-paper/50 border border-dnd-gold/20 rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Opportunities
              </h3>
              <div className="space-y-3">
                {activeDowntime.opportunities.map((opp, i) => (
                  <div key={i} className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                    <div className="font-bold text-xs text-emerald-900">{opp.name}</div>
                    <div className="text-[10px] text-emerald-700/80 leading-tight mt-1">{opp.description}</div>
                  </div>
                ))}
                {activeDowntime.opportunities.length === 0 && (
                  <p className="text-xs font-serif italic text-dnd-ink/30">No opportunities yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-dnd-red/10 flex items-center justify-center border-2 border-dnd-red/20">
          <Clock className="w-6 h-6 text-dnd-red" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-black text-dnd-ink uppercase tracking-tight">Downtime Activities</h2>
          <p className="text-xs font-sans font-bold text-dnd-gold uppercase tracking-[0.3em]">Long-term Projects & Training</p>
        </div>
      </div>

      {!selectedActivityId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map(activity => (
            <button
              key={activity.id}
              onClick={() => setSelectedActivityId(activity.id)}
              className="group bg-dnd-paper/80 border-2 border-dnd-gold/20 hover:border-dnd-gold p-6 rounded-2xl text-left transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-dnd-gold/10 flex items-center justify-center text-dnd-gold group-hover:scale-110 transition-transform">
                  {getActivityIcon(activity.id)}
                </div>
                <h3 className="text-xl font-display font-black text-dnd-ink uppercase">{activity.name}</h3>
              </div>
              <p className="text-sm text-dnd-ink/60 font-serif leading-relaxed mb-4">
                {activity.description}
              </p>
              <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-dnd-gold">
                View Options <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => {
              setSelectedActivityId(null);
              setSelectedVariantId(null);
              setSelectedGoalId(null);
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-dnd-ink/40 hover:text-dnd-red transition-colors"
          >
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to Activities
          </button>

          <div className="bg-dnd-paper/80 border-2 border-dnd-gold rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-dnd-gold/10 flex items-center justify-center text-dnd-gold">
                {getActivityIcon(selectedActivity!.id)}
              </div>
              <h3 className="text-2xl font-display font-black text-dnd-ink uppercase">{selectedActivity!.name}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedActivity!.requirements.map((req: string, i: number) => (
                      <li key={i} className="text-xs font-serif flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold mb-2">Project Name</h4>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. My Summer House, Training Sparky..."
                    className="w-full bg-dnd-ink/5 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 font-serif text-sm focus:border-dnd-gold outline-none transition-colors"
                  />
                </div>

                {(selectedActivityId === 'crafting_mundane' || selectedActivityId === 'construction') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold">
                        {selectedActivityId === 'crafting_mundane' ? 'Material Cost (GP)' : 'Total Construction Cost (GP)'}
                      </h4>
                      <span className="text-[8px] font-bold text-dnd-ink/40 uppercase">
                        {selectedActivityId === 'crafting_mundane' ? '1/2 Market Value' : 'Total Project Value'}
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={materialCost || ''}
                        onChange={(e) => setMaterialCost(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder={selectedActivityId === 'crafting_mundane' ? "Enter half the item's market value..." : "Enter the total cost of the project..."}
                        className="w-full bg-dnd-ink/5 border-2 border-dnd-gold/20 rounded-xl px-4 py-2 font-serif text-sm focus:border-dnd-gold outline-none transition-colors pr-12"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-dnd-gold">GP</div>
                    </div>
                    <p className="text-[9px] text-dnd-ink/40 mt-2 italic leading-tight">
                      {selectedActivityId === 'crafting_mundane' 
                        ? <>Check the <strong>Items</strong> section for market prices. Material cost is typically 50% of the market price.</>
                        : <>Reference ranges: Small (100-500), Medium (1k-5k), Large (10k-25k), Massive (40k-100k), Grand (150k-500k).</>
                      }
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold mb-2">Select Scale / Difficulty</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedActivity!.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all",
                          selectedVariantId === variant.id 
                            ? "bg-dnd-gold/10 border-dnd-gold shadow-md" 
                            : "bg-white border-dnd-gold/10 hover:border-dnd-gold/40"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{variant.name}</span>
                          <span className="text-[10px] font-black uppercase tracking-tighter bg-dnd-ink/5 px-2 py-0.5 rounded">DC {variant.dc}</span>
                        </div>
                        {variant.examples && (
                          <p className="text-[10px] text-dnd-ink/40 font-serif italic">
                            {variant.examples.join(', ')}
                          </p>
                        )}
                        {variant.progress_required && (
                          <p className="text-[10px] text-dnd-gold font-bold uppercase mt-1">
                            {variant.progress_required} Progress Required
                          </p>
                        )}
                        {variant.material_cost_gp && (
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">
                            Cost: {variant.material_cost_gp} GP
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedActivity!.training_goals && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-gold mb-2">Training Goal</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedActivity!.training_goals.map((goal: any) => (
                        <button
                          key={goal.id}
                          onClick={() => setSelectedGoalId(goal.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            selectedGoalId === goal.id 
                              ? "bg-dnd-gold/10 border-dnd-gold shadow-md" 
                              : "bg-white border-dnd-gold/10 hover:border-dnd-gold/40"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">{goal.name}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-dnd-ink/5 px-2 py-0.5 rounded">{goal.progress_required} Progress</span>
                          </div>
                          <p className="text-[10px] text-dnd-ink/40 font-serif italic">
                            {goal.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-dnd-ink/5 rounded-2xl p-6 border border-dnd-gold/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-red mb-4">How it works</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-dnd-gold/20 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                      <p className="text-xs font-serif leading-relaxed">
                        Each day, you make a <strong>{selectedActivity!.progress_check.ability}</strong>. 
                        Success adds progress, while failure by 5 or more can set you back.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-dnd-gold/20 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                      <p className="text-xs font-serif leading-relaxed">
                        After the check, a <strong>Daily Event</strong> is rolled. You might face a complication or find an opportunity.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-dnd-gold/20 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                      <p className="text-xs font-serif leading-relaxed">
                        Once progress is complete, a <strong>Resolution Score</strong> is calculated based on your performance and events.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  disabled={!selectedVariantId || (selectedActivity!.training_goals && !selectedGoalId) || ((selectedActivityId === 'crafting_mundane' || selectedActivityId === 'construction') && materialCost <= 0)}
                  onClick={() => onStartActivity(selectedActivityId, selectedVariantId!, customName, selectedGoalId || undefined, (selectedActivityId === 'crafting_mundane' || selectedActivityId === 'construction') ? materialCost : undefined)}
                  className="w-full bg-dnd-red text-white p-6 rounded-2xl border-2 border-dnd-gold shadow-lg hover:shadow-dnd-red/20 transition-all font-display font-black uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
                >
                  Start Project
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap border-2",
      active 
        ? "bg-dnd-red text-white border-dnd-gold shadow-lg translate-x-1" 
        : "bg-dnd-paper/50 text-dnd-ink/60 border-transparent hover:bg-dnd-paper hover:text-dnd-ink hover:translate-x-1"
    )}
  >
    <span className={cn("transition-transform", active && "scale-110")}>{icon}</span>
    <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
  </button>
);
