import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import seed from "../data/discovery.json";
import type { DiscoverySnapshot } from "../discovery";

const blobPath = "books/discovery.json";
const localPath = path.join(process.cwd(),".cache/books/discovery.json");
export async function readDiscovery(strict = false): Promise<DiscoverySnapshot> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await get(blobPath,{access:"private",useCache:false});
      if (result?.statusCode === 200) return await new Response(result.stream).json();
    } else if (!process.env.VERCEL) {
      return JSON.parse(await readFile(localPath,"utf8"));
    }
  } catch (error) {
    if (strict && !(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
  return seed as DiscoverySnapshot;
}
export async function writeDiscovery(data: DiscoverySnapshot) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobPath,JSON.stringify(data),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
  } else {
    if (process.env.VERCEL) throw new Error("Configure private Blob storage before enabling scheduled refreshes.");
    await mkdir(path.dirname(localPath),{recursive:true});
    const temporary = `${localPath}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary,JSON.stringify(data));
    await rename(temporary,localPath);
  }
}
