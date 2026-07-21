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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.getCategorias = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, COUNT(p.id) as productos
            FROM categorias c
            LEFT JOIN productos p ON p.categoria_id = c.id AND p.disponible = 1
            WHERE c.activo = 1
            GROUP BY c.id
            ORDER BY c.nombre ASC
        `);
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.getProductoById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
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

        res.status(201).json({
            id: result.insertId,
            mensaje: 'Producto creado',
            imagen
        });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.updateProducto = async (req, res) => {
    try {
        const { categoria_id, nombre, descripcion, precio, disponible } = req.body;

        let imagen = req.body.imagen_actual || '';

        if (req.file) {
            imagen = `/uploads/productos/${req.file.filename}`;
        }

        // Si el formulario no manda "disponible", se conserva el valor actual
        // (antes se forzaba a 1 y reactivaba productos ocultos al editarlos).
        const disponibleParam = (disponible === undefined || disponible === '') ? null : disponible;

        await db.query(
            'UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, imagen=?, disponible=COALESCE(?, disponible) WHERE id=?',
            [categoria_id, nombre, descripcion, precio, imagen, disponibleParam, req.params.id]
        );

        res.json({
            mensaje: 'Producto actualizado',
            imagen
        });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
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

        const [existe] = await db.query(
            'SELECT id FROM categorias WHERE nombre = ? AND activo = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                error: 'Ya existe una categoría con ese nombre'
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
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.updateCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'El nombre de la categoría es obligatorio'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM categorias WHERE nombre = ? AND activo = 1 AND id != ?',
            [nombre, req.params.id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                error: 'Ya existe una categoría con ese nombre'
            });
        }

        await db.query(
            'UPDATE categorias SET nombre = ? WHERE id = ?',
            [nombre, req.params.id]
        );

        res.json({ mensaje: 'Categoría actualizada' });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.deleteCategoria = async (req, res) => {
    try {
        const [productos] = await db.query(
            'SELECT COUNT(*) as total FROM productos WHERE categoria_id = ? AND disponible = 1',
            [req.params.id]
        );

        if (productos[0].total > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar: hay productos usando esta categoría'
            });
        }

        await db.query('UPDATE categorias SET activo = 0 WHERE id = ?', [req.params.id]);

        res.json({ mensaje: 'Categoría eliminada' });

    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};