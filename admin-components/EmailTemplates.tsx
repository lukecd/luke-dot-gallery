"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "@/app/admin/admin.module.css";
import { AdminDataState } from "@/admin-components/AdminDataState";
import { ActionButton } from "@/admin-components/ActionButton";

type EmailTemplate = {
  id: string;
  template_key: "plant-illustration-ready-v1" | "testflight-invitation-v1";
  subject_template: string;
  text_template: string;
  label: string;
  purpose: string;
  variables: string[];
};

function validationMessage(template: EmailTemplate) {
  const subject = template.subject_template.trim();
  const text = template.text_template.trim();
  if (!subject || !text) return "Add both an email subject and message.";
  if (template.template_key === "plant-illustration-ready-v1" && (!subject.includes("{plant_name}") || !text.includes("{plant_name}"))) {
    return "Include {plant_name} in the subject and message.";
  }
  if (template.template_key === "testflight-invitation-v1" && !text.includes("{testflight_public_link}")) {
    return "Include {testflight_public_link} in the message.";
  }
  return null;
}

export function EmailTemplates({ onToast }: { onToast: (message: string) => void }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/templates");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load Workflow emails.");
      setTemplates(data.templates);
      setError(null);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Could not load Workflow emails.";
      setError(message);
      onToast(message);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function updateTemplate(templateKey: EmailTemplate["template_key"], field: "subject_template" | "text_template", value: string) {
    setTemplates((current) => current.map((template) => template.template_key === templateKey ? { ...template, [field]: value } : template));
  }

  async function save(template: EmailTemplate) {
    const validationError = validationMessage(template);
    if (validationError) {
      onToast(validationError);
      return;
    }

    setSavingKey(template.template_key);
    try {
      const response = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey: template.template_key, subject: template.subject_template, text: template.text_template }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this email.");
      setTemplates((current) => current.map((currentTemplate) => currentTemplate.template_key === template.template_key ? { ...currentTemplate, ...data.template } : currentTemplate));
      onToast(`${template.label} saved.`);
    } catch (caughtError) {
      onToast(caughtError instanceof Error ? caughtError.message : "Could not save this email.");
    } finally {
      setSavingKey(null);
    }
  }

  return <section className={styles.emailWorkspace}>
    <header className={styles.compactHeader}>
      <div><p className={styles.eyebrow}>Workflow emails</p><h1>Write what Sow sends.</h1><span>Plain-text operational emails, saved once and used by their workflows.</span></div>
    </header>
    {loading ? <AdminDataState state="loading" title="Loading Workflow emails…" description="Checking the saved operational templates." /> : null}
    {!loading && error ? <AdminDataState state="error" title="Workflow emails could not load." description={`${error} No email has been changed.`} onRetry={() => { void load(); }} /> : null}
    {!loading && !error ? <div className={styles.emailTemplateList}>
      {templates.map((template) => {
        const validationError = validationMessage(template);
        const busy = savingKey === template.template_key;
        return <section className={styles.emailTemplateCard} id={template.template_key} key={template.id}>
          <header><div><p className={styles.eyebrow}>Operational email</p><h2>{template.label}</h2><p>{template.purpose}</p></div></header>
          <div className={styles.emailTemplateEditor}>
            <label htmlFor={`${template.template_key}-subject`}>Subject</label>
            <input id={`${template.template_key}-subject`} value={template.subject_template} onChange={(event) => updateTemplate(template.template_key, "subject_template", event.target.value)} />
            <label htmlFor={`${template.template_key}-message`}>Plain-text message</label>
            <textarea id={`${template.template_key}-message`} value={template.text_template} onChange={(event) => updateTemplate(template.template_key, "text_template", event.target.value)} />
            <p>Available variables: {template.variables.map((variable, index) => <span key={variable}><code>{variable}</code>{index < template.variables.length - 1 ? ", " : ""}</span>)}.</p>
            {template.template_key === "plant-illustration-ready-v1" ? <p>The illustration is attached automatically.</p> : null}
            {validationError ? <p className={styles.emailTemplateValidation} role="alert">{validationError}</p> : null}
            <ActionButton size="compact" loading={busy} loadingLabel="Saving…" disabled={savingKey !== null} onClick={() => { void save(template); }}>Save email</ActionButton>
            <div className={styles.emailPreview}><p className={styles.eyebrow}>Plain-text preview</p><strong>{template.subject_template || "Email subject"}</strong><pre>{template.text_template || "Email message"}</pre></div>
          </div>
        </section>;
      })}
    </div> : null}
  </section>;
}
