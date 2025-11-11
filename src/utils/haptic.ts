/**
 * Haptic feedback utilities for mobile devices
 */

export const haptic = {
  // Light tap (for button presses)
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium feedback (for swipes)
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  
  // Strong feedback (for matches and important events)
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  // Success pattern (for successful actions)
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 10, 15]);
    }
  },
  
  // Error pattern (for errors)
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
  }
};
