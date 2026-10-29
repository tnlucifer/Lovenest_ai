import React, { useState, useEffect } from 'react';
import { Gift, MemoryItem, PhotoItem, RelationshipType, OccasionType, ThemeType, OpenWhenItem, PlaceItem } from '../../types/gift';
import { THEMES } from '../../lib/themeStyles';
import { AUDIO_TRACKS, audioController } from '../../lib/audioService';
import { generateAiWritingAssistance, AiAssistAction } from '../../lib/aiWriting';
import { saveGift, saveLocalGift, generateGiftId, encodeGiftToUrlParam } from '../../lib/giftService';
import { auth } from '../../lib/firebase';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Eye, 
  Share2, 
  Check, 
  Plus, 
  Trash2, 
  Music, 
  Image as ImageIcon, 
  Lock, 
  Calendar, 
  MapPin, 
  HelpCircle,
  Copy,
  QrCode as QrIcon,
  Download,
  Smartphone,
  Wand2,
  Send,
  MessageCircle,
  Upload,
  Link as LinkIcon,
  Play,
  Pause,
  Youtube,
  FileAudio,
  Mail
} from 'lucide-react';
import { RecipientExperience } from '../recipient/RecipientExperience';
import { fileToOptimizedDataUrl, audioFileToDataUrl, validateImageFile } from '../../lib/imageUtils';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../../lib/youtubeUtils';

interface CreatorWizardProps {
  initialGift: Gift;
  onExit: () => void;
  onViewRecipient: (gift: Gift) => void;
  onOpenAuth: () => void;
}

