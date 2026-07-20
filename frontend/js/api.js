const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://fastfood-pos-production-8951.up.railway.app';
const API_URL = `${SERVER_URL}/api`;

// Adjunta automáticamente el token a las llamadas a la API y, si el backend
// responde 401 (token ausente/expirado), cierra la sesión y manda al login.
(function () {
    const fetchOriginal = window.fetch.bind(window);

    window.fetch = function (recurso, opciones = {}) {
        const url = typeof recurso === 'string' ? recurso : (recurso && recurso.url) || '';
        const esApi = url.startsWith(SERVER_URL);
        const esLogin = url.includes('/api/auth/login');

        if (esApi) {
            const token = localStorage.getItem('token');
            if (token) {
                opciones = {
                    ...opciones,
                    headers: {
                        ...(opciones.headers || {}),
                        Authorization: `Bearer ${token}`
                    }
                };
            }
        }

        return fetchOriginal(recurso, opciones).then(function (res) {
            if (esApi && !esLogin && res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                if (!location.pathname.startsWith('/login')) {
                    location.href = '/login';
                }
            }
            return res;
        });
    };
})();
