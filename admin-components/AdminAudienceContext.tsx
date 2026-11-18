"use client";

import { createContext } from "react";

// The list already loads this count; share it with the hero without a second query.
export const AdminAudienceContext = createContext<(appId: string, count: number) => void>(() => {});
