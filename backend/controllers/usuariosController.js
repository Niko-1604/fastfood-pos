const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, nombre, email, rol, activo, created_at
            FROM usuarios
            ORDER BY created_at DESC
        `);

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !password || !rol) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        if (!['admin', 'cajero'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol no válido'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [correo]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                error: 'El correo ya está registrado'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?,?,?,?,1)',
            [nombre, correo, passwordHash, rol]
        );

        res.status(201).json({
            id: result.insertId,
            mensaje: 'Usuario creado correctamente'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        if (!nombre || !correo || !rol) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }

        if (!['admin', 'cajero'].includes(rol)) {
            return res.status(400).json({
                error: 'Rol no válido'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [correo, req.params.id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                error: 'El correo ya está registrado'
            });
        }

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);

            await db.query(
                'UPDATE usuarios SET nombre=?, email=?, password=?, rol=? WHERE id=?',
                [nombre, correo, passwordHash, rol, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE usuarios SET nombre=?, email=?, rol=? WHERE id=?',
                [nombre, correo, rol, req.params.id]
            );
        }

        res.json({ mensaje: 'Usuario actualizado correctamente' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);

        res.json({ mensaje: 'Usuario eliminado' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { activo } = req.body;

        await db.query(
            'UPDATE usuarios SET activo = ? WHERE id = ?',
            [activo, req.params.id]
        );

        res.json({ mensaje: 'Estado actualizado' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};