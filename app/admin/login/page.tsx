import type { Metadata } from "next";

import { AdminLogin } from "@/admin-components/AdminLogin";

export const metadata: Metadata = {
  title: "Luke’s Apps · sign in",
  robots: { index: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AdminLogin error={error} />;
}
