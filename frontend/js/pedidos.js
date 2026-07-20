const productosPOS = document.getElementById('productosPOS');
const carritoItems = document.getElementById('carritoItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const clienteCedula = document.getElementById('clienteCedula');
const clienteNombreResuelto = document.getElementById('clienteNombreResuelto');
const clienteId = document.getElementById('clienteId');
const tipoPedido = document.getElementById('tipoPedido');
const deliveryFeeWrap = document.getElementById('deliveryFeeWrap');
const costoDelivery = document.getElementById('costoDelivery');
const metodoPago = document.getElementById('metodoPago');
const notas = document.getElementById('notas');
const buscarProductoPOS = document.getElementById('buscarProductoPOS');
const categoriasPOS = document.getElementById('categoriasPOS');

let productosGlobal = [];
let carrito = [];
let categoriaActual = 'todos';
let metodoPagoActual = 'efectivo';

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const productos = await response.json();

        productosGlobal = productos;
        renderCategoriasPOS();
        aplicarFiltros();
    } catch (error) {
        console.log('Error productos:', error);
    }
}

function renderCategoriasPOS() {

    const nombres = [...new Set(
        productosGlobal
            .map(prod => prod.categoria)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    if (!nombres.includes(categoriaActual)) {
        categoriaActual = 'todos';
    }

    categoriasPOS.innerHTML = `
        <button class="categoria-btn ${categoriaActual === 'todos' ? 'active' : ''}"
            onclick="filtrarCategoria('todos', this)">
            Todos
        </button>
    `;

    nombres.forEach(nombre => {
        categoriasPOS.innerHTML += `
            <button class="categoria-btn ${categoriaActual === nombre ? 'active' : ''}"
                onclick="filtrarCategoria('${nombre}', this)">
                ${nombre}
            </button>
        `;
    });

}

function renderProductos(productos) {
    productosPOS.innerHTML = '';

    if (productos.length === 0) {
        productosPOS.innerHTML = `<p>No hay productos disponibles</p>`;
        return;
    }

    productos.forEach(prod => {
        let imagenHTML = `
            <div style="height:140px;display:flex;align-items:center;justify-content:center;font-size:55px;background:#111827;">
                🍔
            </div>
        `;

        if (prod.imagen) {
            const imagen = prod.imagen.startsWith('/uploads')
                ? `${SERVER_URL}${prod.imagen}`
                : prod.imagen;

            imagenHTML = `<img src="${imagen}" alt="${prod.nombre}">`;
        }

        productosPOS.innerHTML += `
            <div class="producto-card">
                ${imagenHTML}

                <div class="producto-info">
                    <h3>${prod.nombre}</h3>
                    <p>${prod.descripcion || ''}</p>
                    <span>$${Number(prod.precio).toFixed(2)}</span>

                    <button onclick="agregarCarrito(${prod.id})">
                        Agregar
                    </button>
                </div>
            </div>
        `;
    });
}

function filtrarCategoria(categoria, boton) {
    categoriaActual = categoria;

    document.querySelectorAll('.categoria-btn')
        .forEach(btn => btn.classList.remove('active'));

    boton.classList.add('active');

    aplicarFiltros();
}

function aplicarFiltros() {
    const texto = buscarProductoPOS.value.toLowerCase();

    const filtrados = productosGlobal.filter(prod => {
        const nombre = (prod.nombre || '').toLowerCase();
        const categoria = prod.categoria || '';

        const coincideTexto = nombre.includes(texto);

        const coincideCategoria =
            categoriaActual === 'todos' ||
            categoria === categoriaActual;

        return coincideTexto && coincideCategoria;
    });

    renderProductos(filtrados);
}

function agregarCarrito(id) {
    const producto = productosGlobal.find(p => p.id == id);

    if (!producto) return;

    const existe = carrito.find(item => item.id == id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    renderCarrito();
}

function renderCarrito() {
    carritoItems.innerHTML = '';

    if (carrito.length === 0) {
        carritoItems.innerHTML = `<p class="empty">No hay productos agregados</p>`;
        subtotalElement.innerText = '$0.00';
        totalElement.innerText = '$0.00';
        return;
    }

    let subtotal = 0;

    carrito.forEach(item => {
        const itemSubtotal = Number(item.precio) * item.cantidad;
        subtotal += itemSubtotal;

        carritoItems.innerHTML += `
            <div class="carrito-item">
                <div>
                    <h4>${item.nombre}</h4>
                    <p>${item.cantidad} x $${Number(item.precio).toFixed(2)}</p>
                </div>

                <div class="acciones-carrito">
                    <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    });

    subtotalElement.innerText = `$${subtotal.toFixed(2)}`;
    totalElement.innerText = `$${(subtotal + obtenerCostoDelivery()).toFixed(2)}`;
}

function obtenerCostoDelivery() {
    if (tipoPedido.value !== 'delivery') return 0;
    return Number(costoDelivery.value || 0);
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(p => p.id == id);

    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => p.id != id);
    }

    renderCarrito();
}

function volverClienteGeneral() {
    clienteId.value = '1';
    clienteNombreResuelto.textContent = 'Cliente General';
    clienteNombreResuelto.classList.remove('encontrado');
}

async function buscarClientePorCedula() {
    const cedula = clienteCedula.value.trim();

    if (!cedula) {
        volverClienteGeneral();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/buscar/${encodeURIComponent(cedula)}`);

        if (!response.ok) {
            mostrarNotificacion('Cliente no encontrado, se registrará como Cliente General', 'error');
            volverClienteGeneral();
            return;
        }

        const cliente = await response.json();

        clienteId.value = cliente.id;
        clienteNombreResuelto.textContent = cliente.nombre;
        clienteNombreResuelto.classList.add('encontrado');

    } catch (error) {
        console.log('Error buscando cliente:', error);
    }
}

async function finalizarVenta() {
    if (carrito.length === 0) {
        mostrarNotificacion('Agregá al menos un producto antes de finalizar', 'error');
        return;
    }

    const btnVender = document.querySelector('.btn-vender');

    btnVender.disabled = true;
    btnVender.textContent = 'Procesando...';

    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente_id: clienteId.value || 1,
                tipo: tipoPedido.value,
                costo_delivery: obtenerCostoDelivery(),
                metodo_pago: metodoPagoActual,
                notas: notas.value,
                items: carrito.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'Error al registrar venta', 'error');
            return;
        }

        mostrarNotificacion('Venta registrada correctamente');

        if (data.id) {
            mostrarModal(`
                <h3>Venta #${data.id} registrada</h3>
                <p class="venta-ok-texto">La venta se guardó correctamente.</p>
                <button class="btn-imprimir-modal" onclick="imprimirComprobante(${data.id})">
                    <i class="fas fa-print"></i> Imprimir comprobante
                </button>
            `);
        }

        limpiarVenta();

    } catch (error) {
        console.log('Error venta:', error);
    } finally {
        btnVender.disabled = false;
        btnVender.textContent = 'Finalizar Venta';
    }
}

function limpiarVenta() {
    carrito = [];
    notas.value = '';

    tipoPedido.value = 'local';
    deliveryFeeWrap.style.display = 'none';
    costoDelivery.value = '1.00';

    metodoPagoActual = 'efectivo';
    metodoPago.querySelectorAll('.metodo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metodo === 'efectivo');
    });

    renderCarrito();
}

buscarProductoPOS.addEventListener('keyup', aplicarFiltros);

clienteCedula.addEventListener('blur', buscarClientePorCedula);
clienteCedula.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarClientePorCedula();
    }
});

tipoPedido.addEventListener('change', () => {
    const esDelivery = tipoPedido.value === 'delivery';
    deliveryFeeWrap.style.display = esDelivery ? 'block' : 'none';
    if (esDelivery) costoDelivery.value = '1.00';
    renderCarrito();
});

costoDelivery.addEventListener('input', renderCarrito);

metodoPago.querySelectorAll('.metodo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        metodoPago.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        metodoPagoActual = btn.dataset.metodo;
    });
});

cargarProductos();
renderCarrito();