/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ManifestV3Export } from '@crxjs/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, BuildOptions } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'
import { stripDevIcons, crxI18n } from './custom-vite-plugins';
import manifest from './manifest.json';
import devManifest from './manifest.dev.json';
import pkg from './package.json';
import { playwright } from '@vitest/browser-playwright'

const isDev = process.env.__DEV__ === 'true';
// set this flag to true, if you want localization support
const localize = false;

export const baseManifest = {
    ...manifest,
    version: pkg.version,
    ...(isDev ? devManifest : {} as ManifestV3Export),
    ...(localize ? {
      name: '__MSG_extName__',
      description: '__MSG_extDescription__',
      default_locale : 'en'
    } : {})
} as ManifestV3Export

export const baseBuildOptions: BuildOptions = {
  sourcemap: isDev,
  emptyOutDir: true,
  rollupOptions: {
    input: {"main":resolve("src/pages/", "main", "index.html")},
    output: {entryFileNames: (chunk)=>`src/pages/${chunk.name}/index.js`}
  }
}

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    react(),
    stripDevIcons(isDev),
    crxI18n({ localize, src: './src/locales' }),
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'firefox' },
      ],
    },
  }
});
