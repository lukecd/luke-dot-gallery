import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SharedAdminPreview } from "./preview";

export const metadata = { title: "Shared admin preview", robots: { index: false } };
export default function PreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Suspense><SharedAdminPreview /></Suspense>;
}
