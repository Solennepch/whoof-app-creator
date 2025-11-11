import { useState, useCallback } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

export const useSwipeGestures = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 100
) => {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const position = { x: touch.clientX, y: touch.clientY };
    setTouchStart(position);
    setTouchCurrent(position);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchCurrent) return;

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = Math.abs(touchCurrent.y - touchStart.y);

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    setTouchStart(null);
    setTouchCurrent(null);
  }, [touchStart, touchCurrent, threshold, onSwipeLeft, onSwipeRight]);

  const getCardTransform = useCallback(() => {
    if (!touchStart || !touchCurrent) return '';
    const deltaX = touchCurrent.x - touchStart.x;
    const rotate = deltaX / 20;
    return `translateX(${deltaX}px) rotate(${rotate}deg)`;
  }, [touchStart, touchCurrent]);

  return {
    touchStart,
    touchCurrent,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getCardTransform,
  };
};
