import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Function to get CSRF token
const getCsrfToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.content : null;
};

// Function to refresh CSRF token from server
const refreshCsrfToken = async () => {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            // Update the meta tag with the new token
            const metaTag = document.head.querySelector('meta[name="csrf-token"]');
            if (metaTag && data.csrf_token) {
                metaTag.setAttribute('content', data.csrf_token);
                return data.csrf_token;
            }
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
    return null;
};

// Set up CSRF token
const token = getCsrfToken();
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
} else {
    console.error('CSRF token not found');
}

// Add request interceptor to ensure CSRF token is always fresh
window.axios.interceptors.request.use(
    (config) => {
        const freshToken = getCsrfToken();
        if (freshToken) {
            config.headers['X-CSRF-TOKEN'] = freshToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle CSRF token mismatch
window.axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 419) {
            console.error('CSRF token mismatch detected');
            
            // Try to refresh the CSRF token and retry the request once
            if (!error.config._retry) {
                error.config._retry = true;
                
                try {
                    // Fetch a new CSRF token from the server
                    const freshToken = await refreshCsrfToken();
                    if (freshToken) {
                        // Update the request with the new token
                        error.config.headers['X-CSRF-TOKEN'] = freshToken;
                        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = freshToken;
                        
                        // Retry the request with the new token
                        return window.axios.request(error.config);
                    }
                } catch (refreshError) {
                    console.error('Error refreshing CSRF token:', refreshError);
                }
            }
            
            // If we're authenticated but got a CSRF error, try to refresh the page
            if (document.querySelector('meta[name="is-authenticated"]')?.content === 'true') {
                console.warn('Session may have expired. Attempting to refresh page in 3 seconds...');
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                console.error('Failed to refresh CSRF token, please refresh the page');
            }
        }
        return Promise.reject(error);
    }
);

// Disable WebSocket for now - use polling instead
// WebSocket configuration is commented out until server is set up
/*
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY || 'local',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
    wsHost: import.meta.env.VITE_PUSHER_HOST || `127.0.0.1`,
    wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
    wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
    forceTLS: false,
    encrypted: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': token ? token.content : '',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }
});
*/
