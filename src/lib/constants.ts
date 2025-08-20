export const PROPERTY_IDS = {
  BAHIA_OCEAN_VILLA: 1,
  OCEANVIEW_LOFT: 2,
  ART_DECO_LOFT: 3,
} as const;

export const PROPERTY_NAMES = {
  1: 'Bahia Ocean Villa',
  2: 'Oceanview Loft', 
  3: 'Art Deco Loft',
} as const;

export const PROPERTY_DETAILS = {
  1: {
    name: 'Bahia Ocean Villa',
    location: 'Bahia, Brazil',
    image: '/src/assets/villa-bahia.jpg',
    basePrice: 150000, // $150k
    description: 'Luxury oceanfront villa with stunning views'
  },
  2: {
    name: 'Oceanview Loft',
    location: 'Mazunte, Mexico',
    image: '/src/assets/villa-mexico.jpg',
    basePrice: 120000, // $120k
    description: 'Modern loft with panoramic ocean views'
  },
  3: {
    name: 'Art Deco Loft',
    location: 'Ericeira, Portugal',
    image: '/src/assets/villa-greece.jpg',
    basePrice: 180000, // $180k
    description: 'Charming art deco style loft in historic district'
  }
} as const; 