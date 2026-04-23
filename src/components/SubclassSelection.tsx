import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import CLASSES_DATA from '../data/classes.json';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SubclassSelection({ options, onSelect, characterClass }: { options: string[], onSelect: (name: string) => void, characterClass: string }) {
  const classData = (CLASSES_DATA as any).find((c: any) => c.class.name === characterClass)?.class;
  
  return (
    <div className="min-h-screen bg-dnd-parchment flex items-center justify-center p-4 parchment-texture">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-dnd-paper border-4 border-dnd-gold rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-dnd-red" />
        
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black uppercase tracking-widest text-dnd-red mb-2">{characterClass} Subclass</h1>
          <p className="text-dnd-ink/60 font-serif italic">Choose your specialization and define your path to greatness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((optionName) => {
            const subclassData = classData?.subclasses?.find((s: any) => s.name === optionName);
            const firstLevelFeatures = subclassData?.features?.filter((f: any) => f.level === 3) || [];
            
            return (
              <button
                key={optionName}
                onClick={() => onSelect(optionName)}
                className="p-6 rounded-2xl border-2 border-dnd-gold/20 bg-white/50 hover:border-dnd-red/40 hover:bg-red-50 transition-all text-left flex flex-col gap-4 group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black uppercase tracking-widest text-lg text-dnd-ink group-hover:text-dnd-red transition-colors">{optionName}</h3>
                  <Sparkles className="w-5 h-5 text-dnd-gold group-hover:rotate-12 transition-transform" />
                </div>
                
                {subclassData?.description && (
                  <p className="text-xs text-dnd-ink/60 font-serif italic leading-relaxed line-clamp-3">
                    {subclassData.description}
                  </p>
                )}

                <div className="space-y-2 mt-auto pt-4 border-t border-dnd-gold/10">
                  <p className="text-[10px] uppercase font-black text-dnd-gold tracking-widest">Initial Features (Level 3)</p>
                  <div className="flex flex-wrap gap-2">
                    {firstLevelFeatures.map((f: any) => (
                      <span key={f.name} className="px-2 py-1 rounded bg-dnd-red/5 text-dnd-red text-[8px] font-bold uppercase border border-dnd-red/10">
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
