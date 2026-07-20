// Módulo de impresión de comprobante (ticket de venta).
// Uso: imprimirComprobante(pedidoId)  -> abre una ventana lista para imprimir.

const NEGOCIO = {
    nombre: 'FastFood Manibe',
    lema: 'Comida rápida',
    // Datos opcionales del local (dejar vacío para ocultar)
    direccion: 'Pallatanga y Cosanga E8-130',
    telefono: '+593 99 512 5227'
};

function obtenerLogoComprobante() {

    const existente = document.querySelector('.logo-icon img');
    const logoSrc = existente ? existente.src : `${window.location.origin}/img/panda-logo.png`;

    return new Promise(resolve => {

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                resolve(logoSrc);
            }
        };

        img.onerror = () => resolve(logoSrc);
        img.src = logoSrc;

    });

}

function escaparHTML(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function etiquetaTipoComprobante(tipo) {
    const tipos = {
        local: 'Local',
        para_llevar: 'Para llevar',
        delivery: 'Delivery'
    };
    return tipos[tipo] || tipo || '-';
}

function fechaComprobante(fecha) {
    const d = fecha ? new Date(fecha) : new Date();
    return d.toLocaleString('es-EC', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function construirHTMLComprobante(pedido, logo) {

    const numero = String(pedido.id).padStart(6, '0');
    const cliente = pedido.cliente_nombre || 'Cliente General';
    const metodo = pedido.metodo_pago === 'transferencia' ? 'Transferencia' : 'Efectivo';
    const costoDelivery = Number(pedido.costo_delivery) || 0;

    const filas = (pedido.detalle || []).map(item => `
        <tr>
            <td class="c-cant">${item.cantidad}</td>
            <td class="c-prod">${escaparHTML(item.producto_nombre)}</td>
            <td class="c-val">$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante N° ${numero}</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        font-family: 'Segoe UI', 'Courier New', monospace;
        color: #111;
        background: #fff;
        width: 280px;
        margin: 0 auto;
        padding: 12px 10px;
        font-size: 12px;
    }

    .c-header { text-align: center; margin-bottom: 8px; }
    .c-header img { width: 64px; height: 64px; object-fit: contain; margin-bottom: 4px; }
    .c-header h1 { font-size: 16px; letter-spacing: 0.5px; }
    .c-header p { font-size: 10px; color: #555; }

    .c-sep { border: none; border-top: 1px dashed #888; margin: 8px 0; }

    .c-titulo { text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
    .c-numero { text-align: center; font-size: 18px; font-weight: 700; margin: 2px 0 6px; }

    .c-meta { font-size: 11px; }
    .c-meta div { display: flex; justify-content: space-between; margin: 2px 0; }
    .c-meta span:first-child { color: #555; }

    table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 11px; }
    thead th {
        text-align: left; border-bottom: 1px solid #333;
        padding: 3px 2px; font-size: 10px; text-transform: uppercase;
    }
    tbody td { padding: 3px 2px; vertical-align: top; }
    .c-cant { width: 26px; text-align: center; }
    .c-val { text-align: right; white-space: nowrap; }
    th.c-val { text-align: right; }
    th.c-cant { text-align: center; }

    .c-total {
        display: flex; justify-content: space-between;
        font-size: 15px; font-weight: 700; margin-top: 6px;
    }
    .c-subtotal { display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; color: #333; }

    .c-notas { font-size: 10px; margin-top: 8px; color: #333; }
    .c-footer { text-align: center; font-size: 10px; color: #555; margin-top: 10px; }

    @media print {
        body { width: auto; }
        @page { margin: 4mm; }
    }
</style>
</head>
<body>

    <div class="c-header">
        <img src="${logo}" alt="${escaparHTML(NEGOCIO.nombre)}">
        <h1>${escaparHTML(NEGOCIO.nombre)}</h1>
        <p>${escaparHTML(NEGOCIO.lema)}</p>
        ${NEGOCIO.direccion ? `<p>${escaparHTML(NEGOCIO.direccion)}</p>` : ''}
        ${NEGOCIO.telefono ? `<p>Tel: ${escaparHTML(NEGOCIO.telefono)}</p>` : ''}
    </div>

    <hr class="c-sep">

    <div class="c-titulo">COMPROBANTE DE VENTA</div>
    <div class="c-numero">N° ${numero}</div>

    <div class="c-meta">
        <div><span>Fecha</span><span>${fechaComprobante(pedido.created_at)}</span></div>
        <div><span>Cliente</span><span>${escaparHTML(cliente)}</span></div>
        <div><span>Tipo</span><span>${etiquetaTipoComprobante(pedido.tipo)}</span></div>
        <div><span>Pago</span><span>${metodo}</span></div>
    </div>

    <hr class="c-sep">

    <table>
        <thead>
            <tr>
                <th class="c-cant">Cant</th>
                <th class="c-prod">Producto</th>
                <th class="c-val">Valor</th>
            </tr>
        </thead>
        <tbody>
            ${filas}
        </tbody>
    </table>

    <hr class="c-sep">

    ${costoDelivery > 0 ? `<div class="c-subtotal"><span>Costo de envío</span><span>$${costoDelivery.toFixed(2)}</span></div>` : ''}

    <div class="c-total">
        <span>TOTAL</span>
        <span>$${Number(pedido.total).toFixed(2)}</span>
    </div>

    ${pedido.notas ? `<div class="c-notas"><strong>Notas:</strong> ${escaparHTML(pedido.notas)}</div>` : ''}

    <hr class="c-sep">

    <div class="c-footer">
        ¡Gracias por su compra!<br>
        ${escaparHTML(NEGOCIO.nombre)}
    </div>

</body>
</html>`;

}

async function imprimirComprobante(pedidoId) {

    try {

        const response = await fetch(`${API_URL}/pedidos/${pedidoId}`);

        if (!response.ok) {
            mostrarNotificacion('No se pudo cargar el comprobante', 'error');
            return;
        }

        const pedido = await response.json();

        const logo = await obtenerLogoComprobante();

        const ventana = window.open('', '_blank', 'width=380,height=640');

        if (!ventana) {
            mostrarNotificacion('Permití las ventanas emergentes para imprimir', 'error');
            return;
        }

        ventana.document.open();
        ventana.document.write(construirHTMLComprobante(pedido, logo));
        ventana.document.close();

        ventana.focus();

        // Esperar a que la imagen del logo cargue antes de imprimir
        ventana.onload = () => {
            setTimeout(() => {
                ventana.print();
            }, 200);
        };

    } catch (error) {
        console.log('Error comprobante:', error);
        mostrarNotificacion('Ocurrió un error al generar el comprobante', 'error');
    }

}

// ==========================================================================
//  Reporte de ventas (formato hoja para imprimir)
// ==========================================================================

function etiquetaEstadoReporte(estado) {
    const estados = {
        pendiente: 'Pendiente',
        preparando: 'Preparando',
        listo: 'Listo',
        entregado: 'Entregado',
        pagado: 'Pagado',
        cancelado: 'Cancelado'
    };
    return estados[estado] || estado || '-';
}

function construirHTMLReporte({ ventas, titulo, resumen }, logo) {

    const emision = fechaComprobante(new Date());

    const filas = (ventas || []).map(v => `
        <tr class="${v.estado === 'cancelado' ? 'r-cancelado' : ''}">
            <td>#${v.id}</td>
            <td>${fechaComprobante(v.created_at)}</td>
            <td>${escaparHTML(v.cliente_nombre || 'Cliente General')}</td>
            <td>${etiquetaTipoComprobante(v.tipo)}</td>
            <td>${v.metodo_pago === 'transferencia' ? 'Transferencia' : 'Efectivo'}</td>
            <td>${etiquetaEstadoReporte(v.estado)}</td>
            <td class="r-val">$${Number(v.total).toFixed(2)}</td>
        </tr>
    `).join('');

    const totalVendido = Number(resumen?.total_vendido) || 0;
    const pedidos = Number(resumen?.pedidos) || 0;
    const ticket = Number(resumen?.ticket_promedio) || 0;
    const cancelados = Number(resumen?.cancelados) || 0;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte de ventas</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #111;
        background: #fff;
        padding: 24px;
        font-size: 12px;
    }

    .r-header {
        display: flex; align-items: center; gap: 14px;
        border-bottom: 2px solid #111; padding-bottom: 14px;
    }
    .r-header img { width: 56px; height: 56px; object-fit: contain; }
    .r-header .r-neg h1 { font-size: 20px; }
    .r-header .r-neg p { font-size: 11px; color: #555; }
    .r-header .r-doc { margin-left: auto; text-align: right; }
    .r-header .r-doc h2 { font-size: 16px; letter-spacing: 1px; }
    .r-header .r-doc p { font-size: 11px; color: #555; }

    .r-periodo { margin: 14px 0 10px; font-size: 13px; font-weight: 600; }

    .r-cards { display: flex; gap: 10px; margin-bottom: 16px; }
    .r-card {
        flex: 1; border: 1px solid #ddd; border-radius: 8px;
        padding: 10px 12px;
    }
    .r-card span { display: block; font-size: 10px; text-transform: uppercase; color: #666; }
    .r-card strong { font-size: 18px; }

    table { width: 100%; border-collapse: collapse; }
    thead th {
        background: #111; color: #fff; text-align: left;
        padding: 7px 8px; font-size: 11px;
    }
    thead th.r-val { text-align: right; }
    tbody td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .r-val { text-align: right; white-space: nowrap; }
    .r-cancelado td { color: #999; text-decoration: line-through; }

    tfoot td {
        padding: 9px 8px; border-top: 2px solid #111;
        font-weight: 700; font-size: 14px;
    }
    tfoot .r-val { font-size: 15px; }

    .r-vacio { text-align: center; padding: 24px; color: #888; }
    .r-footer { margin-top: 22px; text-align: center; font-size: 10px; color: #888; }

    @media print {
        body { padding: 0; }
        @page { margin: 12mm; size: A4 portrait; }
        thead { display: table-header-group; }
        .r-cancelado td { color: #999; }
    }
</style>
</head>
<body>

    <div class="r-header">
        <img src="${logo}" alt="${escaparHTML(NEGOCIO.nombre)}">
        <div class="r-neg">
            <h1>${escaparHTML(NEGOCIO.nombre)}</h1>
            <p>${escaparHTML(NEGOCIO.direccion || NEGOCIO.lema)}</p>
            ${NEGOCIO.telefono ? `<p>Tel: ${escaparHTML(NEGOCIO.telefono)}</p>` : ''}
        </div>
        <div class="r-doc">
            <h2>REPORTE DE VENTAS</h2>
            <p>Emitido: ${emision}</p>
        </div>
    </div>

    <div class="r-periodo">${escaparHTML(titulo || 'Ventas')}</div>

    <div class="r-cards">
        <div class="r-card"><span>Total vendido</span><strong>$${totalVendido.toFixed(2)}</strong></div>
        <div class="r-card"><span>Pedidos</span><strong>${pedidos}</strong></div>
        <div class="r-card"><span>Ticket promedio</span><strong>$${ticket.toFixed(2)}</strong></div>
        <div class="r-card"><span>Cancelados</span><strong>${cancelados}</strong></div>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Pago</th>
                <th>Estado</th>
                <th class="r-val">Total</th>
            </tr>
        </thead>
        <tbody>
            ${filas || `<tr><td colspan="7" class="r-vacio">No hay ventas en el período seleccionado</td></tr>`}
        </tbody>
        ${ventas && ventas.length ? `
        <tfoot>
            <tr>
                <td colspan="6">TOTAL VENDIDO (sin cancelados)</td>
                <td class="r-val">$${totalVendido.toFixed(2)}</td>
            </tr>
        </tfoot>` : ''}
    </table>

    <div class="r-footer">${escaparHTML(NEGOCIO.nombre)} — Reporte generado automáticamente</div>

</body>
</html>`;

}

async function imprimirReporteVentas({ ventas, titulo, resumen }) {

    try {

        const logo = await obtenerLogoComprobante();

        const ventana = window.open('', '_blank', 'width=900,height=700');

        if (!ventana) {
            mostrarNotificacion('Permití las ventanas emergentes para imprimir', 'error');
            return;
        }

        ventana.document.open();
        ventana.document.write(construirHTMLReporte({ ventas, titulo, resumen }, logo));
        ventana.document.close();

        ventana.focus();

        ventana.onload = () => {
            setTimeout(() => {
                ventana.print();
            }, 200);
        };

    } catch (error) {
        console.log('Error reporte:', error);
        mostrarNotificacion('Ocurrió un error al generar el reporte', 'error');
    }

}
