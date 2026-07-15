document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    let usuario = null;

    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch (error) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        window.location.href = '/login';
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

        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuConfiguracion) menuConfiguracion.style.display = 'none';
    }

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

let chartVentas = null;

function tiempoRelativo(fecha) {

    const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    return `Hace ${dias} d`;

}

async function cargarResumenDashboard() {

    try {

        const response = await fetch(`${API_URL}/dashboard/resumen`);
        const resumen = await response.json();

        document.getElementById('cardVentasHoy').textContent =
            `$${Number(resumen.ventas_hoy).toFixed(2)}`;

        document.getElementById('cardPedidosHoy').textContent =
            resumen.pedidos_hoy;

        document.getElementById('cardClientes').textContent =
            resumen.total_clientes;

        document.getElementById('cardProductos').textContent =
            resumen.total_productos;

    } catch (error) {

        console.log(error);

    }

}

async function cargarGraficoVentas(periodo) {

    try {

        const endpoint = periodo === 'mes' ? 'ventas-mes' : 'ventas-semana';

        const response = await fetch(`${API_URL}/dashboard/${endpoint}`);
        const datos = await response.json();

        const labels = datos.map(d =>
            periodo === 'mes'
                ? new Date(`${d.mes}-01T00:00:00`).toLocaleDateString('es-EC', { month: 'short', year: 'numeric' })
                : new Date(d.fecha).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric' })
        );

        const valores = datos.map(d => Number(d.total));

        if (chartVentas) chartVentas.destroy();

        chartVentas = new Chart(document.getElementById('graficoVentas'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Ventas',
                    data: valores,
                    backgroundColor: '#ef4444',
                    borderRadius: 8,
                    maxBarThickness: 45
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });

    } catch (error) {

        console.log(error);

    }

}

async function cargarTopProductos() {

    try {

        const response = await fetch(`${API_URL}/dashboard/top-productos`);
        const productos = await response.json();

        const cont = document.getElementById('topProductos');
        cont.innerHTML = '';

        if (productos.length === 0) {
            cont.innerHTML = '<p class="empty-msg">Aún no hay ventas registradas</p>';
            return;
        }

        const medallas = ['🥇', '🥈', '🥉'];

        productos.forEach((p, i) => {

            cont.innerHTML += `
                <div class="top-item">

                    <span class="top-rank">${medallas[i] || `${i + 1}°`}</span>

                    <div class="top-info">
                        <strong>${p.nombre}</strong>
                        <small>${p.vendidos} vendidos</small>
                    </div>

                    <span class="top-ingresos">$${Number(p.ingresos).toFixed(2)}</span>

                </div>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

async function cargarActividadReciente() {

    try {

        const response = await fetch(`${API_URL}/pedidos`);
        const pedidos = await response.json();

        const cont = document.getElementById('actividadReciente');
        cont.innerHTML = '';

        if (pedidos.length === 0) {
            cont.innerHTML = '<p class="empty-msg">Sin actividad reciente</p>';
            return;
        }

        pedidos.slice(0, 5).forEach(p => {

            cont.innerHTML += `
                <div class="activity">
                    <span>🍔 Nuevo pedido de ${p.cliente_nombre || 'Cliente General'} — $${Number(p.total).toFixed(2)}</span>
                    <small>${tiempoRelativo(p.created_at)}</small>
                </div>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

document.addEventListener('DOMContentLoaded', function () {

    if (!localStorage.getItem('token')) return;

    cargarResumenDashboard();
    cargarGraficoVentas('semana');
    cargarTopProductos();
    cargarActividadReciente();

    document.querySelectorAll('.chart-toggle .preset').forEach(btn => {

        btn.addEventListener('click', () => {

            document.querySelectorAll('.chart-toggle .preset')
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');

            cargarGraficoVentas(btn.dataset.periodo);

        });

    });

});