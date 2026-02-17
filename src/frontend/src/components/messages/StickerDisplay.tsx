import { STICKERS, STICKER_SHEET_PATH } from '../../config/stickers';

interface StickerDisplayProps {
  stickerId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StickerDisplay({ stickerId, size = 'md' }: StickerDisplayProps) {
  const sticker = STICKERS.find((s) => s.id === stickerId);

  if (!sticker) {
    return <span className="text-muted-foreground text-sm">[Sticker]</span>;
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0`}
      style={{
        backgroundImage: `url(${STICKER_SHEET_PATH})`,
        backgroundPosition: `-${sticker.position.x}px -${sticker.position.y}px`,
        backgroundSize: '1024px 1024px',
        backgroundRepeat: 'no-repeat',
        transform: 'scale(0.8)',
      }}
      title={sticker.name}
    />
  );
}
