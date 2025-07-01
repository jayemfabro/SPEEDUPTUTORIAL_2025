import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                navy: {
                    50: '#f0f3f9',
                    100: '#d0d9e8',
                    200: '#a7b7d1',
                    300: '#7d94ba',
                    400: '#5371a3',
                    500: '#3a5787',
                    600: '#2a4370',
                    700: '#1a2f59',
                    800: '#0a1b42',
                    900: '#00072b',
                },
            },
        },
    },

    plugins: [forms],
};
