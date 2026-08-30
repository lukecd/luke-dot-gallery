import Image from "next/image";
import { ContactForm } from "./ContactForm";
import { RocketSmokeSequence } from "./RocketSmokeSequence";

type ContactLayerProps = {
  className: string;
  src: string;
};

function ContactLayer({ className, src }: ContactLayerProps) {
  return (
    <div className={className} aria-hidden="true">
      <Image src={src} alt="" fill priority sizes="(max-width: 600px) 125vw, min(100vw, 104rem)" />
    </div>
  );
}

function ContactSkyAccents() {
  return (
    <div className="contact-sky-accents" aria-hidden="true">
      <ContactLayer className="contact-aurora" src="/assets/contact/contact-aurora-trimmed-v2.png" />
      <ContactLayer className="contact-moon" src="/assets/contact/contact-moon-trimmed-v1.png" />
    </div>
  );
}

function ContactLandingRocket() {
  return (
    <div className="contact-landing-rocket" aria-hidden="true">
      <Image
        src="/assets/hero/15-rocket-body.png"
        alt=""
        fill
        priority
        sizes="(max-width: 600px) 22vw, 16vw"
      />
    </div>
  );
}

function ContactLandingSite() {
  return (
    <div className="contact-landing-site" aria-hidden="true">
      <ContactLayer className="contact-landing-pad-rear" src="/assets/contact/contact-landing-pad-rear-v1.png" />
      <ContactLandingRocket />
      <ContactLayer className="contact-landing-pad-front" src="/assets/contact/contact-landing-pad-front-v1.png" />
      <RocketSmokeSequence className="contact-landing-smoke" />
    </div>
  );
}

function ContactGroundStage() {
  return (
    <div className="contact-ground-stage" aria-hidden="true">
      <div className="contact-ground-content">
        <ContactLayer className="contact-plain" src="/assets/contact/contact-plain-trimmed-v2.png" />
        <ContactLayer className="contact-far-terrain" src="/assets/contact/contact-far-terrain-trimmed-v3.png" />
        <ContactLandingSite />
        <ContactLayer className="contact-foreground-left" src="/assets/contact/contact-foreground-left-trimmed-v1.png" />
        <ContactLayer className="contact-foreground-right" src="/assets/contact/contact-foreground-right-trimmed-v1.png" />
      </div>
    </div>
  );
}

/**
 * The contact world deliberately reuses the persistent hero sky. Its layers
 * live in a dedicated horizon coordinate system so resizing preserves their
 * relationship without scaling a finished background illustration.
 */
export function ContactScene() {
  return (
    <section className="contact-scene" aria-label="Contact landing scene">
      <ContactSkyAccents />
      <ContactGroundStage />
      <ContactForm />
    </section>
  );
}
