"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Custom cursor — a dot that tracks the pointer 1:1, a ring that trails it and
 * a soft glow behind the ring.
 *
 * It is deliberately built to work *while the page is still loading*:
 *
 *  - The layers are hidden by CSS (`.cursor-layer { opacity: 0 }`), which ships
 *    with the HTML, so nothing is painted in the top-left corner before React
 *    hydrates.
 *  - The native cursor is NOT hidden globally any more. It stays visible until
 *    this component actually knows where the pointer is, at which point it adds
 *    `custom-cursor-active` to <html> (which hides the native cursor) and fades
 *    the custom layers in on the same frame. So a slow bundle, a slow server
 *    render, a client-side navigation, a JS error or a touch device all fall
 *    back to the normal cursor instead of leaving the visitor with nothing.
 *  - There is no artificial delay: it shows on the first pointer event.
 *  - Hover/click states are delegated from `document`, so links and buttons
 *    that mount later (client components, fetched data, dialogs, route changes)
 *    get the effect without anything being re-wired.
 *  - Everything — including the GSAP ticker callback — is torn down, so route
 *    changes and StrictMode's double mount don't stack up listeners.
 *  - Disabled completely on touch / coarse pointers.
 */

const ACTIVE_CLASS = "custom-cursor-active";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Elements the ring expands over. Delegated, so late-mounted nodes work too. */
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "summary",
  "label[for]",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='tab']",
  "[tabindex]:not([tabindex='-1'])",
  ".cursor-pointer",
].join(",");

/**
 * Elements that keep the native caret/pointer (the custom cursor hides over
 * them). Must stay in sync with the `html.custom-cursor-active input, ...`
 * rule in globals.css.
 */
const EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable='true'], [contenteditable='']";

