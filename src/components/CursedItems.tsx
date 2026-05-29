import React, { useState, useEffect } from 'react';
import { 
  Skull, Flame, Sparkles, BookOpen, User, Dices, ChevronRight, CheckCircle2, 
  Trash2, Download, Copy, RefreshCw, Layers, Shield, Sparkle, AlertTriangle, HelpCircle,
  Gem, Eye, Heart, Sword, ShieldAlert, BadgeAlert, Plus, BookText, Scroll
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import cursedItemsData from '../data/cursed_items.json';
import { HelpButton } from './HelpOverlay';

interface IdentityBlock {
  id: string;
  type: string;
  compatibility_tags: string[];
  name: string;
  material: string;
  visual_detail: string;
  sensory_detail: string;
  theme_tags: string[];
}

interface PrimaryEffect {
  name: string;
  compatibility_tags: string[];
  description: string;
}

interface SecondaryEffect {
  name: string;
  compatibility_tags: string[];
  description: string;
}

interface CurseStage {
  stage: number;
  trigger: string;
  effect: string;
}

interface LatentCurse {
  trigger: string;
  effect: string;
  note?: string;
}

interface ActiveCurse {
  effect: string;
}

interface ConditionalCurse {
  effect_when_true: string;
  effect_when_false: string;
}

interface CurseBlock {
  name: string;
  curse_type: 'progressive' | 'latent' | 'active' | 'conditional';
  theme_tags: string[];
  stages?: CurseStage[];
  latent?: LatentCurse;
  active?: ActiveCurse;
  conditional?: ConditionalCurse;
  curse_tell: string;
}

interface StoryBlock {
  title: string;
  origin_type: string;
  theme_tags: string[];
  creator: string;
  original_purpose: string;
  what_went_wrong: string;
  current_bearer_history: string;
  oracle_seed: string;
}

interface GeneratedCursedItem {
  uid: string;
  identity: IdentityBlock;
  primaryEffect: PrimaryEffect;
  secondaryEffect: SecondaryEffect;
  curse: CurseBlock;
  story: StoryBlock;
  dateGenerated: string;
  notes?: string;
}

export function CursedItemsSection() {
  const [selectedCompatTag, setSelectedCompatTag] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [themeFilter, setThemeFilter] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GeneratedCursedItem | null>(null);
  const [savedItems, setSavedItems] = useState<GeneratedCursedItem[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>('');
  
  // Oracle Interactive Roller
  const [oracleQuestion, setOracleQuestion] = useState<string>('');
  const [oracleResult, setOracleResult] = useState<{ roll: number; answer: string; suffix?: string } | null>(null);
  const [d20Roll, setD20Roll] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load saved items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dnd_saved_cursed_items');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved cursed items', e);
    }
  }, []);

  // Save items to localStorage
  const saveToLocalStorage = (items: GeneratedCursedItem[]) => {
    try {
      localStorage.setItem('dnd_saved_cursed_items', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cursed items', e);
    }
  };

  // Extract all unique item types
  const allTypes = Array.from(new Set(cursedItemsData.identity_blocks.map(item => item.type))).sort();
  
  // Extract all unique theme tags for filters
  const allThemeTags = Array.from(
    new Set([
      ...cursedItemsData.identity_blocks.flatMap(item => item.theme_tags || []),
      ...cursedItemsData.curse_blocks.flatMap(c => c.theme_tags || []),
      ...cursedItemsData.story_blocks.flatMap(s => s.theme_tags || [])
    ])
  ).sort();

  // Get macro category for a type
  const getCompatTagForType = (type: string): string => {
    const found = cursedItemsData.identity_blocks.find(i => i.type === type);
    return found ? found.compatibility_tags[0] : '';
  };

  // Helper macro labels
  const macroLabels: Record<string, string> = {
    'weapon': 'Weapon / Off-hand',
    'worn_body': 'Worn Attire / Armor',
    'worn_jewelry': 'Worn Jewelry / Trinket',
    'held': 'Held Auxiliary / Item',
    'consumed': 'Consumed / Intimate Relic'
  };

  // Filter types based on macro category selection
  const filteredTypes = allTypes.filter(type => {
    if (selectedCompatTag === 'All') return true;
    return getCompatTagForType(type) === selectedCompatTag;
  });

  // Handle category change to reset specific subtype if invalid
  const handleCompatTagChange = (tag: string) => {
    setSelectedCompatTag(tag);
    setSelectedType('All');
  };

  // Generation Core Algorithm (Asymmetric Modular generation)
  const generateCursedItem = () => {
    // FASE 1 & 2: Select Identity Block (Form & Aesthetics)
    let availableIdentity = cursedItemsData.identity_blocks as IdentityBlock[];
    
    // Filter by style
    if (selectedType !== 'All') {
      availableIdentity = availableIdentity.filter(i => i.type === selectedType);
    } else if (selectedCompatTag !== 'All') {
      availableIdentity = availableIdentity.filter(i => i.compatibility_tags.includes(selectedCompatTag));
    }

    if (themeFilter !== 'All') {
      availableIdentity = availableIdentity.filter(i => i.theme_tags.includes(themeFilter));
    }

    // fallback if filter is too restrictive
    if (availableIdentity.length === 0) {
      availableIdentity = cursedItemsData.identity_blocks as IdentityBlock[];
    }

    // Pick random identity block
    const identity = availableIdentity[Math.floor(Math.random() * availableIdentity.length)];
    const idCompatTags = identity.compatibility_tags;
    const idThemeTags = identity.theme_tags;

    // FASE 3: Select Curse and Story based on theme intersection tags (Resonance Circuit)
    let matchingCurses = (cursedItemsData.curse_blocks as CurseBlock[]).filter(c => 
      c.theme_tags.some(tag => idThemeTags.includes(tag))
    );
    if (matchingCurses.length === 0) {
      matchingCurses = cursedItemsData.curse_blocks as CurseBlock[];
    }
    const curse = matchingCurses[Math.floor(Math.random() * matchingCurses.length)];

    let matchingStories = (cursedItemsData.story_blocks as StoryBlock[]).filter(s => 
      s.theme_tags.some(tag => idThemeTags.includes(tag))
    );
    if (matchingStories.length === 0) {
      matchingStories = cursedItemsData.story_blocks as StoryBlock[];
    }
    const story = matchingStories[Math.floor(Math.random() * matchingStories.length)];

    // FASE 4: Select Primary and Secondary effects based on compatibility tags (Mechanical Slot Circuit)
    let matchingPrimary = (cursedItemsData.primary_effects as PrimaryEffect[]).filter(p => 
      p.compatibility_tags.some(tag => idCompatTags.includes(tag))
    );
    if (matchingPrimary.length === 0) {
      matchingPrimary = cursedItemsData.primary_effects as PrimaryEffect[];
    }
    const primaryEffect = matchingPrimary[Math.floor(Math.random() * matchingPrimary.length)];

    let matchingSecondary = (cursedItemsData.secondary_effects as SecondaryEffect[]).filter(s => 
      s.compatibility_tags.some(tag => idCompatTags.includes(tag))
    );
    if (matchingSecondary.length === 0) {
      matchingSecondary = cursedItemsData.secondary_effects as SecondaryEffect[];
    }
    const secondaryEffect = matchingSecondary[Math.floor(Math.random() * matchingSecondary.length)];

    // FASE 5: Assemble and show the polished Cursed Item
    const newItem: GeneratedCursedItem = {
      uid: 'curse_' + Math.random().toString(36).substr(2, 9),
      identity,
      primaryEffect,
      secondaryEffect,
      curse,
      story,
      dateGenerated: new Date().toLocaleDateString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      })
    };

    setActiveItem(newItem);
    setOracleResult(null); // Reset oracle
    setD20Roll(null);
  };

  // Individual Component Rerolls (Honoring slot compatibility & theme resonance)
  const rerollPrimaryEffect = () => {
    if (!activeItem) return;
    const currentCompatTags = activeItem.identity.compatibility_tags;
    let matching = (cursedItemsData.primary_effects as PrimaryEffect[]).filter(p =>
      p.compatibility_tags.some(tag => currentCompatTags.includes(tag))
    );
    if (matching.length === 0) {
      matching = cursedItemsData.primary_effects as PrimaryEffect[];
    }
    const others = matching.filter(p => p.name !== activeItem.primaryEffect.name);
    const pool = others.length > 0 ? others : matching;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    setActiveItem({
      ...activeItem,
      primaryEffect: chosen
    });
  };

  const rerollSecondaryEffect = () => {
    if (!activeItem) return;
    const currentCompatTags = activeItem.identity.compatibility_tags;
    let matching = (cursedItemsData.secondary_effects as SecondaryEffect[]).filter(s =>
      s.compatibility_tags.some(tag => currentCompatTags.includes(tag))
    );
    if (matching.length === 0) {
      matching = cursedItemsData.secondary_effects as SecondaryEffect[];
    }
    const others = matching.filter(s => s.name !== activeItem.secondaryEffect.name);
    const pool = others.length > 0 ? others : matching;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    setActiveItem({
      ...activeItem,
      secondaryEffect: chosen
    });
  };

  const rerollCurse = () => {
    if (!activeItem) return;
    const idThemeTags = activeItem.identity.theme_tags;
    let matching = (cursedItemsData.curse_blocks as CurseBlock[]).filter(c =>
      c.theme_tags.some(tag => idThemeTags.includes(tag))
    );
    if (matching.length === 0) {
      matching = cursedItemsData.curse_blocks as CurseBlock[];
    }
    const others = matching.filter(c => c.name !== activeItem.curse.name);
    const pool = others.length > 0 ? others : matching;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    setActiveItem({
      ...activeItem,
      curse: chosen
    });
  };

  const rerollStory = () => {
    if (!activeItem) return;
    const idThemeTags = activeItem.identity.theme_tags;
    let matching = (cursedItemsData.story_blocks as StoryBlock[]).filter(s =>
      s.theme_tags.some(tag => idThemeTags.includes(tag))
    );
    if (matching.length === 0) {
      matching = cursedItemsData.story_blocks as StoryBlock[];
    }
    const others = matching.filter(s => s.title !== activeItem.story.title);
    const pool = others.length > 0 ? others : matching;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    setActiveItem({
      ...activeItem,
      story: chosen
    });
    setOracleResult(null); // Reset oracle answer on story change
  };

  // Save current item
  const handleSaveItem = () => {
    if (!activeItem) return;
    if (savedItems.some(i => i.identity.id === activeItem.identity.id && i.curse.name === activeItem.curse.name)) {
      alert('This exact item configuration is already saved in your Reliquary.');
      return;
    }
    const updated = [activeItem, ...savedItems];
    setSavedItems(updated);
    saveToLocalStorage(updated);
  };

  // Delete saved item
  const handleDeleteItem = (uid: string) => {
    const updated = savedItems.filter(item => item.uid !== uid);
    setSavedItems(updated);
    saveToLocalStorage(updated);
    if (activeItem?.uid === uid) {
      setActiveItem(null);
    }
  };

  // Add notes to item
  const handleSaveNotes = (uid: string) => {
    const updated = savedItems.map(item => {
      if (item.uid === uid) {
        return { ...item, notes: editedNotes };
      }
      return item;
    });
    setSavedItems(updated);
    saveToLocalStorage(updated);
    setEditingNotesId(null);
    if (activeItem?.uid === uid) {
      setActiveItem({ ...activeItem, notes: editedNotes });
    }
  };

  const startEditingNotes = (item: GeneratedCursedItem) => {
    setEditingNotesId(item.uid);
    setEditedNotes(item.notes || '');
  };

  // Copy item to clipboard as markdown
  const copyToClipboard = () => {
    if (!activeItem) return;

    const md = `
# ${activeItem.identity.name}
*Cursed ${activeItem.identity.type.toUpperCase()} (${macroLabels[activeItem.identity.compatibility_tags[0]] || activeItem.identity.compatibility_tags[0]})*

### Description & Aesthetics
* **Material Composition:** ${activeItem.identity.material}
* **Visual Aberration:** ${activeItem.identity.visual_detail}
* **Sensory Impress:** ${activeItem.identity.sensory_detail}

### Dual Mechanical Systems
* **Primary Attunement Benefit [${activeItem.primaryEffect.name}]:** ${activeItem.primaryEffect.description}
* **Secondary Tactical Surge [${activeItem.secondaryEffect.name}]:** ${activeItem.secondaryEffect.description}

### The Sinister Price [${activeItem.curse.name} - ${activeItem.curse.curse_type.toUpperCase()} CURSE]
${
  activeItem.curse.curse_type === 'progressive' ? 
  activeItem.curse.stages?.map(s => `* **Stage ${s.stage} (${s.trigger}):** ${s.effect}`).join('\n') :
  activeItem.curse.curse_type === 'latent' ?
  `* **Trigger:** ${activeItem.curse.latent?.trigger}\n* **Effect:** ${activeItem.curse.latent?.effect}${activeItem.curse.latent?.note ? `\n* **Suppression Rite:** ${activeItem.curse.latent?.note}` : ''}` :
  activeItem.curse.curse_type === 'active' ?
  `* **Constant Malice:** ${activeItem.curse.active?.effect}` :
  `* **True Resonance:** ${activeItem.curse.conditional?.effect_when_true}\n* **False/Neglected Deficit:** ${activeItem.curse.conditional?.effect_when_false}`
}
* **Curse Manifestation (The Tell):** *${activeItem.curse.curse_tell}*

### Chronicle of Ruin [${activeItem.story.title}]
* **Origin Profile:** ${activeItem.story.origin_type.toUpperCase()}
* **Prime Architect:** ${activeItem.story.creator}
* **Sanctified Intent:** ${activeItem.story.original_purpose}
* **The Defilement:** ${activeItem.story.what_went_wrong}
* **Trace Bearer Chronicle:** ${activeItem.story.current_bearer_history}
* **Oracle Consultation Seed:** *"${activeItem.story.oracle_seed}"*
`.trim();

    navigator.clipboard.writeText(md).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Interactive Oracle Roller
  const handleAskOracle = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    let answer = '';
    let suffix = '';

    if (roll === 1) {
      answer = "Uncompromising NO, accompanied by a sudden, violent reaction from the curse.";
      suffix = "The item turns extremely cold or its sensory pulse spikes, giving a physical warning.";
    } else if (roll <= 5) {
      answer = "NO, and...";
      suffix = "The artifact's current burden remains high.";
    } else if (roll <= 9) {
      answer = "NO, with a lingering constraint.";
      suffix = "You require more preparation or must offer a sacrifice of some sort.";
    } else if (roll <= 11) {
      answer = "No, but...";
      suffix = "Perhaps the balance can be nudged.";
    } else if (roll <= 15) {
      answer = "YES, but...";
      suffix = "The item cooperates, but the curse triggers a mild, temporary setback.";
    } else if (roll <= 19) {
      answer = "YES, and...";
      suffix = "The entity whispers exactly what you want to hear.";
    } else {
      answer = "Pure, absolute YES.";
      suffix = "The item's regular curse is briefly completely calm for the scene.";
    }

    setOracleResult({ roll, answer, suffix });
  };

  const rollD20 = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setD20Roll(roll);
  };

  // Generate on load if nothing exists
  useEffect(() => {
    if (!activeItem) {
      generateCursedItem();
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 text-dnd-ink antialiased w-full" id="cursed-generator-root">
      
      {/* 1. Artifact Evoker (Full-width Filter and Generator Board) */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between h-auto">
        {/* Subtle gold ribbon top */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-dnd-gold opacity-90" />
        
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dnd-gold/12 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-dnd-red/10 text-dnd-red rounded-xl border border-dnd-red/20 shadow-inner">
                <Skull className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-xl tracking-tight uppercase text-dnd-ink leading-tight">Artifact Evoker</h3>
                  <HelpButton sectionKey="cursed" size="sm" />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-dnd-red/70 font-bold">Cursed Lore Engine</p>
              </div>
            </div>
            <p className="font-serif italic text-xs text-dnd-ink/75 max-w-xl md:text-right leading-relaxed">
              Weave unique structural aesthetics with abstract, balanced mechanics and dark, progressive costs inside a fully configurable modular loop.
            </p>
          </div>

          {/* Grid Layout for filters in full width */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Circuit A Filter: Compatibility Tag */}
            <div className="space-y-2">
              <label className="font-display text-[9.5px] uppercase tracking-widest font-black text-dnd-ink/65 flex items-center justify-between border-b border-dnd-gold/10 pb-1">
                <span>Rule-Set Slot (Circuito A)</span>
                <span className="font-mono text-dnd-gold text-[8.5px] font-black">{selectedCompatTag.toUpperCase()}</span>
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleCompatTagChange('All')}
                  className={`text-[9.5px] font-display uppercase tracking-wider py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    selectedCompatTag === 'All' 
                      ? 'bg-dnd-ink border-dnd-gold text-white font-bold' 
                      : 'bg-white border-dnd-gold/15 text-dnd-ink/70 hover:border-dnd-gold/40 hover:bg-dnd-paper/50'
                  }`}
                >
                  All Slots
                </button>
                {Object.keys(macroLabels).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleCompatTagChange(tag)}
                    className={`text-[9.5px] font-display uppercase tracking-wider py-1.5 px-2 rounded-lg border transition-all truncate text-left flex items-center gap-1 cursor-pointer ${
                      selectedCompatTag === tag 
                        ? 'bg-dnd-ink border-dnd-gold text-white font-bold' 
                        : 'bg-white border-dnd-gold/15 text-dnd-ink/70 hover:border-dnd-gold/40 hover:bg-dnd-paper/50'
                    }`}
                    title={macroLabels[tag]}
                  >
                    <span className="w-1 h-2 rounded-full bg-dnd-gold shrink-0" />
                    {tag.replace('worn_', '').replace('held', 'held').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Circuit A Subtype Filter */}
            <div className="space-y-2">
              <label className="font-display text-[9.5px] uppercase tracking-widest font-black text-dnd-ink/65 flex items-center justify-between border-b border-dnd-gold/10 pb-1">
                <span>Specific Morphology</span>
                <span className="font-mono text-dnd-gold text-[8.5px] font-semibold">{selectedType.toUpperCase()}</span>
              </label>
              <div className="flex flex-col justify-center h-[calc(100%-25px)]">
                <p className="font-serif italic text-[11px] text-dnd-ink/50 mb-2">Filter by precise physical form:</p>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs font-serif bg-white border border-dnd-gold/25 rounded-lg px-3 py-2 text-dnd-ink shadow-sm focus:outline-none focus:ring-1 focus:ring-dnd-gold cursor-pointer"
                >
                  <option value="All">All Physical Shapes</option>
                  {filteredTypes.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()} ({getCompatTagForType(type).replace('worn_', '').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Circuit B Filter: Resonance Theme Tag */}
            <div className="space-y-2">
              <label className="font-display text-[9.5px] uppercase tracking-widest font-black text-dnd-ink/65 flex items-center justify-between border-b border-dnd-gold/10 pb-1">
                <span>Resonance Theme (Circuito B)</span>
                <span className="font-mono text-dnd-gold text-[8.5px] font-semibold">{themeFilter.toUpperCase()}</span>
              </label>
              <div className="flex flex-col justify-center h-[calc(100%-25px)] font-serif animate-none">
                <p className="font-serif italic text-[11px] text-dnd-ink/50 mb-2">Focus core thematic resonance:</p>
                <select
                  value={themeFilter}
                  onChange={(e) => setThemeFilter(e.target.value)}
                  className="w-full text-xs font-serif bg-white border border-dnd-gold/25 rounded-lg px-3 py-2 text-dnd-ink shadow-sm focus:outline-none focus:ring-1 focus:ring-dnd-gold cursor-pointer"
                >
                  <option value="All">Any Atmosphere / Resonant Tag</option>
                  {allThemeTags.map(tag => (
                    <option key={tag} value={tag}>{tag.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Strip - Spreads beautifully on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-dnd-gold/15 w-full">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveItem}
              disabled={!activeItem}
              className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl font-display text-[10px] uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-1.5 border ${
                activeItem 
                  ? 'bg-white hover:bg-dnd-paper border-dnd-gold/35 text-dnd-ink cursor-pointer' 
                  : 'bg-white/50 text-dnd-ink/30 border-dnd-gold/10 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-dnd-gold" />
              Save Relic
            </button>
            
            <button
              onClick={() => setShowSavedList(!showSavedList)}
              className="flex-1 sm:flex-initial bg-white border border-dnd-gold/30 text-dnd-ink hover:bg-dnd-ink hover:text-white hover:border-dnd-gold transition-all py-2 px-4 rounded-xl font-display text-[10px] uppercase tracking-wider font-extrabold text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5 text-dnd-gold" />
              Reliquary ({savedItems.length})
            </button>
          </div>

          <button
            onClick={generateCursedItem}
            className="w-full sm:w-auto bg-dnd-ink border-2 border-dnd-gold text-dnd-parchment hover:bg-dnd-red hover:border-white transition-all py-3 px-6 rounded-xl font-display text-xs uppercase tracking-[0.2em] font-black shadow-md flex items-center justify-center gap-2 hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-dnd-gold animate-bounce" />
            Evoke Cursed Relic
          </button>
        </div>
      </div>

      {/* Savable Reliquary - Wide Horizontal Grid Drawer */}
      {showSavedList && (
        <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-lg space-y-4 relative w-full">
          <div className="flex justify-between items-center border-b border-dnd-gold/20 pb-2">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-dnd-gold" />
              <h4 className="font-display font-black text-sm uppercase tracking-wider text-dnd-ink">
                The Saved Reliquary Cabinet
              </h4>
            </div>
            <button 
              onClick={() => setShowSavedList(false)}
              className="text-xs font-bold text-dnd-red hover:underline cursor-pointer"
            >
              Hide Cabinet
            </button>
          </div>

          {savedItems.length === 0 ? (
            <p className="font-serif italic text-xs text-dnd-ink/60 text-center py-6 bg-white/40 border border-dashed border-dnd-gold/20 rounded-lg">
              No artifacts bound to your spell-reliquary yet. Click "Save Relic" above to store your creations.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1 custom-scroll">
              {savedItems.map((item) => (
                <div 
                  key={item.uid}
                  className={`p-4 rounded-xl border text-left transition-all relative group flex flex-col justify-between ${
                    activeItem?.uid === item.uid 
                      ? 'bg-white border-dnd-gold shadow-md' 
                      : 'bg-white/40 border-dnd-gold/10 hover:border-dnd-gold/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <button 
                      onClick={() => {
                        setActiveItem(item);
                        setOracleResult(null);
                      }}
                      className="font-display font-black text-xs text-dnd-ink hover:text-dnd-red transition-colors text-left flex-grow focus:outline-none"
                    >
                      {item.identity.name}
                      <span className="block font-serif text-[10px] italic text-dnd-ink/65 normal-case font-normal mt-0.5">
                        Cursed {item.identity.type}
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteItem(item.uid)}
                      className="text-dnd-ink/40 hover:text-dnd-red p-1 rounded transition-colors cursor-pointer"
                      title="Delete Relic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Display theme tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.identity.theme_tags.slice(0, 3).map(tag => (
                      <span key={tag} className="font-mono text-[7px] uppercase bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/15 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {item.identity.theme_tags.length > 3 && (
                      <span className="font-mono text-[7px] text-dnd-ink/40 px-1">+{item.identity.theme_tags.length - 3}</span>
                    )}
                  </div>

                  {/* Notes block in list */}
                  {item.notes ? (
                    <div className="mt-2.5 bg-dnd-gold/5 border border-dnd-gold/10 p-2 rounded text-[10.5px] italic font-serif text-dnd-ink/80 leading-relaxed">
                      {item.notes}
                    </div>
                  ) : null}

                  <div className="mt-3 flex justify-end gap-2 text-[9px] font-mono text-dnd-ink/50 border-t border-dnd-ink/5 pt-2">
                    <button 
                      onClick={() => startEditingNotes(item)}
                      className="hover:underline hover:text-dnd-ink text-left font-black tracking-wider uppercase"
                    >
                      {item.notes ? 'Edit Note' : '+ Note'}
                    </button>
                  </div>

                  {editingNotesId === item.uid && (
                    <div className="mt-2 space-y-1.5 border-t border-dnd-gold/20 pt-2 z-10 font-sans">
                      <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Record a journal echo or game status..."
                        className="w-full text-[10.5px] font-serif bg-white border border-dnd-gold/20 p-2 rounded focus:ring-1 focus:ring-dnd-gold focus:outline-none h-14 resize-none"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[9px] px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(item.uid)}
                          className="bg-dnd-ink text-white hover:bg-dnd-red text-[9px] px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Main Relic Presentation Sheet (Full-width detailed scroll panel) */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.div
              key={activeItem.uid}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-dnd-paper border-2 border-dnd-gold rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden space-y-6 text-left"
            >
              {/* Complex thematic corner and background design cues */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-dnd-gold/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -left-6 -top-6 w-12 h-12 border-2 border-dnd-gold/15 rotate-45 pointer-events-none" />
              
              {/* Item Header Banner */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b-2 border-dnd-gold/30 pb-5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[9px] uppercase font-black bg-dnd-red/10 text-dnd-red border border-dnd-red/20 px-2 py-0.5 rounded-full flex items-center gap-1 tracking-widest shadow-sm">
                      <Skull className="w-3 h-3 text-dnd-red" />
                      CURSED ARTIFACT
                    </span>
                    <span className="font-mono text-[9px] uppercase font-bold bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/20 px-2 py-0.5 rounded-full tracking-wider">
                      {macroLabels[activeItem.identity.compatibility_tags[0]] || activeItem.identity.compatibility_tags[0]}
                    </span>
                  </div>
                  <h2 className="font-display font-black text-2xl lg:text-3.5xl tracking-tight uppercase text-dnd-ink leading-tight">
                    {activeItem.identity.name}
                  </h2>
                  <p className="font-serif italic text-xs text-dnd-ink/65 leading-none mt-1">
                    An anomalous morphology of {activeItem.identity.type}. Linked and bound under the resonance of {activeItem.identity.theme_tags.slice(0, 3).join(', ')}.
                  </p>
                </div>

                <div className="flex gap-2 self-start md:self-auto shrink-0 mt-2 md:mt-0">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 px-3 rounded-xl bg-white border border-dnd-gold/20 text-dnd-ink/70 hover:text-dnd-ink hover:border-dnd-gold/50 shadow-sm transition-all focus:outline-none flex items-center gap-1.5 text-[10.5px] font-display font-bold uppercase tracking-wider cursor-pointer"
                    title="Copy Markdown representation to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5 text-dnd-gold" />
                    {copySuccess ? 'Copied!' : 'Copy Relic'}
                  </button>
                </div>
              </div>

              {/* Grid 1: Pure Narrative & Aesthetic Identita */}
              <div className="space-y-3">
                <h4 className="font-display text-[10.5px] uppercase tracking-[0.25em] font-black text-dnd-gold border-b border-dnd-gold/10 pb-1 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Sensory Relic Morphology (Aesthetic And Shape)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/40 border border-dnd-gold/10 p-3.5 rounded-2xl space-y-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-dnd-ink/50 font-black">Material & Blueprint</span>
                    <p className="font-serif text-[11.5px] text-dnd-ink/85 leading-relaxed">
                      {activeItem.identity.material}
                    </p>
                  </div>

                  <div className="bg-white/40 border border-dnd-gold/10 p-3.5 rounded-2xl space-y-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-dnd-ink/50 font-black">Visual Aberration</span>
                    <p className="font-serif text-[11.5px] text-dnd-ink/85 leading-relaxed">
                      {activeItem.identity.visual_detail}
                    </p>
                  </div>

                  <div className="bg-white/40 border border-dnd-gold/10 p-3.5 rounded-2xl space-y-1">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-dnd-ink/50 font-black">Sensory Impress</span>
                    <p className="font-serif text-[11.5px] text-dnd-ink/85 leading-relaxed">
                      {activeItem.identity.sensory_detail}
                    </p>
                  </div>
                </div>

                {/* Display item context tags */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {activeItem.identity.theme_tags.map(tag => (
                    <span key={tag} className="font-mono text-[8px] uppercase tracking-wider bg-dnd-ink/5 text-dnd-ink/60 border border-dnd-ink/10 px-2.5 py-0.5 rounded-full">
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid 2: Dual Mechanical Properties */}
              <div className="space-y-3">
                <h4 className="font-display text-[10.5px] uppercase tracking-[0.25em] font-black text-dnd-gold border-b border-dnd-gold/10 pb-1 flex items-center gap-1.5">
                  <Sword className="w-4 h-4" />
                  Dual Mechanical Attunement
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary attunement benefit */}
                  <div className="bg-white/70 border-2 border-dnd-gold/20 p-4 rounded-2xl space-y-2 relative shadow-sm">
                    <div className="absolute top-3 right-4 flex items-center gap-1.5 z-10">
                      <span className="font-mono text-[7px] bg-dnd-gold/20 text-dnd-gold px-1.5 py-0.5 rounded border border-dnd-gold/30 select-none">PRIMARY EFFECT</span>
                      <button 
                        onClick={rerollPrimaryEffect}
                        className="p-1 rounded bg-white hover:bg-dnd-gold hover:text-white border border-dnd-gold/30 text-dnd-gold transition-all shadow-sm flex items-center justify-center cursor-pointer"
                        title="Reroll Primary Effect"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-dnd-gold/80 font-black">Main Effect</span>
                      <h5 className="font-display font-black text-sm uppercase text-dnd-ink tracking-tight flex items-center gap-1.5">
                        <User className="w-4 h-4 text-dnd-gold" />
                        {activeItem.primaryEffect.name}
                      </h5>
                    </div>
                    <p className="font-serif text-xs text-dnd-ink/85 leading-relaxed border-t border-dnd-gold/10 pt-2">
                       {activeItem.primaryEffect.description}
                    </p>
                  </div>

                  {/* Secondary tactical surge */}
                  <div className="bg-white/70 border-2 border-dnd-gold/20 p-4 rounded-2xl space-y-2 relative shadow-sm">
                    <div className="absolute top-3 right-4 flex items-center gap-1.5 z-10">
                      <span className="font-mono text-[7px] bg-dnd-gold/20 text-dnd-gold px-1.5 py-0.5 rounded border border-dnd-gold/30 select-none">SECONDARY SURGE</span>
                      <button 
                        onClick={rerollSecondaryEffect}
                        className="p-1 rounded bg-white hover:bg-dnd-gold hover:text-white border border-dnd-gold/30 text-dnd-gold transition-all shadow-sm flex items-center justify-center cursor-pointer"
                        title="Reroll Secondary Effect"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-dnd-gold/80 font-black">Secondary Effect</span>
                      <h5 className="font-display font-black text-sm uppercase text-dnd-ink tracking-tight flex items-center gap-1.5">
                        <Sparkle className="w-4 h-4 text-dnd-gold" />
                        {activeItem.secondaryEffect.name}
                      </h5>
                    </div>
                    <p className="font-serif text-xs text-dnd-ink/85 leading-relaxed border-t border-dnd-gold/10 pt-2">
                      {activeItem.secondaryEffect.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Segment 3: The Curse (Heavy Price) */}
              <div className="bg-gradient-to-br from-dnd-red/5 to-white border-2 border-dnd-red/30 p-5 rounded-2xl relative space-y-4 shadow-inner">
                <div className="absolute top-2 right-4 font-mono text-[88px] font-black text-dnd-red/5 select-none leading-none pointer-events-none uppercase">CURSE</div>
                
                <div className="flex items-center justify-between gap-4 border-b border-dnd-red/10 pb-2 relative z-10 w-full">
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-1.5 bg-dnd-red text-white text-[9px] font-mono font-black rounded uppercase tracking-wider shadow-sm">
                      {activeItem.curse.curse_type} curse
                    </div>
                    <div>
                      <h4 className="font-display font-black text-md uppercase text-dnd-red tracking-tight leading-none">
                        {activeItem.curse.name}
                      </h4>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-dnd-ink/40 mt-1">THE SACRAMENTAL DEFICIT</p>
                    </div>
                  </div>

                  <button 
                    onClick={rerollCurse}
                    className="p-1.5 px-2.5 rounded-lg bg-white hover:bg-dnd-red hover:text-white border border-dnd-red/30 text-dnd-red transition-all shadow-md flex items-center gap-1.5 text-[9px] font-display uppercase font-bold tracking-wider cursor-pointer select-none shrink-0"
                    title="Reroll Curse"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reroll Curse
                  </button>
                </div>

                {/* Intelligent curse formatting based on layout schema */}
                <div className="relative z-10">
                  {activeItem.curse.curse_type === 'progressive' && (
                    <div className="space-y-3">
                      <p className="font-serif italic text-xs text-dnd-ink/70">
                        This curse climbs through progressive stages. Each time conditions align, your body or spirit absorbs the defiled weight:
                      </p>
                      <div className="relative pl-3 border-l-2 border-dnd-red/25 space-y-3">
                        {activeItem.curse.stages?.map((stageItem) => (
                          <div key={stageItem.stage} className="relative space-y-0.5">
                            <div className="absolute -left-[18px] top-0.5 w-2.5 h-2.5 rounded-full bg-dnd-red border border-white flex items-center justify-center font-mono text-[7px] font-black text-white">
                              {stageItem.stage}
                            </div>
                            <div className="text-[10.5px] font-mono font-black uppercase text-dnd-red tracking-wider">
                              Stage {stageItem.stage}: {stageItem.trigger}
                            </div>
                            <p className="font-serif text-[11px] text-dnd-ink font-medium leading-relaxed bg-white/50 p-2 rounded-lg border border-dnd-red/10">
                              {stageItem.effect}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeItem.curse.curse_type === 'latent' && (
                    <div className="space-y-3 bg-white/40 p-3 rounded-xl border border-dnd-red/10">
                      <div>
                        <span className="font-mono text-[8px] font-black text-dnd-red uppercase tracking-widest block">ACTIVATION TRIGGER</span>
                        <p className="font-serif text-[11px] text-dnd-ink font-semibold leading-relaxed mt-0.5">
                          {activeItem.curse.latent?.trigger}
                        </p>
                      </div>
                      <div className="border-t border-dnd-red/10 pt-2">
                        <span className="font-mono text-[8px] font-black text-dnd-red uppercase tracking-widest block">LATENT IMPACT EFFECT</span>
                        <p className="font-serif text-[11px] text-dnd-ink/90 leading-relaxed mt-0.5">
                          {activeItem.curse.latent?.effect}
                        </p>
                      </div>
                      {activeItem.curse.latent?.note && (
                        <div className="bg-dnd-gold/10 border border-dnd-gold/30 p-2.5 rounded-lg text-[10px] font-serif italic text-dnd-ink/80">
                          <strong className="font-sans text-[8.5px] font-black uppercase tracking-wider text-dnd-gold block not-italic mb-0.5">SUPPRESSION RITE</strong>
                          {activeItem.curse.latent.note}
                        </div>
                      )}
                    </div>
                  )}

                  {activeItem.curse.curse_type === 'active' && (
                    <div className="space-y-2 bg-white/40 p-4 rounded-xl border border-dnd-red/10">
                      <span className="font-mono text-[8px] font-black text-dnd-red uppercase tracking-widest block">PERPETUAL ACTIVE IMPEDIMENT</span>
                      <p className="font-serif text-[11.5px] text-dnd-ink font-medium leading-relaxed">
                        {activeItem.curse.active?.effect}
                      </p>
                    </div>
                  )}

                  {activeItem.curse.curse_type === 'conditional' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-50/50 border border-green-200/50 p-3.5 rounded-xl space-y-1">
                        <span className="font-mono text-[8.5px] font-black text-green-700 uppercase tracking-widest block">TRUE RESONANCE</span>
                        <p className="font-serif text-[11px] text-dnd-ink leading-relaxed">
                          {activeItem.curse.conditional?.effect_when_true}
                        </p>
                      </div>
                      <div className="bg-dnd-red/5 border border-dnd-red/10 p-3.5 rounded-xl space-y-1">
                        <span className="font-mono text-[8.5px] font-black text-dnd-red uppercase tracking-widest block">FALSE/NEGLECTED DEFICIT</span>
                        <p className="font-serif text-[11px] text-dnd-ink leading-relaxed">
                          {activeItem.curse.conditional?.effect_when_false}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SENSORY TELL AT THE END OF THE CURSE */}
                <div className="border-t border-dnd-red/15 pt-3 relative z-10">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-dnd-ink/40">THE CURSE TELL : SENSORY MANIFESTATION</span>
                  <p className="font-serif italic text-xs text-dnd-red font-semibold leading-relaxed mt-0.5">
                    "{activeItem.curse.curse_tell}"
                  </p>
                </div>
              </div>

              {/* Chronicle segment (Il Passato e la Storia) */}
              <div className="bg-white/50 border border-dnd-gold/20 p-5 rounded-2.5xl space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-dnd-gold/25 pb-2 w-full">
                  <div className="flex items-center gap-2">
                    <BookText className="w-4.5 h-4.5 text-dnd-gold" />
                    <h4 className="font-display font-black text-xs uppercase tracking-widest text-dnd-ink flex items-center gap-1.5">
                      Chronicle & Backstory of Ruin
                    </h4>
                  </div>

                  <button 
                    onClick={rerollStory}
                    className="p-1.5 px-2.5 rounded-lg bg-white hover:bg-dnd-gold hover:text-white border border-dnd-gold/30 text-dnd-gold transition-all shadow-md flex items-center gap-1.5 text-[9px] font-display uppercase font-bold tracking-wider cursor-pointer select-none shrink-0"
                    title="Reroll Chronicle Story"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reroll Story
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3 bg-dnd-paper/50 p-3 rounded-xl border border-dnd-gold/10 space-y-2">
                      <div>
                        <span className="font-mono text-[7.5px] tracking-wider uppercase text-dnd-ink/50 font-black block">Origin / Provenance</span>
                        <strong className="font-display font-extrabold text-[11px] uppercase tracking-wide text-dnd-ink block">
                          {activeItem.story.origin_type}
                        </strong>
                      </div>
                      <div className="border-t border-dnd-gold/5 pt-2">
                        <span className="font-mono text-[7.5px] tracking-wider uppercase text-dnd-ink/50 font-black block">Prime Architect / Creator</span>
                        <p className="font-serif text-[11.2px] text-dnd-ink leading-tight">
                          {activeItem.story.creator}
                        </p>
                      </div>
                    </div>

                    <div className="md:w-2/3 space-y-3">
                      <div>
                        <span className="font-mono text-[7.5px] tracking-wider uppercase text-dnd-ink/50 font-black block">Sanctified Intent / Original Purpose</span>
                        <p className="font-serif text-xs text-dnd-ink/80 leading-relaxed">
                          {activeItem.story.original_purpose}
                        </p>
                      </div>

                      <div className="border-t border-dnd-gold/10 pt-2">
                        <span className="font-mono text-[7.5px] tracking-wider uppercase text-dnd-ink/50 font-black block">The Tragedy / What Went Wrong</span>
                        <p className="font-serif text-xs text-dnd-ink/80 leading-relaxed">
                          {activeItem.story.what_went_wrong}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dnd-paper/30 border-l-2 border-dnd-gold/40 p-3 rounded-r-xl space-y-1">
                    <span className="font-mono text-[7.5px] tracking-wider uppercase text-dnd-ink/50 font-black block">Recent Chronicle & Bearer History</span>
                    <p className="font-serif italic text-xs text-dnd-ink/85 leading-relaxed">
                      "{activeItem.story.current_bearer_history}"
                    </p>
                  </div>

                  {/* Interconnected Oracle Question Seed */}
                  <div className="bg-dnd-ink text-dnd-parchment p-3 px-4 rounded-xl border border-dnd-gold flex items-start gap-3 shadow-md">
                    <HelpCircle className="w-5 h-5 text-dnd-gold mt-0.5 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-mono text-[7.5px] tracking-widest uppercase text-dnd-gold/70 font-black block">SOLO PLAY ORACLE SEED</span>
                      <p className="font-serif text-[11.5px] leading-relaxed mt-0.5 font-bold">
                        {activeItem.story.oracle_seed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-dnd-paper border-2 border-dnd-gold border-dashed rounded-3xl p-12 text-center space-y-3">
              <Skull className="w-12 h-12 text-dnd-gold/40 mx-auto" />
              <p className="font-serif italic text-sm text-dnd-ink/65">
                Press "Evoke Cursed Relic" to conjure an anomalous item from the dark void.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Oracle & Resonance Chamber (Spacious, full-width bottom deck) */}
      <div className="bg-dnd-paper border-2 border-dnd-gold rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-dnd-gold opacity-30" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Block: Narrative Query setup & Seed */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-dnd-gold/15 pb-2">
                <div className="p-1 px-1.5 rounded bg-dnd-gold/10 text-dnd-gold border border-dnd-gold/25">
                  <Dices className="w-5 h-5 text-dnd-gold" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm uppercase tracking-wider text-dnd-ink leading-none">Oracle & Resonance Chamber</h4>
                  <p className="font-mono text-[8px] tracking-wide text-dnd-ink/50 mt-1">Solo Play Mechanics Integrator</p>
                </div>
              </div>

              <p className="font-serif italic text-[11px] text-dnd-ink/70 leading-relaxed">
                Query the cosmic scale of the curse directly inside your solo campaigns. Read the item's Oracle Seed below, ask your question to the architects of the void, and cast the d20.
              </p>
            </div>

            {activeItem && (
              <div className="bg-dnd-gold/5 border border-dnd-gold/20 p-3.5 rounded-xl space-y-1">
                <span className="font-mono text-[7.5px] uppercase tracking-widest text-dnd-gold font-bold flex items-center gap-1">
                  <Sparkle className="w-3 h-3 text-dnd-gold" />
                  SUGGESTED ORACLE SEED
                </span>
                <p className="font-serif italic text-xs text-dnd-ink font-semibold leading-relaxed">
                  "{activeItem.story.oracle_seed}"
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-mono text-[8px] uppercase tracking-wider text-dnd-ink/50 font-bold">YOUR CORE QUESTION</label>
              <input 
                type="text"
                value={oracleQuestion}
                onChange={(e) => setOracleQuestion(e.target.value)}
                placeholder="e.g. Will stepping into the cathedral's light trigger a lash from the marrow flail?"
                className="w-full text-xs font-serif bg-white border border-dnd-gold/20 rounded-lg px-3 py-2.5 text-dnd-ink shadow-inner focus:outline-none focus:ring-1 focus:ring-dnd-gold"
              />
            </div>
          </div>

          {/* Right Block: Chaotic Roll Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-dnd-ink to-dnd-ink/90 text-dnd-parchment p-5 rounded-xl border border-dnd-gold shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/12 pb-2">
                <span className="font-mono text-[8px] tracking-widest uppercase text-dnd-gold font-bold">Resonating Fates</span>
                <span className="font-mono text-[8px] bg-dnd-gold/10 text-dnd-gold px-1.5 rounded uppercase font-black">d20 Engine</span>
              </div>
              
              <div className="flex gap-2.5">
                <button
                  onClick={handleAskOracle}
                  className="flex-1 bg-white hover:bg-dnd-paper text-dnd-ink hover:text-dnd-red transition-all py-2 px-3 rounded-lg font-display text-[9px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <BadgeAlert className="w-3.5 h-3.5 text-dnd-red" />
                  Query Fates (d20)
                </button>
                
                <button
                  onClick={rollD20}
                  className="bg-transparent border border-white/20 hover:border-dnd-gold text-white hover:text-dnd-gold transition-all py-2 px-3.5 rounded-lg font-display text-[9px] uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Roll simple D20"
                >
                  <Dices className="w-3.5 h-3.5" />
                  {d20Roll !== null ? `d20: ${d20Roll}` : 'Roll d20'}
                </button>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center min-h-[90px]">
              <AnimatePresence mode="wait">
                {oracleResult ? (
                  <motion.div 
                    key={oracleResult.roll}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full bg-black/30 border border-white/12 p-4 rounded-lg space-y-1 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-3 font-mono text-[36px] font-black text-white/5 select-none leading-none pointer-events-none">
                      #{oracleResult.roll}
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-mono uppercase font-black text-dnd-gold">
                      <span>Cosmic oracle verdict</span>
                      <span>ROLL: {oracleResult.roll}</span>
                    </div>
                    <p className="font-serif font-black text-xs text-white leading-snug">
                      {oracleResult.answer}
                    </p>
                    <p className="font-serif italic text-[10px] text-dnd-parchment/65 leading-normal">
                      {oracleResult.suffix}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-1 text-dnd-parchment/45 py-4">
                    <HelpCircle className="w-7 h-7 mx-auto stroke-1" />
                    <p className="font-serif italic text-[10.5px]">Fate whispers wait in silence.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
