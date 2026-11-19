import "server-only";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { buildIllustrationAssetPayload } from "@/admin-lib/admin/app-illustration-assets";

const APP_REPOSITORY = process.env.SOW_APP_GITHUB_REPOSITORY?.trim() || "lukecd/sow.garden-app";
const APP_BASE_BRANCH = process.env.SOW_APP_GITHUB_BASE_BRANCH?.trim() || "main";

type GitHubContent = { content: string; sha: string };
type GitHubRef = { object?: { sha?: string } };
type PullRequest = { html_url?: string; number?: number; state?: string };
type HandoffBatch = { id: string; branch: string | null; pr_url: string | null; pr_number: number | null };

function githubToken() {
  const token = process.env.SOW_APP_GITHUB_TOKEN?.trim();
  if (!token) throw new Error("SOW_APP_GITHUB_TOKEN is not configured.");
  return token;
}

function githubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function github<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => null) as T & { message?: string } | null;
  if (!response.ok) throw new Error(data?.message ?? `GitHub rejected the app handoff (${response.status}).`);
  return data as T;
}

function normalizedAlias(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function keyFor(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function assetNameFor(key: string) {
  return key.split("-").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

function decodeContent(content: string) {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

function patchDefaultImageLibrary(source: string, key: string, assetName: string, aliases: string[]) {
  const expectedAsset = `"${key}": "Plants/${assetName}"`;
  if (source.includes(`"${key}":`) && !source.includes(expectedAsset)) {
    throw new Error(`The app already has an illustration key named ${key}.`);
  }
  const missingAliases = aliases.filter((alias) => !source.includes(`("${alias}", "${key}")`));
  const aliasRows = missingAliases.map((alias) => `        ("${alias}", "${key}"),`).join("\n");
  const aliasesNeedle = "private static let plantNameAliases: [(String, String)] = [\n";
  const assetNeedle = "private static let assetMap: [String: String] = [\n";
  if (!source.includes(aliasesNeedle) || !source.includes(assetNeedle)) {
    throw new Error("The app illustration mapping file has changed and needs a handoff adapter update.");
  }
  const withAliases = aliasRows ? source.replace(aliasesNeedle, `${aliasesNeedle}${aliasRows}\n`) : source;
  if (withAliases.includes(expectedAsset)) return withAliases === source ? null : withAliases;
  return withAliases.replace(assetNeedle, `${assetNeedle}        "${key}": "Plants/${assetName}",\n`);
}

async function readRepositoryFile(path: string, ref: string) {
  return github<GitHubContent>(`/repos/${APP_REPOSITORY}/contents/${githubPath(path)}?ref=${encodeURIComponent(ref)}`);
}

async function putRepositoryFile(path: string, branch: string, message: string, content: Buffer | string, sha?: string) {
  await github(`/repos/${APP_REPOSITORY}/contents/${githubPath(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch, content: Buffer.from(content).toString("base64"), ...(sha ? { sha } : {}) }),
  });
}

async function repositoryFileSha(path: string, branch: string) {
  try {
    return (await readRepositoryFile(path, branch)).sha;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Not Found")) return undefined;
    throw error;
  }
}

async function ensureBranch(branch: string) {
  try {
    await github<GitHubRef>(`/repos/${APP_REPOSITORY}/git/ref/heads/${encodeURIComponent(branch)}`);
    return;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Not Found")) throw error;
  }
  const base = await github<GitHubRef>(`/repos/${APP_REPOSITORY}/git/ref/heads/${encodeURIComponent(APP_BASE_BRANCH)}`);
  const sha = base.object?.sha;
  if (!sha) throw new Error("Could not find the app repository base branch.");
  await github(`/repos/${APP_REPOSITORY}/git/refs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }) });
}

async function openOrFindPullRequest(branch: string, canonicalName: string, jobId: string, aliases: string[], completeTitle = false) {
  try {
    return await github<PullRequest>(`/repos/${APP_REPOSITORY}/pulls`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: completeTitle ? canonicalName : `Add ${canonicalName} illustration`, head: branch, base: APP_BASE_BRANCH, body: `Generated from Garden Desk request ${jobId}.\n\nAliases: ${aliases.join(", ")}.` }) });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("Validation Failed")) throw error;
    const owner = APP_REPOSITORY.split("/")[0];
    const existing = await github<PullRequest[]>(`/repos/${APP_REPOSITORY}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`);
    if (existing[0]?.html_url && existing[0]?.number) return existing[0];
    throw error;
  }
}

