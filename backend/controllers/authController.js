const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Email y contraseña son obligatorios'
            });
        }

        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Usuario no encontrado o inactivo'
            });
        }

        const usuario = usuarios[0];

        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h'
            }
        );

        res.json({
            ok: true,
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error en login'
        });
    }
};

module.exports = {
    login
};