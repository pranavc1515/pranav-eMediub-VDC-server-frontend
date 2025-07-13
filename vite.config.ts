import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load environment variables
    const proxyTarget =
        process.env.VITE_DEV_PROXY_TARGET || 'https://api.emedihub.com'
        // process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000'

    return {
        plugins: [react()],
        assetsInclude: ['**/*.md'],
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src'),
            },
        },
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom'],
        },
        server: {
            proxy: {
                '/api': {
                    target: proxyTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        build: {
            outDir: 'build',
            chunkSizeWarningLimit: 1500,
            sourcemap: false,
            minify: 'esbuild',
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: [
                            'react',
                            'react-dom',
                            'react-router-dom',
                            'framer-motion',
                            '@floating-ui/react',
                            'axios',
                            'dayjs',
                            'lodash',
                        ],
                    },
                },
            },
        },
    }
})
