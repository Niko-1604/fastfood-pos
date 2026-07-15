const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');

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

// Rutas API
app.use('/api/menu',
    require('./routes/menu'));

app.use('/api/pedidos',
    require('./routes/pedidos'));

app.use('/api/clientes',
    require('./routes/clientes'));

app.use('/api/dashboard',
    require('./routes/dashboard'));

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

app.listen(PORT, () => {

    console.log(
        `✅ Servidor corriendo en http://localhost:${PORT}`
    );

});