import { useEffect, useRef, RefObject } from "react";

interface SwipeGestureOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
    enabled?: boolean;
}

export function useSwipeGesture<T extends HTMLElement>(
    options: SwipeGestureOptions
): RefObject<T> {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        threshold = 50,
        enabled = true,
    } = options;

    const elementRef = useRef<T>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const element = elementRef.current;
        if (!element) return;

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            touchStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;

            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // Determine if swipe is horizontal or vertical
            if (absDeltaX > absDeltaY) {
                // Horizontal swipe
                if (absDeltaX > threshold) {
                    if (deltaX > 0) {
                        onSwipeRight?.();
                    } else {
                        onSwipeLeft?.();
                    }
                }
            } else {
                // Vertical swipe
                if (absDeltaY > threshold) {
                    if (deltaY > 0) {
                        onSwipeDown?.();
                    } else {
                        onSwipeUp?.();
                    }
                }
            }

            touchStartRef.current = null;
        };

        const handleTouchCancel = () => {
            touchStartRef.current = null;
        };

        // Use passive listeners for better performance
        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });
        element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchend", handleTouchEnd);
            element.removeEventListener("touchcancel", handleTouchCancel);
        };
    }, [enabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

    return elementRef;
}
