"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary so the homepage (a Server Component) can lazy-load the
 * contact popover with ssr:false: its Radix popover + icon chunk is fetched
 * on demand instead of riding in the route's initial JS. The popover is pure
 * interaction - without JS it cannot open anyway.
 */
export const LazyContactPopover = dynamic(
  () => import("@/components/contact-popover").then((m) => m.ContactPopover),
  { ssr: false }
);
