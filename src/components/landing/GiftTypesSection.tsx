import React from 'react';
import { Heart, Cake, Sparkles, Users, Award, Plane, Coffee, Gift } from 'lucide-react';

interface GiftTypesSectionProps {
  onSelectOccasion: (occasion: string) => void;
}

export const GiftTypesSection: React.FC<GiftTypesSectionProps> = ({ onSelectOccasion }) => {
  const occasions = [
    {
      name: 'Love Letter',
      tagline: 'Deep Romance',
      icon: Heart,
      desc: 'Pour your heart out with timeless love letters, reasons you love them, and photo memories.',
      bg: 'bg-gradient-to-br from-[#FFF5F6] to-[#FCE7EB]',
      badge: '#5B1E2B',
      accentColor: 'text-[#5B1E2B]',
    },
    {
      name: 'Birthday',
      tagline: 'Celebrate Their Life',
      icon: Cake,
      desc: 'Remind them of how grateful you are for the day they were born and the joy they spread.',
      bg: 'bg-gradient-to-br from-[#FFF8EE] to-[#FDE8CC]',
      badge: '#B85D36',
      accentColor: 'text-[#B85D36]',
    },
    {
      name: 'Anniversary',
      tagline: 'Milestone Journey',
      icon: Sparkles,
      desc: 'Chronicle every year together with an elapsed time counter and nostalgic photo reflections.',
      bg: 'bg-gradient-to-br from-[#FBF8EE] to-[#F5ECCB]',
      badge: '#8C6B1F',
      accentColor: 'text-[#8C6B1F]',
    },
    {
      name: 'Friendship',
      tagline: 'Unbreakable Bond',
      icon: Users,
      desc: 'For the best friend who knows every secret, laughed through every mistake, and never left.',
      bg: 'bg-gradient-to-br from-[#F5F8F6] to-[#DDEEE2]',
      badge: '#2E6649',
      accentColor: 'text-[#2E6649]',
    },
    {
      name: 'Thank You',
      tagline: 'Quiet Gratitude',
      icon: Gift,
      desc: 'Show parents, mentors, or partners that their silent sacrifices did not go unnoticed.',
      bg: 'bg-gradient-to-br from-[#FDF9F5] to-[#F4E9DC]',
      badge: '#7A5B44',
      accentColor: 'text-[#7A5B44]',
    },
    {
      name: 'Graduation',
      tagline: 'Proud Achievement',
      icon: Award,
      desc: 'Celebrate their dedication and wish them courage as they open their next grand chapter.',
      bg: 'bg-gradient-to-br from-[#F8F7FD] to-[#EAE6F9]',
      badge: '#4F46E5',
      accentColor: 'text-[#4F46E5]',
    },
    {
      name: 'Long Distance',
      tagline: 'Across The Miles',
      icon: Plane,
      desc: 'Close the distance between timezones with countdowns, voice messages, and Open-When letters.',
      bg: 'bg-gradient-to-br from-[#F4FAFD] to-[#DCF0FA]',
      badge: '#0284C7',
      accentColor: 'text-[#0284C7]',
    },
    {
      name: 'Just Because',
      tagline: 'Spontaneous Warmth',
      icon: Coffee,
      desc: 'Because you don’t need a calendar reminder or holiday to tell someone they mean the world.',
      bg: 'bg-gradient-to-br from-[#FDF8F6] to-[#F7E7E0]',
      badge: '#9C4221',
      accentColor: 'text-[#9C4221]',
    },
  ];

  return (
    <section id="gift-types" className="py-24 bg-[#FAF7F2] border-t border-[#EFE5D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#5B1E2B]">
            Every Special Occasion
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2325]">
            Made For Moments That Matter
          </h2>
          <p className="text-sm sm:text-base text-[#6B5A60] leading-relaxed">
            Select an occasion to start with tailored questions, gentle writing cues, and custom layouts.
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.map((occ) => {
            const Icon = occ.icon;
            return (
              <div
                key={occ.name}
                onClick={() => onSelectOccasion(occ.name)}
                className={`${occ.bg} border border-black/5 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${occ.accentColor}`} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-black/50">
                      {occ.tagline}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#2C2325] mb-2">
                    {occ.name}
                  </h3>

                  <p className="text-xs text-[#524448] leading-relaxed">
                    {occ.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs font-medium text-[#2C2325]">
                  <span>Create {occ.name} Gift</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
