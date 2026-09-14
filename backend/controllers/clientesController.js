const db = require('../config/db');

exports.getClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.getClienteById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.getClienteByCedula = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE cedula = ?', [req.params.cedula]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.createCliente = async (req, res) => {
    try {
        const { nombre, telefono, cedula, direccion } = req.body;
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, telefono, cedula, direccion) VALUES (?,?,?,?)',
            [nombre, telefono, cedula || null, direccion]
        );
        res.status(201).json({ id: result.insertId, mensaje: 'Cliente creado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.updateCliente = async (req, res) => {
    try {
        const { nombre, telefono, cedula, direccion } = req.body;
        await db.query(
            'UPDATE clientes SET nombre=?, telefono=?, cedula=?, direccion=? WHERE id=?',
            [nombre, telefono, cedula || null, direccion, req.params.id]
        );
        res.json({ mensaje: 'Cliente actualizado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un cliente con esa cédula' });
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.deleteCliente = async (req, res) => {
    try {
        const [pedidos] = await db.query(
            'SELECT COUNT(*) as total FROM pedidos WHERE cliente_id = ?',
            [req.params.id]
        );

        if (pedidos[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar: este cliente ya tiene ventas registradas'
            });
        }

        await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Cliente eliminado' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};