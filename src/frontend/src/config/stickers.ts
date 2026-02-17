// Preset culturally themed stickers for messaging
export interface StickerItem {
  id: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
}

// Sticker sheet layout: 3x2 grid (1024x1024)
export const STICKERS: StickerItem[] = [
  { id: 'banam', name: 'Banam', position: { x: 0, y: 0, width: 341, height: 512 } },
  { id: 'leaf', name: 'Leaf', position: { x: 341, y: 0, width: 341, height: 512 } },
  { id: 'bird', name: 'Bird', position: { x: 682, y: 0, width: 342, height: 512 } },
  { id: 'flower', name: 'Flower', position: { x: 0, y: 512, width: 341, height: 512 } },
  { id: 'grove', name: 'Sacred Grove', position: { x: 341, y: 512, width: 341, height: 512 } },
  { id: 'drum', name: 'Drum', position: { x: 682, y: 512, width: 342, height: 512 } },
];

export const STICKER_SHEET_PATH = '/assets/generated/santal-stickers-sheet.dim_1024x1024.png';
