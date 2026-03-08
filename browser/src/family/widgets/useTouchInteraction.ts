import { useCallback, useRef, useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Mode of touch interaction for different chart types */
export type TouchMode =
  | 'slide'      // Area/line charts: drag finger to move crosshair
  | 'tap-toggle' // Grid/cell charts: tap to show, tap elsewhere to dismiss
  | 'tap-hold';  // Legend buttons: tap to toggle highlight

/** Position from a touch or mouse event, in client coordinates */
export interface ClientPoint {
  clientX: number;
  clientY: number;
}

/** What the hook returns to the consuming chart component */
export interface TouchInteraction<T> {
  /** Current active value (hovered week index, cell coords, etc.) */
  active: T | null;

  /** Clear the active state */
  clear: () => void;

  /**
   * Bind these props to the interactive SVG overlay rect (for 'slide' mode)
   * or to individual interactive elements (for 'tap-toggle' mode).
   */
  bindOverlay: {
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };

  /**
   * For 'tap-toggle' mode: generate props for an individual interactive element.
   * Pass the value that should become active when this element is tapped/hovered.
   */
  bindElement: (value: T) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };

  /**
   * Bind to the chart container div to dismiss tooltip on outside tap.
   */
  bindContainer: {
    ref: React.RefObject<HTMLDivElement>;
  };

  /** Whether a touch interaction is currently in progress (for CSS touch-action) */
  isTouching: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useTouchInteraction - Unified touch + mouse interaction for SVG charts.
 *
 * @param mode - The interaction mode:
 *   - 'slide': For area/line charts with an invisible overlay rect.
 *     Touch start activates, touch move updates, touch end keeps value visible
 *     (tap elsewhere or next touch start on a different chart dismisses).
 *   - 'tap-toggle': For grid/cell charts (heatmaps, swim lanes).
 *     Tap a cell to show tooltip, tap another cell to move it, tap outside to dismiss.
 *   - 'tap-hold': For legend buttons. Tap to toggle, no dismiss-on-outside needed.
 *
 * @param resolver - For 'slide' mode only. Converts a client point + the event target
 *   into the active value (e.g., week index). Receives the bounding rect of the
 *   overlay element and the client coordinates.
 *
 * @returns TouchInteraction<T> with bindOverlay, bindElement, bindContainer, active state.
 */
export function useTouchInteraction<T>(
  mode: TouchMode,
  resolver?: (rect: DOMRect, point: ClientPoint) => T
): TouchInteraction<T> {
  const [active, setActive] = useState<T | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Element | null>(null);

  // Track whether current interaction started from touch (vs mouse)
  const touchActiveRef = useRef(false);

  // ── Slide mode handlers ──────────────────────────────────────────────────

  const resolveFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent, target?: Element) => {
      if (!resolver) return;
      const el = target ?? e.currentTarget;
      const rect = el.getBoundingClientRect();
      const point: ClientPoint =
        'touches' in e
          ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
          : { clientX: e.clientX, clientY: e.clientY };
      const value = resolver(rect, point);
      setActive(value);
    },
    [resolver]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Don't respond to mouse events during/after touch
      if (touchActiveRef.current) return;
      resolveFromEvent(e);
    },
    [resolveFromEvent]
  );

  const handleMouseLeave = useCallback(() => {
    if (touchActiveRef.current) return;
    setActive(null);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Prevent scroll while interacting with chart
      e.preventDefault();
      touchActiveRef.current = true;
      setIsTouching(true);
      overlayRef.current = e.currentTarget;
      if (mode === 'slide') {
        resolveFromEvent(e);
      }
    },
    [mode, resolveFromEvent]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (mode === 'slide' && overlayRef.current) {
        // Use the stored overlay element for getBoundingClientRect
        // since touchMove target might differ
        const rect = overlayRef.current.getBoundingClientRect();
        if (resolver && e.touches.length > 0) {
          const point: ClientPoint = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          };
          const value = resolver(rect, point);
          setActive(value);
        }
      }
    },
    [mode, resolver]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsTouching(false);
      // For 'slide' mode: keep the last value visible (don't clear).
      // It will be cleared on next touchStart elsewhere or on outside tap.
      // Reset touch flag after a delay to allow mouse events again
      setTimeout(() => {
        touchActiveRef.current = false;
      }, 300);
    },
    []
  );

  // ── Tap-toggle mode handlers ─────────────────────────────────────────────

  const handleElementMouseEnter = useCallback((value: T) => {
    if (touchActiveRef.current) return;
    setActive(value);
  }, []);

  const handleElementMouseLeave = useCallback(() => {
    if (touchActiveRef.current) return;
    setActive(null);
  }, []);

  const handleElementTouchStart = useCallback(
    (e: React.TouchEvent, value: T) => {
      e.preventDefault();
      e.stopPropagation();
      touchActiveRef.current = true;
      setIsTouching(true);
      // Toggle: if tapping the same element, dismiss; otherwise, show new one
      setActive((prev) => {
        // Deep equality is tricky for objects, so use JSON comparison
        // For primitives this is fine; for objects it works for our use cases
        if (prev !== null && JSON.stringify(prev) === JSON.stringify(value)) {
          return null;
        }
        return value;
      });
      setTimeout(() => {
        touchActiveRef.current = false;
        setIsTouching(false);
      }, 300);
    },
    []
  );

  // ── Outside-tap dismissal ────────────────────────────────────────────────

  useEffect(() => {
    if (active === null) return;

    const handleOutsideTap = (e: TouchEvent | MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActive(null);
      }
    };

    // Use a small delay so the current tap doesn't immediately dismiss
    const timer = setTimeout(() => {
      document.addEventListener('touchstart', handleOutsideTap, { passive: true });
      document.addEventListener('mousedown', handleOutsideTap);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', handleOutsideTap);
      document.removeEventListener('mousedown', handleOutsideTap);
    };
  }, [active]);

  // ── Return value ─────────────────────────────────────────────────────────

  const clear = useCallback(() => setActive(null), []);

  const bindOverlay = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  const bindElement = useCallback(
    (value: T) => ({
      onMouseEnter: () => handleElementMouseEnter(value),
      onMouseLeave: handleElementMouseLeave,
      onTouchStart: (e: React.TouchEvent) => handleElementTouchStart(e, value),
    }),
    [handleElementMouseEnter, handleElementMouseLeave, handleElementTouchStart]
  );

  return {
    active,
    clear,
    bindOverlay,
    bindElement,
    bindContainer: { ref: containerRef },
    isTouching,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS helper: inline styles for touch-friendly chart containers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply these styles to the chart container div to prevent unwanted
 * browser behaviors on touch devices.
 */
export const touchChartContainerStyle: React.CSSProperties = {
  // Prevent tap highlight flash on iOS
  WebkitTapHighlightColor: 'transparent',
  // Prevent text selection during touch interaction
  WebkitUserSelect: 'none',
  userSelect: 'none',
};

/**
 * Apply these styles to interactive SVG overlay rects or groups.
 * Use touch-action: none to prevent scrolling while dragging on the chart.
 * Only apply when a touch interaction is active to avoid blocking page scroll
 * when the user is just scrolling past the chart.
 */
export function touchOverlayStyle(isTouching: boolean): React.CSSProperties {
  return {
    cursor: 'crosshair',
    touchAction: isTouching ? 'none' : 'pan-y',
  };
}

/**
 * For tap-toggle elements (heatmap cells, dots), use this to ensure
 * minimum touch target size. Returns a transparent rect around the element
 * that expands the hit area.
 */
export function minTouchTarget(
  cx: number,
  cy: number,
  currentSize: number,
  minSize: number = 44
): { x: number; y: number; width: number; height: number } {
  const size = Math.max(currentSize, minSize);
  return {
    x: cx - size / 2,
    y: cy - size / 2,
    width: size,
    height: size,
  };
}
