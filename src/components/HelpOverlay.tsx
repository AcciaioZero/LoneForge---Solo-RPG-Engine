import React, { useState } from 'react';
import { HelpCircle, X, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HELP_CONTENT, HelpEntry } from '../data/helpContent';

interface HelpModalProps {
  sectionKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ sectionKey, isOpen, onClose }: HelpModalProps) {
  const content: HelpEntry | undefined = HELP_CONTENT[sectionKey];

  if (!content) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-[#fdfcf0] text-[#1a1a1a] max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-2xl border-4 border-[#b8860b] shadow-2xl flex flex-col parchment-texture z-10"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b-2 border-[#b8860b]/20 bg-[#f4f1e1]/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8c1616]" />
                <h2 className="font-display tracking-widest text-lg font-black text-[#8c1616] uppercase">
                  {content.title} Guide
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 px-2 text-[#1a1a1a]/50 hover:text-[#8c1616] hover:bg-black/5 rounded-lg transition-all"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Summary */}
              {content.summary && (
                <div className="font-serif tracking-normal leading-relaxed text-[#1a1a1a]/85 text-[14px] italic border-b border-[#b8860b]/10 pb-4">
                  {content.summary}
                </div>
              )}

              {/* Features List */}
              <div className="space-y-4">
                <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-[#1a1a1a]/40">
                  Key Features & Mechanics
                </h3>
                <div className="space-y-4">
                  {content.features.map((feature, i) => (
                    <div key={i} className="group">
                      <div className="font-display font-medium text-xs uppercase text-[#8c1616] tracking-wider mb-1">
                        {feature.label}
                      </div>
                      <div className="font-serif text-[13px] leading-relaxed text-[#1a1a1a]/95 pl-4 border-l-2 border-[#b8860b]/30 group-hover:border-[#8c1616] transition-colors">
                        {feature.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip Column */}
              {content.tip && (
                <div className="bg-[#8c1616]/5 border-l-4 border-[#8c1616] rounded-r-xl p-4 mt-2">
                  <div className="flex gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#8c1616] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display text-[10px] uppercase tracking-wider font-black text-[#8c1616] mb-1">
                        Scribe's Tip
                      </h4>
                      <p className="font-serif text-[12px] leading-relaxed italic text-[#8c1616]">
                        {content.tip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 bg-[#f4f1e1]/40 border-t border-[#b8860b]/10 flex justify-end">
              <button
                onClick={onClose}
                className="bg-[#8c1616] hover:bg-[#8c1616]/90 active:bg-red-950 text-[#fdfcf0] font-sans text-[10px] uppercase tracking-widest font-bold px-6 py-2.5 rounded-xl transition shadow hover:shadow-lg"
              >
                Close Guide
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface HelpButtonProps {
  sectionKey: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HelpButton({ sectionKey, className, size = 'md' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if content exists to prevent rendering blank buttons
  if (!HELP_CONTENT[sectionKey]) {
    return null;
  }

  const sizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2"
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        type="button"
        className={cn(
          "inline-flex items-center justify-center text-dnd-gold rounded-full hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer shrink-0",
          sizeClasses[size],
          className
        )}
        title="View Guide"
      >
        <HelpCircle className={iconSizes[size]} />
      </button>

      <HelpModal
        sectionKey={sectionKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

// Helper utility for concatenating classes
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
