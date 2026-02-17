import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { STICKERS, STICKER_SHEET_PATH } from '../../config/stickers';

interface StickerPickerProps {
  onStickerSelect: (stickerId: string) => void;
}

export default function StickerPicker({ onStickerSelect }: StickerPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (stickerId: string) => {
    onStickerSelect(stickerId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" type="button">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="grid grid-cols-3 gap-2">
          {STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleSelect(sticker.id)}
              className="relative aspect-square rounded-lg overflow-hidden hover:bg-accent transition-colors border border-border"
              title={sticker.name}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${STICKER_SHEET_PATH})`,
                  backgroundPosition: `-${sticker.position.x}px -${sticker.position.y}px`,
                  backgroundSize: '1024px 1024px',
                  backgroundRepeat: 'no-repeat',
                  transform: 'scale(0.8)',
                }}
              />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
