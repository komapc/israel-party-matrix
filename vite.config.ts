import { defineConfig } from 'vite';

// Served from the domain root (elections-2026.lipu.dev); pages live at nested paths like /ru/map/…
export default defineConfig({
  base: '/',
});
