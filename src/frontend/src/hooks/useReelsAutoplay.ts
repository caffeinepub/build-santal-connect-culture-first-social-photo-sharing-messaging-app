import { useEffect, useState, RefObject } from 'react';

export function useReelsAutoplay(totalReels: number, containerRef: RefObject<HTMLDivElement | null>) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalReels === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.75, // Trigger when 75% of the reel is visible
      }
    );

    // Observe all reel items
    const reelItems = container.querySelectorAll('[data-index]');
    reelItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [totalReels, containerRef]);

  return { activeIndex };
}
