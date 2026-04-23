import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Package, Shield, Sword, FlaskConical, Scroll, Hammer, Sparkles, Info, X, ArrowUpDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import itemsData from '../data/items.json';
import { LootItem, ItemQuest } from '../types';
import { generateItemQuest } from '../services/gameEngine';

interface ItemsListProps {
  onUncoverHistory?: (itemId: string, isCompendium: boolean) => void;
  discoveredQuests?: Record<string, ItemQuest>;
  onItemSelect?: (itemName: string) => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({ onUncoverHistory, discoveredQuests = {}, onItemSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [selectedItem, setSelectedItem] = useState<(LootItem & { itemQuest?: ItemQuest }) | null>(null);

  const items = (itemsData as any) as LootItem[];

  // Merge discovered quests into items
  const itemsWithQuests = useMemo(() => {
    return items.map(item => ({
      ...item,
      itemQuest: (discoveredQuests || {})[item.Name]
    }));
  }, [items, discoveredQuests]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    items.forEach(item => cats.add(item.Type));
    return Array.from(cats);
  }, [items]);

  const rarities = ['All', 'None', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];

  const filteredItems = useMemo(() => {
    let result = itemsWithQuests.filter(item => {
      const matchesSearch = item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.Text || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.Type === selectedCategory;
      const matchesRarity = selectedRarity === 'All' || (item.Rarity || "").toLowerCase() === selectedRarity.toLowerCase();
      return matchesSearch && matchesCategory && matchesRarity;
    });

    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.Name.localeCompare(b.Name);
      }
      if (sortBy === 'name-desc') {
        return b.Name.localeCompare(a.Name);
      }
      return 0;
    });

