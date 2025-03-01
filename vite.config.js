import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
            },
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith('.glb')) {
                        return 'models/[name][extname]'; // Сохраняет имена .glb файлов
                    }
                    return 'assets/[name]-[hash][extname]'; // Хэши для JS/CSS
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