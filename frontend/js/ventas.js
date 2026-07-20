const tablaVentas = document.getElementById('tablaVentas');
const buscarVenta = document.getElementById('buscarVenta');
const fechaDesde = document.getElementById('fechaDesde');
const fechaHasta = document.getElementById('fechaHasta');
const btnAplicarRango = document.getElementById('btnAplicarRango');
const botonesPreset = document.querySelectorAll('.preset');
const tituloResumen = document.getElementById('tituloResumen');
const tituloTabla = document.getElementById('tituloTabla');

let ventasGlobal = [];
let resumenGlobal = {};
let rangoActual = { desde: null, hasta: null };

function fechaISO(date) {
    return date.toISOString().slice(0, 10);
}

function inicioDeSemana(date) {
    const d = new Date(date);
    const dia = d.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    d.setDate(d.getDate() + diff);
    return d;
}

function calcularRangoPreset(preset) {

    const hoy = new Date();

    switch (preset) {

        case 'hoy':
            return { desde: fechaISO(hoy), hasta: fechaISO(hoy) };

        case 'semana':
            return { desde: fechaISO(inicioDeSemana(hoy)), hasta: fechaISO(hoy) };

        case 'mes':
            return {
                desde: fechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
                hasta: fechaISO(hoy)
            };

        case 'todo':
        default:
            return { desde: null, hasta: null };

    }

}

function aplicarRango(desde, hasta) {

    rangoActual = { desde, hasta };

    fechaDesde.value = desde || '';
    fechaHasta.value = hasta || '';

    buscarVenta.value = '';

    cargarVentas();

}

function queryString() {

    const params = new URLSearchParams();

    if (rangoActual.desde) params.set('desde', rangoActual.desde);
    if (rangoActual.hasta) params.set('hasta', rangoActual.hasta);

    const qs = params.toString();

    return qs ? `?${qs}` : '';

}

async function cargarVentas() {

    try {

        const response = await fetch(`${API_URL}/pedidos${queryString()}`);

        const ventas = await response.json();

        ventasGlobal = ventas;

        renderVentas(ventas);

        actualizarTitulos();

        cargarResumen();

    } catch (error) {

        console.log(error);

    }

}

async function cargarResumen() {

    try {

        const response = await fetch(`${API_URL}/pedidos/resumen${queryString()}`);

        const resumen = await response.json();

        resumenGlobal = resumen;

        document.getElementById('resumenTotal').textContent =
            `$${Number(resumen.total_vendido).toFixed(2)}`;

        document.getElementById('resumenPedidos').textContent =
            resumen.pedidos;

        document.getElementById('resumenTicket').textContent =
            `$${Number(resumen.ticket_promedio).toFixed(2)}`;

        document.getElementById('resumenCancelados').textContent =
            resumen.cancelados;

    } catch (error) {

        console.log(error);

    }

}

