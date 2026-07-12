import { useRef } from 'react';

export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const startX = useRef(null);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - startX.current;
    if (deltaX > threshold) onSwipeRight?.();
    else if (deltaX < -threshold) onSwipeLeft?.();
    startX.current = null;
  };

  return { onTouchStart, onTouchEnd };
}
