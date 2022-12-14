import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/index.ts"],
  format: "esm",
  platform: "node",
  target: "node14",
  clean: true,
  dts: true,
  external: [/node_modules/],
});
