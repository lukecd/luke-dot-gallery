"use client";
import { useEffect } from "react";
import { scrollToProject } from "../lib/projectNavigation";

export function useProjectAnchors() {
  useEffect(() => {
    let frame = 0;
    const restore = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => scrollToProject(window.location.hash.slice(1)));
    };
    // Allow the initial browser fragment jump to finish before scene positioning.
    if (window.location.hash) restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);
}
