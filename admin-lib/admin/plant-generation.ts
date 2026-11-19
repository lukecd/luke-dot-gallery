import "server-only";

import fs from "node:fs";
import path from "node:path";

import OpenAI, { toFile } from "openai";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

const MODEL = "gpt-image-1";
const BUCKET = "garden-desk-generated";

const CONTAINER_DESCRIPTIONS: Record<string, string> = {
  terracotta_pot: "growing in a weathered terracotta pot with visible dark potting soil, mineral staining on the clay rim, and a small irregular patch of sandy gravel beneath the pot",
  ground: "growing in garden soil with no pot — rooted in a small irregular patch of earth with visible soil texture and a few pebbles at the edges",
  hanging: "in a simple woven hanging basket with visible soil and trailing growth, small gravel patch suggested below",
  seed_tray: "as small seedlings in a wooden seed tray with moist dark potting soil, individual cotyledons visible",
};

function buildPrompt(name: string, container: string) {
  const containerDescription = CONTAINER_DESCRIPTIONS[container] ?? CONTAINER_DESCRIPTIONS.terracotta_pot;
  return [
    "Use the attached reference illustration ONLY for art style, rendering technique, level of botanical detail, terracotta pot treatment, soil and gravel ground patch, lighting, and transparent-background composition.",
    "Do NOT copy the plant species from the reference.",
    `Instead paint the same series-quality illustration of: ${name}, ${containerDescription}.`,
    "The result must look like the next plate in the same illustrated plant library as the reference — equally rich in detail, with the same weathered pot, gravel base, soil visibility, and watercolor depth. Only the plant species changes.",
    "The canvas outside the plant, pot, and small gravel patch must be genuinely empty transparent pixels. Do not add any vignette, colored wash, atmospheric background, glow, halo, diffuse shadow, scenery, or backdrop.",
  ].join("\n\n");
}

function referencePath() {
  return path.join(process.cwd(), "src", "lib", "plant-illustrations", "rosemary.png");
}

export async function generatePlantCandidate(jobId: string, actorId: string | null = null) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, requested_plant_name, botanical_name, container, status")
    .eq("id", jobId)
    .single();
  if (jobError || !job) throw new Error("Plant generation job not found.");
  if (job.status !== "generating") throw new Error("This plant job has not been claimed for generation.");

  const { data: attempts, error: attemptsError } = await service
    .from("desk_generated_plant_assets")
    .select("attempt")
    .eq("job_id", jobId)
    .order("attempt", { ascending: false })
    .limit(1);
  if (attemptsError) throw new Error("Could not inspect previous generations.");
  const attempt = (attempts?.[0]?.attempt ?? 0) + 1;
  const prompt = buildPrompt(job.botanical_name?.trim() || job.requested_plant_name, job.container);

  await service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "generation_started", details: { attempt, model: MODEL } });

  try {
    const file = await toFile(fs.createReadStream(referencePath()), "rosemary.png", { type: "image/png" });
    const client = new OpenAI({ apiKey, timeout: 180_000, maxRetries: 1 });
    const response = await client.images.edit({
      model: MODEL,
      image: file,
      prompt,
      size: "1024x1024",
      quality: "high",
      background: "transparent",
      input_fidelity: "high",
    });
    const encoded = response.data?.[0]?.b64_json;
    if (!encoded) throw new Error("OpenAI returned no image data.");
    const image = Buffer.from(encoded, "base64");
    const storagePath = `${jobId}/attempt-${attempt}.png`;
    const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, image, { contentType: "image/png", upsert: false });
    if (uploadError) throw new Error("Could not store the generated illustration.");

    const { data: asset, error: assetError } = await service
      .from("desk_generated_plant_assets")
      .insert({ job_id: jobId, attempt, prompt, model: MODEL, bucket_id: BUCKET, storage_path: storagePath, byte_size: image.byteLength })
      .select("id")
      .single();
    if (assetError || !asset) {
      await service.storage.from(BUCKET).remove([storagePath]);
      throw new Error("Could not record the generated illustration.");
    }

    const now = new Date().toISOString();
    await Promise.all([
      service.from("desk_plant_generation_jobs").update({ status: "awaiting_review", generated_at: now, generation_started_at: null }).eq("id", jobId),
      service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "generation_completed", details: { attempt, asset_id: asset.id, model: MODEL, style_reference: "rosemary-v1" } }),
    ]);
    return { assetId: asset.id, attempt };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plant generation failed.";
    await Promise.all([
      service.from("desk_plant_generation_jobs").update({ status: "failed", last_error: message, generation_started_at: null }).eq("id", jobId),
      service.from("desk_activity_log").insert({ actor_id: actorId, entity_type: "plant_generation_job", entity_id: jobId, action: "generation_failed", details: { attempt, error: message } }),
    ]);
    throw error;
  }
}
