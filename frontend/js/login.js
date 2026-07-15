document.getElementById('btnMostrarPassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const esVisible = passwordInput.type === 'text';

    passwordInput.type = esVisible ? 'password' : 'text';
    this.textContent = esVisible ? '👁️' : '🙈';
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const mensaje = document.getElementById('mensaje');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
            mensaje.textContent = data.mensaje || 'Credenciales incorrectas';
            mensaje.className = 'mensaje error';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        window.location.href = 'index.html';

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor';
        mensaje.className = 'mensaje error';
    }
});