"use client";
import { trackEvent } from "../lib/analytics";

type ExternalLinkProps = { href: string; label: string };

export function ExternalLink({ href, label }: ExternalLinkProps) {
  return <a className="showcase-link" href={href} target="_blank" rel="noreferrer" onClick={() => trackEvent("project_outbound", { link_url: href })}>{label}</a>;
}
