import { readDiscovery } from "../../../books/server/discovery-store";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await readDiscovery(),{headers:{"Cache-Control":"no-store"}});
}
