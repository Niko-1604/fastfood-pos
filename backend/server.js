const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const verificarToken = require('./middlewares/authMiddleware');
const { correrMigraciones } = require('./config/migrate');

const app = express();

// Middlewares de Seguridad y Cabeceras HTTP
app.use(helmet());

// Configuración de CORS restringido a tu frontend en Vercel y entorno local
const allowedOrigins = [
  'https://fastfood-pos-teal.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173' // Puerto habitual en entornos de desarrollo con Vite
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como clientes REST o herramientas internas) o si está en la lista blanca
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acceso bloqueado por política de CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// Rutas API — requieren token válido (excepto /api/auth/login).
app.use('/api/menu', verificarToken, require('./routes/menu'));
app.use('/api/pedidos', verificarToken, require('./routes/pedidos'));
app.use('/api/clientes', verificarToken, require('./routes/clientes'));
app.use('/api/dashboard', verificarToken, require('./routes/dashboard'));
app.use('/api/cupones', verificarToken, require('./routes/cupones'));

// usuarios controla el token/rol por ruta (perfil/password es del propio usuario)
app.use('/api/usuarios', usuariosRoutes);

app.use('/api/auth', authRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: '🍔 FastFood API corriendo correctamente'
  });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await correrMigraciones();
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});