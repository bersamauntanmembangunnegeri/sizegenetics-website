import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sizegenetics.com',
  integrations: [
    tailwind(),
    react(),
    sitemap({
      customPages: [
        'https://sizegenetics.com/products/sizegenetics-device',
        'https://sizegenetics.com/how-it-works',
        'https://sizegenetics.com/clinical-studies',
        'https://sizegenetics.com/testimonials',
        'https://sizegenetics.com/support',
        'https://sizegenetics.com/faq'
      ]
    })
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }
});

