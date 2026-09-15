const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const verificarToken = require('./middlewares/authMiddleware');

const app = express();

// Helmet adaptado para permitir recursos compartidos en Vercel
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginRedirects: false
}));

// Headers CORS explícitos ANTES de cors() para preflight OPTIONS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Permitir peticiones desde cualquier origen
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas API
app.use('/api/menu', verificarToken, require('./routes/menu'));
app.use('/api/pedidos', verificarToken, require('./routes/pedidos'));
app.use('/api/clientes', verificarToken, require('./routes/clientes'));
app.use('/api/dashboard', verificarToken, require('./routes/dashboard'));
app.use('/api/cupones', verificarToken, require('./routes/cupones'));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);

// Ruta de comprobación rápida
app.get('/api/health', (req, res) => {
  res.json({ mensaje: '🍔 FastFood API corriendo correctamente' });
});

// Captura cualquier otra ruta del frontend y entrega el index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Exportación para Serverless en Vercel
module.exports = app;

// Solo escucha puerto si se ejecuta de forma local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor local corriendo en http://localhost:${PORT}`);
  });
}