const db = require('../config/db');

exports.getPedidos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre as cliente_nombre
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPedidoById = async (req, res) => {
    try {
        const [pedido] = await db.query(`
            SELECT p.*, c.nombre as cliente_nombre
            FROM pedidos p LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.id = ?`, [req.params.id]);
        if (pedido.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        const [detalle] = await db.query(`
            SELECT dp.*, pr.nombre as producto_nombre
            FROM detalle_pedido dp
            JOIN productos pr ON dp.producto_id = pr.id
            WHERE dp.pedido_id = ?`, [req.params.id]);

        res.json({ ...pedido[0], detalle });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPedido = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { cliente_id, tipo, notas, items } = req.body;

        // Calcular total
        let total = 0;
        for (const item of items) {
            const [prod] = await conn.query('SELECT precio FROM productos WHERE id = ?', [item.producto_id]);
            total += prod[0].precio * item.cantidad;
        }

        // Crear pedido
        const [result] = await conn.query(
            'INSERT INTO pedidos (cliente_id, total, tipo, notas) VALUES (?,?,?,?)',
            [cliente_id || 1, total, tipo || 'local', notas || '']
        );
        const pedido_id = result.insertId;

        // Insertar detalle
        for (const item of items) {
            const [prod] = await conn.query('SELECT precio FROM productos WHERE id = ?', [item.producto_id]);
            const subtotal = prod[0].precio * item.cantidad;
            await conn.query(
                'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
                [pedido_id, item.producto_id, item.cantidad, prod[0].precio, subtotal]
            );
            // Descontar inventario
            await conn.query(
                'UPDATE inventario SET stock_actual = stock_actual - ? WHERE producto_id = ?',
                [item.cantidad, item.producto_id]
            );
        }

        await conn.commit();
        res.status(201).json({ id: pedido_id, total, mensaje: 'Pedido creado' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletePedido = async (req, res) => {
    try {
        await db.query('UPDATE pedidos SET estado = "cancelado" WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Pedido cancelado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};