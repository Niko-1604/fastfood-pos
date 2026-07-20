function etiquetaRol(rol) {
    if (rol === 'admin') return 'Administrador';
    if (rol === 'cocina') return 'Cocina';
    return 'Cajero';
}

function etiquetaUsuario(usuario, rol) {
    const nombre = usuario?.nombre;
    const label = etiquetaRol(rol);
    return nombre ? `${nombre} · ${label}` : label;
}

document.addEventListener('DOMContentLoaded', function () {

    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // Si no hay sesión
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Rol
    const rol = usuario?.rol?.toLowerCase();

    // Bloquear páginas de administración si no es admin (aunque entren por URL)
    const rutasAdmin = ['/usuarios', '/configuracion'];
    const enRutaAdmin = rutasAdmin.some(p => location.pathname.startsWith(p));

    if (enRutaAdmin && rol !== 'admin') {
        window.location.href = '/';
        return;
    }

    // Ocultar menús para cajero
    if (rol === 'cajero') {

        document.getElementById('menuUsuarios')?.remove();
        document.getElementById('menuConfiguracion')?.remove();

    }

    // Mostrar usuario y rol arriba (algunas páginas tienen <span>, otras texto suelto)
    const userBox = document.querySelector('.user-box span') || document.querySelector('.user-box');

    if (userBox) {
        userBox.textContent = etiquetaUsuario(usuario, rol);
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {

            e.preventDefault();

            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            window.location.href = '/login';
        });
    }

});