function formatFechaCorta(fecha) {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-EC', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

function actualizarTitulos() {

    const { desde, hasta } = rangoActual;

    if (!desde && !hasta) {
        tituloResumen.textContent = 'Resumen del historial completo';
        tituloTabla.textContent = 'Todas las ventas';
        return;
    }

    if (desde === hasta) {

        const esHoy = desde === fechaISO(new Date());
        const etiqueta = esHoy ? 'hoy' : formatFechaCorta(desde);

        tituloResumen.textContent = `Resumen de ${etiqueta}`;
        tituloTabla.textContent = `Ventas de ${etiqueta}`;
        return;

    }

    const etiqueta = `del ${formatFechaCorta(desde)} al ${formatFechaCorta(hasta)}`;

    tituloResumen.textContent = `Resumen ${etiqueta}`;
    tituloTabla.textContent = `Ventas ${etiqueta}`;

}

function renderVentas(ventas) {

    tablaVentas.innerHTML = '';

    if (ventas.length === 0) {

        tablaVentas.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay ventas registradas
                </td>
            </tr>
        `;

        return;

    }

    ventas.forEach(venta => {

        tablaVentas.innerHTML += `
            <tr>

                <td>
                    #${venta.id}
                </td>

                <td>
                    ${venta.cliente_nombre || 'Cliente General'}
                </td>

                <td>
                    ${venta.usuario_nombre || '—'}
                </td>

                <td>
                    $${Number(venta.total).toFixed(2)}
                </td>

                <td>
                    ${etiquetaTipo(venta.tipo)}
                </td>

                <td>
                    ${badgeEstado(venta.estado)}
                </td>

                <td>
                    ${formatearFecha(venta.created_at)}
                </td>

                <td>

                    <div class="acciones-venta">

                        <button class="btn-detalle"
                            onclick="verDetalle(${venta.id})">

                            Ver detalle

                        </button>

                        <button class="btn-imprimir"
                            title="Imprimir comprobante"
                            onclick="imprimirComprobante(${venta.id})">

                            <i class="fas fa-print"></i>

                        </button>

                    </div>

                </td>

            </tr>
        `;

    });

}

function etiquetaTipo(tipo) {

    const iconos = {
        local: '🍽️ Local',
        para_llevar: '🥡 Para llevar',
        delivery: '🛵 Delivery'
    };

    return iconos[tipo] || tipo;

}

function badgeEstado(estado) {

    const etiquetas = {
        pendiente: { texto: 'Pendiente', clase: 'pendiente' },
        preparando: { texto: 'Preparando', clase: 'pendiente' },
        listo: { texto: 'Listo', clase: 'pendiente' },
        entregado: { texto: 'Entregado', clase: 'pagado' },
        pagado: { texto: 'Pagado', clase: 'pagado' },
        cancelado: { texto: 'Cancelado', clase: 'cancelado' }
    };

    const info = etiquetas[estado] || { texto: estado, clase: 'pendiente' };

    return `<span class="estado ${info.clase}">${info.texto}</span>`;

}

function formatearFecha(fecha) {

    return new Date(fecha)
    .toLocaleString('es-EC');

}

async function verDetalle(id) {

    try {

        const response = await fetch(`${API_URL}/pedidos/${id}`);

        const pedido = await response.json();

        let itemsHTML = '';

        pedido.detalle.forEach(item => {

            itemsHTML += `
                <div class="detalle-item">
                    <span>${item.cantidad}x ${item.producto_nombre}</span>
                    <span>$${Number(item.subtotal).toFixed(2)}</span>
                </div>
            `;

        });

        const metodoPagoTexto = pedido.metodo_pago === 'transferencia' ? '🏦 Transferencia' : '💵 Efectivo';
        const costoDelivery = Number(pedido.costo_delivery) || 0;

        mostrarModal(`
            <h3>Pedido #${pedido.id}</h3>
            <div class="detalle-items">${itemsHTML}</div>
            <div class="detalle-meta">
                <div class="detalle-item">
                    <span>Atendido por</span>
                    <span>${pedido.usuario_nombre || '—'}</span>
                </div>
                <div class="detalle-item">
                    <span>Método de pago</span>
                    <span>${metodoPagoTexto}</span>
                </div>
                ${costoDelivery > 0 ? `
                <div class="detalle-item">
                    <span>Costo de envío</span>
                    <span>$${costoDelivery.toFixed(2)}</span>
                </div>` : ''}
            </div>
            <div class="detalle-total">
                <span>Total</span>
                <span>$${Number(pedido.total).toFixed(2)}</span>
            </div>
            ${pedido.notas ? `
            <div class="detalle-notas">
                <strong>Notas:</strong> ${pedido.notas}
            </div>` : ''}
            <button class="btn-imprimir-modal" onclick="imprimirComprobante(${pedido.id})">
                <i class="fas fa-print"></i> Imprimir comprobante
            </button>
        `);

    } catch (error) {

        console.log(error);

    }

}

buscarVenta.addEventListener('keyup', () => {

    const texto = buscarVenta.value.toLowerCase();

    const filtradas = ventasGlobal.filter(v =>
        (v.cliente_nombre || '')
        .toLowerCase()
        .includes(texto)
    );

    renderVentas(filtradas);

});

botonesPreset.forEach(btn => {

    btn.addEventListener('click', () => {

        botonesPreset.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const { desde, hasta } = calcularRangoPreset(btn.dataset.preset);

        aplicarRango(desde, hasta);

    });

});

btnAplicarRango.addEventListener('click', () => {

    if (!fechaDesde.value || !fechaHasta.value) {
        mostrarNotificacion('Selecciona ambas fechas para aplicar el rango', 'error');
        return;
    }

    if (fechaDesde.value > fechaHasta.value) {
        mostrarNotificacion('La fecha "Desde" no puede ser posterior a "Hasta"', 'error');
        return;
    }

    botonesPreset.forEach(b => b.classList.remove('active'));

    aplicarRango(fechaDesde.value, fechaHasta.value);

});

const btnImprimirReporte = document.getElementById('btnImprimirReporte');

if (btnImprimirReporte) {
    btnImprimirReporte.addEventListener('click', () => {

        if (!ventasGlobal.length) {
            mostrarNotificacion('No hay ventas para imprimir en este período', 'error');
            return;
        }

        imprimirReporteVentas({
            ventas: ventasGlobal,
            titulo: tituloTabla.textContent,
            resumen: resumenGlobal
        });

    });
}

aplicarRango(fechaISO(new Date()), fechaISO(new Date()));