async function findOpenAppHandoffBatch(): Promise<HandoffBatch | null> {
  const service = createSupabaseServiceClient();
  const { data: batches, error } = await service
    .from("desk_plant_app_handoff_batches")
    .select("id, branch, pr_url, pr_number")
    .eq("status", "ready")
    .not("pr_number", "is", null)
    .order("pr_created_at", { ascending: false });
  if (error) throw new Error("Could not check for an open app handoff.");

  for (const batch of batches ?? []) {
    if (!batch.branch || !batch.pr_number) continue;
    const pullRequest = await github<PullRequest>(`/repos/${APP_REPOSITORY}/pulls/${batch.pr_number}`);
    if (pullRequest.state === "open") return batch;
  }
  return null;
}

async function putIllustrationAssets(assetName: string, master: Buffer, branch: string, canonicalName: string) {
  const assets = await buildIllustrationAssetPayload(assetName, master);
  const message = `Add ${canonicalName} illustration`;
  await putRepositoryFile(
    `${assets.archiveDirectory}/${assets.fileName}`,
    branch,
    message,
    assets.master,
    await repositoryFileSha(`${assets.archiveDirectory}/${assets.fileName}`, branch),
  );
  await putRepositoryFile(
    `${assets.archiveDirectory}/Contents.json`,
    branch,
    `Add ${canonicalName} archival image set`,
    assets.contents,
    await repositoryFileSha(`${assets.archiveDirectory}/Contents.json`, branch),
  );
  await putRepositoryFile(
    `${assets.appAssetDirectory}/${assets.fileName}`,
    branch,
    message,
    assets.delivery,
    await repositoryFileSha(`${assets.appAssetDirectory}/${assets.fileName}`, branch),
  );
  await putRepositoryFile(
    `${assets.appAssetDirectory}/Contents.json`,
    branch,
    `Add ${canonicalName} image set`,
    assets.contents,
    await repositoryFileSha(`${assets.appAssetDirectory}/Contents.json`, branch),
  );
}

export type CanonicalPlant = { name: string; aliases: string[] };
export type AppIllustrationBatchItem = { jobId: string; plant: CanonicalPlant };

