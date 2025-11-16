import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook global qui désactive le scroll automatiquement 
 * quand le contenu tient entièrement dans l'écran
 */
export function useScrollLock() {
  const location = useLocation();

  useEffect(() => {
    function updateScrollLock() {
      const pageHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;

      if (pageHeight <= viewportHeight) {
        document.documentElement.classList.add("no-scroll");
        document.body.classList.add("no-scroll");
      } else {
        document.documentElement.classList.remove("no-scroll");
        document.body.classList.remove("no-scroll");
      }
    }

    // Exécuter immédiatement
    updateScrollLock();

    // Exécuter au resize
    window.addEventListener("resize", updateScrollLock);

    // Observer les mutations du DOM pour détecter les changements de contenu
    const observer = new MutationObserver(updateScrollLock);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", updateScrollLock);
      observer.disconnect();
    };
  }, [location.pathname]); // Re-exécuter à chaque changement de route
}
