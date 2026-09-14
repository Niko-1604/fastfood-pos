const db = require('../config/db');

// ¿La tabla pedidos ya tiene la columna usuario_id? Se cachea en positivo
// para no romper el sistema si la migración todavía no se corrió en la BD.
let _pedidosTieneUsuario = false;
async function pedidosTieneUsuario(conn = db) {
    if (_pedidosTieneUsuario) return true;
    try {
        const [cols] = await conn.query("SHOW COLUMNS FROM pedidos LIKE 'usuario_id'");
        _pedidosTieneUsuario = cols.length > 0;
    } catch (e) {
        return false;
    }
    return _pedidosTieneUsuario;
}

function condicionesRango(req, alias = '') {
    const columna = alias ? `${alias}.created_at` : 'created_at';
    const { desde, hasta } = req.query;

    const condiciones = [];
    const params = [];

    if (desde) {
        condiciones.push(`DATE(${columna}) >= ?`);
        params.push(desde);
    }

    if (hasta) {
        condiciones.push(`DATE(${columna}) <= ?`);
        params.push(hasta);
    }

    return {
        where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '',
        params
    };
}

exports.getPedidos = async (req, res) => {
    try {
        const { where, params } = condicionesRango(req, 'p');

        const conUsuario = await pedidosTieneUsuario();
        const selUsuario = conUsuario ? ', u.nombre as usuario_nombre' : '';
        const joinUsuario = conUsuario ? 'LEFT JOIN usuarios u ON p.usuario_id = u.id' : '';

        const [rows] = await db.query(`
            SELECT p.*, c.nombre as cliente_nombre${selUsuario}
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ${joinUsuario}
            ${where}
            ORDER BY p.created_at DESC
        `, params);
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.getResumen = async (req, res) => {
    try {
        const { where, params } = condicionesRango(req);

        const [[resumen]] = await db.query(`
            SELECT
                COALESCE(SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END), 0) as total_vendido,
                SUM(CASE WHEN estado != 'cancelado' THEN 1 ELSE 0 END) as pedidos,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
            FROM pedidos
            ${where}
        `, params);

        const pedidos = Number(resumen.pedidos) || 0;
        const totalVendido = Number(resumen.total_vendido) || 0;

        res.json({
            total_vendido: totalVendido,
            pedidos,
            cancelados: Number(resumen.cancelados) || 0,
            ticket_promedio: pedidos > 0 ? totalVendido / pedidos : 0
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.getPedidoById = async (req, res) => {
    try {
        const conUsuario = await pedidosTieneUsuario();
        const selUsuario = conUsuario ? ', u.nombre as usuario_nombre' : '';
        const joinUsuario = conUsuario ? 'LEFT JOIN usuarios u ON p.usuario_id = u.id' : '';

        const [pedido] = await db.query(`
            SELECT p.*, c.nombre as cliente_nombre${selUsuario}
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ${joinUsuario}
            WHERE p.id = ?`, [req.params.id]);
        if (pedido.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        const [detalle] = await db.query(`
            SELECT dp.*, pr.nombre as producto_nombre
            FROM detalle_pedido dp
            JOIN productos pr ON dp.producto_id = pr.id
            WHERE dp.pedido_id = ?`, [req.params.id]);

        res.json({ ...pedido[0], detalle });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.createPedido = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { cliente_id, usuario_id, tipo, notas, items, metodo_pago, costo_delivery, cupon_codigo } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'El pedido no tiene productos' });
        }

        // Subtotal (validando que cada producto exista y esté disponible)
        let subtotal = 0;
        for (const item of items) {
            const [prod] = await conn.query(
                'SELECT precio FROM productos WHERE id = ? AND disponible = 1',
                [item.producto_id]
            );

            if (prod.length === 0) {
                await conn.rollback();
                return res.status(400).json({ error: 'Uno de los productos no existe o no está disponible' });
            }

            subtotal += prod[0].precio * item.cantidad;
        }

        const delivery = tipo === 'delivery' ? Number(costo_delivery || 0) : 0;

        // Descuento por cupón (validado en el servidor, no se confía en el cliente)
        let descuento = 0;
        let cuponFinal = null;
        if (cupon_codigo) {
            const codigo = String(cupon_codigo).trim().toUpperCase();
            const [cup] = await conn.query('SELECT * FROM cupones WHERE codigo = ? AND activo = 1', [codigo]);
            if (cup.length) {
                const c = cup[0];
                let vigente = true;
                if (c.fecha_expiracion) {
                    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                    vigente = new Date(`${String(c.fecha_expiracion).slice(0, 10)}T00:00:00`) >= hoy;
                }
                if (vigente) {
                    descuento = c.tipo === 'monto'
                        ? Math.min(Number(c.valor), subtotal)
                        : subtotal * Number(c.valor) / 100;
                    descuento = Math.round(descuento * 100) / 100;
                    cuponFinal = c.codigo;
                }
            }
        }

        const total = Math.max(0, subtotal - descuento) + delivery;

        const metodo = metodo_pago === 'transferencia' ? 'transferencia' : 'efectivo';
        const conUsuario = await pedidosTieneUsuario(conn);

        // Crear pedido (se paga en caja al momento, por eso queda como "pagado")
        const [result] = conUsuario
            ? await conn.query(
                'INSERT INTO pedidos (cliente_id, usuario_id, total, tipo, costo_delivery, descuento, cupon_codigo, notas, estado, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?,?)',
                [cliente_id || 1, usuario_id || null, total, tipo || 'local', delivery, descuento, cuponFinal, notas || '', 'pagado', metodo]
            )
            : await conn.query(
                'INSERT INTO pedidos (cliente_id, total, tipo, costo_delivery, descuento, cupon_codigo, notas, estado, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?)',
                [cliente_id || 1, total, tipo || 'local', delivery, descuento, cuponFinal, notas || '', 'pagado', metodo]
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
        }

        await conn.commit();
        res.status(201).json({ id: pedido_id, total, mensaje: 'Pedido creado' });
    } catch (err) {
        await conn.rollback();
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    } finally {
        conn.release();
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.deletePedido = async (req, res) => {
    try {
        await db.query('UPDATE pedidos SET estado = "cancelado" WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Pedido cancelado' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};