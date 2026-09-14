const db = require('../config/db');

const TIPOS = ['porcentaje', 'monto'];

function normalizarCodigo(codigo) {
    return String(codigo || '').trim().toUpperCase();
}

function validarDatos({ codigo, tipo, valor }) {
    if (!codigo) return 'El código del cupón es obligatorio';
    if (!TIPOS.includes(tipo)) return 'Tipo de cupón no válido';

    const v = Number(valor);
    if (!v || v <= 0) return 'El valor del descuento debe ser mayor a 0';
    if (tipo === 'porcentaje' && v > 100) return 'El porcentaje no puede ser mayor a 100';

    return null;
}

exports.getCupones = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cupones ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

exports.createCupon = async (req, res) => {
    try {
        const codigo = normalizarCodigo(req.body.codigo);
        const { tipo, valor, fecha_expiracion } = req.body;

        const error = validarDatos({ codigo, tipo, valor });
        if (error) return res.status(400).json({ error });

        await db.query(
            'INSERT INTO cupones (codigo, tipo, valor, fecha_expiracion) VALUES (?,?,?,?)',
            [codigo, tipo, Number(valor), fecha_expiracion || null]
        );

        res.status(201).json({ mensaje: 'Cupón creado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un cupón con ese código' });
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.updateCupon = async (req, res) => {
    try {
        const codigo = normalizarCodigo(req.body.codigo);
        const { tipo, valor, fecha_expiracion, activo } = req.body;

        const error = validarDatos({ codigo, tipo, valor });
        if (error) return res.status(400).json({ error });

        await db.query(
            'UPDATE cupones SET codigo=?, tipo=?, valor=?, fecha_expiracion=?, activo=? WHERE id=?',
            [codigo, tipo, Number(valor), fecha_expiracion || null, activo == 0 ? 0 : 1, req.params.id]
        );

        res.json({ mensaje: 'Cupón actualizado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un cupón con ese código' });
        console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    }
};

exports.deleteCupon = async (req, res) => {
    try {
        await db.query('DELETE FROM cupones WHERE id = ?', [req.params.id]);
        res.json({ mensaje: 'Cupón eliminado' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};

// Para el POS: valida un cupón por su código (activo y no vencido)
exports.validarCupon = async (req, res) => {
    try {
        const codigo = normalizarCodigo(req.params.codigo);

        const [rows] = await db.query('SELECT * FROM cupones WHERE codigo = ? AND activo = 1', [codigo]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cupón no válido' });
        }

        const cupon = rows[0];

        if (cupon.fecha_expiracion) {
            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            const exp = new Date(`${String(cupon.fecha_expiracion).slice(0, 10)}T00:00:00`);
            if (exp < hoy) {
                return res.status(400).json({ error: 'El cupón está vencido' });
            }
        }

        res.json(cupon);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Ocurrió un error inesperado. Intenta de nuevo.' }); }
};
