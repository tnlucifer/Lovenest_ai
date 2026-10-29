import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, User as UserIcon, LogOut, Gift as GiftIcon, Menu, X } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';

interface NavbarProps {
  onOpenAuth: () => void;
  onNavigate: (view: 'landing' | 'create' | 'dashboard') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onNavigate,
  currentView,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setCurrentUser(u);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error", e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EBE3D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B1E2B] to-[#7E293B] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white/80" />
          </div>
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#2C2325]">
              LoveNest
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium tracking-widest uppercase text-[#9B7B83]">
              Digital Gifts
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5E4E53]">
          <a 
            href="#how-it-works" 
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#5B1E2B] transition-colors"
          >
            How It Works
          </a>
          <a 
            href="#features" 
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#5B1E2B] transition-colors"
          >
            Features
          </a>
          <a 
            href="#gift-types" 
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('gift-types')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#5B1E2B] transition-colors"
          >
            Occasions
          </a>
          <a 
            href="#faq" 
            onClick={(e) => {
              if (currentView !== 'landing') {
                e.preventDefault();
                onNavigate('landing');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-[#5B1E2B] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">

          {/* User Auth or Dashboard Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-[#5B1E2B] text-white border-[#5B1E2B]'
                    : 'bg-white border-[#DCD1C3] text-[#2C2325] hover:border-[#5B1E2B]/40'
                }`}
              >
                <GiftIcon className="w-3.5 h-3.5" />
                <span>My Gifts</span>
              </button>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-[#7A6B70] hover:text-[#5B1E2B] hover:bg-[#F2ECE2] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#5E4E53] hover:text-[#2C2325] hover:bg-[#F2ECE2] transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Create Gift CTA Button */}
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#5B1E2B] to-[#722737] text-white text-xs sm:text-sm font-medium shadow-md hover:shadow-lg hover:from-[#4A1521] hover:to-[#5B1E2B] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Your Gift</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#5E4E53] hover:bg-[#F2ECE2]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD8] bg-[#FAF7F2] px-6 py-5 space-y-4">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-[#2C2325]"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-[#2C2325]"
          >
            My Gifts Dashboard
          </button>
          <button
            onClick={() => {
              onNavigate('create');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-[#5B1E2B]"
          >
            + Create New Gift
          </button>
          {!currentUser && (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-[#5E4E53]"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};
