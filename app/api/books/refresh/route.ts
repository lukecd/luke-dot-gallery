import { timingSafeEqual } from "node:crypto";
import { books } from "../../../books/collection";
import { refreshDiscovery } from "../../../books/discovery";
import { readDiscovery, writeDiscovery } from "../../../books/server/discovery-store";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({error:"Refresh is not configured"},{status:503});
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual,expected)) return Response.json({error:"Unauthorized"},{status:401});
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) return Response.json({error:"Discovery storage is not configured"},{status:503});
  try {
    const previous = await readDiscovery(true);
    const next = await refreshDiscovery(books,previous);
    await writeDiscovery(next);
    return Response.json({ok:true,updatedAt:next.updatedAt,checkedAuthors:Object.values(next.checks).filter(c=>c.checkedAt).length,candidates:next.candidates.length});
  } catch {
    return Response.json({error:"Refresh failed; previous recommendations retained"},{status:502});
  }
}
