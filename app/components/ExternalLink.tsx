type ExternalLinkProps = { href: string; label: string };

export function ExternalLink({ href, label }: ExternalLinkProps) {
  return <a className="showcase-link" href={href} target="_blank" rel="noreferrer">{label}</a>;
}
