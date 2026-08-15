import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()]}),
  manifest: {
    name: 'Graze',
    description: 'Read websites in a minimal, customizable environment.',
    version: '0.1.0',
    permissions: [ 'storage', 'tabs' ],
    browser_specific_settings: {
      gecko:{
        data_collection_permissions: {
          required: ["none"]
        }
      }
    }
  }
});
