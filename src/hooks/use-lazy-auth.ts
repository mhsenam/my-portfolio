"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

/**
 * Same contract as `useAuthState` from react-firebase-hooks, but the Firebase
 * SDK is pulled in with a dynamic import *after* mount.
 *
 * The navbar renders in the root layout, i.e. on every route — with a static
 * import the whole auth/firestore SDK (~100 KB gz) ended up in the initial
 * bundle of every page, including ones that never touch Firebase.
 */
export function useLazyAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void Promise.all([
      import("@/lib/firebaseConfig"),
      import("firebase/auth"),
    ]).then(([{ auth }, { onAuthStateChanged }]) => {
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (next) => {
        setUser(next);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return [user, loading] as const;
}
