import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // esbuild minification — fastest, smallest output
    minify: 'esbuild',
    cssMinify: true,
    // Inline assets < 4 KB as base64 (eliminates extra HTTP round-trips)
    assetsInlineLimit: 4096,
    // Show gzip-compressed sizes in build output
    reportCompressedSize: true,
    // Raise chunk warning threshold (our JS is intentionally one file per page)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        admin:   resolve(__dirname, 'admin.html'),
        about:   resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        courses: resolve(__dirname, 'courses.html'),
        enroll:  resolve(__dirname, 'enroll.html'),
        blog:    resolve(__dirname, 'blog.html'),
        signals: resolve(__dirname, 'signals.html'),
      },
      output: {
        // Content-hash filenames — enables immutable `Cache-Control` headers
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    open: false,
    // Warm up frequently accessed modules for faster HMR
    warmup: {
      clientFiles: ['./script.js', './supabase.js', './style.css'],
    },
  },
});
