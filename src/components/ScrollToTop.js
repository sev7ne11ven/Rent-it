import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * This component automatically scrolls the window to the top (0, 0)
 * whenever the route changes.
 */
const ScrollToTop = ({ children }) => {
  // useLocation hook returns the location object that represents the current URL.
  const { pathname } = useLocation();

  // useEffect hook will run every time the 'pathname' changes.
  useEffect(() => {
    // "document.documentElement.scrollTo" is the magic part
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Optional: Use "auto" or "instant" for immediate scrolling
    });
  }, [pathname]); // The effect depends on the pathname, so it runs on route change

  // This component doesn't render anything itself, it just wraps other components.
  return children;
};

export default ScrollToTop;
