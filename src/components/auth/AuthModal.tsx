import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { X, Mail, Lock, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.warn("Google sign-in error", err);
      setErrorMsg("Could not sign in with Google. You can continue as guest or use email.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.warn("Email auth error", err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMsg("Incorrect email or password. Please try again.");
      } else if (msg.includes('email-already-in-use')) {
        setErrorMsg("An account with this email already exists. Try signing in.");
      } else {
        setErrorMsg("Authentication could not be completed right now. You can continue as guest.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#FAF7F2] border border-[#E8DFD8] rounded-3xl p-8 shadow-2xl text-[#2C2325]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6D5E62] hover:text-[#2C2325] hover:bg-[#F0EAE1] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5B1E2B]/10 text-[#5B1E2B] mb-3">
            <Heart className="w-6 h-6 fill-[#5B1E2B]/20" />
          </div>
          <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#2C2325]">
            {mode === 'signup' ? 'Create Your LoveNest Account' : 'Welcome Back to LoveNest'}
          </h3>
          <p className="text-xs text-[#6D5E62] mt-1">
            Keep your digital gifts safe and access them anytime.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#D9CEBA] bg-white text-sm font-medium text-[#2C2325] hover:bg-[#FBF9F5] shadow-xs hover:border-[#5B1E2B]/30 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8DFD8]"></div>
          </div>
          <span className="relative px-3 bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8A797E]">
            or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#4D3F43] mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A797E] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-sm focus:outline-none focus:border-[#5B1E2B] focus:ring-1 focus:ring-[#5B1E2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4D3F43] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A797E] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-sm focus:outline-none focus:border-[#5B1E2B] focus:ring-1 focus:ring-[#5B1E2B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5B1E2B] text-white text-sm font-medium hover:bg-[#4A1521] shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#6D5E62]">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#5B1E2B] font-semibold underline underline-offset-2 hover:text-[#4A1521]"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#5B1E2B] font-semibold underline underline-offset-2 hover:text-[#4A1521]"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[#E8DFD8] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#8A797E] hover:text-[#2C2325] transition-colors"
          >
            Skip for now & continue creating as guest →
          </button>
        </div>
      </div>
    </div>
  );
};
