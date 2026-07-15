const db = require('../config/db');

exports.getResumen = async (req, res) => {
    try {
        const [[ventas]] = await db.query("SELECT COALESCE(SUM(total),0) as total FROM pedidos WHERE DATE(created_at) = CURDATE() AND estado != 'cancelado'");
        const [[pedidos]] = await db.query("SELECT COUNT(*) as total FROM pedidos WHERE DATE(created_at) = CURDATE()");
        const [[pendientes]] = await db.query("SELECT COUNT(*) as total FROM pedidos WHERE estado = 'pendiente'");
        const [[clientes]] = await db.query("SELECT COUNT(*) as total FROM clientes");
        const [stockBajo] = await db.query("SELECT COUNT(*) as total FROM inventario WHERE stock_actual <= stock_minimo");

        res.json({
            ventas_hoy: ventas.total,
            pedidos_hoy: pedidos.total,
            pedidos_pendientes: pendientes.total,
            total_clientes: clientes.total,
            productos_stock_bajo: stockBajo[0].total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVentasSemana = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DATE(created_at) as fecha,
                   SUM(total) as total,
                   COUNT(*) as pedidos
            FROM pedidos
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND estado != 'cancelado'
            GROUP BY DATE(created_at)
            ORDER BY fecha ASC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVentasMes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as mes,
                   SUM(total) as total,
                   COUNT(*) as pedidos
            FROM pedidos
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            AND estado != 'cancelado'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes ASC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTopProductos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.nombre, SUM(dp.cantidad) as vendidos, SUM(dp.subtotal) as ingresos
            FROM detalle_pedido dp
            JOIN productos p ON dp.producto_id = p.id
            JOIN pedidos pe ON dp.pedido_id = pe.id
            WHERE pe.estado != 'cancelado'
            GROUP BY p.id
            ORDER BY vendidos DESC
            LIMIT 5
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPedidosPorEstado = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT estado, COUNT(*) as total
            FROM pedidos
            GROUP BY estado
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};