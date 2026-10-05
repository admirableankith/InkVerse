import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop component
 * - Automatically scrolls to top (0, 0) on internal navigation (PUSH / REPLACE)
 * - Scrolls to element if URL includes an anchor hash (e.g. #contact)
 * - Skips scrolling on browser Back/Forward (POP) to preserve history scroll positions
 * - Respects prefers-reduced-motion
 */
export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If the navigation is a browser Back/Forward (POP) action without an explicit hash,
    // preserve the browser's native scroll restoration.
    if (navType === 'POP' && !location.hash) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (location.hash) {
      const id = location.hash.replace('#', '');
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: scrollBehavior,
            block: 'start',
          });
          return true;
        }
        return false;
      };

      // Try immediately; if element is not yet in DOM, retry briefly
      if (!scrollToElement()) {
        const timer = setTimeout(scrollToElement, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: scrollBehavior,
      });
    }
  }, [location.pathname, location.search, location.hash, location.key, navType]);

  return null;
}