export const CreatorWizard: React.FC<CreatorWizardProps> = ({
  initialGift,
  onExit,
  onViewRecipient,
  onOpenAuth,
}) => {
  const [gift, setGift] = useState<Gift>(initialGift);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState(
    `I made a special personalized card for you! ❤️ Open this private link to see it.`
  );
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Original Media Upload & YouTube states
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioPreviewPlaying, setAudioPreviewPlaying] = useState(false);
  const [ambientPreviewTrackId, setAmbientPreviewTrackId] = useState<string | null>(null);
  const [youtubeInputUrl, setYoutubeInputUrl] = useState(initialGift.youtubeUrl || '');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{ url: string; caption?: string } | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      audioController.stop();
    };
  }, []);

  const toggleAmbientPreview = (trackId: string) => {
    if (ambientPreviewTrackId === trackId) {
      audioController.stop();
      setAmbientPreviewTrackId(null);
    } else {
      audioController.play(trackId);
      setAmbientPreviewTrackId(trackId);
    }
  };

  const handlePasteClipboardYouTube = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        handleYouTubeLinkChange(text.trim());
      }
    } catch {
      // Clipboard read may require user focus or permissions
    }
  };

  // Auto-save on edits to local storage only (snappy, never burns cloud write quota!)
  useEffect(() => {
    saveLocalGift(gift);
  }, [gift]);

  // Clean, short, unguessable private link to recipient view
  const giftUrl = `${window.location.origin}/gift/${gift.id}`;

  // Generate crisp, fast-scanning QR code for the clean private gift link
  useEffect(() => {
    QRCode.toDataURL(giftUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#5B1E2B',
        light: '#FFFFFF'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(e => console.warn("QR code gen error", e));
  }, [giftUrl, gift.id]);

  // When reaching share step (Step 7), automatically ensure card is published and saved
  useEffect(() => {
    if (currentStep === 7) {
      const liveGift: Gift = { ...gift, published: true };
      setGift(liveGift);
      saveGift(liveGift).catch(err => console.warn("Auto-publish save:", err));
    }
  }, [currentStep]);

  const updateField = <K extends keyof Gift>(key: K, value: Gift[K]) => {
    setGift(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  // AI Writing Helper
  const handleAiAssist = async (action: AiAssistAction) => {
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const generated = await generateAiWritingAssistance(action, {
        recipientName: gift.recipientName,
        senderName: gift.senderName,
        relationship: gift.relationship,
        occasion: gift.occasion,
        currentText: gift.message,
        field: 'message',
      });
      setAiSuggestion(generated);
    } catch (err) {
      console.warn("AI generation failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      updateField('message', aiSuggestion);
      setAiSuggestion(null);
    }
  };

  // Memories helper
  const addMemory = () => {
    const newMem: MemoryItem = {
      id: 'mem-' + Date.now(),
      title: 'A Special Afternoon',
      description: 'Write about what made this moment unforgettable...',
      date: new Date().toISOString().split('T')[0],
      location: 'Our Favorite Spot',
      photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    };
    updateField('memories', [...gift.memories, newMem]);
  };

  const updateMemory = (id: string, field: keyof MemoryItem, val: string) => {
    const updated = gift.memories.map(m => m.id === id ? { ...m, [field]: val } : m);
    updateField('memories', updated);
  };

  const deleteMemory = (id: string) => {
    updateField('memories', gift.memories.filter(m => m.id !== id));
  };

  // Photos helper: Upload original photos from device (supports 3MB+ photos effortlessly)
  const handleMultiplePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhotos(true);
    setPhotoUploadError(null);
    try {
      const newItems: PhotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading & optimizing ${file.name} (${i + 1}/${files.length})...`);
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setPhotoUploadError(validation.error || `Could not accept "${file.name}".`);
          continue;
        }
        const dataUrl = await fileToOptimizedDataUrl(file);
        newItems.push({
          id: 'p-' + Date.now() + '-' + i,
          url: dataUrl,
          caption: ''
        });
      }
      if (newItems.length > 0) {
        updateField('photos', [...gift.photos, ...newItems]);
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.warn("Failed to upload photos", err);
      setPhotoUploadError("Failed to process one or more photos. Please try again.");
    } finally {
      setIsUploadingPhotos(false);
      setUploadProgressText('');
    }
  };

  const handleMemoryPhotoUpload = async (memId: string, file: File | null) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Please select an image file under 12MB');
      return;
    }
    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      updateMemory(memId, 'photoUrl', dataUrl);
    } catch (err) {
      console.warn("Failed to upload memory photo", err);
    }
  };

  const handleAudioUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploadingAudio(true);
    try {
      const { url, name } = await audioFileToDataUrl(file);
      setGift(prev => ({
        ...prev,
        audioTrackId: 'upload',
        uploadedAudioUrl: url,
        uploadedAudioName: name,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.warn("Failed to upload audio file", err);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleYouTubeLinkChange = (url: string) => {
    setYoutubeInputUrl(url);
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      setYoutubeError(null);
      setGift(prev => ({
        ...prev,
        audioTrackId: 'youtube',
        youtubeUrl: url,
        youtubeVideoId: videoId,
        updatedAt: new Date().toISOString()
      }));
    } else if (url.trim().length > 0) {
      setYoutubeError("Please enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)");
      setGift(prev => ({
        ...prev,
        youtubeUrl: url,
        updatedAt: new Date().toISOString()
      }));
    } else {
      setYoutubeError(null);
      setGift(prev => ({
        ...prev,
        youtubeUrl: '',
        youtubeVideoId: undefined,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const toggleAudioPreview = () => {
    if (!gift.uploadedAudioUrl) return;
    if (audioPreviewPlaying) {
      audioPreviewRef.current?.pause();
      setAudioPreviewPlaying(false);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(gift.uploadedAudioUrl);
        audioPreviewRef.current.onended = () => setAudioPreviewPlaying(false);
      }
      audioPreviewRef.current.play().then(() => setAudioPreviewPlaying(true)).catch(() => {});
    }
  };

  const addPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80'
    ];
    const randomUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    const newP: PhotoItem = {
      id: 'p-' + Date.now(),
      url: randomUrl,
      caption: 'A moment forever etched in my heart.'
    };
    updateField('photos', [...gift.photos, newP]);
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    updateField('photos', gift.photos.map(p => p.id === id ? { ...p, caption } : p));
  };

  const deletePhoto = (id: string) => {
    updateField('photos', gift.photos.filter(p => p.id !== id));
  };

  // Reasons helper
  const addReason = () => {
    updateField('reasons', [...gift.reasons, '']);
  };

  const updateReason = (index: number, val: string) => {
    const updated = [...gift.reasons];
    updated[index] = val;
    updateField('reasons', updated);
  };

  const deleteReason = (index: number) => {
    updateField('reasons', gift.reasons.filter((_, i) => i !== index));
  };

  // Open when helper
  const addOpenWhenNote = () => {
    const newNote: OpenWhenItem = {
      id: 'ow-' + Date.now(),
      title: 'Open when you need a smile',
      message: 'Remember how much you are cherished, no matter what happens.'
    };
    updateField('openWhenNotes', [...(gift.openWhenNotes || []), newNote]);
  };

  const updateOpenWhen = (id: string, field: 'title' | 'message', val: string) => {
    const current = gift.openWhenNotes || [];
    updateField('openWhenNotes', current.map(n => n.id === id ? { ...n, [field]: val } : n));
  };

  const deleteOpenWhen = (id: string) => {
    updateField('openWhenNotes', (gift.openWhenNotes || []).filter(n => n.id !== id));
  };

  // Publish Gift
  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const publishedGift: Gift = {
        ...gift,
        published: true,
      };
      await saveGift(publishedGift);
      setGift(publishedGift);
      setSaveSuccessMsg(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
      setTimeout(() => setSaveSuccessMsg(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };


  // Copy Link (ensures published: true and saved to Firestore)
  const handleCopyLink = async () => {
    setIsSaving(true);
    const publishedGift: Gift = { ...gift, published: true };
    setGift(publishedGift);
    try {
      await saveGift(publishedGift);
    } catch (err) {
      console.warn("Save on copy notice:", err);
    } finally {
      setIsSaving(false);
    }
    const pinText = gift.passwordProtected && gift.password ? ` (Passcode: ${gift.password})` : '';
    navigator.clipboard.writeText(giftUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // WhatsApp Share (ensures published: true and saved to Firestore)
  const handleWhatsAppShare = async () => {
    setIsSaving(true);
    const publishedGift: Gift = { ...gift, published: true };
    setGift(publishedGift);
    try {
      await saveGift(publishedGift);
    } catch (err) {
      console.warn("Save on whatsapp notice:", err);
    } finally {
      setIsSaving(false);
    }
    const pinNotice = gift.passwordProtected && gift.password ? `\n🔑 Secret Passcode to unlock: ${gift.password}` : '';
    const text = encodeURIComponent(`${whatsAppMsg}${pinNotice}\n\n${giftUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Web Share API (ensures published: true and saved to Firestore)
  const handleNativeShare = async () => {
    setIsSaving(true);
    const publishedGift: Gift = { ...gift, published: true };
    setGift(publishedGift);
    try {
      await saveGift(publishedGift);
    } catch (err) {
      console.warn("Save on share notice:", err);
    } finally {
      setIsSaving(false);
    }
    const pinNotice = gift.passwordProtected && gift.password ? ` (Passcode: ${gift.password})` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A special ${gift.occasion.toLowerCase()} card for ${gift.recipientName || 'you'}`,
          text: `${whatsAppMsg}${pinNotice}`,
          url: giftUrl,
        });
      } catch (e) {
        console.warn("Share cancelled or failed", e);
      }
    } else {
      handleCopyLink();
    }
  };

  const steps = [
    { num: 1, label: 'Person' },
    { num: 2, label: 'Story' },
    { num: 3, label: 'Memories' },
    { num: 4, label: 'Media & Extras' },
    { num: 5, label: 'Design' },
    { num: 6, label: 'Preview' },
    { num: 7, label: 'Share' },
  ];

  if (showFullPreview) {
    return (
      <RecipientExperience
        gift={gift}
        isPreview={true}
        onExitPreview={() => setShowFullPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2325] flex flex-col">
      {/* Creator Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8DFD8] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-[#6D5E62] hover:text-[#2C2325] hover:bg-[#F2ECE2] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#2C2325] leading-none">
              Creating Gift {gift.recipientName ? `for ${gift.recipientName}` : ''}
            </h2>
            <span className="text-[11px] text-[#8F7D83]">
              Auto-saved to your personal vault
            </span>
          </div>
        </div>

        {/* Step Progress indicators */}
        <div className="hidden lg:flex items-center gap-1">
          {steps.map(s => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentStep === s.num
                  ? 'bg-[#5B1E2B] text-white shadow-xs font-semibold'
                  : currentStep > s.num
                  ? 'bg-[#5B1E2B]/10 text-[#5B1E2B]'
                  : 'text-[#8F7D83] hover:bg-[#F2ECE2]'
              }`}
            >
              <span>0{s.num}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFullPreview(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs font-semibold hover:bg-[#FAF7F2] transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#5B1E2B]" />
            <span className="hidden sm:inline">Preview as Recipient</span>
          </button>

          {currentStep === 7 ? (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold shadow-md hover:bg-[#4A1521] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{gift.published ? 'Published ✓' : 'Publish Gift'}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => Math.min(7, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold shadow-md hover:bg-[#4A1521] transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Split Layout: Left Controls, Right Phone Mockup */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Step Forms */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DFD8] p-6 sm:p-8 shadow-xs space-y-8">
          
          {/* Step 1: Person */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 01
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Who is this special gift for?
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Tell us who you are creating this moment for, and how you want to sign it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                    Recipient Name (or nickname) *
                  </label>
                  <input
                    type="text"
                    value={gift.recipientName}
                    onChange={e => updateField('recipientName', e.target.value)}
                    placeholder="e.g. Ambika, Sweetheart, Mom"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                    Your Name (as they know you) *
                  </label>
                  <input
                    type="text"
                    value={gift.senderName}
                    onChange={e => updateField('senderName', e.target.value)}
                    placeholder="e.g. Shanmugam, Your Love"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                  Your Relationship
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Partner', 'Spouse', 'Best Friend', 'Parent', 'Sibling', 'Someone Special', 'Other'] as RelationshipType[]).map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => updateField('relationship', rel)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        gift.relationship === rel
                          ? 'bg-[#5B1E2B] text-white border-[#5B1E2B] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#4D3F43] border-[#E8DFD8] hover:bg-white'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                  What is the Occasion?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Birthday', 'Anniversary', "Valentine's Day", 'Friendship', 'Thank You', 'Graduation', 'Long Distance', 'Just Because', 'Custom'] as OccasionType[]).map(occ => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => updateField('occasion', occ)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        gift.occasion === occ
                          ? 'bg-[#5B1E2B] text-white border-[#5B1E2B] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#4D3F43] border-[#E8DFD8] hover:bg-white'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {gift.occasion === 'Custom' && (
                <div>
                  <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                    Custom Occasion Title
                  </label>
                  <input
                    type="text"
                    value={gift.customOccasion || ''}
                    onChange={e => updateField('customOccasion', e.target.value)}
                    placeholder="e.g. 1000 Days of Us"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Story & AI Assistant */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 02
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Write Your Letter & Story
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Take your time. This is worth getting right. Write what you wish you could say every day.
                </p>
              </div>

              {/* Main Letter Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#4D3F43]">
                    Your Personal Letter *
                  </label>
                  <span className="text-[11px] text-[#8F7D83]">
                    {gift.message.length} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={gift.message}
                  onChange={e => updateField('message', e.target.value)}
                  placeholder="Dear [Name], I wanted to make something that could hold all the quiet gratitude I feel for you..."
                  className="w-full p-4 rounded-2xl border border-[#D9CEBA] bg-[#FAF7F2] text-sm leading-relaxed focus:outline-none focus:border-[#5B1E2B] focus:bg-white font-serif"
                />
              </div>

              {/* AI Writing Assistant Toolbar */}
              <div className="p-4 rounded-2xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Writing Assistance (Optional)
                  </span>
                  <span className="text-[10px] text-[#8F7D83]">
                    Your original text is never overwritten automatically
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiAssist('help_write')}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-medium text-[#4D3F43] hover:border-[#5B1E2B] hover:text-[#5B1E2B] transition-all cursor-pointer"
                  >
                    ✨ Help me write this
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiAssist('more_emotional')}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-medium text-[#4D3F43] hover:border-[#5B1E2B] hover:text-[#5B1E2B] transition-all cursor-pointer"
                  >
                    💖 Make it more emotional
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiAssist('shorter')}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-medium text-[#4D3F43] hover:border-[#5B1E2B] hover:text-[#5B1E2B] transition-all cursor-pointer"
                  >
                    ✂️ Make it shorter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiAssist('poetic')}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-medium text-[#4D3F43] hover:border-[#5B1E2B] hover:text-[#5B1E2B] transition-all cursor-pointer"
                  >
                    📜 Make it poetic
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiAssist('funny')}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-medium text-[#4D3F43] hover:border-[#5B1E2B] hover:text-[#5B1E2B] transition-all cursor-pointer"
                  >
                    😄 Make it funny
                  </button>
                </div>

                {aiLoading && (
                  <p className="text-xs text-[#5B1E2B] italic animate-pulse">
                    Crafting heartfelt lines with Gemini...
                  </p>
                )}

                {/* AI Suggestion Box */}
                {aiSuggestion && (
                  <div className="p-4 rounded-xl bg-white border border-[#5B1E2B]/30 shadow-xs space-y-2 animate-fade-in">
                    <span className="text-[11px] font-semibold text-[#5B1E2B] uppercase tracking-wider block">
                      AI Suggested Draft
                    </span>
                    <p className="text-xs text-[#4D3F43] font-serif italic leading-relaxed whitespace-pre-line">
                      "{aiSuggestion}"
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={applyAiSuggestion}
                        className="px-3 py-1.5 rounded-lg bg-[#5B1E2B] text-white text-xs font-medium hover:bg-[#4A1521] cursor-pointer"
                      >
                        Use this draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSuggestion(null)}
                        className="px-3 py-1.5 rounded-lg border border-[#D9CEBA] text-xs font-medium text-[#6D5E62] hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reasons Why I Love / Appreciate You */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4D3F43]">
                    What do you love / appreciate about them?
                  </label>
                  <button
                    type="button"
                    onClick={addReason}
                    className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Reason
                  </button>
                </div>

                {gift.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-xs text-[#8F7D83] font-mono text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={reason}
                      onChange={e => updateReason(idx, e.target.value)}
                      placeholder="e.g. How your laugh instantly brightens my day..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                    />
                    {gift.reasons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteReason(idx)}
                        className="p-1.5 text-[#8F7D83] hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Story & Favorite Memory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                    How did you meet?
                  </label>
                  <textarea
                    rows={3}
                    value={gift.story}
                    onChange={e => updateField('story', e.target.value)}
                    placeholder="We met on a sunny Tuesday at..."
                    className="w-full p-3 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                    Your favorite memory together
                  </label>
                  <textarea
                    rows={3}
                    value={gift.favoriteMemory}
                    onChange={e => updateField('favoriteMemory', e.target.value)}
                    placeholder="Sitting on the pier watching the stars..."
                    className="w-full p-3 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4D3F43] mb-1.5">
                  Your dream for the future together
                </label>
                <input
                  type="text"
                  value={gift.futureDream}
                  onChange={e => updateField('futureDream', e.target.value)}
                  placeholder="e.g. A seaside cottage, endless morning coffees, and traveling to Italy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Memories Timeline */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                    Step 03
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                    Relationship Memories Timeline
                  </h3>
                  <p className="text-xs text-[#6D5E62] mt-1">
                    Add milestone dates and memories that tell the story of your bond.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addMemory}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-medium hover:bg-[#4A1521] shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Memory</span>
                </button>
              </div>

              {gift.memories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#D9CEBA] rounded-3xl p-8 space-y-3">
                  <p className="font-serif italic text-base text-[#6D5E62]">
                    "Every beautiful story starts with one memory."
                  </p>
                  <button
                    type="button"
                    onClick={addMemory}
                    className="px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold cursor-pointer"
                  >
                    + Add your first memory
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {gift.memories.map((mem, index) => (
                    <div
                      key={mem.id}
                      className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#5B1E2B] font-semibold">
                          Memory #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteMemory(mem.id)}
                          className="text-[#8F7D83] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-[#4D3F43] mb-1">
                            Memory Title
                          </label>
                          <input
                            type="text"
                            value={mem.title}
                            onChange={e => updateMemory(mem.id, 'title', e.target.value)}
                            placeholder="e.g. That Rainy Evening"
                            className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#4D3F43] mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={mem.date}
                            onChange={e => updateMemory(mem.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[#4D3F43] mb-1">
                            Location (City or Place)
                          </label>
                          <input
                            type="text"
                            value={mem.location}
                            onChange={e => updateMemory(mem.id, 'location', e.target.value)}
                            placeholder="e.g. Chennai, Paris, That Cafe"
                            className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#4D3F43] mb-1">
                            Memory Photo
                          </label>

                          {mem.photoUrl ? (
                            <div className="relative rounded-2xl overflow-hidden border border-[#D9CEBA] bg-black/5 shadow-xs">
                              <img
                                src={mem.photoUrl}
                                alt="Memory preview"
                                className="w-full h-44 object-cover"
                              />
                              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-xl">
                                <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#2C2325] text-[10px] font-semibold cursor-pointer shadow-xs hover:bg-[#FAF7F2]">
                                  <Upload className="w-3 h-3 text-[#5B1E2B]" />
                                  <span>Change</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleMemoryPhotoUpload(mem.id, e.target.files?.[0] || null)}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => updateMemory(mem.id, 'photoUrl', '')}
                                  className="p-1 rounded-lg bg-white/20 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#D9CEBA] hover:border-[#5B1E2B] bg-white cursor-pointer transition-colors text-center">
                                <Upload className="w-4 h-4 text-[#5B1E2B]" />
                                <span className="text-xs font-semibold text-[#2C2325]">Upload Photo from Device</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleMemoryPhotoUpload(mem.id, e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>
                              <input
                                type="text"
                                value={mem.photoUrl}
                                onChange={e => updateMemory(mem.id, 'photoUrl', e.target.value)}
                                placeholder="Or paste an image URL..."
                                className="w-full px-3 py-1.5 rounded-xl border border-[#D9CEBA] bg-white text-[11px] focus:outline-none focus:border-[#5B1E2B]"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#4D3F43] mb-1">
                          The Story of That Day
                        </label>
                        <textarea
                          rows={2}
                          value={mem.description}
                          onChange={e => updateMemory(mem.id, 'description', e.target.value)}
                          placeholder="That was the first time I realized how special you were..."
                          className="w-full p-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Media, Music & Interactive Surprises */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 04
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Photos, Music & Surprises
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Enrich the experience with ambient melodies, photo snapshots, and scratch reveals.
                </p>
              </div>

              {/* Special Date Counter setup */}
              <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-3">
                <span className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Special Milestone Date ("Together for...")
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#4D3F43] mb-1">Date</label>
                    <input
                      type="date"
                      value={gift.specialDate || ''}
                      onChange={e => updateField('specialDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#4D3F43] mb-1">Title</label>
                    <input
                      type="text"
                      value={gift.specialDateTitle || 'The Day We Met'}
                      onChange={e => updateField('specialDateTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Gallery Manager with Original Upload */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-serif font-bold text-[#2C2325] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#5B1E2B]" />
                      Original Photos ({gift.photos.length})
                    </label>
                    <span className="text-xs text-[#8F7D83]">
                      Upload original photos (supports 3MB+ each) • Visible to you and your recipient
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] shadow-md cursor-pointer transition-transform hover:scale-102">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhotos ? 'Optimizing...' : '+ Upload Photos (Up to 3MB+)'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingPhotos}
                        onChange={e => handleMultiplePhotoUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={addPhoto}
                      className="px-3 py-2 rounded-xl border border-[#D9CEBA] bg-white text-xs font-medium text-[#6D5E62] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      + Sample Photo
                    </button>
                  </div>
                </div>

                {/* Upload Drag & Drop Area */}
                <label className="border-2 border-dashed border-[#5B1E2B]/40 hover:border-[#5B1E2B] bg-[#FFFBF7] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group hover:bg-[#FFF5ED] shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#5B1E2B]/10 text-[#5B1E2B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-serif font-semibold text-[#2C2325]">
                    Tap or Click to Choose Photos (Up to 3MB+ each)
                  </span>
                  <span className="text-xs text-[#8F7D83] mt-1 max-w-sm">
                    Select JPG, PNG, WEBP, or phone photos • High-res images up to 3MB+ are compressed automatically so the recipient sees them instantly
                  </span>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full bg-[#5B1E2B]/10 text-[#5B1E2B] text-[11px] font-semibold">
                      Browse Device Photos
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200">
                      ✓ Up to 3MB+ Accepted
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploadingPhotos}
                    onChange={e => handleMultiplePhotoUpload(e.target.files)}
                    className="hidden"
                  />
                </label>

                {/* Uploading progress notification */}
                {isUploadingPhotos && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2.5 animate-pulse">
                    <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <span>{uploadProgressText || 'Compressing and loading original photos (up to 3MB+)...'}</span>
                  </div>
                )}

                {/* Upload Error Alert */}
                {photoUploadError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 font-bold">⚠️</span>
                      <span>{photoUploadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoUploadError(null)}
                      className="text-xs text-rose-700 hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Visual Photos Grid with Real Visible Images */}
                {gift.photos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#5B1E2B] font-semibold">
                      <span>✓ {gift.photos.length} {gift.photos.length === 1 ? 'Photo' : 'Photos'} Ready</span>
                      <span className="text-[#8F7D83] font-normal">Click any photo to enlarge</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gift.photos.map((photo, idx) => (
                        <div key={photo.id || idx} className="p-3 rounded-2xl bg-white border border-[#E8DFD8] space-y-2.5 group shadow-xs hover:shadow-md transition-shadow">
                          {/* Image container */}
                          <div 
                            onClick={() => setPreviewPhotoModal(photo)}
                            className="relative w-full h-56 rounded-xl overflow-hidden bg-[#F5ECE1] border border-[#E8DFD8] cursor-pointer"
                          >
                            <img
                              src={photo.url}
                              alt={`Memory ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
                              Photo #{idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePhoto(photo.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white shadow-md transition-colors cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[9px] backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view large 🔍
                            </div>
                          </div>

                          {/* Caption Input */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-[#8F7D83]">
                              Photo Caption / Note
                            </label>
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={e => updatePhotoCaption(photo.id, e.target.value)}
                              placeholder="Write a sweet memory or caption..."
                              className="w-full px-3 py-1.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs focus:outline-none focus:border-[#5B1E2B] focus:bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] text-center text-xs text-[#8F7D83]">
                    No photos added yet. Upload from your device above to give your recipient a heartwarming visual surprise!
                  </div>
                )}
              </div>

              {/* Music & Special Song Selection */}
              <div className="space-y-5 pt-4 border-t border-[#E8DFD8]">
                <div>
                  <label className="text-sm font-serif font-bold text-[#2C2325] flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#5B1E2B]" />
                    Special Song & Soundtrack
                  </label>
                  <p className="text-xs text-[#8F7D83] mt-0.5">
                    Paste any YouTube song link, pick a romantic ambient melody, or upload your own audio.
                  </p>
                </div>

                {/* Prominent YouTube Link Card */}
                <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 ${
                  gift.audioTrackId === 'youtube'
                    ? 'border-red-400 bg-gradient-to-br from-[#FFF8F8] to-[#FFF1F1] shadow-md'
                    : 'border-[#E8DFD8] bg-white hover:border-red-300'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <Youtube className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2C2325] flex items-center gap-1.5">
                          <span>Special Song from YouTube</span>
                          {gift.audioTrackId === 'youtube' && gift.youtubeVideoId && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Active</span>
                          )}
                        </h4>
                        <span className="text-[11px] text-[#8F7D83]">
                          Copy link from YouTube and paste it here
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePasteClipboardYouTube}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Paste from Clipboard</span>
                    </button>
                  </div>

                  {/* Input with Link Icon */}
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-[#8F7D83] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={youtubeInputUrl}
                        onChange={e => handleYouTubeLinkChange(e.target.value)}
                        placeholder="Paste YouTube link here: https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-red-200 bg-white text-xs font-mono focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      />
                    </div>

                    {/* Quick Sample Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="text-[#8F7D83]">Quick samples:</span>
                      <button
                        type="button"
                        onClick={() => handleYouTubeLinkChange('https://www.youtube.com/watch?v=2Vv-BfVoq4g')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-50 cursor-pointer font-medium"
                      >
                        Ed Sheeran - Perfect
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYouTubeLinkChange('https://www.youtube.com/watch?v=vGJTaP6anOU')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-50 cursor-pointer font-medium"
                      >
                        Elvis - Can't Help Falling in Love
                      </button>
                      <button
                        type="button"
                        onClick={() => handleYouTubeLinkChange('https://www.youtube.com/watch?v=7maJOI3QMu0')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-50 cursor-pointer font-medium"
                      >
                        Yiruma - River Flows in You
                      </button>
                    </div>

                    {youtubeError && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        {youtubeError}
                      </p>
                    )}

                    {/* Live Embedded YouTube Player */}
                    {gift.youtubeVideoId && (
                      <div className="space-y-2 pt-2 border-t border-red-100 animate-fade-in">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                            YouTube Song Connected!
                          </span>
                          <span className="font-mono text-[10px] text-[#8F7D83]">
                            ID: {gift.youtubeVideoId}
                          </span>
                        </div>

                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-black/10 bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${gift.youtubeVideoId}?enablejsapi=1&rel=0`}
                            title="YouTube Preview"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <p className="text-[11px] text-[#544146] italic text-center">
                          The recipient can play and listen to this special song inside their gift!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option 2: Upload Original Audio File from Device */}
                <div className={`p-5 rounded-3xl border-2 transition-all space-y-4 ${
                  gift.audioTrackId === 'upload' && gift.uploadedAudioUrl
                    ? 'border-[#5B1E2B] bg-[#FFFBF8] shadow-md'
                    : 'border-[#E8DFD8] bg-white hover:border-[#5B1E2B]/40'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-[#5B1E2B] text-white flex items-center justify-center shadow-xs">
                        <FileAudio className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2C2325] flex items-center gap-1.5">
                          <span>Upload Your Audio File (MP3, WAV, Phone Recording)</span>
                          {gift.audioTrackId === 'upload' && gift.uploadedAudioUrl && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Active & Playing</span>
                          )}
                        </h4>
                        <span className="text-[11px] text-[#8F7D83]">
                          The receiver will hear ONLY your uploaded song (no sample music)
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] shadow-xs cursor-pointer transition-transform hover:scale-102">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingAudio ? 'Processing Audio...' : '+ Choose Audio File'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        disabled={isUploadingAudio}
                        onChange={e => handleAudioUpload(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Active Uploaded Audio Card */}
                  {gift.uploadedAudioUrl ? (
                    <div className="p-4 rounded-2xl bg-[#5B1E2B]/5 border border-[#5B1E2B]/20 flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={toggleAudioPreview}
                          className="w-10 h-10 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer hover:bg-[#7E293B] transition-colors"
                          title="Preview your uploaded song"
                        >
                          {audioPreviewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#2C2325] truncate block">
                            {gift.uploadedAudioName || 'Uploaded Audio File'}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Ready! The receiver will hear this exact song.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={toggleAudioPreview}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#D9CEBA] text-xs font-semibold text-[#5B1E2B] hover:bg-[#FAF7F2] cursor-pointer"
                        >
                          {audioPreviewPlaying ? 'Pause' : 'Listen Preview'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (audioPreviewPlaying) {
                              audioPreviewRef.current?.pause();
                              setAudioPreviewPlaying(false);
                            }
                            setGift(prev => ({ ...prev, audioTrackId: 'none', uploadedAudioUrl: undefined, uploadedAudioName: undefined }));
                          }}
                          className="text-xs text-rose-600 hover:underline cursor-pointer px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#D9CEBA] hover:border-[#5B1E2B] bg-[#FFFBF7] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                      <Upload className="w-7 h-7 text-[#5B1E2B] mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-[#2C2325]">
                        Click or tap to upload MP3 / WAV from your device
                      </span>
                      <span className="text-[10px] text-[#8F7D83] mt-0.5">
                        Supports your favorite song, voice note, or recording
                      </span>
                      <input
                        type="file"
                        accept="audio/*"
                        disabled={isUploadingAudio}
                        onChange={e => handleAudioUpload(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Option 3: Silent (No Music) */}
                <div className="flex items-center justify-between pt-1 px-1">
                  <span className="text-xs text-[#8F7D83]">
                    Prefer a silent card with no music?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (audioPreviewPlaying) {
                        audioPreviewRef.current?.pause();
                        setAudioPreviewPlaying(false);
                      }
                      setGift(prev => ({
                        ...prev,
                        audioTrackId: 'none',
                        uploadedAudioUrl: undefined,
                        uploadedAudioName: undefined,
                        youtubeUrl: '',
                        youtubeVideoId: undefined
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      gift.audioTrackId === 'none' && !gift.uploadedAudioUrl && !gift.youtubeVideoId
                        ? 'bg-[#5B1E2B] text-white font-semibold'
                        : 'bg-white border border-[#E8DFD8] text-[#6D5E62] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {gift.audioTrackId === 'none' && !gift.uploadedAudioUrl && !gift.youtubeVideoId
                      ? '✓ Silent (No Music) Selected'
                      : 'Set to Silent (No Music)'}
                  </button>
                </div>
              </div>

              {/* Scratch-to-reveal message */}
              <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-2">
                <span className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Scratch-to-Reveal Secret Message
                </span>
                <p className="text-[11px] text-[#6D5E62]">
                  This message is covered by a virtual scratch-off metallic coating that the recipient rubs with their finger!
                </p>
                <input
                  type="text"
                  value={gift.scratchMessage || ''}
                  onChange={e => updateField('scratchMessage', e.target.value)}
                  placeholder="e.g. P.S. Pack your bags for Paris next month!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                />
              </div>

              {/* Secret Note for Their Eyes Only */}
              <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-2">
                <span className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  A Secret Note For Their Eyes Only
                </span>
                <p className="text-[11px] text-[#6D5E62]">
                  An intimate, private message sealed within the card that only your recipient can read.
                </p>
                <textarea
                  rows={2}
                  value={gift.secretNote || ''}
                  onChange={e => updateField('secretNote', e.target.value)}
                  placeholder="e.g. In case nobody told you today: you are the most incredible person in my world..."
                  className="w-full p-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs focus:outline-none focus:border-[#5B1E2B]"
                />
              </div>

              {/* Secret Passcode Protection in Step 4 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#5B1E2B]" />
                    <div>
                      <span className="text-xs font-semibold text-[#4D3F43] block">
                        Protect Gift With Secret Passcode (PIN)
                      </span>
                      <span className="text-[10px] text-[#8F7D83]">
                        Recipient must enter this 4-digit PIN before the card opens
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gift.passwordProtected}
                    onChange={e => updateField('passwordProtected', e.target.checked)}
                    className="w-4 h-4 accent-[#5B1E2B] cursor-pointer"
                  />
                </div>

                {gift.passwordProtected && (
                  <div className="pt-2 animate-fade-in space-y-1">
                    <label className="block text-[11px] font-medium text-[#4D3F43]">
                      Set Secret Passcode / PIN
                    </label>
                    <input
                      type="text"
                      value={gift.password || ''}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="e.g. 1928, 2024, or our date"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-mono font-bold tracking-widest text-[#5B1E2B] focus:outline-none focus:border-[#5B1E2B]"
                    />
                  </div>
                )}
              </div>

              {/* Open When Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4D3F43]">
                    "Open When..." Envelopes
                  </label>
                  <button
                    type="button"
                    onClick={addOpenWhenNote}
                    className="text-xs font-semibold text-[#5B1E2B] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Envelope
                  </button>
                </div>

                {(gift.openWhenNotes || []).map(note => (
                  <div key={note.id} className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD8] space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={note.title}
                        onChange={e => updateOpenWhen(note.id, 'title', e.target.value)}
                        placeholder="e.g. Open when you miss me"
                        className="px-2 py-1 rounded-lg border border-[#D9CEBA] bg-white text-xs font-medium w-3/4"
                      />
                      <button
                        type="button"
                        onClick={() => deleteOpenWhen(note.id)}
                        className="text-[#8F7D83] hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={note.message}
                      onChange={e => updateOpenWhen(note.id, 'message', e.target.value)}
                      placeholder="The private words inside this envelope..."
                      className="w-full p-2 rounded-lg border border-[#D9CEBA] bg-white text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Design Themes */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 05
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Select Visual Aesthetic
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Choose a signature color palette, typography style, and particle motifs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(Object.keys(THEMES) as ThemeType[]).map(themeKey => {
                  const t = THEMES[themeKey];
                  const isSelected = gift.theme === themeKey;
                  return (
                    <div
                      key={t.id}
                      onClick={() => updateField('theme', t.id)}
                      className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#5B1E2B] bg-[#5B1E2B]/5 shadow-md scale-102' 
                          : 'border-[#E8DFD8] bg-white hover:border-[#5B1E2B]/30'
                      }`}
                    >
                      <div className={`h-16 w-full rounded-xl bg-gradient-to-r ${t.previewGradient} mb-3 flex items-center justify-center text-white/90 text-sm font-serif font-bold shadow-xs`}>
                        {t.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-base font-semibold text-[#2C2325]">
                          {t.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#5B1E2B] text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6D5E62] mt-1 leading-relaxed">
                        {t.tagline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Live Preview Details */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 06
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Live Recipient Preview
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Check your gift before sharing. The phone frame on the right displays the exact recipient view.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#5B1E2B]/10 text-[#5B1E2B] flex items-center justify-center">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#2C2325]">
                        Ready for {gift.recipientName || 'Your Person'}!
                      </h4>
                      <span className="text-xs text-[#8F7D83]">
                        {gift.occasion} • {gift.photos.length} photos • {gift.memories.length} memories
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="px-4 py-2 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Full Screen View</span>
                  </button>
                </div>

                {/* Letter Message Preview */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] space-y-2 text-left shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B1E2B] font-semibold">
                    Letter Preview
                  </span>
                  <p className="font-serif italic text-xs leading-relaxed text-[#38262B] line-clamp-4 whitespace-pre-line">
                    "{gift.message || 'No letter written yet...'}"
                  </p>
                  <span className="text-[11px] font-serif font-semibold text-[#63323E] block pt-1">
                    — {gift.senderName || 'Your Name'}
                  </span>
                </div>

                {/* Visual Photos Preview in Step 6 */}
                {gift.photos.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-xs font-serif font-bold text-[#2C2325] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#5B1E2B]" />
                      Uploaded Photos Preview ({gift.photos.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {gift.photos.map((p, pIdx) => (
                        <div 
                          key={p.id || pIdx} 
                          onClick={() => setPreviewPhotoModal(p)}
                          className="relative h-28 rounded-xl overflow-hidden bg-black/5 border border-[#E8DFD8] cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={p.url}
                            alt="Photo preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                            #{pIdx + 1}
                          </div>
                          {p.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-1 truncate">
                              {p.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soundtrack Preview Card in Step 6 */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] text-left space-y-2 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B1E2B] font-semibold flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    Soundtrack Configured
                  </span>
                  {gift.audioTrackId === 'youtube' && gift.youtubeVideoId ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        YouTube Song: Active & Embedded
                      </p>
                      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xs border border-black/10">
                        <iframe
                          src={`https://www.youtube.com/embed/${gift.youtubeVideoId}?enablejsapi=1&rel=0`}
                          title="YouTube Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#544146] font-medium">
                      Melody: {gift.audioTrackId === 'upload' ? (gift.uploadedAudioName || 'Uploaded MP3') : gift.audioTrackId} (plays continuously in background)
                    </p>
                  )}
                </div>
              </div>

              {/* Password Protection Toggle */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8DFD8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#5B1E2B]" />
                    <span className="text-xs font-semibold text-[#4D3F43]">
                      Protect With Secret Passcode (PIN)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={gift.passwordProtected}
                    onChange={e => updateField('passwordProtected', e.target.checked)}
                    className="w-4 h-4 accent-[#5B1E2B] cursor-pointer"
                  />
                </div>

                {gift.passwordProtected && (
                  <div className="pt-2 animate-fade-in">
                    <label className="block text-[11px] text-[#4D3F43] mb-1">
                      Set 4-Digit Passcode
                    </label>
                    <input
                      type="text"
                      value={gift.password || ''}
                      onChange={e => updateField('password', e.target.value)}
                      placeholder="e.g. 1928 or our date"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Share & Publish */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#5B1E2B]">
                  Step 07
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2C2325]">
                  Publish & Share Your Surprise
                </h3>
                <p className="text-xs text-[#6D5E62] mt-1">
                  Send via WhatsApp, copy your private URL, or print an elegant QR code!
                </p>
              </div>

              {/* Publish / Live Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Your custom {gift.occasion} card for {gift.recipientName || 'your recipient'} is live!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-100/80 px-2 py-0.5 rounded text-emerald-800">
                    Direct Link: {gift.id}
                  </span>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="text-[11px] font-semibold text-[#5B1E2B] hover:underline cursor-pointer"
                  >
                    {isSaving ? 'Syncing...' : 'Sync Updates ↻'}
                  </button>
                </div>
              </div>

              {/* Private Link Copy Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4D3F43]">
                    Your Private {gift.occasion} Card Link
                  </label>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    ✓ Opens your personalized card directly
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={giftUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-[#FAF7F2] text-xs font-mono select-all font-semibold text-[#5B1E2B]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold hover:bg-[#4A1521] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => window.open(giftUrl, '_blank')}
                    className="px-4 py-2 rounded-xl border border-[#5B1E2B] text-[#5B1E2B] hover:bg-[#5B1E2B] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Test Open Live Card (New Tab)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewRecipient(gift)}
                    className="px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-[#4D3F43] transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View As Recipient In-App</span>
                  </button>
                </div>
              </div>

              {/* Passcode Protection Reminder if set */}
              {gift.passwordProtected && gift.password && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span>Card Protected by Passcode!</span>
                      <span className="block text-[11px] font-normal text-amber-800">
                        Unlock PIN: <strong className="font-mono font-bold text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded text-xs tracking-wider">{gift.password}</strong> (recipient needs this PIN before unboxing the envelope).
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(gift.password || '');
                      alert(`Passcode "${gift.password}" copied!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Copy PIN
                  </button>
                </div>
              )}

              {/* WhatsApp Share Box */}
              <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E8DFD8] space-y-3">
                <span className="text-xs font-semibold text-[#25D366] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  Custom WhatsApp Share Message
                </span>
                <textarea
                  rows={2}
                  value={whatsAppMsg}
                  onChange={e => setWhatsAppMsg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="px-4 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs font-semibold hover:bg-[#FAF7F2] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>More</span>
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {qrDataUrl && (
                <div className="p-6 rounded-2xl bg-white border border-[#E8DFD8] flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={qrDataUrl}
                    alt="Gift QR Code"
                    className="w-36 h-36 rounded-xl border border-[#E8DFD8] shadow-xs p-1"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <h4 className="font-serif text-base font-semibold text-[#2C2325]">
                      Printable Keepsake QR Code
                    </h4>
                    <p className="text-xs text-[#6D5E62] max-w-xs">
                      Download this QR code and print it inside a physical card or letter.
                    </p>
                    <a
                      href={qrDataUrl}
                      download={`LoveNest-${gift.recipientName || 'Gift'}-QR.png`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#5B1E2B] text-[#5B1E2B] text-xs font-semibold hover:bg-[#5B1E2B] hover:text-white transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR Code</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Step Navigation Bar */}
          <div className="pt-6 border-t border-[#E8DFD8] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#6D5E62] hover:bg-[#FAF7F2] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold shadow-md hover:bg-[#4A1521] transition-all cursor-pointer"
              >
                <span>Continue to {steps[currentStep].label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFullPreview(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#5B1E2B] text-white text-xs font-semibold shadow-md hover:bg-[#4A1521] transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Final Experience</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-5 sticky top-24 hidden lg:flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8F7D83]">
              Live Recipient Preview
            </span>
            <p className="text-xs text-[#6D5E62]">
              Updates in real-time as you type
            </p>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[300px] h-[580px] bg-[#1E1B1D] rounded-[44px] p-3 shadow-2xl border-4 border-[#3D353A] relative overflow-hidden">
            {/* Notch */}
            <div className="w-28 h-4 bg-[#3D353A] rounded-full mx-auto mb-2 relative z-20"></div>

            {/* Embedded Mini Live Experience */}
            <div className="w-full h-[525px] rounded-[32px] overflow-y-auto overflow-x-hidden bg-[#FAF7F2] text-[#2C2325] text-xs relative select-none">
              <div className="p-4 space-y-6 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B1E2B]">
                  {gift.occasion || 'Special Day'}
                </span>

                <h4 className="font-serif text-xl font-bold">
                  For {gift.recipientName || 'My Love'}
                </h4>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] text-left space-y-2 shadow-xs">
                  <span className="text-[10px] uppercase font-mono text-[#8F7D83]">Letter</span>
                  <p className="font-serif italic text-xs leading-relaxed line-clamp-4">
                    {gift.message || "Your personal words will appear here..."}
                  </p>
                  <span className="text-[10px] text-[#5B1E2B] font-semibold block pt-1">
                    — {gift.senderName || 'Sender'}
                  </span>
                </div>

                {gift.photos.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B1E2B] font-semibold block">
                      Photos ({gift.photos.length})
                    </span>
                    <div className="space-y-2">
                      {gift.photos.map((p, pIdx) => (
                        <div key={p.id || pIdx} className="rounded-xl overflow-hidden border border-[#E8DFD8] bg-white shadow-xs">
                          <img
                            src={p.url}
                            alt="Preview"
                            className="w-full h-36 object-cover"
                          />
                          {p.caption && (
                            <p className="p-2 text-[10px] italic text-[#6D5E62]">
                              "{p.caption}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gift.memories.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/5 text-left text-[11px] space-y-1">
                    <span className="font-mono text-[9px] text-[#5B1E2B] font-bold">
                      {gift.memories[0].date}
                    </span>
                    <p className="font-serif font-semibold">{gift.memories[0].title}</p>
                    <p className="text-[10px] text-[#6D5E62] line-clamp-2">
                      {gift.memories[0].description}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFullPreview(true)}
                    className="w-full py-2 rounded-xl bg-[#5B1E2B] text-white text-[11px] font-semibold shadow-xs hover:bg-[#4A1521] cursor-pointer"
                  >
                    Tap to open full preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Photo Enlargement Lightbox Modal */}
      {previewPhotoModal && (
        <div
          onClick={() => setPreviewPhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#1C1618] border border-white/20 rounded-3xl overflow-hidden shadow-2xl space-y-3 p-4 text-center text-white"
          >
            <button
              onClick={() => setPreviewPhotoModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl flex items-center justify-center bg-black">
              <img
                src={previewPhotoModal.url}
                alt="Enlarged photo"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>
            {previewPhotoModal.caption && (
              <p className="p-2 text-sm font-serif italic text-white/90">
                "{previewPhotoModal.caption}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
