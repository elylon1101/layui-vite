import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
    base: './',
    plugins: [eslintPlugin({
        include: ['src/**/*.js']
    })],
    css: {
        devSourcemap: true
    },
    esbuild: {
        pure: ['console.log'],
        drop: ['debugger'],
    }
});
