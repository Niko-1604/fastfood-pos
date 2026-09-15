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
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Permitir peticiones desde cualquier origen (incluye los subdominios de Vercel)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/menu', verificarToken, require('./routes/menu'));
app.use('/api/pedidos', verificarToken, require('./routes/pedidos'));
app.use('/api/clientes', verificarToken, require('./routes/clientes'));
app.use('/api/dashboard', verificarToken, require('./routes/dashboard'));
app.use('/api/cupones', verificarToken, require('./routes/cupones'));
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);

// Ruta principal de salud
app.get('/', (req, res) => {
  res.json({ mensaje: '🍔 FastFood API corriendo correctamente' });
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