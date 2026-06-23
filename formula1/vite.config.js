import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';

const routes = [
  { path: '/',           changefreq: 'daily',   priority: 1.0 },
  { path: '/drivers',    changefreq: 'weekly',  priority: 0.9 },
  { path: '/races',      changefreq: 'weekly',  priority: 0.9 },
  { path: '/qualifying', changefreq: 'weekly',  priority: 0.8 },
  { path: '/sprints',    changefreq: 'weekly',  priority: 0.8 },
  { path: '/pratices',   changefreq: 'weekly',  priority: 0.7 },
  { path: '/chat',       changefreq: 'always',  priority: 0.6 },
  { path: '/contact',    changefreq: 'monthly', priority: 0.5 },
];

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://formula1-statistics.vercel.app',
      routes: routes.map(r => r.path),
      outDir: './dist',
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