    return result;
  }, [itemsWithQuests, searchQuery, selectedCategory, selectedRarity, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch ((category || "").toLowerCase()) {
      case 'weapon':
      case 'simple melee weapon':
      case 'martial melee weapon':
      case 'simple ranged weapon':
      case 'martial ranged weapon':
        return <Sword className="w-4 h-4" />;
      case 'armor':
      case 'light armor':
      case 'medium armor':
      case 'heavy armor':
      case 'shield':
        return <Shield className="w-4 h-4" />;
      case 'potion':
        return <FlaskConical className="w-4 h-4" />;
      case 'scroll':
        return <Scroll className="w-4 h-4" />;
      case 'tool':
        return <Hammer className="w-4 h-4" />;
      case 'magic':
      case 'wondrous item':
      case 'ring':
      case 'wand':
      case 'staff':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch ((rarity || "").toLowerCase()) {
      case 'none': return 'text-dnd-ink/40';
      case 'common': return 'text-dnd-ink/60';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'very rare': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      case 'artifact': return 'text-red-600';
      default: return 'text-dnd-ink/60';
    }
  };

  // Update selected item if its quest is discovered
  useEffect(() => {
    if (selectedItem && !selectedItem.itemQuest && (discoveredQuests || {})[selectedItem.Name]) {
      setSelectedItem({
        ...selectedItem,
        itemQuest: (discoveredQuests || {})[selectedItem.Name]
      });
    }
  }, [discoveredQuests, selectedItem]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dnd-ink/40" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-dnd-gold/20 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-dnd-ink/40 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-dnd-gold/20 rounded-lg px-3 py-2 text-xs font-bold uppercase text-dnd-ink/60 focus:outline-none focus:ring-2 focus:ring-dnd-gold/50 cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-dnd-ink/40 shrink-0" />
            <span className="text-[10px] font-bold uppercase text-dnd-ink/40 mr-2">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-dnd-gold text-white'
                    : 'bg-white text-dnd-ink/60 hover:bg-dnd-parchment border border-dnd-gold/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 no-scrollbar">
            <Sparkles className="w-4 h-4 text-dnd-ink/40 shrink-0" />
            <span className="text-[10px] font-bold uppercase text-dnd-ink/40 mr-2">Rarity:</span>
            {rarities.map(rarity => (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${
                  selectedRarity === rarity
                    ? 'bg-dnd-red text-white'
                    : 'bg-white text-dnd-ink/60 hover:bg-dnd-parchment border border-dnd-gold/10'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={`${item.Name}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 rounded-xl bg-dnd-parchment border border-dnd-gold/20 hover:border-dnd-gold/50 transition-all cursor-pointer group relative flex flex-col justify-between"
              onClick={() => setSelectedItem(item)}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-white/50 text-dnd-gold">
                    {getCategoryIcon(item.Type)}
                  </div>
                  <span className={`text-[10px] uppercase font-bold ${getRarityColor(item.Rarity)}`}>
                    {item.Rarity}
                  </span>
                </div>
                <h3 className="font-bold text-dnd-ink group-hover:text-dnd-red transition-colors">{item.Name}</h3>
                <p className="text-[10px] text-dnd-ink/40 uppercase font-bold mb-2">{item.Type}</p>
                <p className="text-xs text-dnd-ink/70 line-clamp-2 italic font-serif">{item.Text}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-dnd-gold/10 flex justify-between items-center">
                <span className="text-xs font-bold text-dnd-ink/60">{item.Value}</span>
                <span className="text-[10px] font-bold text-dnd-ink/40 uppercase">{item.Source} p.{item.Page}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-dnd-ink/10 mx-auto mb-4" />
          <p className="text-dnd-ink/40 italic">No items found matching your criteria.</p>
        </div>
      )}

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg max-h-[85vh] bg-dnd-parchment rounded-2xl shadow-2xl border border-dnd-gold/30 overflow-hidden flex flex-col"
            >
              <div className="relative flex-1 overflow-y-auto custom-scrollbar p-6">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-dnd-red/10 text-dnd-red hover:bg-dnd-red/20 transition-colors z-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white shadow-inner text-dnd-gold">
                    {getCategoryIcon(selectedItem.Type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-dnd-ink leading-tight">{selectedItem.Name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs uppercase font-bold ${getRarityColor(selectedItem.Rarity)}`}>
                        {selectedItem.Rarity}
                      </span>
                      <span className="text-dnd-ink/20">•</span>
                      <span className="text-xs uppercase font-bold text-dnd-ink/40">
                        {selectedItem.Type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/50 border border-dnd-gold/10">
                    <p className="text-sm font-serif italic text-dnd-ink/80 leading-relaxed">
                      {selectedItem.Text}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Value</p>
                      <p className="text-sm font-bold text-dnd-ink">{selectedItem.Value || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Weight</p>
                      <p className="text-sm font-bold text-dnd-ink">{selectedItem.Weight || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Source</p>
                      <p className="text-sm font-bold text-dnd-ink">{selectedItem.Source} p.{selectedItem.Page}</p>
                    </div>
                    {selectedItem.Damage && (
                      <div className="p-3 rounded-lg bg-white/30 border border-dnd-gold/5">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-1">Damage/AC</p>
                        <p className="text-sm font-bold text-dnd-ink">{selectedItem.Damage}</p>
                      </div>
                    )}
                  </div>

                  {selectedItem.Properties && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Properties</p>
                      <p className="text-xs text-dnd-ink/70">{selectedItem.Properties}</p>
                    </div>
                  )}

                  {selectedItem.Mastery && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-dnd-ink/40 mb-2">Mastery</p>
                      <p className="text-xs text-dnd-ink/70">{selectedItem.Mastery}</p>
                    </div>
                  )}

                  {selectedItem.itemQuest && (
                    <div className="mt-6 p-4 rounded-xl bg-dnd-gold/5 border border-dnd-gold/20 space-y-4">
                      <div className="flex items-center gap-2 border-b border-dnd-gold/10 pb-2">
                        <Sparkles className="w-4 h-4 text-dnd-gold" />
                        <h3 className="font-display font-black uppercase text-xs tracking-widest text-dnd-gold">Item History & Quest</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">The Hook</p>
                          <p className="text-sm font-serif italic text-dnd-ink/90">{selectedItem.itemQuest.hook}</p>
                        </div>
                        
                        <div>
                          <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Origin</p>
                          <p className="text-xs text-dnd-ink/70">{selectedItem.itemQuest.origin}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Quest Type</p>
                          <p className="text-xs font-bold text-dnd-ink">{selectedItem.itemQuest.quest_type}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">The Path</p>
                          <ul className="space-y-1">
                            {selectedItem.itemQuest.steps.map((step: string, i: number) => (
                              <li key={i} className="text-xs text-dnd-ink/70 flex gap-2">
                                <span className="text-dnd-gold font-bold">{i + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-dnd-gold/10 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Reward Hint</p>
                            <p className="text-xs italic text-dnd-ink/60">{selectedItem.itemQuest.reward_hint}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-dnd-gold/60 mb-1">Oracle Seed</p>
                            <p className="text-xs italic text-dnd-ink/60">{selectedItem.itemQuest.oracle_seed}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-dnd-ink/5 border-t border-dnd-gold/20 flex gap-2 items-center">
                {onItemSelect && (
                  <button
                    onClick={() => {
                      onItemSelect(selectedItem.Name);
                      setSelectedItem(null);
                    }}
                    className="flex-1 px-4 py-2 bg-dnd-gold text-white rounded-xl font-display uppercase tracking-widest text-[10px] font-black hover:bg-dnd-ink hover:text-dnd-gold transition-all shadow-md border border-dnd-gold/30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add to Treasure
                  </button>
                )}
                {selectedItem.Rarity && selectedItem.Rarity.toLowerCase() !== 'common' && selectedItem.Rarity.toLowerCase() !== 'none' && !selectedItem.itemQuest && onUncoverHistory && (
                  <button
                    onClick={() => {
                      onUncoverHistory(selectedItem.Name, true);
                    }}
                    className="px-4 py-2 bg-dnd-gold text-white rounded-xl font-display uppercase tracking-widest text-[10px] font-black hover:bg-dnd-ink hover:text-dnd-gold transition-all shadow-md border border-dnd-gold/30 flex items-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Uncover History
                  </button>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 bg-dnd-ink text-dnd-gold rounded-xl font-display uppercase tracking-widest text-xs font-black hover:bg-dnd-red hover:text-white transition-all shadow-md border border-dnd-gold/30"
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
