import { useEffect, useState } from "react";

/**
 * Detect if the device supports touch events
 */
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch support
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(hasTouch);
  }, []);

  return isTouchDevice;
}

/**
 * Get if device is mobile based on screen width and touch support
 */
export function useMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    const checkMobile = () => {
      // Consider mobile if touch device AND small screen
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [isTouchDevice]);

  return isMobile;
}
