import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Castle, Mountain, Skull, Map as MapIcon, Wind, Tent, Shield, Dices, ChevronRight, FlaskConical, Gavel, PawPrint, Landmark, Route, Pickaxe, Church, Ghost, Bone } from 'lucide-react';
import { WILDERNESS_TERRAINS, WILDERNESS_BIOMES } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DungeonSelection({ onFinish }: { onFinish: (type: string, rooms: number) => void }) {
  const [selectedType, setSelectedType] = useState('Cave');
  const [roomCount, setRoomCount] = useState(5);

  const dungeonTypes = [
    { id: 'Cave', icon: <Mountain className="w-6 h-6" />, description: 'Natural caverns filled with primitive threats.' },
    { id: 'Prison', icon: <Gavel className="w-6 h-6" />, description: 'Dungeons of stone and iron meant to hold the desperate.' },
    { id: 'Laboratory', icon: <FlaskConical className="w-6 h-6" />, description: 'Place of forbidden experiments and arcane secrets.' },
    { id: 'Ruin', icon: <Castle className="w-6 h-6" />, description: 'Ancient structures reclaimed by time and monsters.' },
    { id: 'Cemetery', icon: <Bone className="w-6 h-6" />, description: 'Silent graves where the dead grow restless.' },
    { id: 'Lair', icon: <PawPrint className="w-6 h-6" />, description: 'The nesting grounds of a dangerous predator.' },
    { id: 'Tomb / Crypt', icon: <Skull className="w-6 h-6" />, description: 'Deep vaults housing the remains of the powerful.' },
    { id: 'Temple or Shrine', icon: <Church className="w-6 h-6" />, description: 'Sacred grounds corrupted by dark forces.' },
    { id: 'Maze', icon: <Route className="w-6 h-6" />, description: 'A confusing web of corridors designed to trap.' },
    { id: 'Mine', icon: <Pickaxe className="w-6 h-6" />, description: 'Deep excavations that uncovered something dark.' },
    { id: 'Guild / Cult Headquarters', icon: <Landmark className="w-6 h-6" />, description: 'The secret lair of a dangerous organization.' }
  ];

  return (
    <div className="min-h-screen bg-dnd-parchment flex items-center justify-center p-4 parchment-texture">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dnd-paper border-4 border-dnd-gold rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-dnd-red" />
        
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black uppercase tracking-widest text-dnd-red mb-2">Destination</h1>
          <p className="text-dnd-ink/60 font-serif italic">Choose where your destiny will lead you.</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dungeonTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 group",
                  selectedType === type.id 
                    ? "bg-dnd-red border-dnd-gold text-dnd-parchment shadow-lg scale-105" 
                    : "bg-dnd-parchment/50 border-dnd-gold/20 text-dnd-ink hover:border-dnd-red/40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedType === type.id ? "bg-white/20" : "bg-dnd-red/10 text-dnd-red"
                )}>
                  {type.icon}
                </div>
                <div>
                  <p className="font-display font-black uppercase tracking-widest text-sm">{type.id}</p>
                  <p className={cn(
                    "text-[10px] mt-1 leading-tight",
                    selectedType === type.id ? "text-white/70" : "text-dnd-ink/40"
                  )}>{type.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-dnd-parchment/30 border-2 border-dnd-gold/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black uppercase tracking-widest text-xs text-dnd-gold">Dungeon Length</h3>
              <span className="font-mono text-xl font-bold text-dnd-red">{roomCount} Rooms</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="20" 
              value={roomCount} 
              onChange={(e) => setRoomCount(parseInt(e.target.value))}
              className="w-full accent-dnd-red h-2 bg-dnd-gold/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-dnd-ink/30">
              <span>Short (3)</span>
              <span>Medium (10)</span>
              <span>Long (20)</span>
            </div>
          </div>

          <button 
            onClick={() => onFinish(selectedType, roomCount)}
            className="w-full bg-dnd-red hover:bg-red-800 text-dnd-parchment py-5 rounded-2xl font-display font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3 group"
          >
            Start Exploration
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function TravelSelection({ onFinish }: { onFinish: (terrain: string, duration: number, destination: string) => void }) {
  const [selectedTerrain, setSelectedTerrain] = useState(WILDERNESS_TERRAINS[0]);
  const [duration, setDuration] = useState(3);
  const [destination, setDestination] = useState('The Lost Ruins');

  const biomes = Object.entries(WILDERNESS_BIOMES).map(([id, data]) => ({
    id,
    icon: <MapIcon className="w-6 h-6" />, // Default icon, could be more specific
    description: `A journey through the ${id.toLowerCase()}.`
  }));

  return (
    <div className="min-h-screen bg-dnd-parchment flex items-center justify-center p-4 parchment-texture">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dnd-paper border-4 border-dnd-gold rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
        
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black uppercase tracking-widest text-emerald-700 mb-2">Wilderness Travel</h1>
          <p className="text-dnd-ink/60 font-serif italic">The world is vast and full of secrets. Where will you go?</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.2em] font-sans font-black text-dnd-gold">Destination Name</label>
            <input 
              type="text" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you heading?"
              className="w-full bg-white/50 border-2 border-dnd-gold/20 rounded-lg px-6 py-4 font-serif text-lg focus:outline-none focus:border-emerald-600 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {biomes.map((biome) => (
              <button
                key={biome.id}
                onClick={() => setSelectedTerrain(biome.id)}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 group",
                  selectedTerrain === biome.id 
                    ? "bg-emerald-600 border-dnd-gold text-dnd-parchment shadow-lg scale-105" 
                    : "bg-dnd-parchment/50 border-dnd-gold/20 text-dnd-ink hover:border-emerald-600/40"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedTerrain === biome.id ? "bg-white/20" : "bg-emerald-600/10 text-emerald-600"
                )}>
                  {biome.icon}
                </div>
                <div>
                  <p className="font-display font-black uppercase tracking-widest text-sm">{biome.id}</p>
                  <p className={cn(
                    "text-[10px] mt-1 leading-tight",
                    selectedTerrain === biome.id ? "text-white/70" : "text-dnd-ink/40"
                  )}>{biome.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-dnd-parchment/30 border-2 border-dnd-gold/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black uppercase tracking-widest text-xs text-dnd-gold">Estimated Duration</h3>
              <span className="font-mono text-xl font-bold text-emerald-700">{duration} Days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="14" 
              value={duration} 
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-dnd-gold/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-dnd-ink/30">
              <span>Short (1)</span>
              <span>Medium (7)</span>
              <span>Long (14)</span>
            </div>
            <p className="text-[8px] text-dnd-ink/40 italic mt-4 text-center">Final duration will vary based on terrain and conditions.</p>
          </div>

          <button 
            onClick={() => onFinish(selectedTerrain, duration, destination)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-dnd-parchment py-5 rounded-2xl font-display font-black uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3 group"
          >
            Begin Journey
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function CampSelection({ onRest, onSkip, lastLog }: { onRest: (category?: string) => void, onSkip: () => void, lastLog: string }) {
  return (
    <div className="min-h-screen bg-dnd-parchment flex items-center justify-center p-4 parchment-texture">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dnd-paper border-4 border-dnd-gold rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-black uppercase tracking-widest text-indigo-700 mb-2">Camp for the Night</h1>
          <p className="text-dnd-ink/60 font-serif italic">The sun sets, and the wilderness grows quiet... or does it?</p>
        </div>

        <div className="bg-white/50 border-2 border-dnd-gold/20 rounded-2xl p-6 mb-8 shadow-inner">
          <p className="font-serif text-lg leading-relaxed text-dnd-ink whitespace-pre-wrap">{lastLog}</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => onRest()}
              className="p-6 bg-indigo-600 hover:bg-indigo-700 text-dnd-parchment rounded-2xl font-display font-black uppercase tracking-widest transition-all shadow-lg flex flex-col items-center gap-2 group"
            >
              <Dices className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span>Random Disturbance</span>
              <span className="text-[10px] opacity-60 font-sans tracking-normal">Roll on the full table</span>
            </button>

            <button 
              onClick={() => onSkip()}
              className="p-6 bg-dnd-parchment/50 border-2 border-dnd-gold/20 hover:border-indigo-600/40 text-dnd-ink rounded-2xl font-display font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 group"
            >
              <Wind className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
              <span>Rest Peacefully</span>
              <span className="text-[10px] opacity-60 font-sans tracking-normal">Recover HP and abilities</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
