import https from "node:https";
const REFRESH = process.env.REFRESH_TIME ? Number(process.env.REFRESH_TIME) * 1000 : 20_000;

let latest: string | null = null;

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
    latest = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("frogphone camera fetch failed:", error);
  }
}

refresh();
const interval = setInterval(refresh, REFRESH);

if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(interval));
}

export function getLatestFrame() {
  return latest;
}
