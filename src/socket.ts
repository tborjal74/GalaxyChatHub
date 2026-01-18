import { io } from 'socket.io-client';

// Use import.meta.env for Vite
const URL = import.meta.env.PROD ? undefined : 'http://localhost:3000';

// If URL is undefined, it defaults to window.location which is fine for production
// providing the backend serves the frontend.
export const socket = io(URL || '', {
    autoConnect: false
});