import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("catalog", "routes/catalog.tsx"),
  route("catalog/:file", "routes/catalog-frame.tsx"),
] satisfies RouteConfig;
