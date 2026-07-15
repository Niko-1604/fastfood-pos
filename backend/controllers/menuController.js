const db = require('../config/db');

exports.getProductos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre as categoria 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.disponible = 1
            ORDER BY p.id DESC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias WHERE activo = 1');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getProductoById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProducto = async (req, res) => {
    try {
        const { categoria_id, nombre, descripcion, precio, disponible } = req.body;

        const imagen = req.file 
            ? `/uploads/productos/${req.file.filename}` 
            : '';

        const [result] = await db.query(
            'INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen, disponible) VALUES (?,?,?,?,?,?)',
            [categoria_id, nombre, descripcion, precio, imagen, disponible ?? 1]
        );

        await db.query(
            'INSERT INTO inventario (producto_id, stock_actual) VALUES (?,?)',
            [result.insertId, 0]
        );

        res.status(201).json({
            id: result.insertId,
            mensaje: 'Producto creado',
            imagen
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProducto = async (req, res) => {
    try {
        const { categoria_id, nombre, descripcion, precio, disponible } = req.body;

        let imagen = req.body.imagen_actual || '';

        if (req.file) {
            imagen = `/uploads/productos/${req.file.filename}`;
        }

        await db.query(
            'UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, imagen=?, disponible=? WHERE id=?',
            [categoria_id, nombre, descripcion, precio, imagen, disponible ?? 1, req.params.id]
        );

        res.json({
            mensaje: 'Producto actualizado',
            imagen
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProducto = async (req, res) => {
    try {
        await db.query(
            'UPDATE productos SET disponible = 0 WHERE id = ?',
            [req.params.id]
        );

        res.json({
            mensaje: 'Producto desactivado correctamente'
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
exports.createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'El nombre de la categoría es obligatorio'
            });
        }

        const [result] = await db.query(
            'INSERT INTO categorias (nombre, activo) VALUES (?, 1)',
            [nombre]
        );

        res.status(201).json({
            id: result.insertId,
            mensaje: 'Categoría creada'
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};