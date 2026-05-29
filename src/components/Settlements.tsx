import React, { useState } from 'react';
import { 
  Castle, AlertTriangle, ChevronRight, UserPlus, Trash2, Dices, Search, Plus, Pencil, Check, X, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { GameState, Settlement, DistrictType, Ability, Enemy, Item, NPC, SettlementType, SettlementTheme } from '../types';
import { ToolPanel } from './ToolPanel';
import { SETTLEMENT_TYPES, URBAN_EVENT_CATEGORIES, SETTLEMENT_EVENTS } from '../constants';
import { getSuggestedRoleForLocation, mapLootItemToItem, rollDice } from '../services/gameEngine';
import ITEMS_DATA from '../data/items.json';
import VENDOR_MAP_DATA from '../data/vendor_map.json';

interface SettlementServicesProps {
  gameState: GameState;
  handlers: {
    handleSetContext: (context: any) => void;
    setSelectedLocationId: (id: string | null) => void;
    setNextSettlementType: (type: SettlementType | 'Random') => void;
    handleGenerateNewSettlement: (type: SettlementType | 'Random') => void;
    handleUpdateSettlementName: (newName: string) => void;
    handleUpdateDistrictName: (districtId: string, newName: string) => void;
    handleUpdateLocationName: (locationId: string, newName: string) => void;
    handleRerollDistrictLocations: (districtId: string) => void;
    handleAddDistrict: (type: DistrictType) => void;
    handleRemoveDistrict: (districtId: string) => void;
    handleGenerateSettlementTheme: () => void;
    handleRerollSettlementThemeField: (field: keyof SettlementTheme) => void;
    handleDistrictDisturbance: (type: DistrictType, name: string) => void;
    handleSettlementEvent: () => void;
    setNpcGenerationTargetLocationId: (id: string | null) => void;
    setNpcGenerationInitialRole: (role: string) => void;
    setActiveTab: (tab: string) => void;
    setInspectedEntity: (entity: any) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    handleLongRest: () => void;
    handleSettlementInteraction: (interaction: string, locationName: string, locationCategory: string) => void;
    handleBuyItem: (item: Item) => void;
    handleSellItem: (itemId: string) => void;
    addLog: (type: any, content: string) => void;
  };
  nextSettlementType: SettlementType | 'Random';
  selectedLocationId: string | null;
}

export function SettlementServices({ gameState, handlers, nextSettlementType, selectedLocationId }: SettlementServicesProps) {
  const {
    handleSetContext,
    setSelectedLocationId,
    setNextSettlementType,
    handleGenerateNewSettlement,
    handleUpdateSettlementName,
    handleUpdateDistrictName,
    handleUpdateLocationName,
    handleRerollDistrictLocations,
    handleAddDistrict,
    handleRemoveDistrict,
    handleGenerateSettlementTheme,
    handleRerollSettlementThemeField,
    handleDistrictDisturbance,
    handleSettlementEvent,
    setNpcGenerationTargetLocationId,
    setNpcGenerationInitialRole,
    setActiveTab,
    setInspectedEntity,
    setGameState,
    handleLongRest,
    handleSettlementInteraction,
    handleBuyItem,
    handleSellItem,
    addLog
  } = handlers;

  const [editingSettlement, setEditingSettlement] = useState(false);
  const [tempSettlementName, setTempSettlementName] = useState('');
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);
  const [tempDistrictName, setTempDistrictName] = useState('');
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [tempLocationName, setTempLocationName] = useState('');
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  return (
    <ToolPanel 
      title="Settlement Services" 
      icon={<Castle className="w-5 h-5" />}
      isOpen={gameState.context === 'Settlement'}
      onToggle={() => handleSetContext('Settlement')}
      accentColor="red"
      helpKey="settlement_services"
    >
      <div className="space-y-4">
        {/* Top Header Row: Name & Selection */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div className="flex flex-col flex-1 min-w-0">
            {editingSettlement ? (
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="text"
                  value={tempSettlementName}
                  onChange={(e) => setTempSettlementName(e.target.value)}
                  className="bg-white border border-dnd-red text-sm font-display font-black uppercase px-2 py-1 rounded w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateSettlementName(tempSettlementName || 'Unnamed Settlement');
                      setEditingSettlement(false);
                    }
                    if (e.key === 'Escape') setEditingSettlement(false);
                  }}
                />
                <button 
                  onClick={() => {
                    handleUpdateSettlementName(tempSettlementName || 'Unnamed Settlement');
                    setEditingSettlement(false);
                  }}
                  className="p-1 bg-dnd-red text-white rounded hover:bg-red-700"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setEditingSettlement(false)}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-2xl font-display font-black uppercase text-dnd-ink leading-tight truncate">
                  {gameState.currentSettlement?.name || 'Local Village'}
                </h2>
                <button 
                  onClick={() => {
                    setTempSettlementName(gameState.currentSettlement?.name || 'Local Village');
                    setEditingSettlement(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-dnd-red"
                  title="Rename Settlement"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-dnd-ink/60">
              <span className="text-dnd-gold">{gameState.currentSettlement?.type}</span>
              <span className="w-1 h-1 rounded-full bg-dnd-gold/40" />
              <span>Pop: {gameState.currentSettlement?.population?.toLocaleString() || 'Unknown'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
            {selectedLocationId && (
              <button onClick={() => setSelectedLocationId(null)} className="text-[10px] text-dnd-ink/60 font-bold uppercase hover:text-dnd-red transition-colors">Back to Town</button>
            )}
            <div className="flex items-center gap-2 bg-dnd-ink/5 p-1 rounded-xl border border-dnd-ink/10">
              <select 
                value={nextSettlementType} 
                onChange={(e) => setNextSettlementType(e.target.value as any)}
                className="bg-transparent text-[11px] font-black uppercase text-dnd-ink outline-none cursor-pointer hover:text-dnd-red transition-colors px-2"
              >
                <option value="Random" className="bg-white text-dnd-ink font-bold">Random Size</option>
                {SETTLEMENT_TYPES.map(type => (
                  <option key={type} value={type} className="bg-white text-dnd-ink font-bold">{type}</option>
                ))}
              </select>
              <button 
                onClick={() => handleGenerateNewSettlement(nextSettlementType)} 
                className="bg-dnd-red/20 text-dnd-red px-3 py-1 rounded-lg text-[10px] font-bold uppercase hover:bg-dnd-red/30 transition-colors"
              >
                New Town
              </button>
            </div>
          </div>
        </div>

        {/* Full Width Settlement Theme Section */}
        {gameState.currentSettlement && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (!gameState.currentSettlement?.theme) {
                    handleGenerateSettlementTheme();
                    setIsThemeExpanded(true);
                  } else {
                    setIsThemeExpanded(!isThemeExpanded);
                  }
                }}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-dnd-red/5 border border-dnd-red/10 text-dnd-red hover:bg-dnd-red/10 transition-all group flex-1"
              >
                <div className="flex items-center gap-3">
                  <Dices className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Settlement Theme</span>
                </div>
                <div className="flex items-center gap-2">
                  {!gameState.currentSettlement.theme && (
                    <span className="text-[9px] font-bold uppercase opacity-50 animate-pulse">Roll Theme</span>
                  )}
                  {gameState.currentSettlement.theme && (
                    isThemeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              {gameState.currentSettlement.theme && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateSettlementTheme();
                  }}
                  className="p-2.5 rounded-xl bg-dnd-red/10 text-dnd-red border border-dnd-red/20 hover:bg-dnd-red/20 transition-all group shrink-0"
                  title="Reroll All Fields"
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}
            </div>
            
            {gameState.currentSettlement.theme && isThemeExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="overflow-hidden"
              >
                <div className="p-5 rounded-xl bg-dnd-parchment/40 border border-dnd-gold/20 text-xs space-y-2 font-serif italic text-dnd-ink/70">
                  <div className="flex flex-col gap-y-5">
                    {[
                      { id: 'biome', label: 'Biome & Location', value: gameState.currentSettlement.theme.biome },
                      { id: 'aesthetic', label: 'Visual Aesthetic', value: gameState.currentSettlement.theme.aesthetic },
                      { id: 'government', label: `Government (${gameState.currentSettlement.theme.government_alignment})`, value: gameState.currentSettlement.theme.government },
                      { id: 'population', label: 'Population & Life', value: gameState.currentSettlement.theme.population },
                      { id: 'economy', label: 'Economy & Trade', value: gameState.currentSettlement.theme.economy },
                      { id: 'religion', label: 'Religions & Myths', value: gameState.currentSettlement.theme.religion },
                      { id: 'sensory_details', label: 'Sensory Details', value: gameState.currentSettlement.theme.sensory_details },
                      { id: 'landmark_or_centerpiece', label: 'Primary Landmark', value: gameState.currentSettlement.theme.landmark_or_centerpiece },
                    ].map((field) => (
                      <div key={field.id} className="group/field relative flex flex-col gap-1 pr-10">
                        <span className="font-bold uppercase not-italic font-sans text-dnd-gold text-[11px] tracking-[0.2em]">{field.label}</span>
                        <span className="text-sm leading-relaxed">{field.value}</span>
                        <button 
                          onClick={() => handleRerollSettlementThemeField(field.id as any)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-dnd-gold/10 text-dnd-gold/40 hover:text-dnd-gold opacity-0 group-hover/field:opacity-100 transition-all"
                          title="Reroll field"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="group/field relative flex flex-col gap-1 bg-dnd-red/5 p-4 rounded-xl border border-dnd-red/10 pr-12">
                      <span className="font-bold uppercase not-italic font-sans text-dnd-red text-[11px] tracking-[0.2em]">Local Tensions</span>
                      <span className="text-sm leading-relaxed text-dnd-red/80">{gameState.currentSettlement.theme.tensions}</span>
                      <button 
                        onClick={() => handleRerollSettlementThemeField('tensions')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-dnd-red/10 text-dnd-red/40 hover:text-dnd-red opacity-0 group-hover/field:opacity-100 transition-all font-sans"
                        title="Reroll tension"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {!selectedLocationId ? (
          <div className="space-y-6">
            {(gameState.currentSettlement?.districts || []).map(district => (
              <div key={district.id} className="space-y-2">
                <div className="flex justify-between items-center border-b border-dnd-gold/10 pb-1">
                  {editingDistrictId === district.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={tempDistrictName}
                        onChange={(e) => setTempDistrictName(e.target.value)}
                        className="bg-white border border-dnd-gold text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateDistrictName(district.id, tempDistrictName || 'Unnamed District');
                            setEditingDistrictId(null);
                          }
                          if (e.key === 'Escape') setEditingDistrictId(null);
                        }}
                      />
                      <button 
                        onClick={() => {
                          handleUpdateDistrictName(district.id, tempDistrictName || 'Unnamed District');
                          setEditingDistrictId(null);
                        }}
                        className="p-1 bg-dnd-gold text-white rounded hover:bg-yellow-600"
                      >
                        <Check className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <p className="text-[10px] uppercase font-bold text-dnd-gold/60">
                        {district.name}
                      </p>
                      <button 
                        onClick={() => {
                          setEditingDistrictId(district.id);
                          setTempDistrictName(district.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-dnd-gold"
                        title="Rename District"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 font-sans">
                    <button 
                      onClick={() => handleRerollDistrictLocations(district.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-dnd-gold/10 border border-dnd-gold/20 text-dnd-gold hover:bg-dnd-gold/20 transition-all group"
                      title="Reroll Buildings"
                    >
                      <RotateCcw className="w-2.5 h-2.5 group-hover:rotate-[-45deg] transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Reroll</span>
                    </button>
                    <button 
                      onClick={() => handleDistrictDisturbance(district.type, district.name)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-dnd-red/10 border border-dnd-red/20 text-dnd-red hover:bg-dnd-red/20 transition-all group relative"
                      title="Generate Disturbance"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Disturbance</span>
                    </button>
                    <button 
                      onClick={() => handleRemoveDistrict(district.id)}
                      className="p-1 rounded bg-dnd-ink/5 text-dnd-ink/40 hover:text-dnd-red hover:bg-dnd-red/10 transition-all"
                      title="Remove District"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                  {district.locations.map(loc => (
                    <div 
                      key={loc.id} 
                      className="p-3 rounded-xl bg-dnd-parchment border border-dnd-gold/20 hover:border-dnd-red transition-all flex justify-between items-center group relative"
                    >
                      <div className="flex-1 mr-2" onClick={() => setSelectedLocationId(loc.id)}>
                        {editingLocationId === loc.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text"
                              value={tempLocationName}
                              onChange={(e) => setTempLocationName(e.target.value)}
                              className="bg-white border border-dnd-red text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateLocationName(loc.id, tempLocationName || 'Unnamed Location');
                                  setEditingLocationId(null);
                                }
                                if (e.key === 'Escape') setEditingLocationId(null);
                              }}
                            />
                            <button 
                              onClick={() => {
                                handleUpdateLocationName(loc.id, tempLocationName || 'Unnamed Location');
                                setEditingLocationId(null);
                              }}
                              className="p-1 bg-dnd-red text-white rounded hover:bg-red-700"
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/loc">
                            <p className="text-[10px] font-black uppercase tracking-widest text-dnd-ink group-hover:text-dnd-red transition-colors">{loc.name}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLocationId(loc.id);
                                setTempLocationName(loc.name);
                              }}
                              className="opacity-0 group-hover/loc:opacity-100 transition-opacity p-0.5 hover:text-dnd-red"
                              title="Rename Location"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-[8px] text-dnd-ink/40 italic">{loc.category || loc.type}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dnd-gold group-hover:translate-x-1 transition-transform cursor-pointer" onClick={() => setSelectedLocationId(loc.id)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-8 pt-6 border-t border-dnd-gold/20">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-dnd-gold mb-3">Add Specialty District</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Trade', 'Arcane', 'Religious', 'Military', 'Government', 'Artists', 'Entertainment', 'Services', 'Residential', 'General'] as DistrictType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleAddDistrict(type)}
                    className="group relative px-3 py-2 rounded-xl bg-white/40 border border-dnd-gold/10 hover:border-dnd-red/40 hover:bg-white transition-all text-left overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-3 h-3 text-dnd-gold group-hover:text-dnd-red" />
                      <span className="text-[10px] font-bold uppercase text-dnd-ink group-hover:text-dnd-red">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button onClick={handleSettlementEvent} className="w-full p-3 rounded-xl bg-dnd-parchment border border-dnd-gold/20 hover:border-dnd-red text-left transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest text-dnd-ink">Urban Event</p>
                <p className="text-[8px] text-dnd-ink/40 italic">Random encounter in the settlement</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const loc = gameState.currentSettlement?.districts.flatMap(d => d.locations).find(l => l.id === selectedLocationId);
              if (!loc) return null;
              return (
                <>
                    <div className="p-4 rounded-xl bg-dnd-parchment border border-dnd-gold/20">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] uppercase font-bold text-dnd-gold">{loc.category || loc.type}</p>
                        <button 
                          onClick={() => {
                            setNpcGenerationTargetLocationId(loc.id);
                            setNpcGenerationInitialRole(getSuggestedRoleForLocation(loc.category));
                            setActiveTab('npc');
                          }}
                          className="flex items-center gap-1 text-[10px] text-dnd-red font-bold uppercase hover:underline"
                        >
                          <UserPlus className="w-3 h-3" />
                          Create NPC
                        </button>
                      </div>
                      <p className="text-sm font-serif italic text-dnd-ink/80 mb-2">{loc.description}</p>
                      {(() => {
                        const cat = (loc.category || '').toLowerCase();
                        const entries = Object.entries(VENDOR_MAP_DATA.vendor_map.locations);
                        const match = entries.find(([k]) => k.toLowerCase() === cat);
                        const notes = loc.notes || match?.[1]?.notes;
                        if (!notes) return null;
                        return (
                          <div className="border-l-2 border-dnd-gold/30 pl-3 py-1 mb-3 bg-dnd-ink/5 rounded-r-md">
                            <p className="text-[10px] text-dnd-ink/70 font-serif leading-relaxed">
                              {notes}
                            </p>
                          </div>
                        );
                      })()}
                      
                      <div className="space-y-2 mt-4">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40">NPCs</p>
                        {(loc.npcs || []).length === 0 ? (
                          <p className="text-[10px] italic text-dnd-ink/40">No NPCs here yet.</p>
                        ) : (
                          (loc.npcs || []).map(npc => (
                            <div 
                              key={npc.id} 
                              className="p-2 rounded-lg bg-white/50 border border-dnd-gold/10 flex justify-between items-center cursor-pointer hover:bg-white transition-colors"
                              onClick={() => setInspectedEntity({ type: 'npc', data: npc })}
                            >
                              <div>
                                <p className="text-xs font-bold text-dnd-ink">{npc.name} ({npc.race} {npc.role})</p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); addLog('narrative', `${npc.name}: "${npc.greeting}"`); }}
                                  className="text-[10px] text-dnd-red font-bold uppercase mt-1"
                                >
                                  Talk
                                </button>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGameState(prev => ({
                                    ...prev,
                                    currentSettlement: prev.currentSettlement ? {
                                      ...prev.currentSettlement,
                                      districts: prev.currentSettlement.districts.map(d => ({
                                        ...d,
                                        locations: d.locations.map(l => {
                                          if (l.id === loc.id) {
                                            return { ...l, npcs: l.npcs.filter(n => n.id !== npc.id) };
                                          }
                                          return l;
                                        })
                                      }))
                                    } : null
                                  }));
                                }}
                                className="p-1 text-dnd-ink/20 hover:text-dnd-red transition-colors"
                                title="Remove NPC"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(loc.interactions || []).map(interaction => {
                      if (interaction === 'Trade') return null; // Handled separately
                      // Filter out "Talk to NPC" (including potential variations like plural or extra spaces)
                      if (/talk\s+to\s+npcs?/i.test(interaction || '')) return null;
                      return (
                        <button 
                          key={interaction}
                          onClick={() => handleSettlementInteraction(interaction, loc.name, loc.category)}
                          className="p-3 rounded-xl bg-dnd-parchment border border-dnd-gold/20 hover:border-dnd-red text-left transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-dnd-ink group-hover:text-dnd-red transition-colors">{interaction}</p>
                            <ChevronRight className="w-3 h-3 text-dnd-gold/40 group-hover:text-dnd-red transition-all transform group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {loc.inventory && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40">Shop Inventory</p>
                        <div className="grid grid-cols-1 gap-2">
                          {(loc.inventory || []).map(item => (
                            <div 
                              key={item.id} 
                              className="p-3 rounded-xl bg-white/80 border border-dnd-gold/20 flex justify-between items-center cursor-pointer hover:bg-white transition-colors"
                            onClick={() => {
                              const rawItem = ((ITEMS_DATA as any) as any[]).find(i => i.Name === item.name);
                              const itemData = rawItem ? { ...mapLootItemToItem(rawItem), id: item.id } : item;
                              setInspectedEntity({ type: 'item', data: itemData });
                            }}
                            >
                              <div>
                                <p className="text-xs font-bold text-dnd-ink">{item.name}</p>
                                <p className="text-[8px] text-dnd-ink/60">{item.description}</p>
                                <p className="text-[10px] font-bold text-dnd-gold">{item.value} gp</p>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleBuyItem(item); }}
                                className="bg-emerald-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase"
                              >
                                Buy
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-dnd-ink/40">Sell Your Items (50% value)</p>
                        {(() => {
                           const vendorConfig = loc.category ? (VENDOR_MAP_DATA as any).vendor_map.locations[loc.category] : null;
                           const buysList = (vendorConfig?.buys || []) as string[];
                           
                           const sellableItems = (gameState.character.inventory || []).filter(item => {
                             if (!vendorConfig) return true; // Generic fallback
                             if (buysList.length === 0) return false;
                             if (buysList.includes("All")) return true;
                             
                             const itemType = (item.type || "").toLowerCase();
                             const itemSubType = (item.subType || "").toLowerCase();
                             
                             return buysList.some(cat => 
                               itemType.includes(cat.toLowerCase()) || 
                               itemSubType.includes(cat.toLowerCase()) ||
                               (cat === 'Magic Item' && (item.bonus && item.bonus > 0)) ||
                               (cat === 'Valuables' && ['Gem', 'Art Object', 'Treasure'].some(v => itemType.includes(v.toLowerCase())))
                             );
                           });

                           if (sellableItems.length === 0) {
                             return <p className="text-[9px] italic text-dnd-ink/40 bg-white/40 p-2 rounded-lg border border-dashed border-dnd-ink/10">This vendor is not interested in buying your current items.</p>;
                           }

                           return (
                            <div className="grid grid-cols-1 gap-2">
                              {sellableItems.map(item => (
                                <div key={item.id} className="p-2 rounded-lg bg-dnd-parchment/30 border border-dashed border-dnd-ink/10 flex justify-between items-center">
                                  <div>
                                    <p className="text-[10px] font-bold text-dnd-ink">{item.name}</p>
                                    <p className="text-[8px] text-dnd-gold">{Math.floor((item.value || 0) * 0.5)} gp</p>
                                  </div>
                                  <button 
                                    onClick={() => handleSellItem(item.id)}
                                    className="text-[8px] text-red-600 font-bold uppercase"
                                  >
                                    Sell
                                  </button>
                                </div>
                              ))}
                            </div>
                           );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </ToolPanel>
  );
}

export function UrbanEventSelection({ onSelect, onCancel }: { onSelect: (category?: string) => void, onCancel: () => void }) {
  return (
    <div className="min-h-screen bg-dnd-parchment flex items-center justify-center p-4 parchment-texture">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dnd-paper border-4 border-dnd-gold rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-dnd-red" />
        
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black uppercase tracking-widest text-dnd-red mb-2">Urban Event</h1>
          <p className="text-dnd-ink/60 font-serif italic">The city is a living thing, always changing, always moving.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => onSelect()}
              className="p-6 bg-dnd-red hover:bg-red-700 text-dnd-parchment rounded-2xl font-display font-black uppercase tracking-widest transition-all shadow-lg flex flex-col items-center gap-2 group"
            >
              <Dices className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span>Random Urban Event</span>
              <span className="text-[10px] opacity-60 font-sans tracking-normal">Roll on the full d100 table</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Thematic Categories</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {URBAN_EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onSelect(cat.name)}
                  className="px-4 py-3 bg-white/50 border border-dnd-gold/20 hover:border-dnd-red/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-dnd-ink transition-all hover:bg-red-50 text-left flex justify-between items-center group"
                >
                  <span>{cat.name}</span>
                  <span className="text-[8px] opacity-40 font-mono group-hover:opacity-100 transition-opacity">{cat.range[0]}-{cat.range[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onCancel}
            className="w-full py-3 text-xs font-bold uppercase text-dnd-ink/40 hover:text-dnd-red transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
