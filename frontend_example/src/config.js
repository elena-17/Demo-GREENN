const rawBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = rawBase ? `${rawBase}/api` : 'http://localhost:5172/api';

const rawWebSocket = import.meta.env.VITE_BACKEND_WEBSOCKET;
export const WS_URL = rawWebSocket ? rawWebSocket : 'ws://localhost:8080/';
