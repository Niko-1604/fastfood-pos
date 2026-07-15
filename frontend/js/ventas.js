const tablaVentas = document.getElementById('tablaVentas');
const buscarVenta = document.getElementById('buscarVenta');

let ventasGlobal = [];

async function cargarVentas() {

    try {

        const response = await fetch(`${API_URL}/pedidos`);

        const ventas = await response.json();

        ventasGlobal = ventas;

        renderVentas(ventas);

    } catch (error) {

        console.log(error);

    }

}

function renderVentas(ventas) {

    tablaVentas.innerHTML = '';

    if (ventas.length === 0) {

        tablaVentas.innerHTML = `
            <tr>
                <td colspan="7">
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
                    $${Number(venta.total).toFixed(2)}
                </td>

                <td>
                    ${venta.tipo}
                </td>

                <td>
                    <span class="estado pagado">
    Pagado
</span>
                </td>

                <td>
                    ${formatearFecha(venta.created_at)}
                </td>

                <td>

                    <button class="btn-detalle"
                        onclick="verDetalle(${venta.id})">

                        Ver detalle

                    </button>

                </td>

            </tr>
        `;

    });

}

function formatearFecha(fecha) {

    return new Date(fecha)
    .toLocaleString('es-EC');

}

async function verDetalle(id) {

    try {

        const response = await fetch(`${API_URL}/pedidos/${id}`);

        const pedido = await response.json();

        let detalle = `Pedido #${pedido.id}\n\n`;

        pedido.detalle.forEach(item => {

            detalle += `
${item.producto_nombre}
Cantidad: ${item.cantidad}
Subtotal: $${item.subtotal}

`;

        });

        detalle += `\nTOTAL: $${pedido.total}`;

        alert(detalle);

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

cargarVentas();