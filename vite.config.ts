import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('jszip')) {
              return 'vendor-jszip';
            }
            if (id.includes('html2canvas')) {
              return 'vendor-html2canvas';
            }
            if (id.includes('dompurify')) {
              return 'vendor-dompurify';
            }
            if (id.includes('jsbarcode')) {
              return 'vendor-jsbarcode';
            }
            if (id.includes('@zxing')) {
              return 'vendor-zxing';
            }
          }
        }
      }
    }
  }
});
