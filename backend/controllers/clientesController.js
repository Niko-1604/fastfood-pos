const db = require('../config/db');

exports.getClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getClienteById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCliente = async (req, res) => {
    try {
        const { nombre, telefono, email, direccion } = req.body;
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?,?,?,?)',
            [nombre, telefono, email, direccion]
        );
        res.status(201).json({ id: result.insertId, mensaje: 'Cliente creado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCliente = async (req, res) => {
    try {
        const { nombre, telefono, email, direccion } = req.body;
        await db.query(
            'UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=? WHERE id=?',
            [nombre, telefono, email, direccion, req.params.id]
        );
        res.json({ mensaje: 'Cliente actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteCliente = async (req, res) => {
    try {
        await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Cliente eliminado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};