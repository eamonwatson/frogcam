import { useEffect } from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types/home";
import { getLatestFrame } from "../camera.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FrogCam" },
    { name: "description", content: "FrogCam webcam feed" },
  ];
}

export function loader() {
  return { image: getLatestFrame() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => revalidator.revalidate(), 20_000);
    return () => clearInterval(interval);
  }, [revalidator]);

  if (!loaderData.image) return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
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
            <td>FrogCam</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
