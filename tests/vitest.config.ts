// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    isolate: false,
    mockReset: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
