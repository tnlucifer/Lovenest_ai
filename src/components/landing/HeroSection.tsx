import React, { useState } from 'react';
import { Sparkles, ArrowRight, Heart, Volume2, Shield, Eye } from 'lucide-react';
import { Particles } from '../ui/Particles';
import confetti from 'canvas-confetti';

interface HeroSectionProps {
  onCreateClick: () => void;
  onPreviewSample: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCreateClick,
  onPreviewSample,
}) => {
  const [isOpenEnvelope, setIsOpenEnvelope] = useState(false);

  const handleOpenEnvelope = () => {
    if (!isOpenEnvelope) {
      setIsOpenEnvelope(true);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#5B1E2B', '#E8C5C8', '#D4AF37', '#FFF7F2'],
      });
    } else {
      setIsOpenEnvelope(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-gradient-to-b from-[#FAF7F2] via-[#FDFBF7] to-[#F5ECE1]">
      <Particles type="hearts" count={16} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5B1E2B]/8 border border-[#5B1E2B]/15 text-[#5B1E2B] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>A new, cinematic way to say what matters</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#2C2325] leading-[1.15]">
              Some memories deserve{' '}
              <span className="italic font-medium text-[#5B1E2B] relative inline-block">
                more than a message.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-2 text-[#D4AF37]/50"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M1 5.5C40 2 120 1.5 199 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#66545A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Create a beautiful digital gift filled with your words, photos, music and memories — made especially for one person.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onCreateClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#5B1E2B] text-white font-medium text-base shadow-xl hover:bg-[#4A1521] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Create Your Gift</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onPreviewSample}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border border-[#D9CDBF] text-[#423337] font-medium text-base hover:bg-[#FAF6EF] hover:border-[#5B1E2B]/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4 text-[#5B1E2B]" />
                <span>See Sample Experience</span>
              </button>
            </div>

            {/* Social proof / reassuring tags */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#7F6E73]">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">★★★★★</span>
                <span>Emotional & memorable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#5B1E2B]" />
                <span>100% Private link</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📱 Zero app installs needed</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Interactive 3D Digital Envelope with Wax Seal */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Soft glow background */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#E8C5C8]/40 via-[#F7E7CE]/30 to-[#FAF7F2] rounded-3xl blur-2xl -z-10 animate-pulse"></div>

              {/* Envelope Container */}
              <div 
                onClick={handleOpenEnvelope}
                className="group relative cursor-pointer select-none transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Envelope Base Card */}
                <div className="relative bg-[#F4ECE3] border-2 border-[#E3D6C5] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
                  
                  {/* Decorative envelope texture & border stitching */}
                  <div className="absolute inset-2 border border-dashed border-[#D4C4B1]/60 rounded-2xl pointer-events-none"></div>
                  
                  {/* Stamp & Airmail motif in top right */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7D83]">
                        Private Delivery
                      </span>
                      <p className="text-xs font-serif italic text-[#5B1E2B]">
                        To: Someone Unforgettable
                      </p>
                    </div>

                    {/* Vintage Gold Stamp */}
                    <div className="w-12 h-14 border border-[#C59B27] bg-[#FFF9EE] rounded-md p-1 flex flex-col items-center justify-center shadow-xs rotate-3">
                      <Heart className="w-4 h-4 text-[#C59B27] fill-[#C59B27]/20" />
                      <span className="text-[9px] font-mono text-[#8C6239] mt-1 font-bold">LOVE</span>
                    </div>
                  </div>

                  {/* Revealed Card sliding out when open */}
                  <div 
                    className={`transition-all duration-700 ease-out my-4 ${
                      isOpenEnvelope 
                        ? 'translate-y-0 opacity-100 scale-100' 
                        : 'translate-y-6 opacity-85 scale-95'
                    }`}
                  >
                    <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] shadow-lg text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5B1E2B]"></div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium tracking-wide uppercase text-[#8F7D83]">
                          Dearest One,
                        </span>
                        <span className="text-[11px] text-[#5B1E2B] font-mono">09.18</span>
                      </div>
                      <p className="font-serif italic text-sm sm:text-base text-[#38262B] leading-relaxed">
                        "I made this little universe of memories just for you. Because some moments changed my entire world..."
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#8F7D83] pt-2 border-t border-[#F2EDE6]">
                        <span className="flex items-center gap-1 text-[#5B1E2B] font-medium">
                          <Heart className="w-3.5 h-3.5 fill-[#5B1E2B]" /> With all my love
                        </span>
                        <span className="text-[10px]">Tap to read more →</span>
                      </div>
                    </div>
                  </div>

                  {/* Wax Seal Center Button */}
                  <div className="relative z-10 flex flex-col items-center justify-center pt-2">
                    <div className="relative">
                      {/* Wax Seal */}
                      <button
                        type="button"
                        className={`w-14 h-14 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center shadow-lg transition-all duration-500 border-2 border-[#D4AF37]/50 ${
                          isOpenEnvelope ? 'rotate-180 scale-95 shadow-md bg-[#7E293B]' : 'hover:scale-110 animate-bounce'
                        }`}
                      >
                        <Heart className="w-6 h-6 fill-white" />
                      </button>
                      {!isOpenEnvelope && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4AF37] rounded-full border-2 border-white animate-ping"></span>
                      )}
                    </div>
                    <span className="text-xs font-serif italic text-[#725E64] mt-2">
                      {isOpenEnvelope ? "Tap to close envelope" : "Tap wax seal to open"}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
