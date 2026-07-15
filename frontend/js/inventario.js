const tablaInventario = document.getElementById('tablaInventario');
const buscarInventario = document.getElementById('buscarInventario');
const tablaMovimientos = document.getElementById('tablaMovimientos');

let inventarioGlobal = [];

async function cargarInventario() {
    try {
        const response = await fetch(`${API_URL}/inventario`);
        const inventario = await response.json();

        inventarioGlobal = inventario;
        renderInventario(inventario);
    } catch (error) {
        console.log('Error inventario:', error);
    }
}

function renderInventario(inventario) {
    tablaInventario.innerHTML = '';

    if (inventario.length === 0) {
        tablaInventario.innerHTML = `
            <tr>
                <td colspan="5">No hay inventario registrado</td>
            </tr>
        `;
        return;
    }

    inventario.forEach(item => {
        const bajo = Number(item.stock_actual) <= Number(item.stock_minimo);

        tablaInventario.innerHTML += `
            <tr>
                <td>${item.producto_nombre}</td>
                <td>${item.stock_actual}</td>
                <td>${item.stock_minimo}</td>
                <td>
                    <span class="${bajo ? 'estado-bajo' : 'estado-ok'}">
                        ${bajo ? 'Stock bajo' : 'Disponible'}
                    </span>
                </td>
                <td>
                    <div class="movimiento-box">
                        <input type="number" id="cant_${item.producto_id}" min="1" value="1">

                        <button class="btn-entrada" onclick="registrarMovimiento(${item.producto_id}, 'entrada')">
                            Entrada
                        </button>

                        <button class="btn-salida" onclick="registrarMovimiento(${item.producto_id}, 'salida')">
                            Salida
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

async function registrarMovimiento(productoId, tipo) {
    const cantidad = document.getElementById(`cant_${productoId}`).value;

    if (!cantidad || Number(cantidad) <= 0) {
        alert('Ingresa una cantidad válida');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/inventario/movimiento`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                producto_id: productoId,
                tipo,
                cantidad: Number(cantidad),
                motivo: tipo === 'entrada' ? 'Ingreso manual' : 'Salida manual'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert('Error: ' + data.error);
            return;
        }

        alert('Movimiento registrado');

        cargarInventario();
        cargarMovimientos();

    } catch (error) {
        console.log('Error movimiento:', error);
    }
}

async function cargarMovimientos() {
    try {
        const response = await fetch(`${API_URL}/inventario/movimientos`);
        const movimientos = await response.json();

        renderMovimientos(movimientos);
    } catch (error) {
        console.log('Error movimientos:', error);
    }
}

function renderMovimientos(movimientos) {
    tablaMovimientos.innerHTML = '';

    if (movimientos.length === 0) {
        tablaMovimientos.innerHTML = `
            <tr>
                <td colspan="5">No hay movimientos registrados</td>
            </tr>
        `;
        return;
    }

    movimientos.forEach(mov => {
        tablaMovimientos.innerHTML += `
            <tr>
                <td>${mov.producto_nombre}</td>
                <td>
                    <span class="${mov.tipo === 'entrada' ? 'tipo-entrada' : 'tipo-salida'}">
                        ${mov.tipo}
                    </span>
                </td>
                <td>${mov.cantidad}</td>
                <td>${mov.motivo || ''}</td>
                <td>${new Date(mov.created_at).toLocaleString('es-EC')}</td>
            </tr>
        `;
    });
}

buscarInventario.addEventListener('keyup', () => {
    const texto = buscarInventario.value.toLowerCase();

    const filtrado = inventarioGlobal.filter(item =>
        (item.producto_nombre || '')
            .toLowerCase()
            .includes(texto)
    );

    renderInventario(filtrado);
});

cargarInventario();
cargarMovimientos();