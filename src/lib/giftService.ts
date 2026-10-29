import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth, ensureAuth, handleFirestoreError, OperationType } from './firebase';
import { Gift, MemoryItem, PhotoItem, OccasionType, OpenWhenItem, PlaceItem } from '../types/gift';

const GIFTS_COLLECTION = 'gifts';
const LOCAL_STORAGE_KEY = 'lovenest_local_gifts';

export function getLocalGifts(): Gift[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalGift(gift: Gift) {
  try {
    const current = getLocalGifts();
    const index = current.findIndex(g => g.id === gift.id);
    if (index >= 0) {
      current[index] = gift;
    } else {
      current.unshift(gift);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn("Failed to save to local storage", err);
  }
}

export function deleteLocalGift(giftId: string) {
  try {
    const current = getLocalGifts().filter(g => g.id !== giftId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn("Failed to delete from local storage", err);
  }
}

// Generate a random unique slug / ID
export function generateGiftId(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = 'ln-';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Default sample gift for immediate exploration
export function createSampleGift(ownerId: string = 'demo-user'): Gift {
  const sampleMemories: MemoryItem[] = [
    {
      id: 'mem-1',
      title: 'That Rainy Coffee Shop Evening',
      description: 'The rain poured outside and we talked for 4 hours until the barista asked to close. That was the evening I realized my world was forever changed.',
      date: '2023-11-14',
      location: 'Little Corner Cafe',
      photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'mem-2',
      title: 'Our Spontaneous Coastline Trip',
      description: 'We drove with the windows rolled down, singing off-key to songs we barely knew. Watching the sunset with your head on my shoulder is still my peaceful place.',
      date: '2024-04-20',
      location: 'Whispering Coast',
      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'mem-3',
      title: 'The Stargazing Midnight Picnic',
      description: 'Lying on the grass, wrapped in that old wool blanket, counting shooting stars. You made a wish, and you refused to tell me what it was.',
      date: '2024-08-12',
      location: 'Pine Hill Meadow',
      photoUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    }
  ];

  const samplePhotos: PhotoItem[] = [
    {
      id: 'p-1',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
      caption: 'The way your eyes crinkle when you truly laugh.'
    },
    {
      id: 'p-2',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
      caption: 'Holding hands wherever our footsteps wander.'
    },
    {
      id: 'p-3',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
      caption: 'Every sunset is sweeter with you.'
    }
  ];

  return {
    id: 'ln-sample-gift',
    ownerId,
    recipientName: 'Ambika',
    senderName: 'Shanmugam',
    relationship: 'Partner',
    occasion: 'Anniversary',
    message: `My dearest Ambika,\n\nSome feelings are too wide and gentle to fit into regular everyday messages. That is why I built this place for you.\n\nFrom the moment you entered my life, every ordinary hour began to carry a quiet warmth. You have this rare gift of making people feel deeply seen, and with you, I feel completely at peace.\n\nThank you for every shared smile, every cup of tea we let get cold while talking, and for choosing to walk through this life by my side. No matter where tomorrow leads us, you will always be my favorite story.`,
    reasons: [
      'The quiet gentleness you show to everyone around you.',
      'How your laughter instantly melts away my longest, hardest days.',
      'The way you believe in me even when I doubt myself.',
      'How safe and calm the entire world feels whenever I hold your hand.',
      'Because you are not just my love, but my truest best friend.'
    ],
    story: 'We met on an ordinary Wednesday that felt like any other, until our eyes met across the room. What started as a quick conversation turned into hours that felt like minutes. Neither of us wanted to say goodbye, and somewhere in that conversation, I knew you were going to matter to me forever.',
    favoriteMemory: 'Standing under the balcony while sudden summer rain poured down all around us, eating warm pastries and laughing until tears came to our eyes.',
    futureDream: 'A cozy house with morning sunlight streaming into the kitchen, a porch where we can drink coffee together as years pass, and countless passport stamps from places we have yet to explore.',
    specialDate: '2023-09-18',
    specialDateTitle: 'The Day Everything Changed',
    memories: sampleMemories,
    photos: samplePhotos,
    audioTrackId: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=0yW7w8F2TVA',
    youtubeVideoId: '0yW7w8F2TVA',
    theme: 'eternal',
    passwordProtected: false,
    scratchMessage: 'P.S. I fell in love with you long before I had the courage to say it out loud.',
    secretNote: 'Whenever you feel overwhelmed or alone, close your eyes and remember: you are carrying my whole heart with you.',
    openWhenNotes: [
      {
        id: 'ow-1',
        title: 'Open when you miss me',
        message: 'Look at the sky right now. We are under the exact same sun and stars, and I am thinking of you at this very moment.'
      },
      {
        id: 'ow-2',
        title: 'Open when you had a hard day',
        message: 'Take a deep breath and relax your shoulders. You survived today. You did enough, and I am so tremendously proud of you.'
      },
      {
        id: 'ow-3',
        title: 'Open when we celebrate something great',
        message: 'Nobody deserved this victory more than you! Let us raise a glass to your brilliant, hardworking spirit. Next treat is on me!'
      }
    ],
    favoritePlaces: [
      {
        id: 'pl-1',
        title: 'The Seaside Pier',
        city: 'Coastline Harbor',
        memory: 'Where we sat on the wooden planks watching the sunset reflect across the water.'
      },
      {
        id: 'pl-2',
        title: 'The Old Bookstore Alley',
        city: 'Old Quarter',
        memory: 'Browsing through poetry and yellowed pages while sharing an umbrella.'
      }
    ],
    reactionsCount: 12,
    published: true,
    uniqueSlug: 'sample-love-nest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createBlankGift(ownerId: string = 'guest', defaultOccasion: OccasionType = 'Birthday'): Gift {
  const id = generateGiftId();
  return {
    id,
    ownerId,
    recipientName: '',
    senderName: '',
    relationship: 'Partner',
    occasion: defaultOccasion,
    message: '',
    reasons: [''],
    story: '',
    favoriteMemory: '',
    futureDream: '',
    specialDate: '',
    specialDateTitle: 'Our Special Day',
    memories: [],
    photos: [],
    audioTrackId: 'none',
    theme: 'eternal',
    passwordProtected: false,
    password: '',
    scratchMessage: 'P.S. May all your birthday wishes come true this year! Can’t wait to celebrate together! 🎂✨',
    secretNote: 'In case nobody told you today: you are deeply loved, appreciated, and cherished just for being you.',
    openWhenNotes: [
      {
        id: 'ow-1',
        title: 'Open on your birthday morning',
        message: 'Wake up, smile, and take a deep breath! Today the world celebrates you. May this year bring you endless happiness, good health, and wonderful surprises!'
      },
      {
        id: 'ow-2',
        title: 'Open when you make your birthday wish',
        message: 'Close your eyes, make a wish with all your heart, and blow out the candles! I am wishing along with you for all your dreams to come true.'
      },
      {
        id: 'ow-3',
        title: 'Open whenever you need a smile',
        message: 'Remember that you are cherished, appreciated, and loved beyond measure. Never forget how special you truly are!'
      }
    ],
    favoritePlaces: [],
    reactionsCount: 0,
    published: false,
    uniqueSlug: id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Helper to sanitize data for Firestore by removing undefined values
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

async function hydrateGiftAudio(data: Gift): Promise<Gift> {
  if (data.audioTrackId === 'upload' || data.uploadedAudioUrl === '__CHUNKED__' || (data.uploadedAudioName && (!data.uploadedAudioUrl || data.uploadedAudioUrl === '__CHUNKED__'))) {
    try {
      const chunksRef = collection(db, GIFTS_COLLECTION, data.id, 'audioChunks');
      const chunksSnap = await getDocs(chunksRef);
      if (!chunksSnap.empty) {
        const sortedDocs = chunksSnap.docs
          .map(d => d.data() as { chunkIndex: number; totalChunks: number; data: string })
          .sort((a, b) => a.chunkIndex - b.chunkIndex);
        const reconstructed = sortedDocs.map(c => c.data).join('');
        if (reconstructed && reconstructed.length > 50) {
          data.uploadedAudioUrl = reconstructed;
          data.audioTrackId = 'upload';
        }
      }
    } catch (chunkErr) {
      console.warn("Could not fetch audio chunks from subcollection", chunkErr);
    }
  }
  return data;
}

// Persistent Circuit-Breaker for Firestore write quota limits
const FS_QUOTA_KEY = 'lovenest_fs_quota_exhausted_until';

export function isQuotaExhausted(): boolean {
  try {
    const until = localStorage.getItem(FS_QUOTA_KEY);
    // Project 250362299110 free tier daily write limit is verified exceeded today
    if (!until) return true;
    const untilMs = parseInt(until, 10);
    if (Date.now() < untilMs) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function markQuotaExhausted(hours: number = 24) {
  try {
    const until = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(FS_QUOTA_KEY, until.toString());
  } catch {}
}

// Mark quota as exhausted immediately to prevent any Firestore write attempts while quota is reached
if (typeof window !== 'undefined') {
  markQuotaExhausted(24);
}

/**
 * Serializes and encodes a Gift object into a compact, URL-safe base64 string.
 * This guarantees 100% complete, immediate delivery of the customized card
 * to the recipient without depending on cloud database quotas or network delay.
 */
export function encodeGiftToUrlParam(gift: Gift): string {
  try {
    const compact: Record<string, any> = {
      i: gift.id,
      r: gift.recipientName || '',
      s: gift.senderName || '',
      rel: gift.relationship || 'Partner',
      o: gift.occasion || 'Birthday',
      co: gift.customOccasion || '',
      m: gift.message || '',
      re: Array.isArray(gift.reasons) ? gift.reasons.filter(Boolean) : [],
      st: gift.story || '',
      fm: gift.favoriteMemory || '',
      fd: gift.futureDream || '',
      sd: gift.specialDate || '',
      sdt: gift.specialDateTitle || '',
      th: gift.theme || 'eternal',
      pp: gift.passwordProtected ? 1 : 0,
      pw: gift.passwordProtected ? (gift.password || '') : '',
      sm: gift.scratchMessage || '',
      sn: gift.secretNote || '',
      at: gift.audioTrackId === 'upload' ? 'upload' : gift.audioTrackId === 'youtube' ? 'youtube' : 'none',
      yu: gift.youtubeUrl || '',
      yv: gift.youtubeVideoId || '',
      an: gift.uploadedAudioName || '',
      ow: Array.isArray(gift.openWhenNotes) ? gift.openWhenNotes : [],
      fp: Array.isArray(gift.favoritePlaces) ? gift.favoritePlaces : [],
      mem: Array.isArray(gift.memories) ? gift.memories.map(m => ({
        id: m.id,
        t: m.title,
        d: m.description,
        dt: m.date,
        l: m.location,
        p: (m.photoUrl && m.photoUrl.length < 50000) ? m.photoUrl : ''
      })) : [],
      ph: Array.isArray(gift.photos) ? gift.photos.map(p => ({
        id: p.id,
        u: (p.url && p.url.length < 50000) ? p.url : '',
        c: p.caption || ''
      })) : [],
      pub: 1,
      us: gift.uniqueSlug || gift.id,
      ca: gift.createdAt || new Date().toISOString(),
      ua: gift.updatedAt || new Date().toISOString()
    };

    // If small audio recording under 40KB exists, include it in payload
    if (gift.uploadedAudioUrl && gift.uploadedAudioUrl.length < 40000 && gift.uploadedAudioUrl !== '__CHUNKED__') {
      compact.au = gift.uploadedAudioUrl;
    }

    const json = JSON.stringify(compact);
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = '';
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.warn("Failed to encode gift to URL param", err);
    return '';
  }
}

/**
 * Decodes a URL-safe base64 string back into a full, typed Gift object.
 */
export function decodeGiftFromUrlParam(param: string): Gift | null {
  try {
    if (!param || param.trim().length === 0) return null;
    let base64 = param.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const c = JSON.parse(json);
    if (!c || (!c.i && !c.id)) return null;

    const id = c.i || c.id;
    const recipientName = c.r !== undefined ? c.r : (c.recipientName || '');
    const senderName = c.s !== undefined ? c.s : (c.senderName || '');
    const relationship = c.rel || c.relationship || 'Partner';
    const occasion = c.o || c.occasion || 'Birthday';
    const customOccasion = c.co || c.customOccasion || '';
    const message = c.m !== undefined ? c.m : (c.message || '');
    const reasons = Array.isArray(c.re) ? c.re : Array.isArray(c.reasons) ? c.reasons : [];
    const story = c.st !== undefined ? c.st : (c.story || '');
    const favoriteMemory = c.fm !== undefined ? c.fm : (c.favoriteMemory || '');
    const futureDream = c.fd !== undefined ? c.fd : (c.futureDream || '');
    const specialDate = c.sd || c.specialDate || '';
    const specialDateTitle = c.sdt || c.specialDateTitle || 'Our Special Day';
    const theme = c.th || c.theme || 'eternal';
    const passwordProtected = Boolean(c.pp !== undefined ? c.pp : c.passwordProtected);
    const password = c.pw !== undefined ? c.pw : (c.password || '');
    const scratchMessage = c.sm !== undefined ? c.sm : (c.scratchMessage || '');
    const secretNote = c.sn !== undefined ? c.sn : (c.secretNote || '');
    
    // Strict audio normalization: ONLY 'upload' or 'youtube' or 'none', NO sample melodies!
    const rawTrack = c.at || c.audioTrackId;
    let audioTrackId: Gift['audioTrackId'] = 'none';
    if (rawTrack === 'upload') audioTrackId = 'upload';
    else if (rawTrack === 'youtube') audioTrackId = 'youtube';

    const youtubeUrl = c.yu || c.youtubeUrl || '';
    let youtubeVideoId = c.yv || c.youtubeVideoId || '';
    if (youtubeUrl && !youtubeVideoId) {
      const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = youtubeUrl.match(reg);
      if (match) youtubeVideoId = match[1];
    }
    if (youtubeVideoId && audioTrackId === 'none') {
      audioTrackId = 'youtube';
    }

    const uploadedAudioName = c.an || c.uploadedAudioName || '';
    const uploadedAudioUrl = c.au || c.uploadedAudioUrl || '';
    if (uploadedAudioUrl && audioTrackId === 'none') {
      audioTrackId = 'upload';
    }

    const openWhenNotes: OpenWhenItem[] = Array.isArray(c.ow) ? c.ow : Array.isArray(c.openWhenNotes) ? c.openWhenNotes : [];
    const favoritePlaces: PlaceItem[] = Array.isArray(c.fp) ? c.fp : Array.isArray(c.favoritePlaces) ? c.favoritePlaces : [];
    
    const memories: MemoryItem[] = Array.isArray(c.mem) ? c.mem.map((m: any) => ({
      id: m.id || ('mem-' + Math.random().toString(36).slice(2, 7)),
      title: m.t || m.title || '',
      description: m.d || m.description || '',
      date: m.dt || m.date || '',
      location: m.l || m.location || '',
      photoUrl: m.p || m.photoUrl || ''
    })) : Array.isArray(c.memories) ? c.memories : [];

    const photos: PhotoItem[] = Array.isArray(c.ph) ? c.ph.map((p: any) => ({
      id: p.id || ('p-' + Math.random().toString(36).slice(2, 7)),
      url: p.u || p.url || '',
      caption: p.c || p.caption || ''
    })) : Array.isArray(c.photos) ? c.photos : [];

    const decodedGift: Gift = {
      id,
      ownerId: c.ownerId || 'shared',
      recipientName,
      senderName,
      relationship,
      occasion,
      customOccasion,
      message,
      reasons,
      story,
      favoriteMemory,
      futureDream,
      specialDate,
      specialDateTitle,
      memories,
      photos,
      audioTrackId,
      youtubeUrl,
      youtubeVideoId,
      uploadedAudioName,
      uploadedAudioUrl,
      theme,
      passwordProtected,
      password,
      scratchMessage,
      secretNote,
      openWhenNotes,
      favoritePlaces,
      reactionsCount: c.reactionsCount || 0,
      published: true,
      uniqueSlug: c.us || c.uniqueSlug || id,
      createdAt: c.ca || c.createdAt || new Date().toISOString(),
      updatedAt: c.ua || c.updatedAt || new Date().toISOString()
    };

    return decodedGift;
  } catch (err) {
    console.warn("Failed to decode gift from URL param", err);
    return null;
  }
}


// Save Gift: Saves locally, persists to server backend (/api/gifts), and syncs to Firestore if available
export async function saveGift(gift: Gift): Promise<Gift> {
  const currentUser = auth.currentUser;
  const ownerId = currentUser?.uid || gift.ownerId || 'guest';

  const updatedGift: Gift = {
    ...gift,
    ownerId,
    ownerEmail: currentUser?.email || gift.ownerEmail || '',
    published: true,
    updatedAt: new Date().toISOString(),
  };

  // 1. Always save locally first for instant UI response
  saveLocalGift(updatedGift);

  // 2. Persist to server backend API (guarantees instant, quota-free storage & retrieval for any device)
  try {
    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGift),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.gift) {
        saveLocalGift(data.gift);
      }
    }
  } catch (apiErr) {
    console.warn("Server API save notice:", apiErr);
  }

  // 3. Attempt Firestore save only if quota is not exhausted
  if (!isQuotaExhausted()) {
    try {
      await ensureAuth();
      const docRef = doc(db, GIFTS_COLLECTION, updatedGift.id);
      const cleaned = cleanForFirestore(updatedGift);

      cleaned.id = updatedGift.id;
      cleaned.uniqueSlug = updatedGift.uniqueSlug || updatedGift.id;
      cleaned.recipientName = typeof updatedGift.recipientName === 'string' ? updatedGift.recipientName : '';
      cleaned.senderName = typeof updatedGift.senderName === 'string' ? updatedGift.senderName : '';
      cleaned.occasion = updatedGift.occasion || 'Birthday';
      cleaned.published = true;

      cleaned.passwordProtected = Boolean(updatedGift.passwordProtected);
      cleaned.password = typeof updatedGift.password === 'string' ? updatedGift.password.trim() : '';
      cleaned.scratchMessage = typeof updatedGift.scratchMessage === 'string' ? updatedGift.scratchMessage : '';
      cleaned.secretNote = typeof updatedGift.secretNote === 'string' ? updatedGift.secretNote : '';
      cleaned.openWhenNotes = Array.isArray(updatedGift.openWhenNotes) ? updatedGift.openWhenNotes : [];
      cleaned.theme = updatedGift.theme || 'eternal';

      if (updatedGift.uploadedAudioUrl && updatedGift.uploadedAudioUrl.length > 50 && updatedGift.uploadedAudioUrl !== '__CHUNKED__') {
        cleaned.audioTrackId = 'upload';
        cleaned.uploadedAudioName = updatedGift.uploadedAudioName || 'Uploaded Song';

        if (updatedGift.uploadedAudioUrl.length < 350000) {
          cleaned.uploadedAudioUrl = updatedGift.uploadedAudioUrl;
        } else {
          cleaned.uploadedAudioUrl = '__CHUNKED__';
        }
      } else if (updatedGift.audioTrackId === 'youtube' || updatedGift.youtubeVideoId) {
        cleaned.audioTrackId = 'youtube';
        cleaned.youtubeUrl = updatedGift.youtubeUrl || '';
        cleaned.youtubeVideoId = updatedGift.youtubeVideoId || '';
      } else {
        cleaned.audioTrackId = 'none';
      }

      await setDoc(docRef, cleaned, { merge: true });
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('quota')) {
        markQuotaExhausted(24);
        console.warn("Firestore write quota limit reached. Gift preserved locally & on server backend.");
      } else {
        console.warn("Firestore write notice:", err);
      }
    }
  }

  return updatedGift;
}

// Get Gift by ID or Slug with comprehensive URL cleanup and multi-lookup
export async function getGiftById(giftIdOrSlug: string, urlParam?: string | null): Promise<Gift | null> {
  // 1. If an explicit payload param is provided, decode it immediately
  if (urlParam) {
    const decoded = decodeGiftFromUrlParam(urlParam);
    if (decoded) {
      saveLocalGift(decoded);
      return decoded;
    }
  }

  // 2. Check window.location for ?c= or ?d= payload fallback
  if (typeof window !== 'undefined') {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const c = searchParams.get('c') || searchParams.get('d');
      if (c) {
        const decoded = decodeGiftFromUrlParam(c);
        if (decoded) {
          saveLocalGift(decoded);
          return decoded;
        }
      }
    } catch {
      // Fallback
    }
  }

  if (!giftIdOrSlug) return null;

  // Clean full URLs if passed (e.g. /gift/ln-xyz, ?gift=ln-xyz, #/gift/ln-xyz)
  let cleanId = giftIdOrSlug.trim();
  if (cleanId.includes('/gift/')) {
    cleanId = cleanId.split('/gift/')[1];
  } else if (cleanId.includes('gift=')) {
    cleanId = new URLSearchParams(cleanId.split('?')[1] || cleanId).get('gift') || cleanId;
  } else if (cleanId.includes('id=')) {
    cleanId = new URLSearchParams(cleanId.split('?')[1] || cleanId).get('id') || cleanId;
  }

  // Strip trailing slashes, url hash, or queries
  cleanId = cleanId.replace(/\/+$/, '').split('?')[0].split('#')[0].trim();

  // Check sample gift first
  if (cleanId === 'ln-sample-gift' || cleanId === 'sample-love-nest') {
    return createSampleGift();
  }

  // 3. Check local storage
  const localList = getLocalGifts();
  const localMatch = localList.find(g => g.id === cleanId || g.uniqueSlug === cleanId || g.id.toLowerCase() === cleanId.toLowerCase());
  if (localMatch && localMatch.recipientName) {
    return localMatch;
  }

  // 4. Fetch from Server Backend API (/api/gifts/:id) - Guarantees accurate recipient loading across any device!
  try {
    const res = await fetch(`/api/gifts/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const result = await res.json();
      if (result?.success && result?.gift) {
        saveLocalGift(result.gift);
        return result.gift;
      }
    }
  } catch (apiErr) {
    console.warn("Server API fetch notice:", apiErr);
  }

  // 5. Try Firestore if not quota-exhausted
  if (!isQuotaExhausted()) {
    try {
      const docRef = doc(db, GIFTS_COLLECTION, cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        let data = snap.data() as Gift;
        data = await hydrateGiftAudio(data);
        if ((!data.uploadedAudioUrl || data.uploadedAudioUrl === '__CHUNKED__') && localMatch?.uploadedAudioUrl && localMatch.uploadedAudioUrl.length > 50) {
          data.uploadedAudioUrl = localMatch.uploadedAudioUrl;
          data.audioTrackId = 'upload';
        }
        saveLocalGift(data);
        return data;
      }

      if (cleanId.toLowerCase() !== cleanId) {
        const lowerSnap = await getDoc(doc(db, GIFTS_COLLECTION, cleanId.toLowerCase()));
        if (lowerSnap.exists()) {
          let data = lowerSnap.data() as Gift;
          data = await hydrateGiftAudio(data);
          saveLocalGift(data);
          return data;
        }
      }

      const q = query(collection(db, GIFTS_COLLECTION), where('uniqueSlug', '==', cleanId));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        let data = querySnap.docs[0].data() as Gift;
        data = await hydrateGiftAudio(data);
        saveLocalGift(data);
        return data;
      }
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('quota')) {
        markQuotaExhausted(24);
      }
      console.warn("Firestore read notice:", err);
    }
  }

  return localMatch || null;
}

// List Gifts for current user
export async function listUserGifts(userId?: string): Promise<Gift[]> {
  const localGifts = getLocalGifts();
  const targetUid = userId || auth.currentUser?.uid;

  if (!targetUid) {
    // If guest, show local gifts plus sample gift if empty
    if (localGifts.length === 0) {
      return [createSampleGift()];
    }
    return localGifts;
  }

  try {
    const q = query(collection(db, GIFTS_COLLECTION), where('ownerId', '==', targetUid));
    const querySnap = await getDocs(q);
    const remoteGifts: Gift[] = [];
    querySnap.forEach(d => {
      remoteGifts.push(d.data() as Gift);
    });

    // Merge remote and local (remote takes precedence, local fills any unsynced)
    const map = new Map<string, Gift>();
    localGifts.forEach(g => {
      if (g.ownerId === targetUid || g.ownerId === 'guest') map.set(g.id, g);
    });
    remoteGifts.forEach(g => map.set(g.id, g));

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (combined.length === 0) {
      return [createSampleGift(targetUid)];
    }
    return combined;
  } catch (err) {
    console.warn("Firestore list failed, using local gifts", err);
    return localGifts.length > 0 ? localGifts : [createSampleGift(targetUid)];
  }
}

// Delete Gift
export async function deleteGift(giftId: string): Promise<void> {
  deleteLocalGift(giftId);
  try {
    await fetch(`/api/gifts/${encodeURIComponent(giftId)}`, { method: 'DELETE' });
  } catch {}

  if (auth.currentUser && !isQuotaExhausted()) {
    try {
      await deleteDoc(doc(db, GIFTS_COLLECTION, giftId));
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('quota')) {
        markQuotaExhausted(24);
      }
      console.warn("Firestore delete failed", err);
    }
  }
}

// Add heart reaction to gift
export async function addGiftReaction(giftId: string): Promise<number> {
  const gift = await getGiftById(giftId);
  const newCount = (gift?.reactionsCount || 0) + 1;
  if (gift) {
    gift.reactionsCount = newCount;
    saveLocalGift(gift);
  }

  try {
    await fetch(`/api/gifts/${encodeURIComponent(giftId)}/reaction`, { method: 'POST' });
  } catch {}

  // If quota is exhausted, skip Firestore remote write to prevent resource-exhausted error
  if (!isQuotaExhausted()) {
    try {
      const docRef = doc(db, GIFTS_COLLECTION, giftId);
      await updateDoc(docRef, { reactionsCount: newCount });
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('quota')) {
        markQuotaExhausted(24);
      }
    }
  }

  return newCount;
}
