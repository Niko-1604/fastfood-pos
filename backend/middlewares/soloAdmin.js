// Requiere que el usuario autenticado tenga rol admin.
// Debe usarse DESPUÉS de verificarToken (que llena req.usuario).
module.exports = function soloAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Requiere permisos de administrador' });
    }
    next();
};
