import "server-only";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { generatePlantCandidate } from "@/admin-lib/admin/plant-generation";
import { createAppIllustrationBatchPullRequest, createAppIllustrationPullRequest, type CanonicalPlant } from "@/admin-lib/admin/app-illustration-handoff";

type Template = {
  id: string;
  template_key: string;
  subject_template: string;
  text_template: string;
};

export type TestFlightTemplate = Pick<Template, "id" | "template_key" | "subject_template" | "text_template">;
export type PlantIllustrationTemplate = TestFlightTemplate;
export type GardenDeskEmailTemplate = TestFlightTemplate & {
  label: string;
  purpose: string;
  variables: readonly string[];
};

const gardenDeskEmailTemplates = {
  "plant-illustration-ready-v1": {
    label: "Plant illustration ready",
    purpose: "Sent when an approved illustration is ready for the requester to add to Sow.",
    variables: ["{first_name}", "{plant_name}"],
  },
  "testflight-invitation-v1": {
    label: "TestFlight invitation",
    purpose: "Sent when a gardener is invited to join the Sow TestFlight.",
    variables: ["{first_name}", "{testflight_public_link}"],
  },
} as const;

export type GardenDeskEmailTemplateKey = keyof typeof gardenDeskEmailTemplates;

type Delivery = {
  id: string;
  status: "draft" | "queued" | "sent" | "failed" | "cancelled";
};

function render(value: string, variables: Record<string, string>) {
  return value.replace(/\{([a-z_]+)\}/g, (_, key: string) => variables[key] ?? "");
}

function illustrationFirstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || "there";
}

async function getTemplate(key: string) {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("desk_email_templates")
    .select("id, template_key, subject_template, text_template")
    .eq("template_key", key)
    .eq("is_active", true)
    .single();
  if (error || !data) throw new Error(`Missing Garden Desk email template: ${key}`);
  return data as Template;
}

