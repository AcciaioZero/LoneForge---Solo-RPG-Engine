import React from 'react';
import { Heart, Coffee, Github, CreditCard, ExternalLink } from 'lucide-react';

export const Support: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dnd-red/10 mb-4 relative">
          <div className="absolute inset-0 rounded-full bg-dnd-red/20 animate-ping" />
          <Heart className="w-8 h-8 text-dnd-red fill-current relative z-10" />
        </div>
        <h1 className="text-4xl font-serif italic text-dnd-ink">Support Loneforge</h1>
        <p className="text-lg text-dnd-ink/70 max-w-2xl mx-auto leading-relaxed">
          Loneforge is a project born out of pure passion for the world of tabletop RPGs and solo play. 
          My goal is to provide a free, accessible, and inspiring tool for all players and game masters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* The Why */}
        <div className="space-y-6 bg-white/50 backdrop-blur-sm border border-dnd-gold/20 p-8 rounded-3xl shadow-xl flex flex-col justify-center">
          <h2 className="text-2xl font-serif text-dnd-ink border-b border-dnd-gold/20 pb-4">A Pure Passion Project</h2>
          <div className="space-y-4 text-dnd-ink/80 text-sm leading-relaxed">
            <p>
              I believe that creativity should have no barriers. Loneforge is, and always will be, <strong className="text-dnd-red font-black">free</strong>. 
              It's here to help solo players find their next adventure, to help GMs test campaign ideas, 
              or to simply provide that spark of inspiration when you need it most.
            </p>
            <p>
              Developing this tool takes countless hours of design, coding, and careful curation of content. 
              Your support makes a real difference—it helps me cover server costs and, more importantly, 
              it gives me the fuel to keep building new features and expanding this universe.
            </p>
            <p className="italic font-medium border-l-2 border-dnd-gold pl-4 py-1">
              Support should always be spontaneous. If Loneforge has helped you tell a better story, 
              and you'd like to help me keep it growing, I'm truly grateful.
            </p>
          </div>
        </div>

        {/* Support Buttons */}
        <div className="flex flex-col gap-4 justify-center">
          <a 
            href="https://ko-fi.com/acciaiozero" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-[#29abe0] text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#29abe0]/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-tight">Ko-fi</p>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Support my work</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>

          <a 
            href="https://buymeacoffee.com/acciaio_zero" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-[#FFDD00] text-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#FFDD00]/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-black/5 rounded-lg text-black">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-tight">Buy Me A Coffee</p>
                <p className="text-[10px] opacity-60 uppercase tracking-widest font-black text-black">Fuel the coding</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
          </a>

          <a 
            href="https://www.paypal.com/paypalme/AcciaioZero" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-[#003087] text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#003087]/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-tight">PayPal</p>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Direct contribution</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="mt-4 pt-6 border-t border-dnd-gold/20">
            <h3 className="text-center text-[10px] uppercase font-black tracking-widest text-dnd-ink/40 mb-4 italic">Open Source Contribution</h3>
            <a 
              href="https://github.com/AcciaioZero/LoneForge---Solo-RPG-Engine"
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 p-4 border-2 border-dnd-ink/10 rounded-2xl hover:bg-dnd-ink text-dnd-ink hover:text-white transition-all font-bold"
            >
              <Github className="w-6 h-6" />
              <span>Clone & Contribute on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <div className="text-center pt-8 opacity-40">
        <p className="text-xs font-serif italic text-dnd-ink">
          "The best stories are the ones we tell together." — Loneforge
        </p>
      </div>
    </div>
  );
};
