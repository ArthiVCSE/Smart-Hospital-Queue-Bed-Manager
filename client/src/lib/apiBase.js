/** Backend origin (REST + Socket.IO). Override with VITE_API_URL in .env */
export function getApiBase() {
  const url = import.meta.env.VITE_API_URL;
  return (typeof url === 'string' && url.length > 0 ? url : 'http://localhost:5000').replace(
    /\/$/,
    ''
  );
}
