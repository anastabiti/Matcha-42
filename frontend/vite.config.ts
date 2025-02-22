import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
  },
  
})
// export default defineConfig({
//   //   plugins: [react()],
// /
//   server: {
//     allowedHosts: ["e1r3p1.1337.ma", "localhost"],
//     // other configuration...
//   }
// });

/*    chunkSizeWarningLimit: 1600,
 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.*/