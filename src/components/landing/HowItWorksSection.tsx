import React from 'react';
import { PenLine, Sliders, Send, Sparkles } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create',
      tagline: 'Tell us about your person and your memories.',
      desc: 'Set the recipient’s name, your relationship, the occasion, and the heartfelt words you have always wanted to put in writing.',
      icon: PenLine,
      badge: '3-Minute Setup',
    },
    {
      num: '02',
      title: 'Personalize',
      tagline: 'Add photos, messages, music, dates and special moments.',
      desc: 'Enrich the gift with your relationship timeline, photo gallery, romantic ambient music, special dates, and scratch-to-reveal surprises.',
      icon: Sliders,
      badge: 'Custom Themes',
    },
    {
      num: '03',
      title: 'Surprise',
      tagline: 'Send the private link or QR code and let them discover it.',
      desc: 'Share via WhatsApp, print an elegant QR code on a card, or text the link. They open it instantly in their phone browser without installing anything.',
      icon: Send,
      badge: 'Instant Magic',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#FAF7F2] border-t border-[#EFE5D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#5B1E2B]">
            Effortless & Heartfelt
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2325]">
            How LoveNest Works
          </h2>
          <p className="text-sm sm:text-base text-[#6B5A60] leading-relaxed">
            Turn your cherished memories into an unforgettable digital keepsake in three simple, joyful steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white rounded-3xl p-8 border border-[#E8DFD8] shadow-xs hover:shadow-xl hover:border-[#5B1E2B]/20 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl font-bold text-[#5B1E2B]/25 group-hover:text-[#5B1E2B] transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-[#FAF5F0] text-[#7A5B64] border border-[#EADFD5]">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#5B1E2B]/8 text-[#5B1E2B] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-[#2C2325] mb-2">
                    {step.title}
                  </h3>

                  <p className="font-medium text-xs sm:text-sm text-[#5B1E2B] mb-3 italic">
                    "{step.tagline}"
                  </p>

                  <p className="text-xs sm:text-sm text-[#6B5A60] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F2EDE6] flex items-center gap-2 text-xs text-[#8A797E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Real-time preview updates instantly</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
