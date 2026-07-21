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
        const userBox = document.querySelector('.user-box span') || document.querySelector('.user-box');
        if (userBox) {
            const rolLabel = usuario.rol === 'admin' ? 'Administrador'
                : usuario.rol === 'cocina' ? 'Cocina' : 'Cajero';
            userBox.textContent = usuario.nombre ? `${usuario.nombre} · ${rolLabel}` : rolLabel;
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

let errorDashboardMostrado = false;
function avisarErrorDashboard() {
    if (errorDashboardMostrado) return;
    errorDashboardMostrado = true;
    mostrarNotificacion('No se pudo cargar parte del panel. Revisá tu conexión.', 'error');
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
        avisarErrorDashboard();

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
        avisarErrorDashboard();

    }

}

async function cargarVentasMetodoPago() {

    try {

        const response = await fetch(`${API_URL}/dashboard/ventas-metodo-pago`);
        const resumen = await response.json();

        const cont = document.getElementById('ventasMetodoPago');
        cont.innerHTML = '';

        if (Number(resumen.efectivo) === 0 && Number(resumen.transferencia) === 0) {
            cont.innerHTML = '<p class="empty-msg">Aún no hay ventas hoy</p>';
            return;
        }

        cont.innerHTML = `
            <div class="metodo-item">
                <div class="metodo-icon efectivo">💵</div>
                <div class="metodo-info">
                    <strong>Efectivo</strong>
                    <small>Ventas de hoy</small>
                </div>
                <span class="metodo-monto">$${Number(resumen.efectivo).toFixed(2)}</span>
            </div>

            <div class="metodo-item">
                <div class="metodo-icon transferencia">🏦</div>
                <div class="metodo-info">
                    <strong>Transferencia</strong>
                    <small>Ventas de hoy</small>
                </div>
                <span class="metodo-monto">$${Number(resumen.transferencia).toFixed(2)}</span>
            </div>
        `;

    } catch (error) {

        console.log(error);
        avisarErrorDashboard();

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

        pedidos.slice(0, 20).forEach(p => {

            cont.innerHTML += `
                <div class="activity">
                    <span>🍔 Nuevo pedido de ${escaparHTML(p.cliente_nombre || 'Cliente General')} — $${Number(p.total).toFixed(2)}</span>
                    <small>${tiempoRelativo(p.created_at)}</small>
                </div>
            `;

        });

    } catch (error) {

        console.log(error);
        avisarErrorDashboard();

    }

}

document.addEventListener('DOMContentLoaded', function () {

    if (!localStorage.getItem('token')) return;

    cargarResumenDashboard();
    cargarGraficoVentas('semana');
    cargarVentasMetodoPago();
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