"use client";
import { useCallback, useEffect, useRef } from "react";

/** Returns a stable function identity that always calls the latest callback. */
export function useCallbackRef<T extends (...args: never[]) => unknown>(cb: T): T {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  const stable = useCallback((...args: never[]) => ref.current(...args), []);
  return stable as T;
}
