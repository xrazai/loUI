import optimizeLocales from '@react-aria/optimize-locales-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// React Aria ships translated strings for 30+ locales; keep only the ones the app supports
// (see docs/guides/bundle-size.md in the design system).
export default defineConfig({
  plugins: [{ ...optimizeLocales.vite({ locales: ['en-US', 'pt-BR'] }), enforce: 'pre' }, react()],
});
