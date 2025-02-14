import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
// export default defineConfig({
//   //   plugins: [react()],
// /
//   server: {
//     allowedHosts: ["e1r3p1.1337.ma", "localhost"],
//     // other configuration...
//   }
// });
