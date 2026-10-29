import React from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

interface EmotionalCTAProps {
  onCreateClick: () => void;
}

export const EmotionalCTA: React.FC<EmotionalCTAProps> = ({ onCreateClick }) => {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-br from-[#4A1521] via-[#5B1E2B] to-[#360D17] text-white overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E8C5C8]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F5D061] text-xs font-medium">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Made for real emotions, not algorithm feeds</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight tracking-tight">
          Don’t just send a message. <br />
          <span className="italic font-medium text-[#F7E7CE]">
            Give them a moment they’ll remember.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
          In a world of fleeting notifications, give someone you care about a permanent space dedicated solely to your journey together.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCreateClick}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#D4AF37] text-[#2C2325] font-semibold text-base shadow-2xl hover:bg-[#E5C07B] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#5B1E2B]" />
            <span>Create Their Gift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/60 pt-2">
          Takes under 3 minutes • Instant preview • 100% private link
        </p>
      </div>
    </section>
  );
};
