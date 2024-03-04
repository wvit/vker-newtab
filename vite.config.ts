import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'newtab/index': 'src/newtab/index.tsx',
        'background/index': 'src/background/index.ts',

        'newtab/index.css': 'src/newtab/index.less',
        'newtab/index.html': 'src/newtab/index.html',
      },
      output: {
        entryFileNames: `[name].js`,

        assetFileNames: ({ name }: any) => {
          if (name.split('/').length > 1) {
            return `[name].[ext]`
          } else {
            return `assets/${name}`
          }
        },
      },
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
