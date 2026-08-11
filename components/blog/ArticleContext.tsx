"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Post } from "@/data/posts";

interface ArticleState {
  post: Post | null;
  editTarget?: any;
  open: (post: Post, editTarget?: any) => void;
  close: () => void;
}

const ArticleCtx = createContext<ArticleState | null>(null);

/**
 * Holds whichever article is open in the popup.
 *
 * Opening pushes `/blog/<slug>` onto history so the address bar matches what is
 * on screen and the entry is linkable; closing goes back, which means the
 * browser's own Back button closes the popup rather than leaving the page.
 * A `popstate` we did not initiate closes it too, so the two stay in step.
 */
export function ArticleProvider({ children }: { children: React.ReactNode }) {
  const [post, setPost] = useState<Post | null>(null);
  const [editTarget, setEditTarget] = useState<any>(undefined);
  // Whether the currently open article owns a history entry to go back to.
  const pushed = useRef(false);

  const open = useCallback((p: Post, target?: any) => {
    setPost(p);
    setEditTarget(target);
    if (typeof window !== "undefined") {
      window.history.pushState({ articlePopup: p.slug }, "", `/blog/${p.slug}`);
      pushed.current = true;
    }
  }, []);

  const close = useCallback(() => {
    // Clear first, then unwind history. Waiting on `popstate` to do the closing
    // would leave the article stuck open anywhere that event does not arrive.
    setPost(null);
    setEditTarget(undefined);
    if (pushed.current && typeof window !== "undefined") {
      pushed.current = false;
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      pushed.current = false;
      setPost(null);
      setEditTarget(undefined);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <ArticleCtx.Provider value={{ post, editTarget, open, close }}>{children}</ArticleCtx.Provider>
  );
}

export function useArticle() {
  const ctx = useContext(ArticleCtx);
  if (!ctx) throw new Error("useArticle must be used within ArticleProvider");
  return ctx;
}

/**
 * Same shape, but safe outside the provider — the blog rows also render on
 * pages that never mount the popup, and they should link instead of throwing.
 */
export function useArticleOptional(): ArticleState | null {
  return useContext(ArticleCtx);
}
