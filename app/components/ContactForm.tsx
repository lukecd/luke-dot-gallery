"use client";

import { type FormEvent, useState } from "react";

export function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSending(true);
    setNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !result.ok) {
        setNotice(result.error ?? "Your message could not be sent. Please try again.");
        return;
      }

      form.reset();
      setNotice("Transmission sent. I’ll get back to you soon.");
    } catch {
      setNotice("Your message could not be sent. Please try again or email luke@spstories.com.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="contact-form-overlay" aria-label="Contact Luke">
      <form className="contact-form" onSubmit={handleSubmit} aria-busy={isSending}>
        <p className="contact-form__eyebrow">CONTACT / TRANSMISSION</p>
        <p className="contact-form__intro">
          Working on something fun? Send a message, or email <a href="mailto:luke@spstories.com">luke@spstories.com</a>.
        </p>
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows={4} required />
        </label>
        <button type="submit" disabled={isSending}>
          {isSending ? "Sending transmission…" : "Send transmission"} <span aria-hidden="true">↗</span>
        </button>
        <p className="contact-form__notice" aria-live="polite">{notice}</p>
      </form>
    </section>
  );
}
