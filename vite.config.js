import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        admin:     resolve(__dirname, 'admin.html'),
        about:     resolve(__dirname, 'about.html'),
        contact:   resolve(__dirname, 'contact.html'),
        courses:   resolve(__dirname, 'courses.html'),
        enroll:    resolve(__dirname, 'enroll.html'),
        blog:      resolve(__dirname, 'blog.html'),
        signals:   resolve(__dirname, 'signals.html'),
      },
    },
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    open: false,
  },
});
