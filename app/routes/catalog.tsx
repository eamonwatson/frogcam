import { useState } from "react";
import { Link, data } from "react-router";
import type { Route } from "./+types/catalog";
import { getCatalogFrames } from "../camera.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "FrogCam Catalog" }];
}

export async function loader() {
  if (process.env.CATALOG !== "true") throw data(null, { status: 404 });
  return { frames: await getCatalogFrames() };
}

export default function Catalog({ loaderData }: Route.ComponentProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div
        className="w-full flex justify-center-safe overflow-x-auto"
        // sideways scroll
        onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
      >
        {loaderData.frames.map((file) => (
          <img
            key={file}
            src={`/catalog/${file}`}
            loading="lazy"
            className="h-48 cursor-pointer"
            onClick={() => setExpanded(file)}
          />
        ))}
      </div>
      <Link to="/" className="caption frogcam-button mt-2">Back</Link>
      {expanded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black" onClick={() => setExpanded(null)}>
          <img src={`/catalog/${expanded}`} className="max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
}
