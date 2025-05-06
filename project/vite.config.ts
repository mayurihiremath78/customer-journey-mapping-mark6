// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//   },
//   build: {
//     outDir: 'dist',
//     minify: 'terser',
//     sourcemap: true,
//   },
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      REACT_APP_API_URL: 'http://localhost:5031'
    }
  }
});