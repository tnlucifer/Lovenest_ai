import React, { useState } from 'react';
import { Heart, Sparkles, Music, Calendar, Image as ImageIcon, CheckCircle, ChevronRight, Play, Eye } from 'lucide-react';

interface InteractiveDemoSectionProps {
  onFullPreviewClick: () => void;
}

export const InteractiveDemoSection: React.FC<InteractiveDemoSectionProps> = ({ onFullPreviewClick }) => {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      label: 'Envelope',
      icon: '💌',
      title: 'Cinematic Arrival',
      text: 'Your recipient receives a private link. The screen darkens softly, presenting an envelope stamped with a custom wax seal and their name.',
      mockPreview: (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-[#181216] to-[#0D0A0C] text-white rounded-3xl">
          <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">A Special Delivery</span>
          <div className="w-20 h-20 rounded-full bg-[#5B1E2B] border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl animate-pulse">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <h4 className="font-serif text-xl font-medium">For Ambika</h4>
          <p className="text-xs text-white/60">Someone created something special for you.</p>
          <div className="px-5 py-2.5 rounded-full bg-[#5B1E2B] text-white text-xs font-medium shadow-md">
            Tap to Open Gift
          </div>
        </div>
      )
    },
    {
      label: 'Tap to Open',
      icon: '✨',
      title: 'Wax Seal Breaks',
      text: 'Upon tap, the seal breaks, delicate rose confetti cascades down the screen, and soft romantic piano notes fill the air.',
      mockPreview: (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#FAF7F2] text-[#2C2325] rounded-3xl relative overflow-hidden">
          <div className="text-2xl animate-bounce">🌸 ✨ 💖</div>
          <h4 className="font-serif text-lg font-bold text-[#5B1E2B]">Seal Unlocked</h4>
          <p className="text-xs text-[#6B5A60] italic">"Take a slow breath. This is for you..."</p>
          <div className="w-12 h-1 bg-[#5B1E2B] rounded-full mx-auto my-2"></div>
          <span className="text-[11px] font-mono text-[#D4AF37]">♪ Playing Warm Sunset Piano</span>
        </div>
      )
    },
    {
      label: 'The Letter',
      icon: '📜',
      title: 'Your Heartfelt Words',
      text: 'A clean, editorial letter scrolls into view. Every word breathes with intimacy and warmth, without noisy distractions.',
      mockPreview: (
        <div className="h-full flex flex-col justify-center p-6 text-left space-y-3 bg-white text-[#2C2325] rounded-3xl border border-[#E8DFD8]">
          <span className="text-[10px] uppercase tracking-widest text-[#8F7D83]">My Dearest,</span>
          <p className="font-serif italic text-xs leading-relaxed text-[#423337]">
            "Some feelings are too wide and gentle to fit into regular everyday messages. You have this rare gift of making people feel deeply seen, and with you, I feel completely at peace..."
          </p>
          <span className="text-[10px] text-[#5B1E2B] font-semibold pt-2 block">Always yours, Shanmugam</span>
        </div>
      )
    },
    {
      label: 'Photos',
      icon: '📸',
      title: 'Living Memories',
      text: 'Full-bleed photos glide smoothly across the screen, each paired with the memory of that exact afternoon.',
      mockPreview: (
        <div className="h-full flex flex-col justify-center p-4 bg-[#140F11] text-white rounded-3xl relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80" 
            alt="Memory" 
            className="w-full h-40 object-cover rounded-2xl mb-3 shadow-md"
          />
          <p className="text-xs font-serif italic text-white/80">"The way your eyes crinkle when you truly laugh."</p>
        </div>
      )
    },
    {
      label: 'Special Date',
      icon: '⏳',
      title: 'Together For...',
      text: 'A live dynamic counter calculates the years, months, days, hours, and minutes you have journeyed together.',
      mockPreview: (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF5F0] text-[#2C2325] rounded-3xl border border-[#E8DFD8]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B1E2B]">Since September 18, 2023</span>
          <h4 className="font-serif text-2xl font-bold my-2 text-[#5B1E2B]">1 Year, 1 Month</h4>
          <p className="text-xs text-[#6B5A60]">and counting every single heartbeat.</p>
        </div>
      )
    },
    {
      label: 'Final Surprise',
      icon: '🎁',
      title: 'Scratch-to-Reveal Secret',
      text: 'An interactive scratch card hides your intimate final message, followed by a heart-reaction button for them to send love back.',
      mockPreview: (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#5B1E2B] text-white rounded-3xl">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          <h4 className="font-serif text-base font-semibold">"And if I had to choose again..."</h4>
          <p className="text-xs text-white/90 italic">I would still find you in every lifetime.</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-xs">
            <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
            <span>12 Hearts Sent</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 bg-[#FAF7F2] border-t border-[#EFE5D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#5B1E2B]">
            Interactive Walkthrough
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2325]">
            The Recipient Experience
          </h2>
          <p className="text-sm sm:text-base text-[#6B5A60] leading-relaxed">
            Click through each chapter to see how your loved one experiences their digital surprise on their phone.
          </p>
        </div>

        {/* Interactive Stepper Navigation */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {demoSteps.map((step, idx) => (
            <button
              key={step.label}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeStep === idx 
                  ? 'bg-[#5B1E2B] text-white shadow-md scale-105' 
                  : 'bg-white text-[#6B5A60] border border-[#E2D7CC] hover:bg-[#F7EFE4]'
              }`}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        {/* Stepper Showcase */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E8DFD8] p-8 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Explanations */}
          <div className="md:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5F0] border border-[#EADFD5] text-[11px] font-mono text-[#5B1E2B]">
              <span>Chapter {activeStep + 1} of {demoSteps.length}</span>
            </div>

            <h3 className="font-serif text-3xl font-semibold text-[#2C2325]">
              {demoSteps[activeStep].title}
            </h3>

            <p className="text-sm sm:text-base text-[#6B5A60] leading-relaxed">
              {demoSteps[activeStep].text}
            </p>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => setActiveStep((activeStep + 1) % demoSteps.length)}
                className="px-5 py-2.5 rounded-xl bg-[#5B1E2B]/10 text-[#5B1E2B] hover:bg-[#5B1E2B] hover:text-white transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onFullPreviewClick}
                className="text-xs text-[#5B1E2B] underline underline-offset-4 hover:text-[#4A1521] flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Launch Full Interactive Screen</span>
              </button>
            </div>
          </div>

          {/* Right: Phone Frame Mockup */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-[260px] h-[480px] bg-[#1E1B1D] rounded-[40px] p-3 shadow-2xl border-4 border-[#3D353A] relative">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-[#3D353A] rounded-full mx-auto mb-2"></div>
              {/* Screen Content */}
              <div className="w-full h-[430px] rounded-[30px] overflow-hidden">
                {demoSteps[activeStep].mockPreview}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
