import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  // Polling also detects newly added demos on Windows-mounted WSL workspaces.
  server: { watch: { usePolling: true, interval: 500 } },
});
