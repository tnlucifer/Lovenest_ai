import { ThemeType } from '../types/gift';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  tagline: string;
  bgClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  accentBg: string;
  goldAccent: string;
  waxSealColor: string;
  fontClass: string;
  fontFamily: string;
  envelopeClass: string;
  particleType: 'hearts' | 'stars' | 'petals' | 'sparkles' | 'leaves' | 'vintage';
  previewGradient: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  eternal: {
    id: 'eternal',
    name: 'Eternal',
    tagline: 'Timeless luxury in burgundy, warm ivory, and brushed gold',
    bgClass: 'bg-[#FAF7F2]',
    cardBgClass: 'bg-[#FFFFFF]/90 backdrop-blur-sm',
    cardBorderClass: 'border-[#E8DFD8]',
    textColor: 'text-[#2C2325]',
    subtextColor: 'text-[#6D5E62]',
    accentColor: 'text-[#5B1E2B]',
    accentBg: 'bg-[#5B1E2B] text-white',
    goldAccent: '#D4AF37',
    waxSealColor: '#5B1E2B',
    fontClass: 'font-serif',
    fontFamily: "'Playfair Display', Georgia, serif",
    envelopeClass: 'bg-[#EDE4DA] border-[#D8C7B5]',
    particleType: 'hearts',
    previewGradient: 'from-[#FAF7F2] via-[#F4ECE4] to-[#5B1E2B]',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Star-kissed celestial night with glowing gold and deep indigo',
    bgClass: 'bg-[#0A0D14]',
    cardBgClass: 'bg-[#121824]/90 backdrop-blur-md',
    cardBorderClass: 'border-[#1E293B]',
    textColor: 'text-[#F1F5F9]',
    subtextColor: 'text-[#94A3B8]',
    accentColor: 'text-[#E2B755]',
    accentBg: 'bg-[#E2B755] text-[#0A0D14]',
    goldAccent: '#F5D061',
    waxSealColor: '#1E293B',
    fontClass: 'font-serif',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    envelopeClass: 'bg-[#151D2C] border-[#293548]',
    particleType: 'stars',
    previewGradient: 'from-[#0A0D14] via-[#1E293B] to-[#E2B755]',
  },
  bloom: {
    id: 'bloom',
    name: 'Bloom',
    tagline: 'Fresh blush peony, delicate rose garden and romantic light',
    bgClass: 'bg-[#FDF6F7]',
    cardBgClass: 'bg-white/95 backdrop-blur-sm',
    cardBorderClass: 'border-[#F0D5D9]',
    textColor: 'text-[#3E2529]',
    subtextColor: 'text-[#825F66]',
    accentColor: 'text-[#B84E65]',
    accentBg: 'bg-[#B84E65] text-white',
    goldAccent: '#E0A899',
    waxSealColor: '#B84E65',
    fontClass: 'font-serif',
    fontFamily: "'Playfair Display', serif",
    envelopeClass: 'bg-[#F8E7EA] border-[#ECCCD2]',
    particleType: 'petals',
    previewGradient: 'from-[#FDF6F7] via-[#F9E2E6] to-[#B84E65]',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Golden hour romance with warm terracotta and apricot embers',
    bgClass: 'bg-[#FFF7F2]',
    cardBgClass: 'bg-white/95 backdrop-blur-sm',
    cardBorderClass: 'border-[#F8DFD2]',
    textColor: 'text-[#382319]',
    subtextColor: 'text-[#7C5A4B]',
    accentColor: 'text-[#BD532B]',
    accentBg: 'bg-[#BD532B] text-white',
    goldAccent: '#F39C12',
    waxSealColor: '#A8441F',
    fontClass: 'font-serif',
    fontFamily: "'Playfair Display', serif",
    envelopeClass: 'bg-[#FBECE2] border-[#F0D0BC]',
    particleType: 'sparkles',
    previewGradient: 'from-[#FFF7F2] via-[#FCE3D2] to-[#BD532B]',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Modern editorial luxury with pure ivory, noir ink and crisp lines',
    bgClass: 'bg-[#FBFBFA]',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-[#E5E5E5]',
    textColor: 'text-[#18181B]',
    subtextColor: 'text-[#71717A]',
    accentColor: 'text-[#18181B]',
    accentBg: 'bg-[#18181B] text-white',
    goldAccent: '#71717A',
    waxSealColor: '#18181B',
    fontClass: 'font-sans',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    envelopeClass: 'bg-[#F4F4F3] border-[#E0E0DD]',
    particleType: 'sparkles',
    previewGradient: 'from-[#FBFBFA] via-[#EAEAEA] to-[#18181B]',
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    tagline: 'Antique love letters, postal wax seals and sepia nostalgia',
    bgClass: 'bg-[#F6EFE6]',
    cardBgClass: 'bg-[#FCF9F3]/95 backdrop-blur-sm',
    cardBorderClass: 'border-[#D9C8B5]',
    textColor: 'text-[#382B21]',
    subtextColor: 'text-[#786352]',
    accentColor: 'text-[#7A4B31]',
    accentBg: 'bg-[#7A4B31] text-white',
    goldAccent: '#C59B27',
    waxSealColor: '#7A4B31',
    fontClass: 'font-serif',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    envelopeClass: 'bg-[#ECE0CE] border-[#D1BEA5]',
    particleType: 'vintage',
    previewGradient: 'from-[#F6EFE6] via-[#E8D9C5] to-[#7A4B31]',
  },
};
