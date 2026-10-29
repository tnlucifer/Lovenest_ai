import React, { useState, useEffect } from 'react';
import { Gift } from '../../types/gift';
import { listUserGifts, deleteGift, createSampleGift, encodeGiftToUrlParam } from '../../lib/giftService';
import { auth } from '../../lib/firebase';
import { 
  Heart, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2, 
  QrCode, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Copy,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';

interface UserDashboardProps {
  onEditGift: (gift: Gift) => void;
  onViewGift: (gift: Gift) => void;
  onCreateNew: () => void;
  onOpenAuth: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onEditGift,
  onViewGift,
  onCreateNew,
  onOpenAuth,
}) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');
  const [shareModalGift, setShareModalGift] = useState<Gift | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const currentUser = auth.currentUser;

  const loadGifts = async () => {
    setLoading(true);
    try {
      const list = await listUserGifts(currentUser?.uid);
      setGifts(list);
    } catch (err) {
      console.warn("Could not load gifts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, [currentUser]);

  const handleDelete = async (giftId: string) => {
    if (confirm("Are you sure you want to delete this gift? This cannot be undone.")) {
      await deleteGift(giftId);
      setGifts(prev => prev.filter(g => g.id !== giftId));
    }
  };

  const handleOpenShare = (gift: Gift) => {
    setShareModalGift(gift);
    const url = `${window.location.origin}/gift/${gift.uniqueSlug || gift.id}`;
    setShareUrl(url);
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: '#5B1E2B', light: '#FFFFFF' }
    }).then(setQrDataUrl).catch(() => {});
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const filteredGifts = gifts.filter(g => {
    if (activeTab === 'published') return g.published;
    if (activeTab === 'drafts') return !g.published;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD8]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
              Creator Vault
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2325]">
              My Gifts & Keepsakes
            </h1>
            <p className="text-xs text-[#6D5E62] mt-1">
              {currentUser ? `Signed in as ${currentUser.email}` : 'Stored locally on your device.'}
              {!currentUser && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="ml-2 text-[#5B1E2B] underline font-medium hover:text-[#4A1521] cursor-pointer"
                >
                  Sign in to sync across devices →
                </button>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5B1E2B] text-white text-sm font-semibold shadow-md hover:bg-[#4A1521] transition-all cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Gift</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(['all', 'published', 'drafts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#5B1E2B] text-white shadow-xs'
                  : 'bg-white border border-[#E8DFD8] text-[#6D5E62] hover:bg-[#FAF5F0]'
              }`}
            >
              {tab === 'all' ? `All (${gifts.length})` : tab === 'published' ? `Published (${gifts.filter(g => g.published).length})` : `Drafts (${gifts.filter(g => !g.published).length})`}
            </button>
          ))}
        </div>

        {/* Gifts Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#5B1E2B] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#8F7D83]">Loading your memories...</p>
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-[#E8DFD8] p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#5B1E2B]/10 text-[#5B1E2B] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
              No gifts in this category yet.
            </h3>
            <p className="text-xs text-[#6D5E62] max-w-sm mx-auto leading-relaxed">
              Every beautiful story starts with a single memory. Create something unforgettable today.
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="px-6 py-3 rounded-2xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] shadow-md transition-all cursor-pointer"
            >
              + Create Your First Gift
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map(gift => (
              <div
                key={gift.id}
                className="bg-white rounded-3xl border border-[#E8DFD8] p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#5B1E2B] font-semibold">
                      {gift.occasion || 'Gift'}
                    </span>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                      gift.published 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {gift.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#2C2325] mb-1">
                    For {gift.recipientName || 'Someone Special'}
                  </h3>

                  <p className="text-xs text-[#6D5E62] italic mb-3">
                    From {gift.senderName || 'Me'} • {gift.relationship}
                  </p>

                  {gift.photos.length > 0 && (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3 bg-[#F5ECE1] border border-[#E8DFD8]">
                      <img
                        src={gift.photos[0].url}
                        alt="Gift preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] backdrop-blur-xs font-mono">
                        {gift.photos.length} {gift.photos.length === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE5D9] mb-4 text-xs text-[#4D3F43] line-clamp-3 font-serif">
                    "{gift.message || 'No letter written yet...'}"
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8F7D83] mb-4">
                    <span>📸 {gift.photos.length} Photos</span>
                    <span>•</span>
                    <span>📅 {gift.memories.length} Memories</span>
                    {gift.reactionsCount ? (
                      <>
                        <span>•</span>
                        <span className="text-[#5B1E2B] font-semibold">
                          ♥ {gift.reactionsCount} Loves
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2EDE6] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewGift(gift)}
                      className="p-2 rounded-xl text-[#5B1E2B] hover:bg-[#5B1E2B]/10 transition-colors"
                      title="View as recipient"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditGift(gift)}
                      className="p-2 rounded-xl text-[#6D5E62] hover:bg-[#FAF5F0] transition-colors"
                      title="Edit gift"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenShare(gift)}
                      className="p-2 rounded-xl text-[#6D5E62] hover:bg-[#FAF5F0] transition-colors"
                      title="Share & QR Code"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(gift.id)}
                    className="p-2 rounded-xl text-[#8F7D83] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete gift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Share & QR Code Modal */}
      {shareModalGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD8] shadow-2xl space-y-6 text-center text-[#2C2325]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold">
                Share Gift for {shareModalGift.recipientName}
              </h3>
              <button
                onClick={() => setShareModalGift(null)}
                className="text-[#8F7D83] hover:text-[#2C2325] text-sm"
              >
                ✕
              </button>
            </div>

            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-44 h-44 mx-auto rounded-2xl border border-[#E8DFD8] shadow-xs p-2"
              />
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#4D3F43] block text-left">
                Direct Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || `${window.location.origin}/gift/${shareModalGift.uniqueSlug || shareModalGift.id}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareUrl || `${window.location.origin}/gift/${shareModalGift.uniqueSlug || shareModalGift.id}`)}
                  className="px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] cursor-pointer"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const url = shareUrl || `${window.location.origin}/gift/${shareModalGift.uniqueSlug || shareModalGift.id}`;
                  const text = encodeURIComponent(`I made something special for you ❤️ Open this when you have a moment:\n\n${url}`);
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] cursor-pointer"
              >
                Share on WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  onViewGift(shareModalGift);
                  setShareModalGift(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#D9CEBA] text-xs font-semibold hover:bg-[#FAF7F2] cursor-pointer"
              >
                Open View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
