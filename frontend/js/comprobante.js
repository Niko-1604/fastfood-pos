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
