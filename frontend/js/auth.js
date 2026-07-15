document.addEventListener('DOMContentLoaded', function () {

    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // Si no hay sesión
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Rol
    const rol = usuario?.rol?.toLowerCase();

    // Ocultar menús para cajero
    if (rol === 'cajero') {

        document.getElementById('menuUsuarios')?.remove();
        document.getElementById('menuConfiguracion')?.remove();
        document.getElementById('menuInventario')?.remove();

    }

    // Mostrar rol arriba
    const userBox = document.querySelector('.user-box span');

    if (userBox) {
        userBox.textContent =
            rol === 'admin'
                ? 'Administrador'
                : 'Cajero';
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {

            e.preventDefault();

            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            window.location.href = '../login.html';
        });
    }

});