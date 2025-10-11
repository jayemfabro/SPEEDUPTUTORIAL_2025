import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Determine if we should eagerly load certain page groups
        const isAdminPage = name.startsWith('Admin/');
        const isTeacherPage = name.startsWith('Teacher/');
        
        // For admin calendar pages, eagerly import related components
        if (name === 'Admin/AdminDailyCalendar' || name === 'Admin/AdminCalendar') {
            // Use Promise.all for better handling of imports
            Promise.all([
                import('./Layouts/AdminLayout.jsx'),
                import('./Components/Admin/Legend.jsx')
            ]).catch(e => console.error('Failed to preload admin components:', e));
        }
        
        // Eagerly load profile components when on profile pages
        if (name.startsWith('Profile/')) {
            Promise.all([
                import('./Pages/Profile/Partials/UpdateProfileInformationForm.jsx'),
                import('./Pages/Profile/Partials/UpdatePasswordForm.jsx')
            ]).catch(e => console.error('Failed to preload profile components:', e));
        }
        
        return resolvePageComponent(
            `./Pages/${name}.jsx`,
            // Use dynamic imports for better code splitting
            import.meta.glob('./Pages/**/*.jsx', { eager: false }),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
