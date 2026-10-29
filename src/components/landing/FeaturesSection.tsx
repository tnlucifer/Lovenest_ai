import React from 'react';
import { 
  Mail, 
  Camera, 
  Music, 
  CalendarHeart, 
  MapPin, 
  Moon, 
  Mic, 
  Film,
  Sparkles
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const items = [
    {
      icon: Mail,
      title: 'Personal Letter',
      tagline: '💌 Handwritten Soul',
      description: 'Your unfiltered heartfelt thoughts displayed with classic typography, elegant letterheads, and optional AI polish.',
      accent: 'border-[#5B1E2B]/20 hover:border-[#5B1E2B]',
    },
    {
      icon: Camera,
      title: 'Photo Gallery',
      tagline: '📸 Cinematic Moments',
      description: 'Cherished snapshots presented in a touch-friendly slideshow with heartfelt captions and gentle zoom transitions.',
      accent: 'border-[#D4AF37]/30 hover:border-[#D4AF37]',
    },
    {
      icon: Music,
      title: 'Your Song',
      tagline: '🎵 Romantic Melody',
      description: 'Gentle ambient piano chords, nostalgic music box chimes, or your own meaningful custom soundtrack.',
      accent: 'border-[#B84E65]/30 hover:border-[#B84E65]',
    },
    {
      icon: CalendarHeart,
      title: 'Special Date',
      tagline: '📅 "Together For..."',
      description: 'An interactive dynamic time counter celebrating every single year, month, and day since your journey began.',
      accent: 'border-[#BD532B]/30 hover:border-[#BD532B]',
    },
    {
      icon: MapPin,
      title: 'Favorite Places',
      tagline: '📍 Memory Map',
      description: 'Curate the coffee shop where you first met, that spontaneous road trip viewpoint, or your peaceful sanctuary.',
      accent: 'border-[#5B1E2B]/20 hover:border-[#5B1E2B]',
    },
    {
      icon: Moon,
      title: 'Future Dreams',
      tagline: '🌙 Tomorrow Together',
      description: 'A shared bucket list of adventures, morning coffees, and milestones you cannot wait to experience side by side.',
      accent: 'border-[#7E293B]/30 hover:border-[#7E293B]',
    },
    {
      icon: Mic,
      title: 'Voice Message',
      tagline: '🎙 Intimate Audio',
      description: 'Attach your spoken voice message so they can hear your tone, laughter, and warmth wherever they are.',
      accent: 'border-[#A8441F]/30 hover:border-[#A8441F]',
    },
    {
      icon: Film,
      title: 'Video Memories',
      tagline: '🎬 Living Clips',
      description: 'Embed video reels or special clips that bring their smile to life inside their private gift page.',
      accent: 'border-[#C59B27]/30 hover:border-[#C59B27]',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#F7F1E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#5B1E2B]">
            Rich & Multi-Sensory
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2325]">
            What You Can Add To Your Gift
          </h2>
          <p className="text-sm sm:text-base text-[#6B5A60] leading-relaxed">
            Every love story is unique. Choose and customize only the elements that reflect your bond.
          </p>
        </div>

        {/* 8 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`bg-white/90 backdrop-blur-xs rounded-2xl p-6 border ${item.accent} shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between`}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#FAF5F0] text-[#5B1E2B] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#5B1E2B] group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-medium tracking-wide uppercase text-[#8F7D83] block mb-1">
                    {item.tagline}
                  </span>

                  <h3 className="font-serif text-lg font-semibold text-[#2C2325] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#6B5A60] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F2EDE6] flex items-center justify-between text-[11px] text-[#8F7D83]">
                  <span>Customizable</span>
                  <span className="text-[#5B1E2B] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
