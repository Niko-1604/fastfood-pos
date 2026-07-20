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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT rol, activo FROM usuarios WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No permitir borrar al único administrador activo (evita quedar sin acceso)
        if (rows[0].rol === 'admin' && rows[0].activo == 1) {
            const [[{ total }]] = await db.query(
                "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin' AND activo = 1"
            );

            if (total <= 1) {
                return res.status(400).json({
                    error: 'No se puede eliminar al único administrador activo'
                });
            }
        }

        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);

        res.json({ mensaje: 'Usuario eliminado' });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.cambiarMiPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                error: 'Completa la contraseña actual y la nueva'
            });
        }

        if (passwordNueva.length < 6) {
            return res.status(400).json({
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const passwordValida = await bcrypt.compare(passwordActual, usuarios[0].password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        const passwordHash = await bcrypt.hash(passwordNueva, 10);

        await db.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [passwordHash, req.usuario.id]
        );

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { activo } = req.body;

        // No permitir desactivar al único administrador activo
        if (Number(activo) === 0) {
            const [rows] = await db.query('SELECT rol FROM usuarios WHERE id = ?', [req.params.id]);

            if (rows.length && rows[0].rol === 'admin') {
                const [[{ total }]] = await db.query(
                    "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'admin' AND activo = 1"
                );

                if (total <= 1) {
                    return res.status(400).json({
                        error: 'No se puede desactivar al único administrador activo'
                    });
                }
            }
        }

        await db.query(
            'UPDATE usuarios SET activo = ? WHERE id = ?',
            [activo, req.params.id]
        );

        res.json({ mensaje: 'Estado actualizado' });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};