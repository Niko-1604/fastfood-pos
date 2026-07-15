document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    let usuario = null;

    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch (error) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
    }

    console.log('USUARIO LOGUEADO:', usuario);

    if (usuario) {
        const userBox = document.querySelector('.user-box span');
        if (userBox) {
            userBox.textContent = usuario.rol === 'admin' ? 'Administrador' : 'Cajero';
        }
    }

    const rol = usuario && usuario.rol ? usuario.rol.toLowerCase() : '';

    if (rol === 'cajero') {
        const menuUsuarios = document.getElementById('menuUsuarios');
        const menuConfiguracion = document.getElementById('menuConfiguracion');
        const menuInventario = document.getElementById('menuInventario');

        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuConfiguracion) menuConfiguracion.style.display = 'none';
        if (menuInventario) menuInventario.style.display = 'none';
    }

    const btnLogout = document.getElementById('btnLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();

            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            window.location.href = 'login.html';
        });
    }
});