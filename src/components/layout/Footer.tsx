import React from 'react';
import { Heart, ShieldCheck, Lock, Sparkles, QrCode } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'create' | 'dashboard') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#F3ECE1] border-t border-[#E3D7C8] text-[#55454A] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E0D3C3]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#5B1E2B] text-white flex items-center justify-center">
                <Heart className="w-4 h-4 fill-white/90" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2C2325]">
                LoveNest
              </span>
            </div>
            <p className="text-base font-serif italic text-[#63323E]">
              "Turn your memories into something they can keep."
            </p>
            <p className="text-xs text-[#736368] leading-relaxed max-w-md">
              A private digital gifting space designed for couples, best friends, and family. 
              Craft personal letters, photo timelines, audio melodies, and interactive surprises that live forever online.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#736368] pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#5B1E2B]" /> Private & Unlisted Links
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5B1E2B]" /> Optional Password PIN
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2C2325]">
              Experience
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('create')} 
                  className="hover:text-[#5B1E2B] transition-colors cursor-pointer"
                >
                  Create Your Gift
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('dashboard')} 
                  className="hover:text-[#5B1E2B] transition-colors cursor-pointer"
                >
                  My Saved Gifts
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#5B1E2B] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#5B1E2B] transition-colors">
                  What You Can Add
                </a>
              </li>
            </ul>
          </div>

          {/* Emotional Quote */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2C2325]">
              A Gentle Reminder
            </h4>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E0D3C3] text-xs text-[#635358] leading-relaxed italic">
              "The best things in life are never things. They are the moments we felt completely seen and loved."
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A797E] gap-4">
          <p>© {new Date().getFullYear()} LoveNest. Crafted with care for meaningful moments.</p>
          <div className="flex items-center gap-6">
            <span>No app installation required for recipients</span>
            <span className="text-[#5B1E2B]">♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
