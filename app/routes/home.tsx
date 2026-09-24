import { useEffect, useState } from "react";
import { Link, useRevalidator } from "react-router";
import type { Route } from "./+types/home";
import { getLatestFrame } from "../camera.server";
import { version } from "../../package.json";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FrogCam" },
    { name: "description", content: "FrogCam webcam feed" },
  ];
}

export function loader() {
  return { ...getLatestFrame(), catalog: process.env.CATALOG === "true" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();
  const [refresh, setRefresh] = useState(Math.ceil(loaderData.next / 1000));

  useEffect(() => {
    const end = Date.now() + loaderData.next;
    setRefresh(Math.ceil(loaderData.next / 1000));
    const timeout = setTimeout(() => revalidator.revalidate(), loaderData.next);
    const countdown = setInterval(() => setRefresh(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(countdown);
    };
  }, [loaderData, revalidator]);

  if (!loaderData.image) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <table
        bgColor="#DDDDDD"
        cellPadding={0}
        cellSpacing={2}
        width={640}
        className="frogcam-frame"
      >
        <tbody>
          <tr>
            <td>
              <img src={loaderData.image} width={640} />
            </td>
          </tr>
          <tr className="caption">
            <td>FrogCam - Refreshes in {refresh}s</td>
          </tr>
        </tbody>
      </table>
      <p className="caption">version {version}</p>
      {loaderData.catalog && <Link to="/catalog" className="caption frogcam-button">Catalog</Link>}
    </div>
  );
}
