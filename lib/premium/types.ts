export type PhotoAlbumId =
  | "childhood"
  | "love"
  | "family"
  | "moments";

export interface CoverContent {
  image: string;
  recipientName: string;
  tagline: string;
  subtitle: string;
  demoNote: string;
  ctaLabel: string;
}

export interface Chapter {
  id: string;
  number: string;
  years: string;
  eraLabel: string;
  title: string;
  place: string;
  story: string;
  memory: string;
  image: string;
}

export interface PhotoMemory {
  id: string;
  year: string;
  title: string;
  caption: string;
  image: string;
  album: PhotoAlbumId;
}

export interface PhotoAlbum {
  id: PhotoAlbumId;
  title: string;
}

export interface VideoMemory {
  id: string;
  title: string;
  description: string;
  duration?: string;
  poster?: string;
  src?: string;
  sources?: { src: string; type: string }[];
}

export interface AudioMemory {
  id: string;
  name: string;
  relation: string;
  quote: string;
  src?: string;
}

export interface FamilyLetter {
  id: string;
  from: string;
  relation: string;
  preview: string;
  body: string;
  signature: string;
}

export interface CommercialBlock {
  title: string;
  subtitle: string;
  price: string;
  ctaLabel: string;
  ctaHref: string;
  occasionNote: string;
}

export interface PremiumBook {
  id: string;
  slug: string;
  title: string;
  recipientName: string;
  seo: {
    title: string;
    description: string;
    ogImage: string;
    noindex?: boolean;
  };
  cover: CoverContent;
  dedication: {
    quote: string;
    body: string;
    signature: string;
  };
  chapters: Chapter[];
  albums: PhotoAlbum[];
  photos: PhotoMemory[];
  videos: VideoMemory[];
  voices: AudioMemory[];
  letters: FamilyLetter[];
  closing: {
    title: string;
    body: string[];
    signature: string;
  };
  commercial: CommercialBlock;
}
