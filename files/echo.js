import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * بتتقرأ مرة واحدة عند تحميل التطبيق
 * getAuthToken() لازم ترجع الـ Bearer Token بتاع المستخدم الحالي (من localStorage أو الـ Auth Context بتاعك)
 */
function getAuthToken() {
  return localStorage.getItem('auth_token'); // عدّلها حسب مكان تخزين التوكن عندك
}

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: window.location.hostname, // دومين التانت الحالي (tenant1.app.com)
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${window.location.origin}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  },
});