function illustrationFilename(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalized || "plant-illustration"}.png`;
}

export async function getTestFlightTemplate(): Promise<TestFlightTemplate> {
  return getTemplate("testflight-invitation-v1");
}

export async function getPlantIllustrationTemplate(): Promise<PlantIllustrationTemplate> {
  return getTemplate("plant-illustration-ready-v1");
}

export async function listGardenDeskEmailTemplates(): Promise<GardenDeskEmailTemplate[]> {
  const service = createSupabaseServiceClient();
  const keys = Object.keys(gardenDeskEmailTemplates) as GardenDeskEmailTemplateKey[];
  const { data, error } = await service
    .from("desk_email_templates")
    .select("id, template_key, subject_template, text_template")
    .in("template_key", keys)
    .eq("is_active", true);
  if (error) throw error;

  const templatesByKey = new Map((data ?? []).map((template) => [template.template_key, template as Template]));
  return keys.map((key) => {
    const template = templatesByKey.get(key);
    if (!template) throw new Error(`Missing Garden Desk email template: ${key}`);
    return { ...template, ...gardenDeskEmailTemplates[key] };
  });
}

export async function updatePlantIllustrationTemplate(
  values: Pick<PlantIllustrationTemplate, "subject_template" | "text_template">,
) {
  const subject = values.subject_template.trim();
  const body = values.text_template.trim();
  if (!subject || !body) throw new Error("Add both an email subject and message.");
  if (!subject.includes("{plant_name}") || !body.includes("{plant_name}")) {
    throw new Error("Include {plant_name} in the subject and message so each gardener receives the right illustration.");
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("desk_email_templates")
    .update({ subject_template: subject, text_template: body })
    .eq("template_key", "plant-illustration-ready-v1")
    .eq("is_active", true)
    .select("id, template_key, subject_template, text_template")
    .single();
  if (error || !data) throw new Error("Could not save the plant illustration email template.");
  return data as PlantIllustrationTemplate;
}

export async function updateTestFlightTemplate(
  values: Pick<TestFlightTemplate, "subject_template" | "text_template">,
) {
  const subject = values.subject_template.trim();
  const body = values.text_template.trim();
  if (!subject || !body) throw new Error("Add both an email subject and message.");
  if (!body.includes("{testflight_public_link}")) {
    throw new Error("Include {testflight_public_link} so every invitation contains the TestFlight link.");
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("desk_email_templates")
    .update({ subject_template: subject, text_template: body })
    .eq("template_key", "testflight-invitation-v1")
    .eq("is_active", true)
    .select("id, template_key, subject_template, text_template")
    .single();
  if (error || !data) throw new Error("Could not save the TestFlight email template.");
  return data as TestFlightTemplate;
}

export async function updateGardenDeskEmailTemplate(
  key: GardenDeskEmailTemplateKey,
  values: Pick<TestFlightTemplate, "subject_template" | "text_template">,
) {
  if (key === "plant-illustration-ready-v1") return updatePlantIllustrationTemplate(values);
  return updateTestFlightTemplate(values);
}

async function getTestFlightRequest(requestId: string) {
  const service = createSupabaseServiceClient();
  const { data: request, error } = await service
    .from("desk_testflight_requests")
    .select("id, submission_id, status, device")
    .eq("id", requestId)
    .single();
  if (error || !request) throw new Error("TestFlight request not found.");

  const { data: submission, error: submissionError } = await service
    .from("desk_submissions")
    .select("id, person_id")
    .eq("id", request.submission_id)
    .single();
  if (submissionError || !submission) throw new Error("TestFlight submission not found.");

  const { data: person, error: personError } = await service
    .from("desk_people")
    .select("id, email, display_name")
    .eq("id", submission.person_id)
    .single();
  if (personError || !person) throw new Error("Gardener not found.");
  return { request, submission, person };
}

export async function getTestFlightPublicLink() {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("desk_settings")
    .select("value")
    .eq("setting_key", "testflight")
    .maybeSingle();
  if (error) throw new Error("Could not read the TestFlight setting.");
  const value = data?.value as { public_link?: unknown } | null;
  return typeof value?.public_link === "string" ? value.public_link.trim() : "";
}

export async function updateTestFlightPublicLink(link: string, actorId: string) {
  const normalized = link.trim();
  if (normalized && !/^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+\/?$/i.test(normalized)) {
    throw new Error("Use a valid TestFlight public link from testflight.apple.com/join/…");
  }
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from("desk_settings")
    .upsert({ setting_key: "testflight", value: { public_link: normalized }, updated_by: actorId }, { onConflict: "setting_key" });
  if (error) throw new Error("Could not save the TestFlight link.");
  return normalized;
}

export async function listTestFlightRequests() {
  const service = createSupabaseServiceClient();
  const { data: requests, error } = await service
    .from("desk_testflight_requests")
    .select("id, submission_id, status, device, created_at, invited_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = await Promise.all((requests ?? []).map(async (request) => {
    const { data: submission } = await service
      .from("desk_submissions")
      .select("person_id, message")
      .eq("id", request.submission_id)
      .maybeSingle();
    const { data: person } = submission
      ? await service.from("desk_people").select("display_name, email").eq("id", submission.person_id).maybeSingle()
      : { data: null };
    const { data: delivery } = await service
      .from("desk_email_deliveries")
      .select("id, status, created_at, sent_at")
      .eq("submission_id", request.submission_id)
      .eq("delivery_kind", "testflight_invitation")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      id: request.id,
      submissionId: request.submission_id,
      status: request.status,
      device: request.device,
      requestedAt: request.created_at,
      invitedAt: request.invited_at,
      name: person?.display_name ?? "A gardener",
      email: person?.email ?? "",
      note: submission?.message ?? "",
      delivery,
    };
  }));
  return rows;
}

export async function prepareTestFlightInvitation(requestId: string) {
  const service = createSupabaseServiceClient();
  const { request, submission, person } = await getTestFlightRequest(requestId);
  const template = await getTemplate("testflight-invitation-v1");
  const publicLink = await getTestFlightPublicLink();
  const variables = {
    first_name: firstName(person.display_name),
    testflight_public_link: publicLink || "[Add the TestFlight public link before sending]",
  };

  const values = {
    person_id: person.id,
    submission_id: submission.id,
    template_id: template.id,
    delivery_kind: "testflight_invitation",
    recipient_email: person.email,
    subject: render(template.subject_template, variables),
    text_body: render(template.text_template, variables),
    status: "draft" as const,
    metadata: { request_id: request.id, public_link_configured: Boolean(publicLink) },
  };

  const { data: existing } = await service
    .from("desk_email_deliveries")
    .select("id")
    .eq("submission_id", submission.id)
    .eq("delivery_kind", "testflight_invitation")
    .in("status", ["draft", "failed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const query = existing
    ? service.from("desk_email_deliveries").update(values).eq("id", existing.id).select("id, status").single()
    : service.from("desk_email_deliveries").insert(values).select("id, status").single();
  const { data: delivery, error } = await query;
  if (error || !delivery) throw new Error("Could not prepare the TestFlight invitation.");
  return { delivery: delivery as Delivery, canSend: Boolean(publicLink) };
}

export async function sendTestFlightInvitation(requestId: string) {
  const { request } = await getTestFlightRequest(requestId);
  if (request.status === "invited") {
    throw new Error("This invitation has already been sent.");
  }
  const prepared = await prepareTestFlightInvitation(requestId);
  if (!prepared.canSend) {
    throw new Error("Add the TestFlight public link before sending invitations.");
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const replyTo = process.env.CONTACT_REPLY_TO;
  if (!apiKey || !from) throw new Error("Configure RESEND_API_KEY and CONTACT_FROM_EMAIL before sending.");

  const service = createSupabaseServiceClient();
  const { data: delivery, error: deliveryError } = await service
    .from("desk_email_deliveries")
    .select("id, recipient_email, subject, text_body")
    .eq("id", prepared.delivery.id)
    .single();
  if (deliveryError || !delivery) throw new Error("Prepared invitation not found.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: delivery.recipient_email,
      subject: delivery.subject,
      text: delivery.text_body,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;
  if (!response.ok) {
    await service.from("desk_email_deliveries").update({ status: "failed", last_error: payload?.message ?? "Resend rejected this delivery." }).eq("id", delivery.id);
    throw new Error(payload?.message ?? "Resend could not send the invitation.");
  }

  const now = new Date().toISOString();
  await Promise.all([
    service.from("desk_email_deliveries").update({ status: "sent", provider_message_id: payload?.id ?? null, sent_at: now, last_error: null }).eq("id", delivery.id),
    service.from("desk_testflight_requests").update({ status: "invited", invited_at: now }).eq("id", request.id),
  ]);
  return { deliveryId: delivery.id };
}

export async function sendTestFlightInvitations(requestIds: string[]) {
  const uniqueIds = [...new Set(requestIds)].filter(Boolean);
  if (uniqueIds.length === 0) throw new Error("Select at least one invitation to send.");

  const outcomes: Array<{ id: string; status: "sent" | "failed"; error?: string }> = [];
  for (const id of uniqueIds) {
    try {
      await sendTestFlightInvitation(id);
      outcomes.push({ id, status: "sent" });
    } catch (error) {
      outcomes.push({ id, status: "failed", error: error instanceof Error ? error.message : "Could not send invitation." });
    }
  }
  return outcomes;
}

export async function listPlantGenerationJobs() {
  const service = createSupabaseServiceClient();
  const { data: jobs, error } = await service
    .from("desk_plant_generation_jobs")
    .select("id, submission_id, requested_plant_name, botanical_name, canonical_name, canonical_key, canonical_aliases, app_pr_url, app_pr_error, container, status, created_at, generated_at, reviewed_at, sent_at, approved_asset_id, approved_at, delivered_at, last_error")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return Promise.all((jobs ?? []).map(async (job) => {
    const { data: submission } = await service.from("desk_submissions").select("person_id, growing_region").eq("id", job.submission_id).maybeSingle();
    const { data: person } = submission
      ? await service.from("desk_people").select("display_name, email").eq("id", submission.person_id).maybeSingle()
      : { data: null };
    const { data: assets } = await service
      .from("desk_generated_plant_assets")
      .select("id, attempt, status, storage_path, created_at")
      .eq("job_id", job.id)
      .order("attempt", { ascending: false });
    const assetsWithUrls = await Promise.all((assets ?? []).map(async (asset) => {
      // The bucket stays private. Only the authenticated Garden Desk route
      // receives this short-lived URL; the storage path itself is not sent on.
      const { data } = await service.storage.from("garden-desk-generated").createSignedUrl(asset.storage_path, 5 * 60);
      const { data: download } = await service.storage
        .from("garden-desk-generated")
        .createSignedUrl(asset.storage_path, 5 * 60, { download: illustrationFilename(job.requested_plant_name) });
      return {
        id: asset.id,
        attempt: asset.attempt,
        status: asset.status,
        createdAt: asset.created_at,
        signedUrl: data?.signedUrl ?? null,
        downloadUrl: download?.signedUrl ?? null,
        downloadName: illustrationFilename(job.requested_plant_name),
      };
    }));
    return { ...job, requester: person, growingRegion: submission?.growing_region ?? null, assets: assetsWithUrls };
  }));
}

export async function getPlantGenerationMetrics() {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("desk_plant_generation_jobs")
    .select("status, generated_at, delivered_at");
  if (error) throw new Error("Could not count plant illustration deliveries.");
  return (data ?? []).reduce((metrics, job) => ({
    queued: metrics.queued + (job.status === "queued" ? 1 : 0),
    generating: metrics.generating + (job.status === "generating" ? 1 : 0),
    ready: metrics.ready + (job.status === "awaiting_review" ? 1 : 0),
    generated: metrics.generated + (job.generated_at ? 1 : 0),
    sent: metrics.sent + (job.delivered_at ? 1 : 0),
  }), { queued: 0, generating: 0, ready: 0, generated: 0, sent: 0 });
}

export async function deletePlantGenerationJob(jobId: string, actorId: string) {
  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, submission_id, requested_plant_name, status")
    .eq("id", jobId)
    .single();
  if (jobError || !job) throw new Error("Plant generation job not found.");
  if (!["queued", "awaiting_review", "failed"].includes(job.status)) {
    throw new Error("Only queued, review-ready, or failed requests can be deleted. This request has already started delivery.");
  }

  const { data: assets, error: assetsError } = await service
    .from("desk_generated_plant_assets")
    .select("bucket_id, storage_path")
    .eq("job_id", jobId);
  if (assetsError) throw new Error("Could not inspect the generated illustrations.");

  const pathsByBucket = new Map<string, string[]>();
  for (const asset of assets ?? []) {
    const paths = pathsByBucket.get(asset.bucket_id) ?? [];
    paths.push(asset.storage_path);
    pathsByBucket.set(asset.bucket_id, paths);
  }
  for (const [bucket, paths] of pathsByBucket) {
    const { error } = await service.storage.from(bucket).remove(paths);
    if (error) throw new Error("Could not remove the generated illustration files.");
  }

  const { error: deleteError } = await service
    .from("desk_submissions")
    .delete()
    .eq("id", job.submission_id);
  if (deleteError) throw new Error("Could not delete this plant request.");
  await service.from("desk_activity_log").insert({
    actor_id: actorId,
    entity_type: "plant_generation_job",
    entity_id: jobId,
    action: "plant_request_deleted",
    details: { requested_plant_name: job.requested_plant_name },
  });
  return { deleted: true };
}

function canonicalPlantKey(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizedPlantAlias(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export async function savePlantCanonicalIdentity(
  jobId: string,
  values: { canonicalName: string; aliases: string[] },
  actorId: string,
) {
  const canonicalName = values.canonicalName.trim();
  const canonicalKey = canonicalPlantKey(canonicalName);
  if (!canonicalName || !canonicalKey) {
    throw new Error("Enter a botanical name that can form a canonical key.");
  }

  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, status, requested_plant_name")
    .eq("id", jobId)
    .single();
  if (jobError || !job) throw new Error("Plant generation job not found.");
  if (job.status !== "awaiting_review") {
    throw new Error("Canonical identity can only be saved while a candidate is awaiting review.");
  }

  const humanAliases = [...new Set([job.requested_plant_name, canonicalName, ...values.aliases]
    .map((alias) => alias.trim())
    .filter(Boolean))];
  const normalizedAliases = [...new Set(humanAliases.map(normalizedPlantAlias).filter(Boolean))];
  if (normalizedAliases.length === 0) throw new Error("Add at least one recognizable plant name.");

  const { data: conflict, error: conflictError } = await service
    .from("desk_plant_generation_jobs")
    .select("id")
    .eq("canonical_key", canonicalKey)
    .neq("id", jobId)
    .limit(1)
    .maybeSingle();
  if (conflictError) throw new Error("Could not check whether this botanical name is already in use.");
  if (conflict) throw new Error("That canonical key is already assigned to another plant request.");

  const { error: updateError } = await service
    .from("desk_plant_generation_jobs")
    .update({ canonical_name: canonicalName, canonical_key: canonicalKey, canonical_aliases: humanAliases })
    .eq("id", jobId);
  if (updateError) throw new Error("Could not save this plant identity.");
  await service.from("desk_activity_log").insert({
    actor_id: actorId,
    entity_type: "plant_generation_job",
    entity_id: jobId,
    action: "canonical_identity_saved",
    details: { canonical_name: canonicalName, canonical_key: canonicalKey, aliases: humanAliases, normalized_aliases: normalizedAliases },
  });
  return { canonicalName, canonicalKey, aliases: humanAliases, normalizedAliases };
}

export async function queuePlantGeneration(jobId: string, actorId: string) {
  const service = createSupabaseServiceClient();
  const { data: job, error } = await service
    .from("desk_plant_generation_jobs")
    .select("id, status")
    .eq("id", jobId)
    .single();
  if (error || !job) throw new Error("Plant generation job not found.");
  if (["approved", "sent", "cancelled"].includes(job.status)) throw new Error("This plant job is closed.");
  if (job.status === "generating") throw new Error("This plant is already being generated.");

  const { error: updateError } = await service
    .from("desk_plant_generation_jobs")
    .update({ status: "queued", last_error: null, generation_started_at: null })
    .eq("id", jobId);
  if (updateError) throw new Error("Could not queue this plant illustration.");
  await service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "generation_queued", details: {} });
  return { queued: true };
}

export async function runNextPlantGeneration() {
  const service = createSupabaseServiceClient();
  const staleBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  await service
    .from("desk_plant_generation_jobs")
    .update({ status: "queued", generation_started_at: null, last_error: "The previous worker did not finish; generation was safely requeued." })
    .eq("status", "generating")
    .lt("generation_started_at", staleBefore);

  const { data: claimed, error: claimError } = await service.rpc("desk_claim_next_plant_generation");
  if (claimError) throw new Error("Could not claim a plant generation.");
  if (!claimed) return { processed: false };

  const result = await generatePlantCandidate(claimed);
  return { processed: true, jobId: claimed, ...result };
}

export async function reviewPlantCandidate(jobId: string, assetId: string, action: "approve" | "reject", actorId: string) {
  const service = createSupabaseServiceClient();
  const { data: asset, error } = await service
    .from("desk_generated_plant_assets")
    .select("id, job_id, status")
    .eq("id", assetId)
    .eq("job_id", jobId)
    .single();
  if (error || !asset) throw new Error("Plant candidate not found.");
  if (asset.status !== "candidate") throw new Error("This candidate has already been reviewed.");

  if (action === "reject") {
    const { error: rejectError } = await service.from("desk_generated_plant_assets").update({ status: "rejected" }).eq("id", assetId);
    if (rejectError) throw new Error("Could not reject this candidate.");
    await service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "candidate_rejected", details: { asset_id: assetId } });
    return { status: "rejected" };
  }

  const { data: approved, error: approveError } = await service.rpc("desk_approve_plant_candidate", { p_job_id: jobId, p_asset_id: assetId });
  if (approveError || !approved) throw new Error("Could not approve this candidate.");
  await service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "candidate_approved", details: { asset_id: assetId } });
  return { status: "approved" };
}

function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || "there";
}

export async function sendApprovedPlantIllustration(jobId: string, actorId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const replyTo = process.env.CONTACT_REPLY_TO?.trim();
  if (!apiKey || !from) throw new Error("Configure RESEND_API_KEY and CONTACT_FROM_EMAIL before sending.");

  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, submission_id, requested_plant_name, approved_asset_id, status")
    .eq("id", jobId)
    .single();
  if (jobError || !job?.approved_asset_id || job.status !== "approved") throw new Error("Approve a candidate before sending it.");
  const { data: submission } = await service.from("desk_submissions").select("person_id").eq("id", job.submission_id).single();
  const { data: person } = submission ? await service.from("desk_people").select("id, email, display_name").eq("id", submission.person_id).single() : { data: null };
  const { data: asset } = await service.from("desk_generated_plant_assets").select("id, storage_path, bucket_id").eq("id", job.approved_asset_id).single();
  if (!person || !asset) throw new Error("The requester or approved image could not be found.");
  const { data: existingDelivery, error: existingDeliveryError } = await service
    .from("desk_email_deliveries")
    .select("id")
    .eq("submission_id", job.submission_id)
    .eq("delivery_kind", "plant_illustration_ready")
    .eq("status", "sent")
    .maybeSingle();
  if (existingDeliveryError) throw new Error("Could not check whether the requester email was already sent.");
  if (existingDelivery) return { sent: true, reused: true };
  const { data: image, error: imageError } = await service.storage.from(asset.bucket_id).download(asset.storage_path);
  if (imageError || !image) throw new Error("Could not retrieve the approved illustration.");
  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  const template = await getPlantIllustrationTemplate();
  const variables = { first_name: illustrationFirstName(person.display_name), plant_name: job.requested_plant_name };
  const subject = render(template.subject_template, variables);
  const text = render(template.text_template, variables);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Keeps a network/database retry from delivering the same approved asset twice.
      "Idempotency-Key": `plant-illustration/${job.id}`,
    },
    body: JSON.stringify({ from, to: person.email, subject, text, attachments: [{ filename: illustrationFilename(job.requested_plant_name), content: base64 }], ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const payload = await response.json().catch(() => null) as { id?: string; message?: string } | null;
  if (!response.ok) throw new Error(payload?.message ?? "Resend could not send the illustration.");
  const now = new Date().toISOString();
  const { error: deliveryError } = await service.from("desk_email_deliveries").insert({ person_id: person.id, submission_id: job.submission_id, delivery_kind: "plant_illustration_ready", recipient_email: person.email, subject, text_body: text, status: "sent", provider_message_id: payload?.id ?? null, sent_at: now, metadata: { job_id: job.id, asset_id: asset.id } });
  if (deliveryError) throw new Error("The illustration was sent, but its delivery record could not be saved.");
  await Promise.all([
    service.from("desk_plant_generation_jobs").update({ status: "sent", sent_at: now, delivered_at: now }).eq("id", jobId),
    service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "illustration_sent", details: { asset_id: asset.id, provider_message_id: payload?.id ?? null } }),
  ]);
  return { sent: true };
}

export async function approveAndDeliverPlantIllustration(jobId: string, assetId: string, plant: CanonicalPlant, actorId: string) {
  await reviewPlantCandidate(jobId, assetId, "approve", actorId);
  const [appPr, email] = await Promise.allSettled([
    createAppIllustrationPullRequest(jobId, plant),
    sendApprovedPlantIllustration(jobId, actorId),
  ]);
  return {
    approved: true,
    appPr: appPr.status === "fulfilled" ? { url: appPr.value.url } : { error: appPr.reason instanceof Error ? appPr.reason.message : "Could not create the app PR." },
    email: email.status === "fulfilled" ? { sent: true } : { error: email.reason instanceof Error ? email.reason.message : "Could not send the requester email." },
  };
}

export async function retryPlantAppHandoff(jobId: string, plant: CanonicalPlant) {
  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, app_handoff_batch_id")
    .eq("id", jobId)
    .single();
  if (jobError || !job) throw new Error("Plant generation job not found.");

  if (!job.app_handoff_batch_id) return createAppIllustrationPullRequest(jobId, plant);

  const { data: batchJobs, error: batchJobsError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, canonical_name, botanical_name, canonical_aliases, requested_plant_name")
    .eq("app_handoff_batch_id", job.app_handoff_batch_id)
    .order("created_at", { ascending: true });
  if (batchJobsError || !batchJobs?.length) throw new Error("Could not find the illustrations in this app handoff batch.");

  return createAppIllustrationBatchPullRequest(batchJobs.map((batchJob) => {
    const name = batchJob.id === jobId ? plant.name : (batchJob.canonical_name ?? batchJob.botanical_name ?? "");
    const aliases = batchJob.id === jobId ? plant.aliases : (batchJob.canonical_aliases?.length ? batchJob.canonical_aliases : [batchJob.requested_plant_name]);
    return { jobId: batchJob.id, plant: { name, aliases } };
  }));
}

function approvalConfigurationError() {
  const missing = [
    !process.env.SOW_APP_GITHUB_TOKEN?.trim() && "SOW_APP_GITHUB_TOKEN",
    !process.env.RESEND_API_KEY?.trim() && "RESEND_API_KEY",
    !process.env.CONTACT_FROM_EMAIL?.trim() && "CONTACT_FROM_EMAIL",
  ].filter(Boolean);
  return missing.length ? `Configure ${missing.join(", ")} before approving.` : null;
}

export async function approvePlantIllustrations(jobIds: string[], actorId: string) {
  const uniqueIds = [...new Set(jobIds)].filter(Boolean);
  if (uniqueIds.length === 0) throw new Error("Select at least one illustration to approve.");
  if (uniqueIds.length > 50) throw new Error("Approve no more than 50 illustrations at a time.");
  const configurationError = approvalConfigurationError();
  if (configurationError) throw new Error(configurationError);

  const outcomes: Array<{ id: string; status: "completed" | "failed"; appPr?: { url?: string; error?: string }; email?: { sent?: boolean; error?: string }; error?: string }> = [];
  const approved: Array<{ id: string; assetId: string; plant: CanonicalPlant }> = [];
  for (const jobId of uniqueIds) {
    try {
      const service = createSupabaseServiceClient();
      const { data: job, error: jobError } = await service
        .from("desk_plant_generation_jobs")
        .select("id, submission_id, status, requested_plant_name, botanical_name, canonical_name, canonical_aliases")
        .eq("id", jobId)
        .single();
      if (jobError || !job) throw new Error("Plant generation job not found.");
      if (job.status !== "awaiting_review") throw new Error("This illustration is no longer ready to approve.");
      const { data: candidate, error: candidateError } = await service
        .from("desk_generated_plant_assets")
        .select("id")
        .eq("job_id", jobId)
        .eq("status", "candidate")
        .order("attempt", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (candidateError || !candidate) throw new Error("No reviewable candidate was found.");
      const { data: submission, error: submissionError } = await service
        .from("desk_submissions")
        .select("person_id")
        .eq("id", job.submission_id)
        .single();
      if (submissionError || !submission) throw new Error("The original plant request could not be found.");
      const { data: requester, error: requesterError } = await service
        .from("desk_people")
        .select("email")
        .eq("id", submission.person_id)
        .single();
      if (requesterError || !requester?.email?.trim()) throw new Error("Add a requester email before approving this illustration.");

      const scientificName = job.canonical_name ?? job.botanical_name;
      if (!scientificName) throw new Error("Set the scientific name before approving this illustration.");
      const identity = await savePlantCanonicalIdentity(jobId, {
        canonicalName: scientificName,
        aliases: job.canonical_aliases?.length ? job.canonical_aliases : [job.requested_plant_name],
      }, actorId);
      await reviewPlantCandidate(jobId, candidate.id, "approve", actorId);
      approved.push({ id: jobId, assetId: candidate.id, plant: { name: identity.canonicalName, aliases: identity.aliases } });
    } catch (error) {
      outcomes.push({ id: jobId, status: "failed", error: error instanceof Error ? error.message : "Could not approve this illustration." });
    }
  }
  if (!approved.length) return outcomes;
  let batchUrl: string | undefined;
  let batchError: string | undefined;
  try {
    batchUrl = (await createAppIllustrationBatchPullRequest(approved.map((item) => ({ jobId: item.id, plant: item.plant })))).url;
  } catch (error) {
    batchError = error instanceof Error ? error.message : "Could not create the app pull request.";
  }
  for (const item of approved) {
    try {
      await sendApprovedPlantIllustration(item.id, actorId);
      const error = batchError;
      outcomes.push({ id: item.id, status: error ? "failed" : "completed", appPr: error ? { error } : { url: batchUrl }, email: { sent: true }, ...(error ? { error } : {}) });
    } catch (error) {
      const emailError = error instanceof Error ? error.message : "Could not send the requester email.";
      outcomes.push({ id: item.id, status: "failed", appPr: batchError ? { error: batchError } : { url: batchUrl }, email: { error: emailError }, error: batchError ?? emailError });
    }
  }
  return outcomes;
}
