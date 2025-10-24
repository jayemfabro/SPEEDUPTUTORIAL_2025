import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
    react(),
    ],
    build: {
        // Keep default warning but split large vendor chunks into smaller groups
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id) return null;

                    // Put core libs into a small core vendor chunk
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('@inertiajs')) {
                            return 'vendor-core';
                        }

                        // UI libs
                        if (id.includes('@headlessui') || id.includes('headlessui') || id.includes('lucide-react') || id.includes('clsx')) {
                            return 'vendor-ui';
                        }

                        // Utilities
                        if (id.includes('axios') || id.includes('lodash') || id.includes('dayjs')) {
                            return 'vendor-utils';
                        }

                        // default vendor split
                        return 'vendor-misc';
                    }

                    // Group app-specific large areas (Layouts / Pages) to separate chunks
                    if (id.includes('resources/js/Layouts/AdminLayout')) {
                        return 'admin-core';
                    }
                    if (id.includes('resources/js/Pages/Admin')) {
                        return 'admin-pages';
                    }
                    if (id.includes('resources/js/Layouts/TeachersLayout')) {
                        return 'teacher-core';
                    }
                    if (id.includes('resources/js/Pages/Teacher')) {
                        return 'teacher-pages';
                    }

                    return null;
                }
            }
        }
    },
});
