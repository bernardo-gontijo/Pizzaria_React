// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- padrão recomendado pela documentação do Vitest
/// <reference types="vitest/config" />
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setupTests.ts"],
      css: true,
      execArgv: ["--no-experimental-webstorage", "--no-warnings"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*"],
      },
    },
  }),
);
