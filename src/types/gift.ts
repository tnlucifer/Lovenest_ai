export type RelationshipType = 
  | 'Partner' 
  | 'Spouse' 
  | 'Best Friend' 
  | 'Parent' 
  | 'Sibling' 
  | 'Someone Special' 
  | 'Other';

export type OccasionType = 
  | 'Birthday' 
  | 'Anniversary' 
  | "Valentine's Day" 
  | 'Friendship' 
  | 'Thank You' 
  | 'Graduation' 
  | 'Long Distance' 
  | 'Just Because' 
  | 'Custom';

export type ThemeType = 
  | 'eternal' 
  | 'midnight' 
  | 'bloom' 
  | 'sunset' 
  | 'minimal' 
  | 'vintage';

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  photoUrl: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
}

export interface OpenWhenItem {
  id: string;
  title: string; // e.g. "Open when you miss me"
  message: string;
}

export interface PlaceItem {
  id: string;
  title: string;
  city: string;
  memory: string;
}

export interface Gift {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  recipientName: string;
  senderName: string;
  relationship: RelationshipType;
  occasion: OccasionType;
  customOccasion?: string;
  message: string;
  reasons: string[];
  story: string;
  favoriteMemory: string;
  futureDream: string;
  specialDate?: string;
  specialDateTitle?: string;
  memories: MemoryItem[];
  photos: PhotoItem[];
  audioTrackId: 'happy-birthday' | 'celebration' | 'warm-piano' | 'music-box' | 'lofi-rain' | 'acoustic' | 'custom' | 'youtube' | 'upload' | 'none';
  customAudioUrl?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  uploadedAudioUrl?: string;
  uploadedAudioName?: string;
  videoUrl?: string;
  voiceMessageUrl?: string;
  theme: ThemeType;
  passwordProtected: boolean;
  password?: string;
  scratchMessage?: string;
  secretNote?: string;
  openWhenNotes?: OpenWhenItem[];
  favoritePlaces?: PlaceItem[];
  reactionsCount?: number;
  published: boolean;
  uniqueSlug: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
