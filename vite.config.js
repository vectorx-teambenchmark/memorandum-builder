import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({command, mode})=>{
  console.log('Command: %s',command);
  console.log('Mode: %s',mode);

  // Load env vars so we can use VITE_SALESFORCE_AUTH_URL in the proxy config
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        // Proxy the Salesforce OAuth token exchange during development.
        // The browser sends POST /oauth2/token to the Vite dev server,
        // which forwards it to the Salesforce token endpoint.
        '/oauth2/token': {
          target: env.VITE_SALESFORCE_AUTH_URL
            ? env.VITE_SALESFORCE_AUTH_URL.replace('/services/oauth2/authorize', '')
            : 'https://login.salesforce.com',
          changeOrigin: true,
          rewrite: (path) => '/services/oauth2/token'
        }
      }
    }
  }
});
