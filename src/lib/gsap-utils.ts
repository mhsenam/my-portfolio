import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Animation easing presets
export const easings = {
  smooth: "power3.out",
  bouncy: "elastic.out(1, 0.5)",
  sharp: "power4.inOut",
  expo: "expo.out",
  circ: "circ.out",
};

// Common animation durations
export const durations = {
  fast: 0.3,
  normal: 0.6,
  slow: 1,
  verySlow: 1.5,
};

// Stagger delays
export const staggers = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.2,
};

/**
 * Create a fade-in animation
 */
export const fadeIn = (
  elements: gsap.TweenTarget,
  options?: {
    duration?: number;
    delay?: number;
    from?: number;
    ease?: gsap.EaseFunction | string;
  }
) => {
  return gsap.fromTo(
    elements,
    { opacity: options?.from ?? 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? durations.normal,
      delay: options?.delay ?? 0,
      ease: options?.ease ?? easings.smooth,
    }
  );
};

/**
 * Create a staggered fade-in for multiple elements
 */
export const staggerFadeIn = (
  elements: gsap.TweenTarget,
  options?: {
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: gsap.EaseFunction | string;
  }
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? durations.normal,
      delay: options?.delay ?? 0,
      stagger: options?.stagger ?? staggers.normal,
      ease: options?.ease ?? easings.smooth,
    }
  );
};

/**
 * Create a scale-in animation
 */
export const scaleIn = (
  elements: gsap.TweenTarget,
  options?: {
    duration?: number;
    delay?: number;
    from?: number;
    ease?: gsap.EaseFunction | string;
  }
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, scale: options?.from ?? 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: options?.duration ?? durations.normal,
      delay: options?.delay ?? 0,
      ease: options?.ease ?? easings.expo,
    }
  );
};

/**
 * Create a text reveal animation (character by character)
 */
export const textReveal = (
  element: gsap.TweenTarget,
  text: string,
  options?: {
    duration?: number;
    delay?: number;
    speed?: number;
  }
) => {
  return gsap.to(element, {
    duration: options?.duration ?? 1,
    text: text,
    ease: "none",
    delay: options?.delay ?? 0,
    speed: options?.speed ?? 1,
  });
};

/**
 * Create a scroll-triggered animation
 */
export const scrollReveal = (
  elements: gsap.TweenTarget,
  options?: {
    duration?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    ease?: gsap.EaseFunction | string;
    direction?: "up" | "down" | "left" | "right";
  }
) => {
  const direction = options?.direction ?? "up";
  const fromProps: Record<string, number> = { opacity: 0 };

  switch (direction) {
    case "up":
      fromProps.y = 60;
      break;
    case "down":
      fromProps.y = -60;
      break;
    case "left":
      fromProps.x = 60;
      break;
    case "right":
      fromProps.x = -60;
      break;
  }

  return gsap.fromTo(
    elements,
    fromProps,
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: options?.duration ?? durations.normal,
      ease: options?.ease ?? easings.smooth,
      scrollTrigger: {
        trigger: elements as Element,
        start: options?.start ?? "top 85%",
        end: options?.end ?? "bottom 15%",
        scrub: options?.scrub ?? false,
      },
    }
  );
};

/**
 * Create parallax effect
 */
export const parallax = (
  element: gsap.TweenTarget,
  speed: number = 0.5,
  options?: {
    scrub?: boolean | number;
  }
) => {
  return gsap.to(element, {
    yPercent: -50 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element as Element,
      start: "top bottom",
      end: "bottom top",
      scrub: options?.scrub ?? true,
    },
  });
};

/**
 * Magnetic button effect
 */
export const magneticEffect = (
  element: HTMLElement,
  strength: number = 0.3
) => {
  const magnetize = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: easings.smooth,
    });
  };

  const reset = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: easings.expo,
    });
  };

  element.addEventListener("mousemove", magnetize);
  element.addEventListener("mouseleave", reset);

  return () => {
    element.removeEventListener("mousemove", magnetize);
    element.removeEventListener("mouseleave", reset);
  };
};

/**
 * Smooth scroll to element
 */
export const smoothScroll = (
  target: string | HTMLElement,
  offset: number = 0
) => {
  const element =
    typeof target === "string"
      ? document.querySelector(target)
      : target;

  if (element) {
    const y = (element as HTMLElement).getBoundingClientRect().top + window.pageYOffset + offset;
    gsap.to(window, {
      duration: 1,
      scrollTo: { y, autoKill: false },
      ease: easings.smooth,
    });
  }
};

/**
 * Text split for character animation
 */
export const splitText = (text: string) => {
  return text.split("").map((char, i) => ({
    char,
    index: i,
    isSpace: char === " ",
  }));
};

/**
 * Create a timeline for sequenced animations
 */
export const createTimeline = (options?: gsap.TimelineVars) => {
  return gsap.timeline({
    defaults: { ease: easings.smooth },
    ...options,
  });
};

/**
 * Refresh all ScrollTrigger instances
 */
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

/**
 * Kill all animations
 */
export const killAllAnimations = () => {
  gsap.killTweensOf("*");
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

// Export gsap and plugins for direct use
export { gsap, ScrollTrigger };