export async function createAppIllustrationBatchPullRequest(items: AppIllustrationBatchItem[]) {
  if (!items.length) throw new Error("Choose at least one approved illustration for the app handoff.");
  const service = createSupabaseServiceClient();
  const jobIds = [...new Set(items.map((item) => item.jobId))];
  let batchId: string | undefined;
  let branch: string | undefined;
  try {
    const { data: existingJobs, error: jobsError } = await service
      .from("desk_plant_generation_jobs")
      .select("id, requested_plant_name, approved_asset_id, canonical_name, canonical_key, canonical_aliases, app_handoff_batch_id")
      .in("id", jobIds);
    if (jobsError || existingJobs?.length !== jobIds.length) throw new Error("One or more approved illustrations could not be found.");

    const existingBatchId = existingJobs.find((job) => job.app_handoff_batch_id)?.app_handoff_batch_id;
    const openBatch = existingBatchId ? null : await findOpenAppHandoffBatch();
    const { data: batch, error: batchError } = existingBatchId
      ? await service.from("desk_plant_app_handoff_batches").select("id, branch, pr_url, pr_number").eq("id", existingBatchId).single()
      : openBatch
        ? { data: openBatch, error: null }
        : await service.from("desk_plant_app_handoff_batches").insert({ job_count: jobIds.length, status: "creating" }).select("id, branch, pr_url, pr_number").single();
    if (batchError || !batch) throw new Error("Could not start the app handoff batch.");
    const handoffBatchId = batch.id;
    batchId = handoffBatchId;
    const hasNewJobs = existingJobs.some((job) => job.app_handoff_batch_id !== handoffBatchId);
    if (batch.pr_url && !hasNewJobs) return { url: batch.pr_url, created: false, batchId: handoffBatchId };

    const handoffBranch = batch.branch || `garden-desk/batch-${handoffBatchId.slice(0, 8)}`;
    branch = handoffBranch;
    await ensureBranch(handoffBranch);
    const [{ error: batchUpdateError }, { error: jobsUpdateError }] = await Promise.all([
      service.from("desk_plant_app_handoff_batches").update({ branch: handoffBranch, status: "creating", last_error: null }).eq("id", handoffBatchId),
      service.from("desk_plant_generation_jobs").update({ app_handoff_batch_id: handoffBatchId, app_pr_branch: handoffBranch, app_pr_error: null }).in("id", jobIds),
    ]);
    if (batchUpdateError || jobsUpdateError) throw new Error("Could not record the app handoff attempt.");

    const mappingPath = "Sow/Services/DefaultImageLibrary.swift";
    const mapping = await readRepositoryFile(mappingPath, handoffBranch);
    let mappingSource = decodeContent(mapping.content);
    const names: string[] = [];
    for (const item of items) {
      const job = existingJobs.find((row) => row.id === item.jobId);
      if (!job?.approved_asset_id) throw new Error("Approve every selected candidate before creating the app PR.");
      const canonicalName = item.plant.name.trim();
      const canonicalKey = keyFor(canonicalName);
      if (!canonicalName || !canonicalKey) throw new Error("Every selected illustration needs a scientific name.");
      const aliases = [...new Set([canonicalName, ...item.plant.aliases].map(normalizedAlias).filter(Boolean))];
      const { data: asset, error: assetError } = await service.from("desk_generated_plant_assets").select("storage_path, bucket_id").eq("id", job.approved_asset_id).single();
      if (assetError || !asset) throw new Error("An approved image could not be retrieved for the app handoff.");
      const assetName = assetNameFor(canonicalKey);
      const updatedMapping = patchDefaultImageLibrary(mappingSource, canonicalKey, assetName, [...new Set([normalizedAlias(job.requested_plant_name), ...aliases])]);
      if (updatedMapping) mappingSource = updatedMapping;
      const { data: image, error: imageError } = await service.storage.from(asset.bucket_id).download(asset.storage_path);
      if (imageError || !image) throw new Error("Could not retrieve an approved image for the app handoff.");
      await putIllustrationAssets(assetName, Buffer.from(await image.arrayBuffer()), handoffBranch, canonicalName);
      const { error: jobUpdateError } = await service.from("desk_plant_generation_jobs").update({ app_asset_name: assetName, canonical_name: canonicalName, canonical_key: canonicalKey, canonical_aliases: aliases }).eq("id", job.id);
      if (jobUpdateError) throw new Error("Could not save the app illustration details.");
      names.push(canonicalName);
    }
    if (mappingSource !== decodeContent(mapping.content)) await putRepositoryFile(mappingPath, handoffBranch, "Map approved plant illustrations", mappingSource, mapping.sha);
    const pr = await openOrFindPullRequest(handoffBranch, `Add ${names.length} plant illustrations`, handoffBatchId, names, true);
    if (!pr.html_url || !pr.number) throw new Error("GitHub did not return the app pull request.");
    const now = new Date().toISOString();
    const [{ error: batchCompleteError }, { error: jobsCompleteError }] = await Promise.all([
      service.from("desk_plant_app_handoff_batches").update({ status: "ready", pr_url: pr.html_url, pr_number: pr.number, pr_created_at: now, last_error: null }).eq("id", handoffBatchId),
      service.from("desk_plant_generation_jobs").update({ app_pr_url: pr.html_url, app_pr_number: pr.number, app_pr_created_at: now, app_pr_error: null }).in("id", jobIds),
    ]);
    if (batchCompleteError || jobsCompleteError) throw new Error("The app pull request was created, but its handoff record could not be saved.");
    return { url: pr.html_url, created: true, batchId: handoffBatchId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the app pull request.";
    const [{ error: batchPersistenceError }, { error: jobsPersistenceError }] = await Promise.all([
      batchId
        ? service.from("desk_plant_app_handoff_batches").update({ status: "failed", branch, last_error: message }).eq("id", batchId)
        : Promise.resolve({ error: null }),
      service.from("desk_plant_generation_jobs").update({ app_pr_error: message, ...(branch ? { app_pr_branch: branch } : {}) }).in("id", jobIds),
    ]);
    if (batchPersistenceError || jobsPersistenceError) {
      throw new Error(`${message} The handoff error could not be saved; please check Supabase permissions.`);
    }
    throw error;
  }
}

export async function createAppIllustrationPullRequest(jobId: string, plant: CanonicalPlant) {
  const canonicalName = plant.name.trim();
  const canonicalKey = keyFor(canonicalName);
  if (!canonicalName || !canonicalKey) throw new Error("Add a scientific or canonical plant name before approving.");
  const aliases = [...new Set([canonicalName, ...plant.aliases].map(normalizedAlias).filter(Boolean))];
  if (aliases.length === 0) throw new Error("Add at least one recognizable plant name.");

  const service = createSupabaseServiceClient();
  const { data: job, error: jobError } = await service
    .from("desk_plant_generation_jobs")
    .select("id, requested_plant_name, approved_asset_id, app_pr_url, app_pr_branch")
    .eq("id", jobId)
    .single();
  if (jobError || !job?.approved_asset_id) throw new Error("Approve a candidate before creating its app PR.");
  if (job.app_pr_url) return { url: job.app_pr_url, created: false };
  const { data: asset, error: assetError } = await service
    .from("desk_generated_plant_assets")
    .select("storage_path, bucket_id")
    .eq("id", job.approved_asset_id)
    .single();
  if (assetError || !asset) throw new Error("The approved image could not be found.");

  const assetName = assetNameFor(canonicalKey);
  const branch = job.app_pr_branch || `garden-desk/${canonicalKey}-${job.id.slice(0, 8)}`;
  try {
    await ensureBranch(branch);
    await service.from("desk_plant_generation_jobs").update({ canonical_name: canonicalName, canonical_key: canonicalKey, canonical_aliases: aliases, app_asset_name: assetName, app_pr_branch: branch, app_pr_error: null }).eq("id", jobId);

    const { data: image, error: imageError } = await service.storage.from(asset.bucket_id).download(asset.storage_path);
    if (imageError || !image) throw new Error("Could not retrieve the approved image for the app handoff.");
    const mappingPath = "Sow/Services/DefaultImageLibrary.swift";
    const mapping = await readRepositoryFile(mappingPath, branch);
    const updatedMapping = patchDefaultImageLibrary(decodeContent(mapping.content), canonicalKey, assetName, [...new Set([normalizedAlias(job.requested_plant_name), ...aliases])]);
    await putIllustrationAssets(assetName, Buffer.from(await image.arrayBuffer()), branch, canonicalName);
    if (updatedMapping) await putRepositoryFile(mappingPath, branch, `Map ${canonicalName} illustration`, updatedMapping, mapping.sha);

    const pr = await openOrFindPullRequest(branch, canonicalName, job.id, aliases);
    if (!pr.html_url || !pr.number) throw new Error("GitHub did not return the new pull request.");
    await service.from("desk_plant_generation_jobs").update({ app_pr_url: pr.html_url, app_pr_number: pr.number, app_pr_created_at: new Date().toISOString(), app_pr_error: null }).eq("id", jobId);
    return { url: pr.html_url, created: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the app pull request.";
    await service.from("desk_plant_generation_jobs").update({ app_pr_error: message, app_pr_branch: branch }).eq("id", jobId);
    throw error;
  }
}
