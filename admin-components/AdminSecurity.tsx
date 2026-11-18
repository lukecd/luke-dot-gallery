"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import theme from "@/app/admin/admin-theme.module.css";
import styles from "@/app/admin/admin-auth.module.css";
import { createSupabaseBrowserClient } from "@/admin-lib/supabase/browser";

type Enrollment = { id: string; qrCode: string };
type ExistingFactor = { id: string };

export function AdminSecurity() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [existingFactor, setExistingFactor] = useState<ExistingFactor | null>(null);
  const [checkingFactor, setCheckingFactor] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkForExistingFactor() {
      const supabase = createSupabaseBrowserClient();
      const { data, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (!active) return;

      const verifiedFactor = data?.totp.find((factor) => factor.status === "verified");
      if (factorsError) {
        setError("We could not check your authenticator. Please try again.");
      } else if (verifiedFactor) {
        setExistingFactor({ id: verifiedFactor.id });
      }
      setCheckingFactor(false);
    }

    void checkForExistingFactor();
    return () => {
      active = false;
    };
  }, []);

  async function beginEnrollment() {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error: enrollmentError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Garden Desk",
    });
    if (enrollmentError || !data) {
      setError("We could not start authenticator setup. Please try again.");
      setBusy(false);
      return;
    }
    setEnrollment({ id: data.id, qrCode: data.totp.qr_code });
    setBusy(false);
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const factorId = existingFactor?.id ?? enrollment?.id;
    if (!factorId) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError || !challenge) {
      setError("We could not check that code. Please try again.");
      setBusy(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (verifyError) {
      setError("That code did not match. Please try again.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className={`${theme.theme} ${styles.page}`}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Luke’s Apps · Account</p>
        <h1>{existingFactor ? "Enter your authenticator code." : "Add your authenticator."}</h1>
        <p>
          {existingFactor
            ? "Use the authenticator you already set up for Luke’s Apps."
            : "Verify your identity to access your apps and contacts."}
        </p>
        {checkingFactor ? (
          <p>Checking your secure setup…</p>
        ) : existingFactor || enrollment ? (
          <form onSubmit={verify}>
            {enrollment && <img src={enrollment.qrCode} alt="Authenticator setup QR code" className={styles.qrCode} />}
            <label htmlFor="totp-code">Six-digit authenticator code</label>
            <input id="totp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} />
            <button type="submit" disabled={busy}>{busy ? "Checking…" : existingFactor ? "Verify and continue" : "Finish secure setup"}</button>
          </form>
        ) : (
          <button type="button" onClick={beginEnrollment} disabled={busy}>
            {busy ? "Preparing…" : "Set up authenticator"}
          </button>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </section>
    </main>
  );
}
