import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/juggling-game/',
    build: {
        minify: true,
        rollupOptions: {
            input: {
                main: 'index.html',
            },
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.glb')) {
                        return 'models/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
    copy: [
        {
            src: 'models',
            dest: 'models',
        },
    ],
});