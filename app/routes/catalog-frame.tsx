import type { Route } from "./+types/catalog-frame";
import { readCatalogFrame } from "../camera.server";

export async function loader({ params }: Route.LoaderArgs) {
  const frame = process.env.CATALOG === "true" ? await readCatalogFrame(params.file) : null;
  if (!frame) return new Response(null, { status: 404 });
  return new Response(frame, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=43200, immutable" },
  });
}
