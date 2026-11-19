import { CREATOR_UPDATES_CONSENT } from "@/admin-lib/mailing-consent";

export const CONTACT_EMAIL = "luke@spstories.com";
export const MARKETING_CONSENT_COPY_VERSION = CREATOR_UPDATES_CONSENT.sow.version;
export const MARKETING_CONSENT_TEXT = CREATOR_UPDATES_CONSENT.sow.text;

export type ContactReason =
  | "feedback"
  | "feature-request"
  | "bug-report"
  | "plant-suggestion"
  | "testflight-invitation"
  | "updates";

export type ContactPayload = {
  reason: ContactReason;
  name: string;
  email: string;
  message?: string;
  plantName?: string;
  region?: string;
  device?: string;
  location?: string;
  updatesOptIn?: boolean;
};

export function formatContactEmail(payload: ContactPayload): {
  subject: string;
  text: string;
} {
  const label: Record<ContactReason, string> = {
    feedback: "Feedback",
    "feature-request": "Feature request",
    "bug-report": "Bug report",
    "plant-suggestion": "Plant suggestion",
    "testflight-invitation": "TestFlight invitation",
    updates: "Sow updates request",
  };
  const subject = `[Sow] ${label[payload.reason]} from ${payload.name}`;

  const text = [
    `Reason: ${label[payload.reason]}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.plantName ? `Plant: ${payload.plantName}` : null,
    payload.region ? `Region: ${payload.region}` : null,
    payload.device ? `Device: ${payload.device}` : null,
    payload.location ? `Where it happened: ${payload.location}` : null,
    payload.updatesOptIn ? "Wants updates about Sow and other apps by Luke Cassady-Dorion: yes" : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text };
}
