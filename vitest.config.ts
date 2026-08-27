/// <reference types="vitest/config" />
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setupTests.ts'],
      css: true,
      // Node 24+ expõe um localStorage global experimental que conflita
      // com o localStorage fornecido pelo ambiente jsdom, quebrando testes
      // que usam localStorage.clear()/setItem(). Desabilitamos esse recurso
      // nativo do Node apenas durante os testes.
      execArgv: ['--no-experimental-webstorage', '--no-warnings'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
        ],
      },
    },
  }),
)