import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ¡IMPORTANTE! Asegúrate de que '/proyectos-control-x/' coincida con el nombre de tu repositorio en GitHub.
  base: '/proyectos-control-x/', 
});