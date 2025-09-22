import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['src'] })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PoeApiSdk',
      // Filename is controlled by rollupOptions.output entries below
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      // Add a second entry for browser-only helpers
      input: {
        index: 'src/index.ts',
        'browser-auth': 'src/browser-auth.ts',
      },
      external: ['axios'],
      output: [
        {
          format: 'es',
          entryFileNames: `[name].mjs`,
          globals: { axios: 'axios' },
        },
        {
          format: 'cjs',
          entryFileNames: `[name].js`,
          globals: { axios: 'axios' },
        },
      ],
    },
  },
});
