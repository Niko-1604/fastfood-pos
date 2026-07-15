const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://fastfood-pos-production-8951.up.railway.app';
const API_URL = `${SERVER_URL}/api`;
