import https from "node:https";
import fs from "node:fs/promises";
import path from "node:path";
const REFRESH = process.env.REFRESH_TIME ? Number(process.env.REFRESH_TIME) * 1000 : 20_000;

const CATALOG = process.env.CATALOG === "true";
const CATALOG_DIR = path.resolve(process.env.CATALOG_STORAGE || "catalog");

const state: { latest: string | null; interval?: NodeJS.Timeout } = ((globalThis as any).frogcam ??= { latest: null });
clearInterval(state.interval);

function fetchFrame(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https
      .get(`https://${process.env.FROGPHONE}:8080/camera`, { rejectUnauthorized: false }, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function refresh() {
  try {
    const buffer = await fetchFrame();
    state.latest = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    if (CATALOG) await store(buffer);
  } catch (error) {
    console.error("frogphone camera fetch failed:", error);
  }
}

async function store(buffer: Buffer) {
  const now = Date.now();
  await fs.mkdir(CATALOG_DIR, { recursive: true });
  await fs.writeFile(path.join(CATALOG_DIR, `${now}.jpg`), buffer);
  for (const file of await fs.readdir(CATALOG_DIR)) {
    if (now - Number.parseInt(file) > 12 * 60 * 60 * 1000) await fs.unlink(path.join(CATALOG_DIR, file));
  }
}

if (!state.latest) refresh();
state.interval = setInterval(refresh, REFRESH);

export function getLatestFrame() {
  return state.latest;
}

export async function getCatalogFrames() {
  const files = await fs.readdir(CATALOG_DIR).catch(() => []);
  return files.filter((file) => /^\d+\.jpg$/.test(file)).sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
}

export async function readCatalogFrame(file: string) {
  if (!/^\d+\.jpg$/.test(file)) return null;
  return fs.readFile(path.join(CATALOG_DIR, file)).catch(() => null);
}
