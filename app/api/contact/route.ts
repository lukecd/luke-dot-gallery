import { NextResponse } from "next/server";

const CONTACT_RECIPIENT = "luke@spstories.com";
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeMessage(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function invalidRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: ContactRequest;

  try {
    const parsedBody: unknown = await request.json();

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      return invalidRequest("Please complete the form and try again.");
    }

    body = parsedBody as ContactRequest;
  } catch {
    return invalidRequest("Please complete the form and try again.");
  }

  const name = normalizeText(body.name);
  const email = normalizeText(body.email).toLowerCase();
  const message = normalizeMessage(body.message);

  if (!name || name.length > MAX_NAME_LENGTH) {
    return invalidRequest("Please enter a valid name.");
  }

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return invalidRequest("Please enter a valid email address.");
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return invalidRequest("Please enter a message of up to 5,000 characters.");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !from) {
    console.error("Contact email delivery is missing its Resend configuration.");
    return NextResponse.json(
      { error: "Message delivery is not configured yet. Please email luke@spstories.com." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "luke-gallery-contact-form",
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_RECIPIENT],
        reply_to: email,
        subject: `Luke.gallery contact — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    if (!response.ok) {
      console.error("Contact email provider rejected a message.", { status: response.status });
      return NextResponse.json(
        { error: "Your message could not be sent. Please try again or email luke@spstories.com." },
        { status: 502 },
      );
    }
  } catch {
    console.error("Contact email provider could not be reached.");
    return NextResponse.json(
      { error: "Your message could not be sent. Please try again or email luke@spstories.com." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
