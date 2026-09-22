import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FrogCam" },
    { name: "description", content: "FrogCam webcam feed" },
  ];
}

export default function Home() {
  return <h1>FrogCam</h1>;
}