const TRAIL_EASE = 0.16; // per-frame lerp factor for the ring/glow
const REVEAL_DURATION = 0.15;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const finePointer = window.matchMedia(FINE_POINTER_QUERY);

    /**
     * Wire the cursor up. Returns its own teardown so it can be re-run when the
     * device switches between fine and coarse pointers (e.g. a laptop in tablet
     * mode, or a mouse plugged into a tablet).
     */
    const attach = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const glow = glowRef.current;
      if (!dot || !ring || !glow) return undefined;

      const layers = [glow, ring, dot];
      const instant = window.matchMedia(REDUCED_MOTION_QUERY).matches;

      const pointer = { x: 0, y: 0 }; // where the pointer really is
      const trail = { x: 0, y: 0 }; // eased position of the ring + glow

      let hasPosition = false; // we have seen at least one real pointer position
      let insideWindow = false;
      let overEditable = false;
      let hoverTarget: Element | null = null;
      let renderedOpacity: number | null = null;
      let ringRest = 1;
      let glowRest = 1;

      // Known starting state. xPercent/yPercent keeps every layer centred on
      // the pointer — GSAP overwrites a CSS `transform: translate(-50%, -50%)`
      // as soon as it writes x/y, which used to leave the dot off-centre.
      gsap.set(layers, {
        x: 0,
        y: 0,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 0,
        force3D: true,
      });

      const setDotX = gsap.quickSetter(dot, "x", "px");
      const setDotY = gsap.quickSetter(dot, "y", "px");
      const setTrailX = gsap.quickSetter([ring, glow], "x", "px");
      const setTrailY = gsap.quickSetter([ring, glow], "y", "px");

      /**
       * The only place that decides whether the custom cursor is on screen, and
       * whether the native one may be hidden. Toggling both together is what
       * makes the hand-off seamless.
       */
      const sync = () => {
        const active = hasPosition && !overEditable;
        root.classList.toggle(ACTIVE_CLASS, active);

        const nextOpacity = active && insideWindow ? 1 : 0;
        if (renderedOpacity === nextOpacity) return;
        renderedOpacity = nextOpacity;

        gsap.to(layers, {
          opacity: nextOpacity,
          duration: instant ? 0 : REVEAL_DURATION,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      const place = (x: number, y: number) => {
        pointer.x = x;
        pointer.y = y;
        setDotX(x);
        setDotY(y);

        if (!hasPosition) {
          // Snap the trailing layers to the pointer so nothing flies in from
          // the corner of the viewport.
          trail.x = x;
          trail.y = y;
          setTrailX(x);
          setTrailY(y);
          hasPosition = true;
        }
      };

      const applyHoverState = (hovering: boolean) => {
        ringRest = hovering ? 1.9 : 1;
        glowRest = hovering ? 1.45 : 1;

        gsap.to(dot, {
          scale: hovering ? 0 : 1,
          duration: instant ? 0 : 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(ring, {
          scale: ringRest,
          duration: instant ? 0 : 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(glow, {
          scale: glowRest,
          duration: instant ? 0 : 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onPointerMove = (event: PointerEvent) => {
        const first = !hasPosition;
        place(event.clientX, event.clientY);
        if (first || !insideWindow) {
          insideWindow = true;
          sync();
        }
      };

      // `pointerover` also carries coordinates, so the cursor appears as soon
      // as the pointer is known to be over the document — no need to wait for
      // a move (the pointer may already be resting on the page when we hydrate).
      const onPointerOver = (event: PointerEvent) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        place(event.clientX, event.clientY);

        const editable = target.closest(EDITABLE_SELECTOR);
        overEditable = Boolean(editable);

        const nextHover = editable ? null : target.closest(INTERACTIVE_SELECTOR);
        if (nextHover !== hoverTarget) {
          hoverTarget = nextHover;
          applyHoverState(Boolean(nextHover));
        }

        if (!insideWindow) insideWindow = true;
        sync();
      };

      const onPointerDown = (event: PointerEvent) => {
        place(event.clientX, event.clientY);
        insideWindow = true;
        sync();

        if (instant) return;
        gsap.fromTo(
          glow,
          { scale: glowRest * 0.78 },
          {
            scale: glowRest,
            duration: 0.45,
            ease: "elastic.out(1, 0.55)",
            overwrite: "auto",
          }
        );
      };

      // `pointerleave` on the document (unlike `pointerout`) only fires when the
      // pointer genuinely leaves the window — not when it moves between elements
      // or when the element under it is replaced by a re-render.
      const onPointerLeaveDocument = () => {
        insideWindow = false;
        sync();
      };

      const onPointerEnterDocument = (event: PointerEvent) => {
        place(event.clientX, event.clientY);
        insideWindow = true;
        sync();
      };

      const onWindowBlur = () => {
        insideWindow = false;
        sync();
      };

      const tick = () => {
        if (!hasPosition) return;
        const ratio = instant
          ? 1
          : 1 - Math.pow(1 - TRAIL_EASE, gsap.ticker.deltaRatio());
        trail.x += (pointer.x - trail.x) * ratio;
        trail.y += (pointer.y - trail.y) * ratio;
        setTrailX(trail.x);
        setTrailY(trail.y);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("blur", onWindowBlur);
      document.addEventListener("pointerover", onPointerOver, { passive: true });
      document.addEventListener("pointerleave", onPointerLeaveDocument);
      document.addEventListener("pointerenter", onPointerEnterDocument, {
        passive: true,
      });
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("blur", onWindowBlur);
        document.removeEventListener("pointerover", onPointerOver);
        document.removeEventListener("pointerleave", onPointerLeaveDocument);
        document.removeEventListener("pointerenter", onPointerEnterDocument);

        gsap.killTweensOf(layers);
        // Hand the inline styles back to CSS so a re-mount starts hidden again.
        gsap.set(layers, { clearProps: "all" });
        root.classList.remove(ACTIVE_CLASS);
      };
    };

    let detach = finePointer.matches ? attach() : undefined;

    const onPointerTypeChange = (event: MediaQueryListEvent) => {
      detach?.();
      detach = event.matches ? attach() : undefined;
      if (!event.matches) root.classList.remove(ACTIVE_CLASS);
    };

    finePointer.addEventListener("change", onPointerTypeChange);

    return () => {
      finePointer.removeEventListener("change", onPointerTypeChange);
      detach?.();
      detach = undefined;
      root.classList.remove(ACTIVE_CLASS);
    };
  }, []);

  return (
    <>
      {/* Soft glow — trailing */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="cursor-layer w-16 h-16 bg-primary/10"
      />

      {/* Ring — trailing, expands over interactive elements */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="cursor-layer w-8 h-8 border-2 border-primary mix-blend-difference"
      />

      {/* Dot — pinned to the pointer */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="cursor-layer w-3 h-3 bg-primary mix-blend-difference"
      />
    </>
  );
}
