const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const verificarToken = require('./middlewares/authMiddleware');
const { correrMigraciones } = require('./config/migrate');

const app = express();

// Middlewares
app.use(cors());

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
// Las imágenes en /uploads quedan públicas (se cargan en <img>, no por fetch).
app.use('/api/menu',
    verificarToken, require('./routes/menu'));

app.use('/api/pedidos',
    verificarToken, require('./routes/pedidos'));

app.use('/api/clientes',
    verificarToken, require('./routes/clientes'));

app.use('/api/dashboard',
    verificarToken, require('./routes/dashboard'));

app.use('/api/cupones',
    verificarToken, require('./routes/cupones'));

// usuarios controla el token/rol por ruta (perfil/password es del propio usuario)
app.use('/api/usuarios',
    usuariosRoutes);

app.use('/api/auth',
    authRoutes);

// Ruta principal
app.get('/', (req, res) => {

    res.json({
        mensaje:
            '🍔 FastFood API corriendo correctamente'
    });

});

// Puerto
const PORT =
    process.env.PORT || 3000;

app.listen(PORT, async () => {

    await correrMigraciones();

    console.log(
        `✅ Servidor corriendo en http://localhost:${PORT}`
    );

});