// Curated Highlights channel categories
export const HIGHLIGHT_CHANNELS = [
  {
    id: 'festival',
    name: 'Festivals',
    description: 'Sohrai, Baha Parab, Karam celebrations',
    icon: '🎉',
  },
  {
    id: 'folklore',
    name: 'Folklore',
    description: 'Stories, legends, and oral traditions',
    icon: '📖',
  },
  {
    id: 'danceMusic',
    name: 'Dance & Music',
    description: 'Traditional performances and instruments',
    icon: '🎵',
  },
  {
    id: 'artNature',
    name: 'Art & Nature',
    description: 'Sohrai paintings, crafts, and natural beauty',
    icon: '🎨',
  },
] as const;

export type ChannelId = typeof HIGHLIGHT_CHANNELS[number]['id'];
