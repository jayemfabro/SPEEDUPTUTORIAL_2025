import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            // Configure preloading correctly
            buildDirectory: 'build',
            preload: [
                // Explicitly define which assets to preload and with what type
                { as: 'style', find: /\.css$/ },
                { as: 'script', find: /\.js$/ },
                // Don't preload resources that aren't used immediately
                { as: 'image', type: 'image/png', find: /\.png$/ },
            ],
        }),
        react(),
    ],
    build: {
        chunkSizeWarningLimit: 800, // Increase from default 500KB to 800KB
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Handle vendor dependencies - grouped more effectively
                    if (id.includes('node_modules')) {
                        // Core React - these are always needed right away
                        if (id.includes('react') || id.includes('react-dom') || 
                            id.includes('@inertiajs/react')) {
                            return 'vendor-core';
                        }
                        
                        // UI components that might be used across pages
                        if (id.includes('@headlessui') || 
                            id.includes('lucide-react') || 
                            id.includes('tailwind')) {
                            return 'vendor-ui-components';
                        }
                        
                        // Utilities
                        if (id.includes('axios') || id.includes('lodash')) {
                            return 'vendor-utils';
                        }
                        
                        // All other vendor code
                        return 'vendor-misc';
                    }
                    
                    // Admin components
                    if (id.includes('resources/js/Layouts/AdminLayout')) {
                        return 'admin-core';
                    }
                    if (id.includes('resources/js/Pages/Admin/AdminCalendar') || 
                        id.includes('resources/js/Pages/Admin/AdminDailyCalendar') ||
                        id.includes('resources/js/Components/Admin/Legend')) {
                        return 'admin-calendar';
                    }
                    if (id.includes('resources/js/Pages/Admin/Students') || 
                        id.includes('resources/js/Pages/Admin/Teachers')) {
                        return 'admin-users';
                    }
                    
                    // Teacher components
                    if (id.includes('resources/js/Layouts/TeachersLayout')) {
                        return 'teacher-core';
                    }
                    if (id.includes('resources/js/Pages/Teacher/TeacherCalendar') || 
                        id.includes('resources/js/Pages/Teacher/TeachersDailyCalendar')) {
                        return 'teacher-calendar';
                    }
                    
                    // Default: let Vite decide
                    return null;
                }
            }
        }
    },
});
