import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, 
  Flame, 
  Droplets, 
  ChevronRight, 
  ChevronDown, 
  Info, 
  Lock, 
  Unlock, 
  Zap, 
  Sword, 
  Shield, 
  Eye, 
  AlertCircle,
  Dices,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scroll,
  History,
  Activity,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GameState, Power, CharacterPowerState } from '../types';
import POWERS_DATA from '../data/powers.json';
import { HelpButton } from './HelpOverlay';

const CATEGORY_METADATA: Record<string, any> = {
  lycanthropy: {
    name: 'Lycanthropy',
    description: 'The ancient curse of the moon and the wild heathlands.',
    primaryMeterId: 'hunger',
    meters: [{ id: 'hunger', name: 'Hunger', max: 10 }],
    thresholdField: 'Hunger_thresholds',
    hunger_interactions: [
      { threshold: 3, name: "The Gnaw", narrative_desc: "The world feels brittle. Every heartbeat is a drum.", effects: ["+1 to damage", "-1 to Persuasion"] },
      { threshold: 6, name: "The Fever", narrative_desc: "Your blood is molten. The skin is too tight.", effects: ["Advantage on STR", "Disadvantage on all mental checks"] },
      { threshold: 9, name: "The Frenzy", narrative_desc: "Red fills your vision. Reason is a distant memory.", effects: ["Automatically enter Rage", "Cannot distinguish friend from foe"] }
    ],
    oracle_triggers: [
      { condition: "When you consume raw flesh", mandatory: false },
      { condition: "When the moon is full", mandatory: true }
    ],
    default_trial_requirements: ["Reach Hunger 5", "Kill a beast solo"]
  },
  vampirism: {
    name: 'Vampirism',
    description: 'The thirst for life essence and the ancient shadows of the night.',
    primaryMeterId: 'blood',
    meters: [
      { id: 'blood', name: 'Blood Thirst', max: 10 },
      { id: 'humanity', name: 'Humanity', max: 10 }
    ],
    thresholdField: 'Blood_thresholds',
    hunger_interactions: [
      { threshold: 3, name: "The Ache", narrative_desc: "The sun feels too bright. The silence too loud.", effects: ["+1 to Stealth", "-1 to Constitution saves"] },
      { threshold: 7, name: "The Burn", narrative_desc: "Your throat is dry as desert sand. Every heartbeat is a taunt.", effects: ["Advantage on DEX", "Disadvantage on all social checks"] },
      { threshold: 10, name: "The Hollow", narrative_desc: "Only the red matters. All else is glass.", effects: ["Regain HP on hit", "Must feed immediately or take damage"] }
    ],
    oracle_triggers: [
      { condition: "When you taste blood", mandatory: false },
      { condition: "When you enter a residence uninvited", mandatory: true }
    ],
    default_trial_requirements: ["Reach Blood 5", "Abstain from blood for a night"]
  },
  eidolon: {
    name: 'Eidolon',
    description: 'An ancient planar entity bound to your soul, sharing your physical shell.',
    primaryMeterId: 'dominance',
    meters: [{ id: 'dominance', name: 'Dominance', max: 10 }],
    thresholdField: 'Dominance_thresholds',
    hunger_interactions: [
      { threshold: 0, name: "The Silence", narrative_desc: "The second channel is quiet. You are entirely alone in your skull.", effects: ["No access to eidolon powers", "Can interact via deliberate short rest"] },
      { threshold: 4, name: "The Whisper", narrative_desc: "It annotates your thoughts with older, stranger interpretations of your world.", effects: ["Bonus to checks increases to +3", "Provides unsolicited observations and details"] },
      { threshold: 7, name: "The Convergence", narrative_desc: "The line between your impulses and its intentions begins to shift.", effects: ["All power bonuses increase by +1", "Eidolon acts autonomously once per scene"] }
    ],
    oracle_triggers: [
      { condition: "When the entity acts autonomously", mandatory: true },
      { condition: "When you invoke a tier 3 or tier 4 power", mandatory: false }
    ],
    default_trial_requirements: ["Face the Threshold Contest", "Spend a full day in internal dialogue"]
  }
};

interface PowerSystemProps {
  gameState: GameState;
  handleUnlockPower: (id: string) => void;
  handleUpdatePowerMeter: (name: string, amount: number) => void;
  handleCompletePowerTrial: (id: string) => void;
  addLog: (type: any, content: string) => void;
}

