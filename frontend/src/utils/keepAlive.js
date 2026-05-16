// Ping the backend every 4 minutes to prevent Render cold starts
const AI_BASE = import.meta.env.VITE_AI_URL || 'https://verifyaibe.onrender.com';

export function startKeepAlive() {
  const ping = () => fetch(`${AI_BASE}/health`, { method: 'GET' }).catch(() => {});
  ping(); // immediate on load
  setInterval(ping, 4 * 60 * 1000); // every 4 min
}
