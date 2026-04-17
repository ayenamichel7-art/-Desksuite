import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-ignore
window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'desksuite-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // On passe le token Sanctum pour les channels privés
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('desksuite_token')}`,
            Accept: 'application/json',
        },
    },
    authorizer: (channel: { name: string }, _options: unknown) => {
        return {
            authorize: (socketId: string, callback: (error: unknown, data: unknown) => void) => {
                fetch(`${import.meta.env.VITE_API_URL || '/api'}/broadcasting/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('desksuite_token')}`,
                        'X-Socket-ID': socketId
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                .then(response => response.json())
                .then(data => callback(null, data))
                .catch(error => callback(error, null));
            }
        };
    },
});
