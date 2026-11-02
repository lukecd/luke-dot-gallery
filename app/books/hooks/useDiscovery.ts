"use client";
import { useEffect, useState } from "react";
import seed from "../data/discovery.json";
import type { DiscoverySnapshot } from "../discovery";
export function useDiscovery() {
  const [snapshot,setSnapshot] = useState<DiscoverySnapshot>(seed as DiscoverySnapshot);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/books/discovery",{signal:controller.signal}).then(response => response.ok ? response.json() : Promise.reject()).then(setSnapshot).catch(() => {});
    return () => controller.abort();
  },[]);
  return snapshot;
}
