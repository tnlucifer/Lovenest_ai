import React, { useState, useEffect, useRef } from 'react';
import { Gift } from '../../types/gift';
import { THEMES } from '../../lib/themeStyles';
import { audioController } from '../../lib/audioService';
import { addGiftReaction } from '../../lib/giftService';
import { extractYouTubeVideoId } from '../../lib/youtubeUtils';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Lock, 
  KeyRound, 
  Clock, 
  Share2, 
  ChevronDown, 
  ArrowLeft, 
  Disc3, 
  Mail, 
  Send,
  Youtube,
  FileAudio,
  Play,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Particles } from '../ui/Particles';

interface RecipientExperienceProps {
  gift: Gift;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export const RecipientExperience: React.FC<RecipientExperienceProps> = ({
  gift,
  isPreview = false,
  onExitPreview,
}) => {
  // Only play customized song (YouTube) or uploaded song (audio file) - NEVER play sample musics!
  const hasUploadedSong = Boolean(gift.uploadedAudioUrl && gift.uploadedAudioUrl.length > 50 && gift.uploadedAudioUrl !== '__CHUNKED__');
  const activeYouTubeId = gift.youtubeVideoId || (gift.youtubeUrl ? extractYouTubeVideoId(gift.youtubeUrl) : null);
  const hasYouTubeSong = Boolean(activeYouTubeId);
  const effectiveTrack: string = hasUploadedSong ? 'upload' : hasYouTubeSong ? 'youtube' : 'none';

  const isProtected = Boolean(gift.passwordProtected && gift.password && gift.password.trim().length > 0);
  const [hasOpened, setHasOpened] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!isProtected);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState<string>(effectiveTrack);
  const [heartsCount, setHeartsCount] = useState(gift.reactionsCount || 0);
  const [openWhenSelected, setOpenWhenSelected] = useState<string | null>(null);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ url: string; caption?: string } | null>(null);

  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratchingRef = useRef(false);

  const theme = THEMES[gift.theme] || THEMES.eternal;

  const getTrackLabel = (trackId: string) => {
    if (trackId === 'upload') return gift.uploadedAudioName || 'Uploaded Song';
    if (trackId === 'youtube') return 'Custom YouTube Song';
    return '';
  };

  // Subscribe to audio state
  useEffect(() => {
    const unsub = audioController.subscribe(playing => {
      setIsPlayingMusic(playing);
    });
    return () => {
      unsub();
      audioController.stop();
    };
  }, []);

  // Pre-load audio when component mounts if uploaded song exists
  useEffect(() => {
    if (hasUploadedSong && gift.uploadedAudioUrl) {
      setCurrentTrackName('upload');
    } else if (hasYouTubeSong) {
      setCurrentTrackName('youtube');
    } else {
      setCurrentTrackName('none');
      audioController.stop();
    }
  }, [gift.uploadedAudioUrl, gift.youtubeVideoId, hasUploadedSong, hasYouTubeSong]);

  // Calculate elapsed time dynamically
  const timeElapsed = React.useMemo(() => {
    if (!gift.specialDate) return null;
    const start = new Date(gift.specialDate).getTime();
    const now = new Date().getTime();
    if (isNaN(start)) return null;

    const diff = Math.max(0, now - start);
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    return { years, months, days, totalDays };
  }, [gift.specialDate]);

  // Start background music - plays ONLY uploaded song or customized song, NEVER sample musics!
  const startBackgroundMusic = (trackId: string = effectiveTrack) => {
    if (trackId === 'upload' && gift.uploadedAudioUrl) {
      audioController.play('upload', gift.uploadedAudioUrl);
      setCurrentTrackName('upload');
    } else {
      audioController.stop();
      setCurrentTrackName(trackId);
    }
  };

  const toggleMusic = () => {
    if (hasUploadedSong && gift.uploadedAudioUrl) {
      if (isPlayingMusic) {
        audioController.stop();
      } else {
        audioController.play('upload', gift.uploadedAudioUrl);
      }
    }
  };

  // Handle open gift - plays fully and starts background music
  const handleOpenGift = () => {
    setHasOpened(true);
    // Burst confetti
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#5B1E2B', '#E8C5C8', '#D4AF37', '#FFFFFF'],
    });

    // ONLY start music if an uploaded song is provided!
    if (hasUploadedSong && gift.uploadedAudioUrl) {
      audioController.play('upload', gift.uploadedAudioUrl);
      setCurrentTrackName('upload');
    } else {
      audioController.stop();
    }
  };

  // Handle Password Unlock
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = passwordInput.trim().toLowerCase();
    const expected = (gift.password || '').trim().toLowerCase();
    if (entered === expected) {
      setIsUnlocked(true);
      setPasswordError(false);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#5B1E2B', '#D4AF37', '#FFFFFF']
      });
    } else {
      setPasswordError(true);
    }
  };

  // Quick scratch reveal button
  const handleRevealScratch = () => {
    setScratchedPercentage(100);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#E8C5C8', '#5B1E2B']
    });
  };

  // Heart burst interaction
  const handleSendHeart = async () => {
    const next = heartsCount + 1;
    setHeartsCount(next);

    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#E11D48', '#FDA4AF', '#F43F5E'],
    });

    if (!isPreview) {
      await addGiftReaction(gift.id);
    }
  };

  // Setup Scratch Canvas when opened
  useEffect(() => {
    if (!hasOpened || !gift.scratchMessage) return;

    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw silver/gold foil overlay
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#C0C0C0');
    grad.addColorStop(0.5, '#E8E8E8');
    grad.addColorStop(1, '#A8A8A8');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative text on foil
    ctx.fillStyle = '#555555';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Rub with finger/mouse to reveal secret ✨', w / 2, h / 2 + 4);

    const checkScratched = () => {
      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        let clearCount = 0;
        for (let i = 3; i < imgData.data.length; i += 4) {
          if (imgData.data[i] === 0) clearCount++;
        }
        const pct = Math.round((clearCount / (imgData.data.length / 4)) * 100);
        setScratchedPercentage(pct);
      } catch {
        // Ignore canvas reading errors
      }
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      checkScratched();
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isScratchingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      scratch(x, y);
    };

    const startScratch = () => { isScratchingRef.current = true; };
    const stopScratch = () => { isScratchingRef.current = false; };

    canvas.addEventListener('mousedown', startScratch);
    window.addEventListener('mouseup', stopScratch);
    canvas.addEventListener('mousemove', handlePointerMove);

    canvas.addEventListener('touchstart', startScratch);
    window.addEventListener('touchend', stopScratch);
    canvas.addEventListener('touchmove', handlePointerMove);

    return () => {
      canvas.removeEventListener('mousedown', startScratch);
      window.removeEventListener('mouseup', stopScratch);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('touchstart', startScratch);
      window.removeEventListener('touchend', stopScratch);
      canvas.removeEventListener('touchmove', handlePointerMove);
    };
  }, [hasOpened, gift.scratchMessage]);

  // Passcode gate view
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#110D10] text-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C161B] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-medium">This Gift is Private</h3>
            <p className="text-xs text-white/60 mt-1">
              Please enter the passcode given to you by {gift.senderName || 'the sender'}.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter secret passcode..."
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {passwordError && (
              <p className="text-xs text-rose-400">Incorrect passcode. Please check with {gift.senderName}.</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#5B1E2B] text-white text-sm font-medium hover:bg-[#7E293B] transition-all cursor-pointer shadow-lg"
            >
              Unlock Gift
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pre-open Cinematic Envelope Screen
  if (!hasOpened) {
    return (
      <div className={`min-h-screen flex flex-col justify-between items-center p-6 text-center select-none relative overflow-hidden transition-colors duration-1000 ${
        gift.theme === 'midnight' ? 'bg-[#080B10] text-white' : 'bg-[#151013] text-[#FAF7F2]'
      }`}>
        <Particles type={theme.particleType} count={24} />

        {/* Top bar info */}
        <div className="w-full max-w-md flex items-center justify-between z-10 pt-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37]">
            LoveNest Keepsake
          </span>
          {isPreview && onExitPreview && (
            <button
              onClick={onExitPreview}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>
          )}
        </div>

        {/* Center Envelope */}
        <div className="w-full max-w-sm space-y-8 z-10 animate-fade-in my-auto">
          
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest uppercase text-[#D4AF37]/90">
              A private gift for
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-white">
              {gift.recipientName || 'You'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-serif italic pt-1">
              "Someone created something special for you."
            </p>
          </div>

          {/* Envelope with Wax Seal */}
          <div 
            onClick={handleOpenGift}
            className="group relative cursor-pointer"
          >
            {/* Subtle glow behind envelope */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#5B1E2B]/50 via-[#D4AF37]/30 to-transparent rounded-3xl blur-2xl -z-10 group-hover:scale-110 transition-transform"></div>

            <div className="relative bg-[#231B20] border-2 border-[#5B1E2B]/50 rounded-3xl p-8 shadow-2xl text-center space-y-6 overflow-hidden">
              <div className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                To: {gift.recipientName} • From: {gift.senderName || 'Secret Admirer'}
              </div>

              {/* Center Wax Seal Button */}
              <div className="py-4">
                <div className="w-20 h-20 rounded-full bg-[#5B1E2B] text-white border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Heart className="w-9 h-9 fill-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  className="px-8 py-3.5 rounded-full bg-[#D4AF37] text-[#2C2325] font-serif font-bold text-sm tracking-wide shadow-xl hover:bg-[#E5C07B] transition-all cursor-pointer group-hover:scale-105"
                >
                  Open Your Gift
                </button>
                <p className="text-[11px] text-white/50 pt-2 font-mono">
                  Tap to unlock your surprise
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom footer text */}
        <div className="text-center text-[11px] text-white/40 pb-4 z-10">
          Created with LoveNest • No account required
        </div>
      </div>
    );
  }

  // Vertical Cinematic Story Experience
  return (
    <div className={`min-h-screen ${theme.bgClass} ${theme.textColor} transition-colors duration-700 selection:bg-[#E8C5C8] relative`}>
      <Particles type={theme.particleType} count={16} />

      {/* Floating Controls Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Floating Soundtrack Pill - Only shown for customized uploaded song! */}
        {hasUploadedSong && (
          <button
            type="button"
            onClick={toggleMusic}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold shadow-xl transition-all cursor-pointer backdrop-blur-md ${
              isPlayingMusic
                ? 'bg-[#5B1E2B] text-white hover:bg-[#4A1521] border border-white/20'
                : 'bg-white/95 text-[#5B1E2B] border border-[#5B1E2B]/40 hover:bg-white animate-pulse'
            }`}
            title={isPlayingMusic ? 'Pause Music' : 'Play Uploaded Song'}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isPlayingMusic ? 'animate-spin' : ''}`}>
              <Disc3 className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className="text-[11px] font-medium hidden sm:inline">
              {isPlayingMusic ? `Playing: ${gift.uploadedAudioName || 'Uploaded Song'}` : `🎵 Play: ${gift.uploadedAudioName || 'Uploaded Song'}`}
            </span>
            {isPlayingMusic ? (
              <Pause className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#5B1E2B]" />
            )}
          </button>
        )}

        {/* Exit Preview if in editor */}
        {isPreview && onExitPreview && (
          <button
            onClick={onExitPreview}
            className="px-3.5 py-2 rounded-full bg-black/75 hover:bg-black text-white text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24 sm:space-y-32 text-center relative z-10">

        {/* Scene 1: Personal Greeting */}
        <section className="space-y-4 pt-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{gift.occasion || 'A Special Gift'}</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight leading-tight">
            For {gift.recipientName}
          </h1>

          <p className="text-xs sm:text-sm text-[#736368] font-mono tracking-widest uppercase">
            With all my heart, from {gift.senderName}
          </p>

          <div className="pt-6">
            <ChevronDown className="w-6 h-6 mx-auto animate-bounce text-black/30" />
          </div>
        </section>

        {/* Scene 2: The Heartfelt Letter */}
        <section className="text-left space-y-6">
          <div className={`p-8 sm:p-12 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-2 h-full bg-[#5B1E2B]"></div>
            
            <div className="flex items-center justify-between text-xs text-[#8F7D83] uppercase tracking-widest font-mono mb-6">
              <span>A Personal Letter</span>
              <Heart className="w-4 h-4 text-[#5B1E2B] fill-[#5B1E2B]" />
            </div>

            <div className="font-serif text-base sm:text-lg leading-relaxed text-[#38262B] whitespace-pre-line space-y-4">
              {gift.message || "I wanted to make something that could hold all the quiet gratitude I feel for you..."}
            </div>

            <div className="pt-8 mt-6 border-t border-[#E8DFD8] flex items-center justify-between text-xs sm:text-sm font-serif italic text-[#63323E]">
              <span>Forever & Always,</span>
              <span className="font-semibold">{gift.senderName}</span>
            </div>
          </div>
        </section>

        {/* Scene 3: Reasons Why I Love / Appreciate You */}
        {gift.reasons && gift.reasons.filter(r => r.trim()).length > 0 && (
          <section className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                Little Treasures
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">
                Reasons Why You Mean The World
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 text-left">
              {gift.reasons.filter(r => r.trim()).map((reason, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xs hover:shadow-md transition-shadow flex items-start gap-4`}
                >
                  <span className="w-7 h-7 rounded-full bg-[#5B1E2B]/10 text-[#5B1E2B] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-[#38262B]">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scene 4: Photo Gallery */}
        {gift.photos && gift.photos.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                Frozen in Time
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">
                Our Favorite Snapshots
              </h2>
            </div>

            <div className="space-y-6">
              {gift.photos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => setSelectedPhotoModal(photo)}
                  className={`p-4 sm:p-5 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl overflow-hidden text-left space-y-3 cursor-pointer group hover:shadow-2xl transition-all`}
                >
                  <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#F5ECE1]">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Special memory"}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] backdrop-blur-xs font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      Tap to view photo 🔍
                    </div>
                  </div>
                  {photo.caption && photo.caption.trim().length > 0 && (
                    <p className="text-xs sm:text-sm font-serif italic text-[#544146] px-2 leading-relaxed">
                      "{photo.caption}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scene 5: Timeline of Memories */}
        {gift.memories && gift.memories.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">
                Moments We’ll Never Forget
              </h2>
            </div>

            <div className="relative border-l-2 border-[#5B1E2B]/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-12 text-left">
              {gift.memories.map((mem, idx) => (
                <div key={mem.id || idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#5B1E2B] border-4 border-white shadow-xs"></div>

                  <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-md space-y-3`}>
                    <div className="flex flex-wrap items-center justify-between text-xs text-[#8F7D83] font-mono gap-2">
                      <span className="flex items-center gap-1.5 text-[#5B1E2B] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {mem.date || 'Once upon a time'}
                      </span>
                      {mem.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {mem.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-[#2C2325]">
                      {mem.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#544146] leading-relaxed">
                      {mem.description}
                    </p>

                    {mem.photoUrl && (
                      <div className="pt-2">
                        <img
                          src={mem.photoUrl}
                          alt={mem.title}
                          className="w-full h-48 sm:h-64 object-cover rounded-2xl shadow-xs"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scene 6: Special Date Counter */}
        {gift.specialDate && timeElapsed && (
          <section className="space-y-6">
            <div className={`p-8 sm:p-12 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl`}>
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                {gift.specialDateTitle || 'Our Special Day'}
              </span>
              
              <h2 className="font-serif text-2xl sm:text-3xl mt-2 mb-6">
                Together for
              </h2>

              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                <div className="p-4 rounded-2xl bg-black/5 text-center">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5B1E2B] block">
                    {timeElapsed.years}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8F7D83]">
                    Years
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/5 text-center">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5B1E2B] block">
                    {timeElapsed.months}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8F7D83]">
                    Months
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/5 text-center">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5B1E2B] block">
                    {timeElapsed.days}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8F7D83]">
                    Days
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#736368] font-serif italic mt-6">
                That is {timeElapsed.totalDays.toLocaleString()} days of laughter, patience, and growing together.
              </p>
            </div>
          </section>
        )}

        {/* Scene 7: Our Special Places */}
        {gift.favoritePlaces && gift.favoritePlaces.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                On The Map
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">
                Places Sacred To Us
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gift.favoritePlaces.map((pl, idx) => (
                <div
                  key={pl.id || idx}
                  className={`p-6 rounded-2xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xs space-y-2`}
                >
                  <div className="flex items-center gap-2 text-[#5B1E2B] text-xs font-mono font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>{pl.city}</span>
                  </div>
                  <h4 className="font-serif text-lg font-semibold">{pl.title}</h4>
                  <p className="text-xs text-[#635358] leading-relaxed">
                    "{pl.memory}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scene 8: Our Song / Soundtrack - Only shown if customized song or uploaded song is present! */}
        {(hasUploadedSong || hasYouTubeSong) && (
          <section className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                The Soundtrack
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">
                Our Special Song
              </h2>
            </div>

            {/* YouTube Embed Player */}
            {hasYouTubeSong && activeYouTubeId ? (
              <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl space-y-4 text-center`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                  <Youtube className="w-4 h-4 fill-red-600 text-red-600" />
                  <span>Chosen Especially For You</span>
                </div>

                <h4 className="font-serif text-xl sm:text-2xl font-semibold">
                  A Song That Reminds Me of Us
                </h4>

                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-black/10 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeYouTubeId}?rel=0&playsinline=1${hasOpened ? '&autoplay=1' : ''}`}
                    title="Our Special Song"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <p className="text-xs text-[#736368] font-serif italic pt-1">
                  "Whenever this song plays, I think of you and smile."
                </p>
              </div>
            ) : hasUploadedSong ? (
              <div className={`p-8 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl flex flex-col items-center space-y-5 text-center`}>
                <div 
                  onClick={toggleMusic}
                  className="relative cursor-pointer group"
                  title="Click to play / pause your uploaded song"
                >
                  <div className={`w-28 h-28 rounded-full bg-[#18181B] text-white flex items-center justify-center border-4 border-[#D4AF37]/60 shadow-2xl transition-transform group-hover:scale-105 ${isPlayingMusic ? 'animate-spin' : ''}`}>
                    <Disc3 className="w-14 h-14 text-[#D4AF37]" />
                  </div>
                  <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center shadow-inner">
                    {isPlayingMusic ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8F7D83] flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPlayingMusic ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                    {isPlayingMusic ? 'Your Uploaded Song Playing' : 'Song Paused (Tap to Play)'}
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2325]">
                    {gift.uploadedAudioName || 'Our Special Song'}
                  </h4>
                  <p className="text-xs text-[#736368] italic">
                    Original song chosen by {gift.senderName || 'Your Love'} especially for you
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={toggleMusic}
                    className="px-6 py-2.5 rounded-full bg-[#5B1E2B] text-white font-semibold text-xs hover:bg-[#7E293B] shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingMusic ? 'Pause Uploaded Song' : 'Play Uploaded Song'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* Scene 9: Future Dreams */}
        {gift.futureDream && (
          <section className="space-y-6">
            <div className={`p-8 sm:p-12 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl text-left space-y-4`}>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                <Sparkles className="w-4 h-4" />
                <span>Our Tomorrow</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold">
                My Dream For Our Future
              </h3>
              <p className="font-serif italic text-base leading-relaxed text-[#3E2C31]">
                "{gift.futureDream}"
              </p>
            </div>
          </section>
        )}

        {/* Scene 10: Interactive Surprise: Scratch Card & Open When Letters */}
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
              Interactive Surprises
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl">
              Hidden Notes Just For You
            </h2>
          </div>

          {/* Scratch to reveal message */}
          {gift.scratchMessage && (
            <div className={`p-6 sm:p-8 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl space-y-4`}>
              <h4 className="font-serif text-lg font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Scratch-to-Reveal Secret Message</span>
              </h4>
              <p className="text-xs text-[#736368]">
                Rub away the metallic foil below using your finger/cursor, or tap the button to reveal.
              </p>

              <div className="relative w-full max-w-sm h-32 mx-auto rounded-2xl overflow-hidden border border-[#D9CDBF] shadow-inner select-none flex items-center justify-center p-4 bg-[#FFF9F2]">
                {/* Hidden Message Behind */}
                <div className="text-center font-serif text-sm font-semibold text-[#5B1E2B] italic px-4 leading-relaxed">
                  "{gift.scratchMessage}"
                </div>

                {/* Scratch canvas over top */}
                {scratchedPercentage < 75 && (
                  <canvas
                    ref={scratchCanvasRef}
                    width={360}
                    height={130}
                    className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                {scratchedPercentage < 75 ? (
                  <button
                    type="button"
                    onClick={handleRevealScratch}
                    className="px-4 py-2 rounded-xl bg-[#5B1E2B]/10 hover:bg-[#5B1E2B]/20 text-[#5B1E2B] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    ✨ Tap to Scratch & Reveal
                  </button>
                ) : (
                  <p className="text-xs font-mono text-[#5B1E2B] font-semibold animate-fade-in">
                    ✓ Secret note completely revealed!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sealed Secret Note for Your Eyes Only */}
          {gift.secretNote && (
            <div className={`p-8 sm:p-10 rounded-3xl ${theme.cardBgClass} border ${theme.cardBorderClass} shadow-xl space-y-4 text-left relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>A Secret Note For Your Eyes Only</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center text-sm shadow-md">
                  💌
                </div>
              </div>
              <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#2C2325] whitespace-pre-line pt-2">
                "{gift.secretNote}"
              </p>
              <div className="pt-2 text-right text-xs font-serif text-[#8F7D83]">
                — Forever yours, {gift.senderName || 'Me'}
              </div>
            </div>
          )}

          {/* Open When Notes */}
          {gift.openWhenNotes && gift.openWhenNotes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-medium">
                "Open When..." Letters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gift.openWhenNotes.map(note => {
                  const isSelected = openWhenSelected === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setOpenWhenSelected(isSelected ? null : note.id)}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition-all shadow-xs ${
                        isSelected 
                          ? 'bg-[#5B1E2B] text-white border-[#5B1E2B] scale-102 shadow-lg' 
                          : `${theme.cardBgClass} ${theme.cardBorderClass} hover:border-[#5B1E2B]/40`
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-[#5B1E2B]'}`} />
                        <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                          Envelope
                        </span>
                      </div>
                      <h5 className="font-serif text-sm font-semibold mb-2">
                        {note.title}
                      </h5>
                      {isSelected ? (
                        <p className="text-xs leading-relaxed italic opacity-95 pt-2 border-t border-white/20 whitespace-pre-line animate-fade-in">
                          "{note.message}"
                        </p>
                      ) : (
                        <span className="text-[11px] opacity-70">Tap to unseal note →</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Scene 11: Final Emotional Reveal & Heart Reaction */}
        <section className="space-y-8 pt-8">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#4A1521] via-[#5B1E2B] to-[#360D17] text-white shadow-2xl space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
              One Last Thing
            </span>

            <h3 className="font-serif text-3xl sm:text-4xl font-normal leading-relaxed">
              "And if I had to choose again..."
            </h3>

            <p className="font-serif italic text-lg sm:text-xl text-[#F7E7CE] max-w-lg mx-auto">
              I would find you sooner, so I could love you longer.
            </p>

            <div className="w-16 h-0.5 bg-[#D4AF37]/50 mx-auto my-6"></div>

            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-white/70">
              Made with endless love by {gift.senderName} for {gift.recipientName} ❤️
            </p>

            {/* Tap to send love back */}
            <div className="pt-6 space-y-3">
              <button
                onClick={handleSendHeart}
                className="px-8 py-4 rounded-full bg-[#E11D48] text-white font-medium text-sm shadow-xl hover:bg-[#F43F5E] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white animate-bounce" />
                <span>Tap to Send Love Back</span>
              </button>

              <div className="text-xs text-white/60 font-mono">
                {heartsCount} {heartsCount === 1 ? 'heart' : 'hearts'} received
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Recipient Footer */}
      {/* Photo Lightbox Modal */}
      {selectedPhotoModal && (
        <div 
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#1A1618] border border-white/20 rounded-3xl overflow-hidden shadow-2xl space-y-3 p-3 text-center"
          >
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl flex items-center justify-center bg-black">
              <img
                src={selectedPhotoModal.url}
                alt="Enlarged Memory"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>
            {selectedPhotoModal.caption && (
              <p className="p-3 text-sm font-serif italic text-white/90 leading-relaxed">
                "{selectedPhotoModal.caption}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
