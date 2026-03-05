import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/auth.ts', 'src/events.ts', 'src/queue.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
});
