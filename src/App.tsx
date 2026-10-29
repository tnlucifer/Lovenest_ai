import React, { useState, useEffect } from 'react';
import { Gift, OccasionType } from './types/gift';
import { getGiftById, createSampleGift, createBlankGift, decodeGiftFromUrlParam, saveLocalGift } from './lib/giftService';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Layout & UI
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

// Landing Sections
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { GiftTypesSection } from './components/landing/GiftTypesSection';
import { InteractiveDemoSection } from './components/landing/InteractiveDemoSection';
import { EmotionalCTA } from './components/landing/EmotionalCTA';
import { FAQSection } from './components/landing/FAQSection';

// App Views
import { CreatorWizard } from './components/creator/CreatorWizard';
import { RecipientExperience } from './components/recipient/RecipientExperience';
import { UserDashboard } from './components/dashboard/UserDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'dashboard' | 'recipient'>('landing');
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [recipientGift, setRecipientGift] = useState<Gift | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadingInitialGift, setLoadingInitialGift] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Monitor auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const [giftNotFound, setGiftNotFound] = useState<string | null>(null);

  // Parse initial route (e.g. /gift/:id, ?c=..., ?gift=xyz, ?id=xyz, or #/gift/xyz)
  useEffect(() => {
    const handleUrlRoute = async () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const giftParam = searchParams.get('gift') || searchParams.get('id');
      const hash = window.location.hash;

      // 1. Instant Zero-Latency Delivery: If a direct card payload is embedded in ?c= or ?d= or #c=, unpack it immediately!
      const encodedPayload = searchParams.get('c') || searchParams.get('d') || (hash.includes('c=') ? hash.split('c=')[1]?.split('&')[0] : null);
      if (encodedPayload) {
        const decoded = decodeGiftFromUrlParam(encodedPayload);
        if (decoded) {
          saveLocalGift(decoded);
          setRecipientGift(decoded);
          setCurrentView('recipient');
          setLoadingInitialGift(false);
          setGiftNotFound(null);
          return;
        }
      }

      let targetGiftId: string | null = null;
      if (pathname.startsWith('/gift/')) {
        targetGiftId = pathname.replace('/gift/', '').trim();
      } else if (giftParam) {
        targetGiftId = giftParam.trim();
      } else if (hash.startsWith('#/gift/')) {
        targetGiftId = hash.replace('#/gift/', '').trim();
      }

      if (targetGiftId) {
        // Strip trailing slashes, query parameters or hashes
        targetGiftId = targetGiftId.replace(/\/+$/, '').split('?')[0].split('#')[0].trim();
      }

      if (targetGiftId) {
        setLoadingInitialGift(true);
        setGiftNotFound(null);
        try {
          let loaded = await getGiftById(targetGiftId);
          // If not found instantly, retry once after 400ms for network write replication
          if (!loaded) {
            await new Promise(r => setTimeout(r, 400));
            loaded = await getGiftById(targetGiftId);
          }

          if (loaded) {
            setRecipientGift(loaded);
            setCurrentView('recipient');
          } else {
            // Check if it's the sample slug
            if (targetGiftId === 'sample-love-nest' || targetGiftId === 'ln-sample-gift') {
              const sample = createSampleGift();
              setRecipientGift(sample);
              setCurrentView('recipient');
            } else {
              setGiftNotFound(targetGiftId);
              setCurrentView('recipient');
            }
          }
        } finally {
          setLoadingInitialGift(false);
        }
      } else if (pathname === '/dashboard') {
        setCurrentView('dashboard');
      } else if (pathname === '/create') {
        setActiveGift(createBlankGift(user?.uid || 'guest'));
        setCurrentView('create');
      }
    };

    handleUrlRoute();

    // Listen to browser popstate (back/forward)
    const onPopState = () => {
      handleUrlRoute();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Navigate handler with browser history support
  const navigateTo = (view: 'landing' | 'create' | 'dashboard') => {
    setCurrentView(view);
    if (view === 'landing') {
      window.history.pushState({}, '', '/');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'create') {
      if (!activeGift) {
        setActiveGift(createBlankGift(user?.uid || 'guest'));
      }
      window.history.pushState({}, '', '/create');
    }
  };

  // Start new gift creation
  const handleStartCreate = (defaultOccasion?: string) => {
    const newGift = createBlankGift(user?.uid || 'guest');
    if (defaultOccasion) {
      newGift.occasion = defaultOccasion as OccasionType;
    }
    setActiveGift(newGift);
    setCurrentView('create');
    window.history.pushState({}, '', '/create');
  };

  // Open Sample Gift Experience
  const handleOpenSampleExperience = () => {
    const sample = createSampleGift();
    setRecipientGift(sample);
    setCurrentView('recipient');
    window.history.pushState({}, '', `/gift/${sample.uniqueSlug}`);
  };

  // Edit existing gift from dashboard
  const handleEditGift = (gift: Gift) => {
    setActiveGift(gift);
    setCurrentView('create');
    window.history.pushState({}, '', '/create');
  };

  // View as recipient from dashboard or editor
  const handleViewRecipient = (gift: Gift) => {
    setRecipientGift(gift);
    setCurrentView('recipient');
    window.history.pushState({}, '', `/gift/${gift.uniqueSlug || gift.id}`);
  };

  // Recipient standalone experience (No creator controls visible!)
  if (currentView === 'recipient' && recipientGift) {
    return (
      <RecipientExperience
        key={recipientGift.id}
        gift={recipientGift}
        isPreview={false}
        onExitPreview={() => navigateTo('landing')}
      />
    );
  }

  // Card Not Found View
  if (currentView === 'recipient' && giftNotFound && !recipientGift) {
    return (
      <div className="min-h-screen bg-[#110D10] text-white flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#5B1E2B]/30 border border-[#D4AF37]/40 flex items-center justify-center text-2xl shadow-lg">
          🎁
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-serif text-2xl font-bold text-[#FAF7F2]">
            Card Not Found
          </h2>
          <p className="text-xs text-white/70 leading-relaxed">
            We couldn't locate this private card (ID: <span className="font-mono text-[#D4AF37]">{giftNotFound}</span>). The creator may still be editing it or may not have published yet.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleOpenSampleExperience()}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Explore Sample Card
          </button>
          <button
            onClick={() => handleStartCreate('Birthday')}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#2C2325] text-xs font-bold hover:bg-[#E5C07B] cursor-pointer shadow-md transition-colors"
          >
            Create Your Own Birthday Card
          </button>
        </div>
      </div>
    );
  }

  // Loading spinner for direct gift links
  if (loadingInitialGift) {
    return (
      <div className="min-h-screen bg-[#110D10] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"></div>
        <p className="font-serif italic text-base text-white/80">
          Unfolding your private gift...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C2325]">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onNavigate={navigateTo}
        currentView={currentView}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <main>
            <HeroSection
              onCreateClick={() => handleStartCreate()}
              onPreviewSample={handleOpenSampleExperience}
            />

            <HowItWorksSection />

            <FeaturesSection />

            <GiftTypesSection
              onSelectOccasion={(occ) => handleStartCreate(occ)}
            />

            <InteractiveDemoSection
              onFullPreviewClick={handleOpenSampleExperience}
            />

            <EmotionalCTA
              onCreateClick={() => handleStartCreate()}
            />

            <FAQSection />
          </main>
        )}

        {currentView === 'create' && activeGift && (
          <CreatorWizard
            initialGift={activeGift}
            onExit={() => navigateTo('landing')}
            onViewRecipient={handleViewRecipient}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <UserDashboard
            onEditGift={handleEditGift}
            onViewGift={handleViewRecipient}
            onCreateNew={() => handleStartCreate()}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </div>

      {/* Footer (only on landing or dashboard) */}
      {currentView !== 'create' && (
        <Footer onNavigate={navigateTo} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
