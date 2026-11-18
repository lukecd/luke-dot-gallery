export type MailingList = { id: string; slug: string; name: string; consent_text: string; consent_copy_version: string; signup_enabled: boolean };
export type Subscriber = { id: string; status: "subscribed" | "unsubscribed"; source: string; consentedAt: string; consentCopyVersion: string; sourceSubmissionId: string | null; person: { display_name: string | null; email: string } };
export type SubscriberPage = { subscribers: Subscriber[]; lists: MailingList[]; list: MailingList; page: number; total: number; activeCount: number };

export function subscribersCsv(rows: Subscriber[]) {
  const cell = (value: string) => `"${(/^[=+@\-\t\r\n]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  return ["Name,Email,Status,Recorded,Source,Consent version", ...rows.map((row) => [row.person.display_name ?? "", row.person.email, row.status, row.consentedAt, row.source, row.consentCopyVersion].map(cell).join(","))].join("\r\n");
}
