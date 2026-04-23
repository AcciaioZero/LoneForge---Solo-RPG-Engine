import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolPanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: 'gold' | 'red' | 'emerald' | 'indigo';
}

export function ToolPanel({ title, icon, children, isOpen, onToggle, accentColor }: ToolPanelProps) {
  const colors = {
    gold: "border-dnd-gold bg-dnd-gold/5 text-dnd-gold",
    red: "border-dnd-red bg-dnd-red/5 text-dnd-red",
    emerald: "border-emerald-600 bg-emerald-600/5 text-emerald-600",
    indigo: "border-indigo-600 bg-indigo-600/5 text-indigo-600"
  };

  return (
    <section className={cn(
      "bg-dnd-paper border-2 rounded-2xl overflow-hidden transition-all duration-500 shadow-md",
      isOpen ? colors[accentColor] : "border-dnd-gold/20 opacity-80"
    )}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-dnd-ink/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isOpen ? "bg-white/20" : "bg-dnd-ink/5")}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
          </div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-sans font-black">{title}</h3>
        </div>
        <ChevronRight className={cn("w-5 h-5 transition-transform duration-300", isOpen ? "rotate-90" : "")} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0 border-t border-dnd-gold/10 text-dnd-ink">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
