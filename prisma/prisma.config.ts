import { defineConfig } from "@prisma/internals";

export default defineConfig({
  seed: "ts-node prisma/seed.ts",
});