export const PowerSystem: React.FC<PowerSystemProps> = ({
  gameState,
  handleUnlockPower,
  handleUpdatePowerMeter,
  handleCompletePowerTrial,
  addLog
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPowerId, setSelectedPowerId] = useState<string | null>(null);
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [activeEventPowerId, setActiveEventPowerId] = useState<string | null>(null);
  const [eventPhase, setEventPhase] = useState<'intro' | 'choice' | 'check' | 'outcome'>('intro');
  const [eventChoiceId, setEventChoiceId] = useState<string | null>(null);
  const [eventRollResult, setEventRollResult] = useState<{ roll: number; bonus: number; success: boolean; resultText: string } | null>(null);
  const [enabledPowerIds, setEnabledPowerIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [selectedOracleTableId, setSelectedOracleTableId] = useState<string | null>(null);
  const [oracleRollResult, setOracleRollResult] = useState<{
    main: { roll: number; result: any };
    nested: { tableName: string; roll: number; result: any }[];
  } | null>(null);

  const powerState = gameState.character.powerState || {
    unlockedPowerIds: [],
    meters: {},
    completedTrialIds: [],
    activeManifestationIds: []
  };

  const detailRef = React.useRef<HTMLDivElement>(null);

  // Scroll to detail when power is selected on mobile
  React.useEffect(() => {
    if (selectedPowerId && window.innerWidth < 1280) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPowerId]);

  const categories = useMemo(() => {
    return Object.entries(POWERS_DATA || {})
      .filter(([key, val]) => (key.endsWith('_powers') || key.endsWith('_power')) && Array.isArray(val))
      .map(([key, powers]) => {
        const categoryId = key.replace('_powers', '').replace('_power', '');
        const metadata = CATEGORY_METADATA[categoryId] || {
          name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
          description: `Legendary powers inherent to the ${categoryId} lineage.`,
          meters: [{ id: 'power', name: 'Power', max: 10 }],
          hunger_interactions: [],
          oracle_triggers: [],
          default_trial_requirements: ["Complete a significant deed"]
        };

        return {
          id: categoryId,
          name: metadata.name,
          description: metadata.description,
          meters: metadata.meters,
          powers: (powers as any[]).filter((p: any) => p.category !== 'trial' && p.category !== 'oracle_table'),
          oracle_tables: (powers as any[]).filter((p: any) => p.category === 'oracle_table').map((o: any) => ({
            ...o,
            triggers: o.triggers || metadata.oracle_triggers
          })),
          hunger_interactions: metadata.hunger_interactions,
          trials: (powers as any[]).filter((p: any) => p.category === 'trial').map((trial: any) => ({
            ...trial,
            requirements: trial.skill_checks 
              ? trial.skill_checks.map((sc: any) => `${sc.type} DC ${sc.dc}: ${sc.success}`)
              : trial.requirements || metadata.default_trial_requirements
          }))
        };
      });
  }, []);

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId), 
  [selectedCategoryId, categories]);

  const allPowers = useMemo(() => {
    return Object.values(POWERS_DATA).flat() as any[];
  }, []);

  const currentEventPower = useMemo(() => 
    allPowers.find(p => p.id === activeEventPowerId)
  , [activeEventPowerId, allPowers]);

  const isPowerUnlocked = (powerId: string) => powerState.unlockedPowerIds.includes(powerId);

  const canUnlockPower = (power: Power) => {
    if (isPowerUnlocked(power.id)) return false;
    
    // Tier 0 powers are always available if their acquisition events are met (narrative)
    if (power.tier === 0) return true;

    // Check dependency
    if (power.unlocked_by && !isPowerUnlocked(power.unlocked_by)) return false;

    // Check trial
    if (power.requires_trial && !powerState.completedTrialIds.includes(power.requires_trial)) return false;

    return true;
  };

  const renderTrialDetail = (trial: any) => {
    if (!trial) return null;
    const completed = powerState.completedTrialIds.includes(trial.id);

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 text-dnd-gold">
          <Scroll className="w-10 h-10" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.4em]">Spiritual Trial</h3>
            <h2 className="text-3xl font-display font-black text-dnd-ink uppercase tracking-widest leading-tight">
              {trial.name}
            </h2>
          </div>
        </div>

        <div className="bg-dnd-paper p-8 rounded-3xl border-2 border-dnd-gold/10">
            <p className="text-lg font-serif italic text-dnd-ink mb-6Leading-relaxed">
            {trial.description}
            </p>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">Requirements</h4>
              <div className="space-y-2">
                {trial.requirements.map((req: string, ridx: number) => (
                  <div key={ridx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-dnd-gold/5">
                    <div className="w-2 h-2 rounded-full bg-dnd-gold" />
                    <span className="text-sm font-bold text-dnd-ink">{req}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {completed ? (
          <div className="bg-emerald-500 text-white p-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-black uppercase tracking-widest text-sm">Trial Completed</span>
          </div>
        ) : (
          <button
            onClick={() => {
              handleCompletePowerTrial(trial.id);
              setSelectedTrialId(null);
            }}
            className="w-full py-5 bg-dnd-ink text-white rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl"
          >
            Mark as Completed
          </button>
        )}
      </div>
    );
  };

  const renderOracleDetail = (table: any) => {
    if (!table) return null;

    return (
      <div className="space-y-8 p-12 overflow-y-auto custom-scrollbar h-full">
        <div className="flex items-center gap-4 text-dnd-red shrink-0">
          <Dices className="w-10 h-10" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.4em]">Oracle Table</h3>
            <h2 className="text-3xl font-display font-black text-dnd-ink uppercase tracking-widest leading-tight">
              {table.name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-dnd-paper p-6 rounded-2xl border border-dnd-gold/20 shadow-inner">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40 mb-4">Suggested Use</h4>
              <ul className="space-y-3">
                {table.suggested_use?.map((use: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-dnd-ink/70 font-serif italic leading-relaxed">
                    <span className="text-dnd-gold font-bold">•</span>
                    {use}
                  </li>
                ))}
                {(!table.suggested_use || table.suggested_use.length === 0) && (
                  <li className="text-sm text-dnd-ink/30 font-serif italic leading-relaxed">No suggested use documented.</li>
                )}
              </ul>
            </div>

            <button
              onClick={() => handleRollTable(table)}
              className="w-full py-6 bg-dnd-ink text-white rounded-3xl font-display text-lg uppercase tracking-[0.3em] font-black hover:bg-dnd-red hover:shadow-2xl transition-all shadow-xl group flex items-center justify-center gap-4"
            >
              <Dices className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Roll {table.roll || "1d20"}
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">Roll Results</h4>
            {oracleRollResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Result */}
                <div className="bg-white p-6 rounded-3xl border-2 border-dnd-red shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-dnd-red/5 blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-dnd-red text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      Result: {oracleRollResult.main.roll}
                    </span>
                    {oracleRollResult.main.result.type && (
                      <span className="text-[10px] uppercase font-black text-dnd-ink/30 tracking-wider font-mono">
                        {oracleRollResult.main.result.type}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg font-serif italic text-dnd-ink leading-relaxed mb-4">
                    {oracleRollResult.main.result.narrative || oracleRollResult.main.result.description}
                  </p>

                  <div className="space-y-3">
                    {oracleRollResult.main.result.mechanic && (
                      <div className="flex gap-3 items-start bg-emerald-50 p-4 rounded-xl border border-emerald-500/10">
                        <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-emerald-900">{oracleRollResult.main.result.mechanic}</span>
                      </div>
                    )}
                    {(oracleRollResult.main.result.hunger_effect !== undefined) && (
                      <div className={cn(
                        "flex gap-3 items-start p-4 rounded-xl border",
                        oracleRollResult.main.result.hunger_effect > 0 ? "bg-red-50 border-red-500/10" : 
                        oracleRollResult.main.result.hunger_effect < 0 ? "bg-emerald-50 border-emerald-500/10" : 
                        "bg-dnd-paper border-dnd-gold/10"
                      )}>
                        <Droplets className={cn(
                          "w-4 h-4 shrink-0 mt-0.5",
                          oracleRollResult.main.result.hunger_effect > 0 ? "text-red-600" : 
                          oracleRollResult.main.result.hunger_effect < 0 ? "text-emerald-600" : 
                          "text-dnd-ink/40"
                        )} />
                        <span className={cn(
                          "text-xs font-bold",
                          oracleRollResult.main.result.hunger_effect > 0 ? "text-red-900" : 
                          oracleRollResult.main.result.hunger_effect < 0 ? "text-emerald-900" : 
                          "text-dnd-ink/60"
                        )}>
                          {oracleRollResult.main.result.hunger_effect > 0 ? `+${oracleRollResult.main.result.hunger_effect}` : oracleRollResult.main.result.hunger_effect}
                          {oracleRollResult.main.result.hunger_effect_note && `, ${oracleRollResult.main.result.hunger_effect_note}`}
                        </span>
                      </div>
                    )}
                    {oracleRollResult.main.result.hooks?.map((hook: any, idx: number) => (
                       <div key={idx} className="flex gap-3 items-start bg-dnd-gold/5 p-4 rounded-xl border border-dnd-gold/20">
                        <AlertTriangle className="w-4 h-4 text-dnd-gold shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-dnd-ink/80 leading-snug">{hook.description || hook.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nested Results */}
                {oracleRollResult.nested.map((nr, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-dnd-paper/50 p-6 rounded-2xl border border-dnd-gold/30 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-dnd-gold mb-2">
                       <Sparkles className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">Linked Roll: {nr.tableName}</span>
                       <span className="ml-auto text-[10px] font-mono font-black text-dnd-gold">Rolled: {nr.roll}</span>
                    </div>

                    <p className="text-sm font-serif italic text-dnd-ink/80 leading-relaxed">
                      {nr.result.narrative || nr.result.description}
                    </p>

                    <div className="space-y-2 mt-2">
                      {nr.result.mechanic && (
                        <div className="text-[11px] font-bold text-dnd-ink/60 pl-4 border-l-2 border-dnd-gold">
                          {nr.result.mechanic}
                        </div>
                      )}
                      {nr.result.hunger_effect !== undefined && (
                        <div className={cn(
                          "text-[10px] font-bold pl-4 border-l-2",
                          nr.result.hunger_effect > 0 ? "text-red-600 border-red-400" : 
                          nr.result.hunger_effect < 0 ? "text-emerald-600 border-emerald-400" : 
                          "text-dnd-ink/40 border-dnd-gold/20"
                        )}>
                          Hunger: {nr.result.hunger_effect > 0 ? `+${nr.result.hunger_effect}` : nr.result.hunger_effect}
                          {nr.result.hunger_effect_note && ` (${nr.result.hunger_effect_note})`}
                        </div>
                      )}
                      {nr.result.hooks?.map((hook: any, hidx: number) => (
                        <div key={hidx} className="text-[10px] font-serif italic text-dnd-ink/50 pl-4 border-l border-dnd-gold/40">
                          {hook.description || hook.text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-dnd-ink/5 rounded-[2rem] text-center space-y-4 min-h-[300px]">
                <Dices className="w-12 h-12 text-dnd-ink/10" />
                <p className="text-sm text-dnd-ink/30 font-serif italic">Roll the bones to consult the oracle.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPowerDetail = (power: any) => {
    if (!power) return null;
    const unlocked = isPowerUnlocked(power.id);
    const available = canUnlockPower(power);
    
    const primaryMeterId = selectedCategory ? (CATEGORY_METADATA[selectedCategory.id]?.primaryMeterId || 'hunger') : 'hunger';
    const primaryMeterValue = powerState.meters[primaryMeterId] || 0;
    const thresholdField = (selectedCategory ? CATEGORY_METADATA[selectedCategory.id]?.thresholdField : null) || 'Hunger_thresholds';

    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Header Area */}
        <div className="p-8 lg:p-10 bg-dnd-paper relative overflow-hidden shrink-0 border-b border-dnd-gold/10">
          <div className="absolute top-0 right-0 p-8 text-dnd-ink/5 -mr-10 -mt-10 rotate-12">
            <Flame className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="p-3 bg-dnd-ink text-dnd-gold rounded-2xl shadow-xl">
                <Flame className="w-6 h-6" />
              </div>
              <div className="px-4 py-1.5 bg-dnd-red text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {power.tier === 0 ? "Tier 0 - Initiation" : `Tier ${power.tier}`}
              </div>
              <div className="px-4 py-1.5 bg-dnd-gold/20 text-dnd-ink rounded-full text-[10px] font-black uppercase tracking-widest">
                {power.category}
              </div>
              <button 
                onClick={() => unlocked && handleTogglePower(power.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ml-auto transition-all",
                  unlocked 
                    ? enabledPowerIds.includes(power.id) 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer" 
                      : "bg-dnd-ink/40 text-white active:scale-95 cursor-pointer"
                    : available ? "bg-dnd-ink/10 text-dnd-ink/40" : "bg-dnd-ink/10 text-dnd-ink/40"
                )}
              >
                {unlocked ? (enabledPowerIds.includes(power.id) ? "Active" : "Suppressed") : available ? "Available" : "Locked"}
              </button>
            </div>

            <h3 className="font-display text-5xl font-black text-dnd-ink uppercase tracking-tighter mb-4">
              {power.name}
            </h3>
            <p className="text-lg text-dnd-ink/60 font-serif italic max-w-xl">
              {power.description}
            </p>
          </div>
        </div>

          {/* Main Content Area - Scrollable */}
        <div className="p-8 lg:p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {power.tier === 0 ? (
            <div className="space-y-12 animate-in fade-in duration-700">
              {/* Trigger Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-dnd-gold flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  The Triggering Event
                </h4>
                <div className="bg-white/60 border-2 border-dnd-gold/10 p-8 rounded-[2rem] relative shadow-inner">
                  <p className="text-lg font-serif italic text-dnd-ink leading-relaxed">
                    {power.trigger}
                  </p>
                </div>
              </div>

              {/* Setting Section */}
              {power.setting && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-dnd-gold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    The Setting
                  </h4>
                  <div className="bg-dnd-ink/5 p-8 rounded-3xl border-l-[6px] border-dnd-gold/40 italic text-base text-dnd-ink/80 leading-loose">
                    <p>{power.setting}</p>
                  </div>
                </div>
              )}

              {/* Player Choice Preview or Active Stage */}
              {power.player_choice && (
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-dnd-red flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    The Temptation
                  </h4>
                  <div className="bg-white/80 border-2 border-dnd-gold/30 p-8 rounded-2xl">
                    <p className="text-xl font-serif font-bold text-dnd-ink leading-relaxed italic">
                      "{power.player_choice.prompt}"
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {power.player_choice.options?.map((opt: any) => (
                        <button 
                          key={opt.id} 
                          onClick={() => {
                            if (opt.consequence) {
                              addLog('narrative', `${opt.label || opt.text}: ${opt.consequence}`);
                            }
                            if (!unlocked) {
                              handleBeginInitiation(power.id);
                              setEventPhase('choice');
                              setEventChoiceId(opt.id);
                            }
                          }}
                          className="px-3 py-1 bg-dnd-ink/5 text-dnd-ink/60 text-[9px] font-black uppercase tracking-widest rounded-full border border-dnd-ink/10 hover:bg-dnd-red/10 hover:text-dnd-red hover:border-dnd-red/30 transition-all cursor-pointer"
                        >
                          {opt.label || opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skill Check Info */}
              {power.skill_check && (
                <button 
                  onClick={() => {
                    if (unlocked) {
                      const roll = Math.floor(Math.random() * 20) + 1;
                      const statType = power.skill_check.type;
                      const statValue = (gameState.character.stats as any)[statType] || 10;
                      const bonus = Math.floor((statValue - 10) / 2);
                      addLog('narrative', `Legacy Echo [${statType}]: Roll ${roll} + ${bonus} = ${roll+bonus} (DC ${power.skill_check.dc})`);
                    } else {
                      handleBeginInitiation(power.id);
                      setEventPhase('check');
                    }
                  }}
                  className={cn(
                    "w-full p-8 rounded-3xl border transition-all text-left group",
                    unlocked ? "bg-dnd-paper/50 border-dnd-gold/10" : "bg-white border-dnd-gold/30 hover:border-dnd-red shadow-sm hover:shadow-md"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-dnd-ink flex items-center gap-2">
                      <Dices className="w-4 h-4" />
                      Spiritual Trial: {power.skill_check.type}
                    </h4>
                    <span className="text-[9px] font-black uppercase text-dnd-red group-hover:underline">
                      {unlocked ? "Roll Echo" : "Begin Trial"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-dnd-ink text-white rounded-xl text-xs font-black">DC {power.skill_check.dc}</div>
                      <span className="text-[10px] font-black uppercase text-dnd-ink/40 tracking-widest">Roll 1d20 + {Math.floor(((gameState.character.stats as any)[power.skill_check.type] - 10) / 2)} modifier</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mt-2">
                       <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <span className="text-[9px] font-black uppercase text-emerald-600 mb-1 block">Success</span>
                          <p className="text-[11px] text-dnd-ink/70 font-serif italic">{power.skill_check.success}</p>
                       </div>
                       
                       {power.skill_check.critical_success && (
                         <div className="p-4 bg-dnd-gold/5 border border-dnd-gold/20 rounded-xl">
                            <span className="text-[9px] font-black uppercase text-dnd-gold mb-1 block">Critical Success (Natural 20)</span>
                            <p className="text-[11px] text-dnd-ink/70 font-serif italic">{power.skill_check.critical_success}</p>
                         </div>
                       )}

                       <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                          <span className="text-[9px] font-black uppercase text-red-600 mb-1 block">Failure</span>
                          <p className="text-[11px] text-dnd-ink/70 font-serif italic">{power.skill_check.failure}</p>
                       </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Narrative Outcome */}
              {power.narrative_outcome && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    The Legacy's Wake
                  </h4>
                  <div className={cn(
                    "p-8 rounded-3xl border-2 italic text-dnd-ink/80 leading-relaxed font-serif",
                    unlocked ? "bg-emerald-50/50 border-emerald-500/20" : "bg-dnd-paper border-transparent opacity-40 blur-[1px]"
                  )}>
                    {unlocked ? power.narrative_outcome : "The outcome remains veiled until the initiation is complete."}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* description section */}
              {(() => {
                const thresholds = (power[thresholdField] || [0, 2, 5]);
                const currentThreshold = [...thresholds]
                  .reverse()
                  .find(t => primaryMeterValue >= t) ?? 0;
                
                const thresholdEffect = power.threshold_effects?.[currentThreshold.toString()];
                
                const narrative = thresholdEffect?.narrative || power.effects?.narrative || "The legacy whispers softly into your mind, drawing from deeper pits of memory.";
                const mechanic = thresholdEffect?.mechanic || power.effects?.mechanic || "Mechanical details are yet to be discovered.";

                return (
                  <div className="flex flex-col gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-widest text-dnd-gold flex items-center gap-2">
                            <Scroll className="w-4 h-4" />
                            Mystic Insight
                          </h4>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            primaryMeterValue >= thresholds[2] ? "bg-dnd-red/10 border-dnd-red text-dnd-red" : "bg-dnd-gold/10 border-dnd-gold text-dnd-gold"
                          )}>
                             Tier {power.tier}
                          </span>
                        </div>
                        <div className="space-y-4">
                           <p className="font-serif italic text-lg text-dnd-ink/90 leading-relaxed border-l-4 border-dnd-gold/20 pl-6 py-2 bg-dnd-gold/5 rounded-r-2xl">
                              "{narrative}"
                           </p>
                           <div className="p-8 bg-white/50 border border-dnd-gold/10 rounded-3xl shadow-sm">
                              <p className="text-xs font-medium text-dnd-ink/80 leading-relaxed">
                                 {mechanic}
                              </p>
                           </div>
                        </div>
                      </div>

                      {/* Threshold Progress */}
                      <div className="bg-dnd-paper/50 border border-dnd-gold/10 rounded-3xl p-8 space-y-6">
                        <div className="flex justify-between items-end">
                           <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40 mb-1">Potency Level</h4>
                              <p className="text-xl font-display font-black uppercase text-dnd-ink">
                                 {primaryMeterValue >= (thresholds[2] || 5) ? "Primeval" : primaryMeterValue >= (thresholds[1] || 2) ? "Resonant" : "Incipient"}
                              </p>
                           </div>
                           <div className="text-right">
                              <span className="text-2xl font-mono font-black text-dnd-red">{primaryMeterValue}</span>
                              <span className="text-xs font-bold text-dnd-ink/30 ml-1">/ 10</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                        <div className="h-3 bg-dnd-ink/5 rounded-full overflow-hidden border border-dnd-ink/5 p-0.5">
                          <motion.div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              primaryMeterValue >= (thresholds[2] || 5) ? "bg-dnd-red" : primaryMeterValue >= (thresholds[1] || 2) ? "bg-orange-500" : "bg-emerald-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${(primaryMeterValue / 10) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-dnd-ink/40">
                          <span className={cn(primaryMeterValue >= (thresholds[0] || 0) && "text-emerald-600")}>Dormant</span>
                          <span className={cn(primaryMeterValue >= (thresholds[1] || 2) && "text-orange-500")}>Evolved</span>
                          <span className={cn(primaryMeterValue >= (thresholds[2] || 5) && "text-dnd-red")}>Feral</span>
                        </div>
                        </div>
                      </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Hooks & Hunger Interactions Side-by-side - Hidden for Tier 0 */}
          {power.tier !== 0 && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Hooks */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-dnd-gold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Echoed Hooks
                    </h4>
                    <div className="space-y-3">
                      {(power.hooks || [
                        { id: 'h1', name: "Familiar Scent", description: "You recognize a scent from your past in a crowded market." },
                      ]).map((hook: any, idx: number) => (
                        <button 
                          key={`hook-${power.id}-${idx}`}
                          onClick={() => setSelectedHook(hook)}
                          className="w-full p-6 text-left rounded-3xl bg-dnd-ink text-white border-2 border-transparent hover:border-dnd-gold transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-4 h-4 text-dnd-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-dnd-gold">{hook.name || hook.type || "Legacy Hook"}</span>
                          </div>
                          <p className="text-[10px] font-serif italic opacity-60 line-clamp-3">
                            {hook.description || hook.text}
                          </p>
                          <div className="mt-3 flex justify-end">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-dnd-gold opacity-0 group-hover:opacity-100 transition-opacity">Click to Expand</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hunger Interactions */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-dnd-red flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Hunger Interactions
                    </h4>
                    <div className="space-y-4">
                      {power.hunger_interactions?.increases?.map((inc: any, idx: number) => (
                        <div key={`inc-${idx}`} className="p-5 bg-red-50/50 border border-red-100 rounded-3xl space-y-2">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="w-3 h-3 text-red-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Increase +{inc.amount}</span>
                          </div>
                          <p className="text-sm font-bold text-dnd-ink leading-tight">{inc.trigger}</p>
                          {inc.note && (
                            <p className="text-[10px] font-serif italic text-red-900/60 leading-relaxed border-l border-red-200 pl-3">
                              {inc.note}
                            </p>
                          )}
                        </div>
                      ))}
                      {power.hunger_interactions?.decreases?.map((dec: any, idx: number) => (
                        <div key={`dec-${idx}`} className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-2">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="w-3 h-3 text-emerald-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Decrease -{dec.amount}</span>
                          </div>
                          <p className="text-sm font-bold text-dnd-ink leading-tight">{dec.trigger}</p>
                        </div>
                      ))}
                      {!power.hunger_interactions && (
                        <div className="p-6 bg-dnd-paper/50 rounded-2xl border border-dashed border-dnd-gold/20 text-center">
                          <p className="text-[10px] text-dnd-ink/30 italic font-black uppercase">Standard consumption rules apply</p>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              {/* Development Paths */}
              {(power.development_paths || power.development) && (
                <div className="pt-12 border-t border-dnd-gold/10 space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-dnd-gold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Development Paths
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(power.development_paths || power.development || []).map((dev: any, idx: number) => (
                      <div 
                        key={`dev-${power.id}-${idx}`}
                        className="p-8 bg-white border-2 border-dnd-gold/10 rounded-[2rem] hover:border-dnd-gold/30 transition-all space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-dnd-gold">{dev.name}</span>
                          <Zap className="w-4 h-4 text-dnd-gold/40" />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] font-black uppercase text-dnd-ink/40 mb-1 tracking-widest">Requirement</p>
                            <p className="text-xs font-serif italic text-dnd-ink/70 leading-relaxed">{dev.requirement}</p>
                          </div>
                          {dev.result && (
                            <div className="pt-4 border-t border-dnd-gold/5">
                              <p className="text-[9px] font-black uppercase text-dnd-gold mb-1 tracking-widest">Evolution Result</p>
                              <p className="text-sm font-bold text-dnd-ink">{dev.result}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-10 mt-6 border-t border-dnd-gold/20">
            {!unlocked && available ? (
              <button 
                onClick={() => {
                  if (power.tier === 0 && (power.player_choice || power.trigger)) {
                    handleBeginInitiation(power.id);
                  } else {
                    handleUnlockPower(power.id);
                  }
                }}
                className="w-full py-6 bg-dnd-ink text-white rounded-3xl font-display text-lg uppercase tracking-[0.4em] font-black hover:bg-dnd-red hover:shadow-2xl transition-all flex items-center justify-center gap-4 group"
              >
                {power.tier === 0 ? "Embrace Initiation" : "Awaken Power"}
                <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
              </button>
            ) : unlocked ? (
              <button 
                onClick={() => handleTogglePower(power.id)}
                className={cn(
                  "w-full py-6 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 group",
                  enabledPowerIds.includes(power.id)
                    ? "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
                    : "bg-dnd-ink/5 border-2 border-dashed border-dnd-ink/10 text-dnd-ink/40 hover:bg-dnd-ink/10"
                )}
              >
                {enabledPowerIds.includes(power.id) ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="font-display font-black uppercase tracking-widest">Awakened & Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    <span className="font-display font-black uppercase tracking-widest">Dormant / Suppressed</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-6 bg-dnd-paper border-2 border-dashed border-dnd-gold/20 rounded-3xl flex items-center justify-center gap-4 text-dnd-ink/30">
                <Lock className="w-5 h-5" />
                <span className="font-display font-black uppercase tracking-widest">Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillTree = () => {
    if (!selectedCategory) return null;

    let nodes: any[] = [];
    let connections: any[] = [];

    // Predefined Layout for Lycanthropy
    if (selectedCategory.id === 'lycanthropy') {
      nodes = [
        { id: 'hollow_banquet', x: 120, y: 60, tier: 0 },
        { id: 'forced_exposure_heathland', x: 320, y: 60, tier: 0 },
        { id: 'the_stag_that_watched', x: 520, y: 60, tier: 0 },
        { id: 'hunger_edge', x: 120, y: 220, tier: 1 },
        { id: 'hollow_scent', x: 320, y: 220, tier: 1 },
        { id: 'split_sense', x: 520, y: 220, tier: 1 },
        { id: 'trial_hunt_the_hollow_stag', x: 320, y: 340, type: 'trial' },
        { id: 'bloodbound_strike', x: 120, y: 460, tier: 2 },
        { id: 'pack_sinew', x: 320, y: 460, tier: 2 },
        { id: 'deadground', x: 520, y: 460, tier: 2 },
        { id: 'trial_the_marrow_rite', x: 220, y: 580, type: 'trial' },
        { id: 'trial_skin_of_the_moor', x: 420, y: 580, type: 'trial' },
        { id: 'the_red_covenant', x: 220, y: 700, tier: 3 },
        { id: 'the_hollow_sovereign', x: 420, y: 700, tier: 3 },
        { id: 'trial_the_hollow_crown_rite', x: 320, y: 820, type: 'trial' },
        { id: 'the_hollow_crown', x: 320, y: 940, tier: 4 },
      ];

      connections = [
        { from: 'hollow_banquet', to: 'hunger_edge' },
        { from: 'forced_exposure_heathland', to: 'hollow_scent' },
        { from: 'the_stag_that_watched', to: 'split_sense' },
        { from: 'hunger_edge', to: 'trial_hunt_the_hollow_stag' },
        { from: 'hollow_scent', to: 'trial_hunt_the_hollow_stag' },
        { from: 'split_sense', to: 'trial_hunt_the_hollow_stag' },
        { from: 'trial_hunt_the_hollow_stag', to: 'bloodbound_strike' },
        { from: 'trial_hunt_the_hollow_stag', to: 'pack_sinew' },
        { from: 'trial_hunt_the_hollow_stag', to: 'deadground' },
        { from: 'bloodbound_strike', to: 'trial_the_marrow_rite' },
        { from: 'pack_sinew', to: 'trial_the_marrow_rite' },
        { from: 'pack_sinew', to: 'trial_skin_of_the_moor' },
        { from: 'deadground', to: 'trial_skin_of_the_moor' },
        { from: 'trial_the_marrow_rite', to: 'the_red_covenant' },
        { from: 'trial_skin_of_the_moor', to: 'the_hollow_sovereign' },
        { from: 'the_red_covenant', to: 'trial_the_hollow_crown_rite' },
        { from: 'the_hollow_sovereign', to: 'trial_the_hollow_crown_rite' },
        { from: 'trial_the_hollow_crown_rite', to: 'the_hollow_crown' },
      ];
    } else if (selectedCategory.id === 'vampirism') {
      nodes = [
        { id: 'the_embrace', x: 320, y: 60, tier: 0 },
        { id: 'the_red_thirst', x: 120, y: 220, tier: 1 },
        { id: 'pale_dominion', x: 320, y: 220, tier: 1 },
        { id: 'the_crimson_veil', x: 520, y: 220, tier: 1 },
        { id: 'trial_the_first_hunt', x: 320, y: 340, type: 'trial' },
        { id: 'blood_sorcery', x: 120, y: 460, tier: 2 },
        { id: 'lord_of_minds', x: 320, y: 460, tier: 2 },
        { id: 'shroud_of_night', x: 520, y: 460, tier: 2 },
        { id: 'trial_the_long_night', x: 320, y: 580, type: 'trial' },
        { id: 'the_red_throne', x: 220, y: 700, tier: 3 },
        { id: 'the_dying_light', x: 420, y: 700, tier: 3 },
        { id: 'trial_the_final_draught', x: 320, y: 820, type: 'trial' },
        { id: 'the_eternal', x: 320, y: 940, tier: 4 },
      ];

      connections = [
        { from: 'the_embrace', to: 'the_red_thirst' },
        { from: 'the_embrace', to: 'pale_dominion' },
        { from: 'the_embrace', to: 'the_crimson_veil' },
        { from: 'the_red_thirst', to: 'trial_the_first_hunt' },
        { from: 'pale_dominion', to: 'trial_the_first_hunt' },
        { from: 'the_crimson_veil', to: 'trial_the_first_hunt' },
        { from: 'trial_the_first_hunt', to: 'blood_sorcery' },
        { from: 'trial_the_first_hunt', to: 'lord_of_minds' },
        { from: 'trial_the_first_hunt', to: 'shroud_of_night' },
        { from: 'blood_sorcery', to: 'trial_the_long_night' },
        { from: 'lord_of_minds', to: 'trial_the_long_night' },
        { from: 'shroud_of_night', to: 'trial_the_long_night' },
        { from: 'trial_the_long_night', to: 'the_red_throne' },
        { from: 'trial_the_long_night', to: 'the_dying_light' },
        { from: 'the_red_throne', to: 'trial_the_final_draught' },
        { from: 'the_dying_light', to: 'trial_the_final_draught' },
        { from: 'trial_the_final_draught', to: 'the_eternal' },
      ];
    } else if (selectedCategory.id === 'eidolon') {
      nodes = [
        { id: 'the_binding', x: 320, y: 60, tier: 0 },
        { id: 'the_shared_voice', x: 120, y: 220, tier: 1 },
        { id: 'the_borrowed_fist', x: 320, y: 220, tier: 1 },
        { id: 'the_opened_eye', x: 520, y: 220, tier: 1 },
        { id: 'trial_the_threshold_contest', x: 320, y: 340, type: 'trial' },
        { id: 'the_manifest_form', x: 120, y: 460, tier: 2 },
        { id: 'the_sovereign_will', x: 320, y: 460, tier: 2 },
        { id: 'the_distant_reach', x: 520, y: 460, tier: 2 },
        { id: 'trial_the_interior_war', x: 320, y: 580, type: 'trial' },
        { id: 'the_concordat', x: 220, y: 700, tier: 3 },
        { id: 'the_fracture_line', x: 420, y: 700, tier: 3 },
        { id: 'trial_the_last_negotiation', x: 320, y: 820, type: 'trial' },
        { id: 'the_unified_being', x: 320, y: 940, tier: 4 },
      ];

      connections = [
        { from: 'the_binding', to: 'the_shared_voice' },
        { from: 'the_binding', to: 'the_borrowed_fist' },
        { from: 'the_binding', to: 'the_opened_eye' },
        { from: 'the_shared_voice', to: 'trial_the_threshold_contest' },
        { from: 'the_borrowed_fist', to: 'trial_the_threshold_contest' },
        { from: 'the_opened_eye', to: 'trial_the_threshold_contest' },
        { from: 'trial_the_threshold_contest', to: 'the_manifest_form' },
        { from: 'trial_the_threshold_contest', to: 'the_sovereign_will' },
        { from: 'trial_the_threshold_contest', to: 'the_distant_reach' },
        { from: 'the_manifest_form', to: 'trial_the_interior_war' },
        { from: 'the_sovereign_will', to: 'trial_the_interior_war' },
        { from: 'the_distant_reach', to: 'trial_the_interior_war' },
        { from: 'trial_the_interior_war', to: 'the_concordat' },
        { from: 'trial_the_interior_war', to: 'the_fracture_line' },
        { from: 'the_concordat', to: 'trial_the_last_negotiation' },
        { from: 'the_fracture_line', to: 'trial_the_last_negotiation' },
        { from: 'trial_the_last_negotiation', to: 'the_unified_being' },
      ];
    } else {
      // Dynamic Layout for other lineages
      const powersByTier: Record<number, Power[]> = {};
      selectedCategory.powers.forEach(p => {
        if (!powersByTier[p.tier]) powersByTier[p.tier] = [];
        powersByTier[p.tier].push(p);
      });

      const TIER_SPACING = 200;
      const X_START = 320;
      const HORIZONTAL_GAP = 200;

      Object.entries(powersByTier).forEach(([tierStr, powers]) => {
        const tier = parseInt(tierStr);
        const y = 60 + tier * TIER_SPACING;
        const totalWidth = (powers.length - 1) * HORIZONTAL_GAP;
        const tierStartX = X_START - (totalWidth / 2);

        powers.forEach((p, idx) => {
          nodes.push({ id: p.id, x: tierStartX + idx * HORIZONTAL_GAP, y, tier });
        });
      });

      // Simple connections between adjacent tiers
      Object.keys(powersByTier).map(t => parseInt(t)).sort((a, b) => a - b).forEach((tier, idx, arr) => {
        if (idx === arr.length - 1) return;
        const nextTier = arr[idx + 1];
        powersByTier[tier].forEach(p => {
          powersByTier[nextTier].forEach(np => {
            connections.push({ from: p.id, to: np.id });
          });
        });
      });

      // Add trials at the bottom for now
      selectedCategory.trials.forEach((t: any, idx: number) => {
        nodes.push({ id: t.id, x: 320 + (idx * 200) - ((selectedCategory.trials.length-1)*100), y: 940, type: 'trial' });
      });
    }

    return (
      <div className="xl:col-span-12 bg-white/50 border-2 border-dnd-gold/10 rounded-3xl p-4 shadow-sm flex flex-col relative">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-dnd-gold/10 shrink-0 px-4">
          <div className="flex items-center gap-3">
             <Zap className="w-5 h-5 text-dnd-red" />
             <h4 className="text-xs uppercase tracking-[0.3em] font-black text-dnd-ink">Ancestral Tree</h4>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="min-w-[640px] min-h-[1050px] relative p-8">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, idx) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromX = `calc(50% + ${fromNode.x - 320}px)`;
                const fromY = fromNode.y + (fromNode.type === 'trial' ? 30 : 45);
                const toX = `calc(50% + ${toNode.x - 320}px)`;
                const toY = toNode.y - (toNode.type === 'trial' ? 30 : 45);

                const isAnyUnlocked = powerState.unlockedPowerIds.includes(conn.from);
                
                let strokeColor = "rgba(22, 28, 36, 0.1)"; // Default locked
                if (isAnyUnlocked) {
                  const nodeTo = nodes.find(n => n.id === conn.to);
                  const isToUnlocked = nodeTo?.type === 'trial' 
                    ? powerState.completedTrialIds.includes(conn.to) 
                    : powerState.unlockedPowerIds.includes(conn.to);
                  
                  if (isToUnlocked) {
                    strokeColor = "#10b981"; // emerald-500
                  } else {
                    const powerTo = allPowers.find((p: any) => p.id === conn.to);
                    if (powerTo && canUnlockPower(powerTo)) {
                      strokeColor = "rgba(212, 175, 55, 0.4)"; // dnd-gold/40
                    }
                  }
                }

                return (
                  <path
                    key={`line-${idx}`}
                    d={`M ${fromNode.x} ${fromY} C ${fromNode.x} ${(fromY + toY) / 2}, ${toNode.x} ${(fromY + toY) / 2}, ${toNode.x} ${toY}`}
                    stroke={strokeColor}
                    strokeWidth="3"
                    fill="none"
                    className="transition-colors duration-500"
                    style={{ transform: `translateX(calc(50% - 320px))` }}
                  />
                );
              })}
            </svg>

            {nodes.map(node => {
              if (node.type === 'trial') {
                const trial = selectedCategory.trials.find((t: any) => t.id === node.id);
                if (!trial) return null;
                const completed = powerState.completedTrialIds.includes(trial.id);

                return (
                  <motion.button
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedTrialId(trial.id)}
                    style={{ left: `calc(50% + ${node.x - 320}px)`, top: node.y }}
                    className={cn(
                        "absolute w-16 h-16 -ml-8 -mt-8 rotate-45 flex items-center justify-center transition-all shadow-xl group z-20 hover:scale-110",
                        completed ? "bg-emerald-600 border-2 border-emerald-400" : "bg-dnd-ink border-2 border-dnd-gold/40"
                    )}
                  >
                    <div className="-rotate-45 flex flex-col items-center">
                        <Scroll className="w-4 h-4 text-dnd-gold mb-1" />
                        <span className="text-[7px] font-black uppercase text-white truncate max-w-[40px] text-center leading-none">
                          {trial.name.includes(':') ? trial.name.split(':')[1].trim().slice(0, 8) : "Trial"}
                        </span>
                    </div>
                    
                    <div className="absolute opacity-0 group-hover:opacity-100 -rotate-45 pointer-events-none transition-opacity bg-dnd-ink border border-dnd-gold/30 text-white p-3 rounded-xl text-[9px] w-48 bottom-full mb-6 z-[100] shadow-2xl">
                        <p className="font-black uppercase tracking-widest text-dnd-gold mb-1 border-b border-dnd-gold/20 pb-1">{trial.name}</p>
                        <p className="font-serif italic text-white/70 leading-relaxed">{trial.description}</p>
                    </div>
                  </motion.button>
                );
              }

              const power = allPowers.find((p: any) => p.id === node.id);
              if (!power) return null;

              const unlocked = isPowerUnlocked(power.id);
              const available = canUnlockPower(power);
              const isSelected = selectedPowerId === power.id;

              return (
                <motion.button
                  key={power.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedPowerId(power.id)}
                  style={{ left: `calc(50% + ${node.x - 320}px)`, top: node.y }}
                  className={cn(
                    "absolute w-[180px] h-[90px] -ml-[90px] -mt-[45px] p-4 rounded-2xl border-2 transition-all shadow-sm flex flex-col justify-between group overflow-hidden",
                    isSelected ? "ring-4 ring-dnd-red/20 z-10 border-dnd-red" : "",
                    unlocked ? "bg-emerald-50 border-emerald-500/30 hover:border-emerald-500" : 
                    available ? "bg-white border-dnd-gold/20 hover:border-dnd-gold" : 
                    "bg-dnd-paper/50 border-dnd-ink/5 grayscale opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start" id={`node-${power.id}`}>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-sm",
                      power.tier === 0 ? "bg-dnd-red" : power.tier === 1 ? "bg-dnd-gold" : power.tier === 2 ? "bg-orange-500" : power.tier === 3 ? "bg-purple-600" : "bg-black"
                    )}>
                      Tier {power.tier}
                    </div>
                    {unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : !available ? (
                      <Lock className="w-4 h-4 text-dnd-ink/20" />
                    ) : (
                      <Unlock className="w-4 h-4 text-dnd-gold" />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h5 className="font-display font-black text-[11px] uppercase tracking-tighter text-dnd-ink line-clamp-2 leading-tight group-hover:text-dnd-red transition-colors">
                        {power.name}
                    </h5>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[7px] font-black uppercase text-dnd-ink/30 tracking-widest">
                       {unlocked ? "Mastered" : available ? "Available" : "Locked"}
                    </span>
                    <Zap className={cn("w-3 h-3 transition-colors", unlocked ? "text-emerald-500" : "text-dnd-ink/10")} />
                  </div>
                  
                  {isSelected && (
                    <motion.div 
                      layoutId="node-glow"
                      className="absolute inset-0 bg-dnd-red/5 pointer-events-none"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => setSelectedCategoryId(null)}
          className="w-full mt-4 py-3 border-2 border-dashed border-dnd-gold/20 rounded-2xl text-[10px] uppercase tracking-widest font-black text-dnd-ink/30 hover:border-dnd-red hover:text-dnd-red transition-all shrink-0"
        >
          Return to Ancestries
        </button>
      </div>
    );
  };

  const handleRollTable = (table: any, isNested = false) => {
    if (!table || !table.results) return null;

    // Determine die type (e.g., "1d10" -> 10)
    let dieSize = 20;
    if (table.roll) {
      const match = table.roll.match(/1d(\d+)/);
      if (match) dieSize = parseInt(match[1]);
    }

    const roll = Math.floor(Math.random() * dieSize) + 1;
    
    const result = table.results.find((r: any) => {
      if (r.range) return roll >= r.range[0] && roll <= r.range[1];
      if (r.threshold) return roll >= r.threshold[0] && roll <= r.threshold[1];
      return false;
    });

    if (!result) return null;

    const rollInfo = { roll, result };

    if (!isNested) {
      const nestedResults: any[] = [];
      
      // Handle recursion for roll_on and also_roll
      const processNested = (targetTableId: string) => {
        const targetTable = allPowers.find(p => p.id === targetTableId && p.category === 'oracle_table');
        if (targetTable) {
          const nested = handleRollTable(targetTable, true);
          if (nested) {
            nestedResults.push({
              tableName: targetTable.name,
              roll: nested.roll,
              result: nested.result
            });
          }
        }
      };

      if (result.roll_on) processNested(result.roll_on);
      if (result.also_roll) processNested(result.also_roll);

      addLog('narrative', `Oracle Roll: ${table.name} [${roll}] -> ${result.narrative || result.mechanic || "Event triggered"}`);
      setOracleRollResult({ main: rollInfo, nested: nestedResults });
    }

    return rollInfo;
  };

  const renderMeter = (category: typeof categories[0]) => {
    if (!category.meters) return null;

    return category.meters.map(meter => {
      const value = powerState.meters[meter.id] || 0;
      const percentage = (value / meter.max) * 100;
      const interactions = category.hunger_interactions?.filter(i => value >= i.threshold) || [];
      const currentInteraction = interactions[interactions.length - 1];

      return (
        <div key={meter.id} className="w-full bg-white border-2 border-dnd-gold/20 rounded-3xl p-8 shadow-sm space-y-10 relative overflow-hidden group">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-dnd-red/10 rounded-2xl group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8 text-dnd-red" />
              </div>
              <div>
                <h3 className="font-display text-3xl uppercase tracking-[0.3em] font-black text-dnd-ink">{meter.name}</h3>
                <p className="text-xs text-dnd-ink/40 font-serif italic mt-1">The primal urge that separates man from beast.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 bg-dnd-paper rounded-2xl p-2 border border-dnd-gold/10">
                <button 
                  onClick={() => handleUpdatePowerMeter(meter.id, -1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-dnd-gold/10 hover:border-dnd-red hover:text-dnd-red transition-all shadow-sm active:scale-90"
                >
                  -
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="font-mono text-3xl font-black text-dnd-ink">{value}</span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-dnd-ink/20">Level</span>
                </div>
                <button 
                  onClick={() => handleUpdatePowerMeter(meter.id, 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-dnd-gold/10 hover:border-dnd-red hover:text-dnd-red transition-all shadow-sm active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Large Horizontal Bar */}
          <div className="relative h-8 bg-dnd-ink/5 rounded-2xl border-2 border-dnd-ink/10 overflow-hidden shadow-inner p-1">
            <motion.div 
              initial={false}
              animate={{ width: `${percentage}%` }}
              className={cn(
                "h-full rounded-xl transition-all duration-700 relative",
                percentage > 80 ? "bg-gradient-to-r from-red-600 to-red-900 shadow-[0_0_25px_rgba(153,27,27,0.4)]" : 
                percentage > 40 ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gradient-to-r from-emerald-600 to-emerald-800"
              )}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white/20 blur-sm mix-blend-overlay opacity-30" />
            </motion.div>
            
            {/* Legend Markers */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mark => (
              <div 
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-dnd-ink/10"
                style={{ left: `${mark * 10}%` }}
              />
            ))}
          </div>

          {/* Effects & Oracles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Current State Interaction */}
              <div className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-500",
                  currentInteraction 
                    ? "bg-dnd-red/[0.03] border-dnd-red/20 shadow-lg" 
                    : "bg-emerald-50/[0.03] border-emerald-500/10"
                )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className={cn("w-5 h-5", currentInteraction ? "text-dnd-red" : "text-emerald-500")} />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-dnd-ink">
                      {currentInteraction ? currentInteraction.name : "Dormant State"}
                    </span>
                  </div>
                  <span className="text-[10px] font-black bg-dnd-ink text-white px-2 py-0.5 rounded uppercase tracking-widest">Soul Resonance</span>
                </div>
                
                <p className="text-sm text-dnd-ink/70 font-serif italic mb-6 leading-relaxed">
                  {currentInteraction ? `"${currentInteraction.narrative_desc}"` : "The beast within sleeps soundly. Your human reason remains unshaken by the moon's pull."}
                </p>

                {/* Integrated Active Lineage Traits */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-dnd-gold" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-dnd-gold">Active Lineage Traits</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {category.powers
                      .filter(p => isPowerUnlocked(p.id))
                      .map((p) => (
                        <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-dnd-gold/10 shadow-sm">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-dnd-red uppercase tracking-widest">{p.name}</span>
                            <span className="text-[10px] font-bold text-dnd-ink/60 truncate max-w-[200px]">{p.effects?.mechanic || "Narrative impact"}</span>
                          </div>
                        </div>
                      ))}
                    {category.powers.filter(p => isPowerUnlocked(p.id)).length === 0 && (
                      <p className="text-[10px] text-dnd-ink/20 font-serif italic py-2">No traits awakened yet.</p>
                    )}
                  </div>
                </div>

                {currentInteraction && (
                  <div className="mt-6 pt-6 border-t border-dnd-gold/10 grid grid-cols-2 gap-3">
                    {currentInteraction.effects.map((eff, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-dnd-gold/10 shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-dnd-red/10 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-dnd-red" />
                        </div>
                        <span className="text-[11px] font-bold text-dnd-ink/80 leading-tight">{eff}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Right: Oracle Tables Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-dnd-gold mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-[0.2em]">Oracle Tables</span>
              </div>
              
              <div className="space-y-3">
                {category.oracle_tables?.map(table => (
                  <button 
                    key={table.id} 
                    onClick={() => {
                      setSelectedOracleTableId(table.id);
                      setOracleRollResult(null);
                    }}
                    className="w-full text-left bg-dnd-paper/40 p-4 rounded-2xl border border-dnd-gold/10 hover:border-dnd-gold/40 hover:bg-white transition-all group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col">
                         <span className="text-xs font-black uppercase tracking-widest text-dnd-ink group-hover:text-dnd-red transition-colors">{table.name.replace('Oracle: ', '')}</span>
                         <span className="text-[10px] text-dnd-ink/50 font-serif italic">Trigger: {table.triggers?.[0]?.condition || "Universal Event"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-dnd-ink text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-dnd-red transition-all shadow-md group-active:scale-95">
                        <Dices className="w-4 h-4" />
                        Consult
                      </div>
                    </div>
                    {/* Tiny representation of results */}
                    <div className="flex gap-1 overflow-hidden">
                      {table.results.slice(0, 5).map((r: any, i: number) => (
                        <div key={i} className="px-1.5 py-0.5 rounded bg-white/50 border border-dnd-gold/5 text-[8px] text-dnd-ink/40 font-mono">
                          {r.range ? `${r.range[0]}-${r.range[1]}` : i}
                        </div>
                      ))}
                      <span className="text-[8px] text-dnd-ink/20 self-center">...</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-dnd-red/5 blur-[120px] pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] pointer-events-none -ml-32 -mb-32" />
        </div>
      );
    });
  };

  const handleChoice = (option: any) => {
    setEventChoiceId(option.id);
    
    // Always log consequence if it exists
    if (option.consequence) {
      addLog('narrative', `Choice Consequence: ${option.consequence}`);
    }

    if (option.id === 'refuse') {
      setActiveEventPowerId(null);
      return;
    }
    
    if (currentEventPower?.skill_check) {
      setEventPhase('check');
    } else {
      setEventPhase('outcome');
      handleFinalizeEvent();
    }
  };

  const handlePerformCheck = () => {
    if (!currentEventPower?.skill_check) return;
    
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Dynamic bonus from character stats
    const statType = currentEventPower.skill_check.type;
    const statValue = (gameState.character.stats as any)[statType] || 10;
    const bonus = Math.floor((statValue - 10) / 2);
    
    const dc = currentEventPower.skill_check.dc;
    const isSuccess = (roll + bonus) >= dc;
    const isCrit = roll === 20;
    
    let resultText = isSuccess ? currentEventPower.skill_check.success : currentEventPower.skill_check.failure;
    if (isCrit && currentEventPower.skill_check.critical_success) {
      resultText = currentEventPower.skill_check.critical_success;
    }

    // Log the result globally
    addLog('narrative', `Spiritual Trial [${statType}]: Roll ${roll} + ${bonus} (mod) = ${roll+bonus} (DC ${dc}). Result: ${isSuccess ? 'SUCCESS' : 'FAILURE'} - ${resultText}`);

    setEventRollResult({ roll, bonus, success: isSuccess, resultText });
    setEventPhase('outcome');
    if (isSuccess) {
      handleFinalizeEvent();
    }
  };

  const handleFinalizeEvent = () => {
    if (!currentEventPower) return;
    
    // Unlock the initiation power
    handleUnlockPower(currentEventPower.id);
    
    // Auto-enable
    if (!enabledPowerIds.includes(currentEventPower.id)) {
      setEnabledPowerIds(prev => [...prev, currentEventPower.id]);
    }
    
    // Unlock linked powers from json
    if (currentEventPower.unlocks) {
      currentEventPower.unlocks.forEach((pid: string) => {
        handleUnlockPower(pid);
        setEnabledPowerIds(prev => prev.includes(pid) ? prev : [...prev, pid]);
      });
    }
  };

  const handleTogglePower = (powerId: string) => {
    setEnabledPowerIds(prev => 
      prev.includes(powerId) 
        ? prev.filter(id => id !== powerId) 
        : [...prev, powerId]
    );
    
    const power = allPowers.find(p => p.id === powerId);
    if (power) {
      const isEnabling = !enabledPowerIds.includes(powerId);
      addLog('info', isEnabling ? `Enabled legacy trait: ${power.name}` : `Suppressed legacy trait: ${power.name}`);
    }
  };

  const handleBeginInitiation = (powerId: string) => {
    setActiveEventPowerId(powerId);
    setEventPhase('intro');
    setEventChoiceId(null);
    setEventRollResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence>
        {activeEventPowerId && currentEventPower && (
          <motion.div 
            key={`event-${activeEventPowerId}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dnd-ink/80 backdrop-blur-sm"
          >
            <div className="bg-dnd-paper max-w-2xl w-full rounded-3xl border-2 border-dnd-gold shadow-2xl overflow-hidden max-h-[95vh] flex flex-col relative">
              {/* Animated Background Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] opacity-30" />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1] 
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-dnd-red/10 via-transparent to-dnd-gold/10" 
                />
              </div>

              <div className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
                {/* Header with improved styling */}
                <div className="flex items-center gap-6 border-b border-dnd-gold/20 pb-8">
                  <motion.div 
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="p-4 bg-dnd-ink text-dnd-gold rounded-2xl shadow-xl border-2 border-dnd-gold/30"
                  >
                    <Flame className="w-8 h-8" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-dnd-gold mb-1">
                      {currentEventPower.tier === 0 ? "Tier 0 - Initiation Event" : "Legacy Awakening"}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl uppercase tracking-widest font-black text-dnd-ink leading-tight drop-shadow-sm">{currentEventPower.name}</h3>
                  </div>
                </div>

                {/* Phase: Intro */}
                {eventPhase === 'intro' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    <div className="bg-white/60 border-2 border-dnd-gold/10 p-10 rounded-[2rem] relative shadow-inner">
                      <div className="absolute -top-4 left-10 px-4 py-1 bg-dnd-ink text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-md shadow-lg">The Call</div>
                      <p className="text-xl md:text-2xl font-serif italic text-dnd-ink leading-relaxed first-letter:text-6xl first-letter:float-left first-letter:mr-4 first-letter:font-black first-letter:text-dnd-red first-letter:mt-1">
                        {currentEventPower.trigger}
                      </p>
                    </div>

                    {currentEventPower.setting && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-dnd-ink/5 p-8 rounded-3xl border-l-[6px] border-dnd-gold/40 italic text-base text-dnd-ink/80 leading-loose flex gap-6"
                      >
                        <Scroll className="w-8 h-8 text-dnd-gold shrink-0 mt-1 opacity-40 shadow-sm" />
                        <p>{currentEventPower.setting}</p>
                      </motion.div>
                    )}

                    <motion.button 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      onClick={() => setEventPhase('choice')}
                      className="w-full py-6 bg-dnd-ink text-white rounded-3xl font-display text-lg uppercase tracking-[0.3em] font-black hover:bg-dnd-red hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg transition-all shadow-xl group flex items-center justify-center gap-4"
                    >
                      Step into the Unknown
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Phase: Choice */}
                {eventPhase === 'choice' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/80 border-2 border-dnd-gold/30 p-8 rounded-2xl">
                      <h4 className="text-xs uppercase font-black text-dnd-red mb-4 tracking-widest">The Prompt</h4>
                      <p className="text-xl font-serif font-bold text-dnd-ink leading-relaxed italic">
                        "{currentEventPower.player_choice?.prompt}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      {currentEventPower.player_choice?.options?.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleChoice(option)}
                          className="w-full text-left p-6 rounded-2xl border-2 border-dnd-gold/20 bg-white hover:border-dnd-red hover:bg-dnd-red/5 transition-all group relative overflow-hidden"
                        >
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-bold text-lg text-dnd-ink group-hover:text-dnd-red transition-colors">{option.label || option.text}</span>
                              {option.consequence && (
                                <span className="text-[10px] text-dnd-ink/40 font-serif italic mt-1">{option.consequence}</span>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-dnd-gold group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase: Skill Check */}
                {eventPhase === 'check' && (
                  <div className="space-y-6 animate-in zoom-in duration-500 text-center py-8">
                     <div className="w-24 h-24 bg-dnd-paper border-4 border-dnd-gold rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                        <Dices className="w-12 h-12 text-dnd-gold" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-dnd-ink uppercase tracking-tighter mb-2">A Test of Resolve</h4>
                        <p className="text-sm text-dnd-ink/60 font-serif italic max-w-sm mx-auto">
                          The spirits of the heathland weigh your spirit. You must succeed a 
                          <span className="text-dnd-red font-bold mx-1">{currentEventPower.skill_check?.type}</span> 
                          check with <span className="text-dnd-gold font-bold">DC {currentEventPower.skill_check?.dc}</span>.
                        </p>
                     </div>
                     <button 
                       onClick={handlePerformCheck}
                       className="px-12 py-4 bg-dnd-ink text-white rounded-2xl font-display text-sm uppercase tracking-[0.3em] font-black hover:bg-dnd-red transition-all shadow-xl active:scale-95"
                     >
                       Roll the Bones
                     </button>
                  </div>
                )}

                {/* Phase: Outcome */}
                {eventPhase === 'outcome' && (
                  <div className="space-y-8 animate-in fade-in duration-1000">
                    {eventRollResult && (
                      <div className={cn(
                        "p-6 rounded-2xl border-2 flex items-center justify-between",
                        eventRollResult.roll === 20 ? "bg-dnd-gold/10 border-dnd-gold/40" : 
                        eventRollResult.success ? "bg-emerald-50 border-emerald-500/30" : "bg-red-50 border-red-500/30"
                      )}>
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "p-3 rounded-xl", 
                             eventRollResult.roll === 20 ? "bg-dnd-gold text-white" :
                             eventRollResult.success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                           )}>
                              {eventRollResult.roll === 20 ? <Sparkles className="w-6 h-6" /> :
                               eventRollResult.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                           </div>
                           <div>
                              <span className="block text-[10px] uppercase font-black tracking-widest text-dnd-ink/40 mb-1">Skill Check Result</span>
                              <div className="flex items-baseline gap-2">
                                <span className={cn(
                                  "font-mono text-2xl font-black",
                                  eventRollResult.roll === 20 ? "text-dnd-gold" : "text-dnd-ink"
                                )}>
                                  {eventRollResult.roll + eventRollResult.bonus}
                                </span>
                                <span className="text-xs text-dnd-ink/40 font-bold">(Roll {eventRollResult.roll} + {eventRollResult.bonus})</span>
                              </div>
                           </div>
                        </div>
                        <span className={cn(
                          "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", 
                          eventRollResult.roll === 20 ? "bg-dnd-gold text-white" :
                          eventRollResult.success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        )}>
                           {eventRollResult.roll === 20 ? "Natural 20!" : eventRollResult.success ? "Success" : "Failure"}
                        </span>
                      </div>
                    )}

                    <div className="bg-white border-2 border-dnd-gold/10 p-8 rounded-2xl shadow-inner relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none" />
                      <h4 className="text-xs uppercase font-black text-dnd-gold mb-6 tracking-widest">
                        {eventRollResult?.roll === 20 ? "Transcendent Awakening" : 
                         eventRollResult?.success ? "The Legacy Awakens" : "The Soul is Scored"}
                      </h4>
                      <p className="text-lg font-serif italic text-dnd-ink leading-[2] first-letter:text-5xl first-letter:float-left first-letter:mr-4 first-letter:font-black first-letter:text-dnd-red">
                        {currentEventPower.narrative_outcome}
                      </p>
                      
                      <div className="mt-8 pt-8 border-t border-dnd-gold/10 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                           <Sparkles className="w-4 h-4" />
                           {eventRollResult?.roll === 20 ? "Exalted Path" : "Transformation Path"}
                        </span>
                        <div className={cn(
                          "p-6 rounded-xl border-l-4",
                          eventRollResult?.roll === 20 ? "bg-dnd-gold/5 border-dnd-gold" :
                          eventRollResult?.success ? "bg-emerald-50/50 border-emerald-500/30" : "bg-red-50/50 border-red-500/30"
                        )}>
                          <p className="text-base font-bold text-dnd-ink/80 leading-relaxed italic">
                            "{eventRollResult?.resultText || "The path is set. The beast within begins its growl."}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveEventPowerId(null)}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-display text-sm uppercase tracking-[0.2em] font-black hover:bg-emerald-700 transition-all shadow-xl"
                    >
                      Embrace the Outcome
                    </button>
                  </div>
                )}

                {/* Footer Controls (Retreating) */}
                {eventPhase !== 'outcome' && (
                  <button 
                    onClick={() => setActiveEventPowerId(null)}
                    className="w-full py-2 text-xs font-black uppercase tracking-widest text-dnd-ink/40 hover:text-dnd-red transition-colors mt-4"
                  >
                    Retreat for now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 mb-10">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-dnd-ink text-white rounded-2xl">
              <History className="w-8 h-8" />
           </div>
           <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-4xl uppercase tracking-[0.2em] font-black text-dnd-ink">Legacy</h2>
                <HelpButton sectionKey="legacy" size="md" />
              </div>
              <p className="text-sm text-dnd-ink/40 font-serif italic">Trace the path of your ancestors and the forces that bind your soul.</p>
           </div>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key={selectedCategory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Horizontal Hunger Section - TAKES FULL WIDTH */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex p-1 bg-dnd-ink/5 rounded-2xl border border-dnd-gold/10">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'list' ? "bg-dnd-ink text-white shadow-lg" : "text-dnd-ink/40 hover:text-dnd-ink"
                  )}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === 'tree' ? "bg-dnd-ink text-white shadow-lg" : "text-dnd-ink/40 hover:text-dnd-ink"
                  )}
                >
                  Tree View
                </button>
              </div>
            </div>

            {renderMeter(selectedCategory)}

            {/* Category Dashboard Bottom Half - Dedicate space to Tiers and Detail */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
              {/* Conditional Navigation: List or Tree */}
              {viewMode === 'tree' ? (
                <>
                  {renderSkillTree()}
                  
                  {/* Tree Mode Modals */}
                  <AnimatePresence>
                    {selectedPowerId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dnd-ink/70 backdrop-blur-sm"
                        onClick={() => setSelectedPowerId(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 30 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 30 }}
                          className="bg-white max-w-4xl w-full h-[85vh] rounded-[3rem] border-2 border-dnd-gold shadow-2xl overflow-hidden relative flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                           <button 
                            onClick={() => setSelectedPowerId(null)}
                            className="absolute top-8 right-8 p-3 rounded-full bg-dnd-paper/50 hover:bg-white transition-all z-[130] shadow-md group"
                          >
                            <XCircle className="w-8 h-8 text-dnd-ink/40 group-hover:text-dnd-red" />
                          </button>
                          <div className="flex-1 overflow-hidden">
                            {renderPowerDetail(allPowers.find((p: any) => p.id === selectedPowerId))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {selectedTrialId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-dnd-ink/70 backdrop-blur-sm"
                        onClick={() => setSelectedTrialId(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 30 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 30 }}
                          className="bg-white max-w-2xl w-full h-[70vh] rounded-[3rem] border-2 border-dnd-gold shadow-2xl overflow-hidden relative flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                           <button 
                            onClick={() => setSelectedTrialId(null)}
                            className="absolute top-8 right-8 p-3 rounded-full bg-dnd-paper/50 hover:bg-white transition-all z-[130] shadow-md group"
                          >
                            <XCircle className="w-8 h-8 text-dnd-ink/40 group-hover:text-dnd-red" />
                          </button>
                          <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                            {renderTrialDetail(selectedCategory.trials.find((t: any) => t.id === selectedTrialId))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="xl:col-span-4 space-y-10 sticky top-8">
                  <div className="bg-white/50 border-2 border-dnd-gold/10 rounded-3xl p-8 shadow-sm flex flex-col max-h-[50vh] xl:max-h-[85vh]">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-dnd-gold/10 shrink-0">
                    <div className="flex items-center gap-3">
                       <Zap className="w-5 h-5 text-dnd-red" />
                       <h4 className="text-xs uppercase tracking-[0.3em] font-black text-dnd-ink">Legacy Tiers</h4>
                    </div>
                    <span className="text-[10px] font-black text-dnd-ink/40 uppercase tracking-widest">{selectedCategory.powers.filter(p => isPowerUnlocked(p.id)).length} Awoken</span>
                  </div>

                  <div className="space-y-12 overflow-y-auto pr-4 custom-scrollbar">
                    {[0, 1, 2, 3, 4].map(tier => {
                      const tierPowers = selectedCategory.powers.filter(p => p.tier === tier);
                      if (tierPowers.length === 0) return null;

                      return (
                        <div key={`tier-nav-${tier}`} className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-dnd-ink text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                              Tier {tier}
                            </div>
                            <div className="h-px flex-1 bg-dnd-gold/10" />
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {tierPowers.map(power => {
                              const unlocked = isPowerUnlocked(power.id);
                              const available = canUnlockPower(power);
                              const isSelected = selectedPowerId === power.id;

                              return (
                                <button 
                                  key={`nav-btn-${power.id}`}
                                  onClick={() => setSelectedPowerId(power.id)}
                                  className={cn(
                                    "group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left",
                                    isSelected
                                      ? "bg-dnd-red border-dnd-red shadow-xl translate-x-2"
                                      : unlocked 
                                        ? "bg-emerald-50/50 border-emerald-500/30 hover:border-emerald-500" 
                                        : available 
                                          ? "bg-white border-dnd-gold/10 hover:border-dnd-gold shadow-sm" 
                                          : "bg-dnd-paper/30 border-dnd-ink/5 opacity-50 grayscale select-none"
                                  )}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                      isSelected ? "bg-white text-dnd-red" : unlocked ? "bg-emerald-500 text-white" : "bg-dnd-paper text-dnd-gold"
                                    )}>
                                      {power.tier === 0 ? <Flame className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <h5 className={cn(
                                          "font-display font-black text-sm uppercase tracking-tight transition-colors",
                                          isSelected ? "text-white" : "text-dnd-ink group-hover:text-dnd-red"
                                        )}>
                                          {power.name}
                                        </h5>
                                        {unlocked ? (
                                          <CheckCircle2 className={cn("w-4 h-4", isSelected ? "text-white" : "text-emerald-500")} />
                                        ) : !available ? (
                                          <Lock className="w-4 h-4 text-dnd-ink/20" />
                                        ) : (
                                          <Unlock className={cn("w-4 h-4", isSelected ? "text-white" : "text-dnd-gold")} />
                                        )}
                                      </div>
                                      <p className={cn(
                                        "text-[10px] font-serif italic line-clamp-1 mt-1 transition-colors",
                                        isSelected ? "text-white/60" : "text-dnd-ink/60"
                                      )}>
                                        {power.description}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setSelectedCategoryId(null)}
                    className="w-full mt-10 py-4 border-2 border-dashed border-dnd-gold/20 rounded-2xl text-[10px] uppercase tracking-widest font-black text-dnd-ink/30 hover:border-dnd-red hover:text-dnd-red transition-all"
                  >
                    Return to Ancestries
                  </button>
                </div>

                {/* Spiritual Trials Column if any are active */}
                <div className="bg-dnd-ink/95 rounded-3xl p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <Scroll className="w-6 h-6 text-dnd-gold" />
                      <h4 className="font-display text-xl uppercase tracking-widest font-black">Spiritual Trials</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedCategory.trials?.map(trial => {
                        const completed = powerState.completedTrialIds.includes(trial.id);
                        return (
                          <div 
                            key={trial.id} 
                            id={`trial-nav-${trial.id}`}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all",
                              completed 
                                ? "bg-emerald-900/30 border-emerald-500/50" 
                                : "bg-white/5 border-white/10 hover:border-dnd-gold/50"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-sm text-dnd-gold">{trial.name}</h5>
                              {completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <p className="text-[10px] text-white/60 font-serif italic leading-relaxed mb-4">
                              {trial.description}
                            </p>
                            <div className="space-y-2">
                               <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Requirements</span>
                               <ul className="space-y-1">
                                 {trial.requirements.map((req, i) => (
                                   <li key={i} className="text-[9px] text-white/80 flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-dnd-gold" />
                                     {req}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                            {!completed && (
                              <button 
                                onClick={() => handleCompletePowerTrial(trial.id)}
                                className="mt-4 w-full py-1.5 bg-dnd-gold text-dnd-ink text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all"
                              >
                                Complete Trial
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-dnd-gold/5 blur-[100px] pointer-events-none" />
                </div>
              </div>
            )}

              {/* Right Column: Detailed Power View */}
              <div className="xl:col-span-8">
                <AnimatePresence mode="wait">
                  {selectedPowerId ? (
                    <motion.div
                      ref={detailRef}
                      key={selectedPowerId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white border-2 border-dnd-gold/20 rounded-[2.5rem] shadow-2xl sticky top-8 max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden"
                    >
                      {renderPowerDetail(allPowers.find((p: any) => p.id === selectedPowerId))}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 bg-dnd-paper/30 border-4 border-dashed border-dnd-gold/10 rounded-[3rem]">
                      <History className="w-16 h-16 text-dnd-gold/20" />
                      <div>
                        <h4 className="font-display text-2xl font-black text-dnd-ink uppercase tracking-widest mb-4">Select a Legacy Trait</h4>
                        <p className="text-sm text-dnd-ink/40 font-serif italic">Choose a node to reveal its secrets and consequences.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(category => {
                const unlockedCount = category.powers.filter(p => isPowerUnlocked(p.id)).length;
                const totalCount = category.powers.length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="relative group text-left p-8 rounded-3xl border-2 bg-white border-dnd-gold/10 hover:border-dnd-gold hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 rounded-2xl bg-dnd-paper text-dnd-gold group-hover:bg-dnd-red group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-12">
                          <History className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] uppercase tracking-widest font-black text-dnd-ink/30 mb-1">Affinity</span>
                          <span className="font-mono text-xl font-black text-dnd-gold">{Math.round((unlockedCount / totalCount) * 100)}%</span>
                        </div>
                      </div>
                      
                      <h3 className="font-display text-2xl font-black text-dnd-ink mb-3 uppercase tracking-tighter group-hover:text-dnd-red transition-colors">
                        {category.name}
                      </h3>
                      
                      <p className="text-sm text-dnd-ink/60 font-serif leading-relaxed italic mb-8">
                        {category.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-dnd-gold/10">
                         <span className="text-[10px] font-black uppercase tracking-widest text-dnd-ink/40">Explore Lineage</span>
                         <ChevronRight className="w-5 h-5 text-dnd-gold group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>

                    {/* Decorative Background */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-dnd-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  </button>
                );
              })}
            </div>

            <div className="text-center py-20 space-y-6 bg-dnd-paper/30 border-2 border-dashed border-dnd-gold/20 rounded-3xl">
              <div className="w-16 h-16 bg-dnd-paper rounded-full flex items-center justify-center mx-auto border-2 border-dnd-gold/20 text-dnd-gold/40">
                <Skull className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-dnd-ink uppercase tracking-widest">The Soul's Echo</h3>
                <p className="text-sm text-dnd-ink/40 font-serif italic max-w-sm mx-auto mt-2">
                  Trace the path of your ancestors. Some legacies are gifts, others are curses that will consume your very soul if left unchecked.
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedHook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dnd-ink/90 backdrop-blur-md"
            onClick={() => setSelectedHook(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dnd-paper max-w-xl w-full max-h-[90vh] rounded-[2.5rem] border-2 border-dnd-gold shadow-2xl overflow-hidden relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedHook(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-dnd-ink/5 transition-all z-10"
              >
                <XCircle className="w-8 h-8 text-dnd-ink/40 hover:text-dnd-red" />
              </button>

              <div className="p-10 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-4 text-dnd-gold">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em]">Echoed Hook</h3>
                    <h2 className="text-2xl font-display font-black text-dnd-ink uppercase tracking-widest leading-tight">{selectedHook.name || selectedHook.type || "Legacy Hook"}</h2>
                  </div>
                </div>

                <div className="bg-white/40 border-2 border-dnd-gold/10 p-8 rounded-[2rem] shadow-inner">
                  <p className="text-xl font-serif italic text-dnd-ink leading-relaxed">
                    {selectedHook.description || selectedHook.text}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedHook(null)}
                  className="w-full py-4 bg-dnd-ink text-white rounded-2xl font-black uppercase tracking-widest hover:bg-dnd-red transition-all"
                >
                  Return to Path
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOracleTableId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dnd-ink/90 backdrop-blur-md"
            onClick={() => setSelectedOracleTableId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white max-w-5xl w-full h-[85vh] rounded-[3rem] border-2 border-dnd-gold shadow-2xl overflow-hidden relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedOracleTableId(null)}
                className="absolute top-8 right-8 p-3 rounded-full bg-dnd-paper/50 hover:bg-white transition-all z-[130] shadow-md group"
              >
                <XCircle className="w-8 h-8 text-dnd-ink/40 group-hover:text-dnd-red" />
              </button>
              <div className="flex-1 overflow-hidden">
                {renderOracleDetail(allPowers.find(p => p.id === selectedOracleTableId))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
