const db = require('../config/db');

exports.getInventario = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, p.nombre as producto_nombre, p.precio
            FROM inventario i
            JOIN productos p ON i.producto_id = p.id
            ORDER BY i.stock_actual ASC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMovimientos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                m.*,
                p.nombre as producto_nombre
            FROM movimientos_inventario m
            JOIN productos p ON m.producto_id = p.id
            ORDER BY m.created_at DESC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { stock_actual, stock_minimo } = req.body;

        await db.query(
            'UPDATE inventario SET stock_actual=?, stock_minimo=? WHERE producto_id=?',
            [stock_actual, stock_minimo, req.params.producto_id]
        );

        res.json({ mensaje: 'Stock actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.registrarMovimiento = async (req, res) => {
    try {
        const { producto_id, tipo, cantidad, motivo } = req.body;

        await db.query(
            'INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, motivo) VALUES (?,?,?,?)',
            [producto_id, tipo, cantidad, motivo]
        );

        const operacion = tipo === 'entrada' ? '+' : '-';

        await db.query(
            `UPDATE inventario SET stock_actual = stock_actual ${operacion} ? WHERE producto_id = ?`,
            [cantidad, producto_id]
        );

        res.status(201).json({ mensaje: 'Movimiento registrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};