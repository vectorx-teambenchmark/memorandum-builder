import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5'

// https://vitejs.dev/config/
export default defineConfig(({command, mode})=>{
  console.log('Command: %s',command);
  console.log('Mode: %s',mode);
  const require = createRequire( import.meta.url );
  return {
    plugins: [
      vue(),
      ckeditor5( {theme: require.resolve( '@ckeditor/ckeditor5-theme-lark')})
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
});
