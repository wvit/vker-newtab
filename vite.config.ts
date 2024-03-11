import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',

  publicDir: '../public',

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    reportCompressedSize: false,
    rollupOptions: {
      input: {
        'background/index': 'src/background/index.ts',
        'iframe/script': 'src/iframe/script.js',

        'newtab/index.html': 'src/newtab/index.html',
        'iframe/index.html': 'src/iframe/index.html',
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

  plugins: [
    react(),

    {
      name: 'rewrite-middleware',
      configureServer(serve) {
        serve.middlewares.use(async (req, res, next) => {
          await next()

          if (res.statusCode === 404) {
            /** 兼容 localhost/newtab/ 和 localhost/newtab/index.html 写法 */
            res.writeHead(302, {
              Location: path.join(req.url || '', 'index.html'),
            })

            res.end()
          }
        })
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 8000,
  },
})
