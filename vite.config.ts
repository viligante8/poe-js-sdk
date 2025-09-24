import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['src'] })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PoeApiSdk',
      // Filename is controlled by rollupOptions.output entries below
      // Ensure CJS builds use .cjs to avoid ESM detection when package has type: module
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
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
          // Use .cjs so Node treats these as CommonJS when the package root is ESM
          entryFileNames: `[name].cjs`,
          globals: { axios: 'axios' },
        },
      ],
    },
  },
});
