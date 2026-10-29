import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is a digital gift?',
      a: 'A digital gift on LoveNest is a personalized, interactive private web experience. Instead of sending a plain text or generic e-card, you create an intimate journey featuring a custom letter, photo gallery, relationship timeline, background ambient melody, special date counter, and interactive scratch reveals.'
    },
    {
      q: 'Do they need an account?',
      a: 'No! The recipient does not need to install an app, create an account, or download any software. They simply tap the private link you send them, and the gift opens seamlessly in their mobile or desktop browser.'
    },
    {
      q: 'Can I add photos?',
      a: 'Yes. You can add photos to your memory timeline or photo gallery, complete with meaningful captions and dates.'
    },
    {
      q: 'Can I add music?',
      a: 'Yes. You can choose from our curated ambient piano and romantic melodies (which play reliably on any browser without copyright flags), or attach your own custom song link.'
    },
    {
      q: 'Can I edit the gift later?',
      a: 'Absolutely. You can log into your LoveNest dashboard at any time to update messages, add new anniversary photos, or refresh your memories. The recipient’s link will automatically reflect the latest updates.'
    },
    {
      q: 'Can I share it using WhatsApp?',
      a: 'Yes! Once you publish your gift, LoveNest provides a one-click WhatsApp share button with a customizable heartfelt message, as well as native Web Share support for Messages, Telegram, and AirDrop.'
    },
    {
      q: 'Can I generate a QR code?',
      a: 'Yes. Every gift comes with an instantly generated high-resolution QR code that you can download and print inside physical birthday cards, letters, framed photos, or anniversary gifts.'
    },
    {
      q: 'Is my gift private?',
      a: 'Yes, 100%. Every gift receives an unguessable, randomized private link. Gift pages are never indexed by search engines (configured with noindex metadata). You can also add an optional 4-digit secret PIN for extra peace of mind.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#FAF7F2] border-t border-[#EFE5D9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5B1E2B]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2325]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#6B5A60]">
            Everything you need to know about crafting and sharing your digital gift.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-base font-serif font-medium text-[#2C2325] hover:text-[#5B1E2B] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8F7D83] transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-[#5B1E2B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#6B5A60] leading-relaxed border-t border-[#F2ECE5]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
