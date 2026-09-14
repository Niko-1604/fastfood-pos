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
const cuponCodigo = document.getElementById('cuponCodigo');
const btnAplicarCupon = document.getElementById('btnAplicarCupon');
const cuponAplicadoBox = document.getElementById('cuponAplicadoBox');
const descuentoRow = document.getElementById('descuentoRow');
const descuentoValor = document.getElementById('descuentoValor');

let productosGlobal = [];
let carrito = [];
let categoriaActual = 'todos';
let metodoPagoActual = 'efectivo';
let cuponAplicado = null; // { codigo, tipo, valor }

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const productos = await response.json();

        productosGlobal = productos;
        renderCategoriasPOS();
        aplicarFiltros();
    } catch (error) {
        console.log('Error productos:', error);
        productosPOS.innerHTML = `<p class="pos-error">No se pudieron cargar los productos. Revisá tu conexión e intentá de nuevo.</p>`;
        mostrarNotificacion('No se pudieron cargar los productos', 'error');
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
                    <h3>${escaparHTML(prod.nombre)}</h3>
                    <p>${escaparHTML(prod.descripcion || '')}</p>
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
        if (descuentoRow) descuentoRow.style.display = 'none';
        return;
    }

    carrito.forEach(item => {
        const itemSubtotal = Number(item.precio) * item.cantidad;

        carritoItems.innerHTML += `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <h4>${escaparHTML(item.nombre)}</h4>
                    <p>$${Number(item.precio).toFixed(2)} c/u · $${itemSubtotal.toFixed(2)}</p>
                </div>

                <div class="acciones-carrito">
                    <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
                    <input type="number" class="cantidad-input" min="1" value="${item.cantidad}"
                           onchange="fijarCantidad(${item.id}, this.value)">
                    <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    <button class="btn-quitar-item" title="Quitar producto" onclick="quitarDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    const totales = calcularTotales();

    subtotalElement.innerText = `$${totales.subtotal.toFixed(2)}`;

    if (descuentoRow) {
        if (totales.descuento > 0) {
            descuentoRow.style.display = 'flex';
            descuentoValor.innerText = `-$${totales.descuento.toFixed(2)}`;
        } else {
            descuentoRow.style.display = 'none';
        }
    }

    totalElement.innerText = `$${totales.total.toFixed(2)}`;
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

function fijarCantidad(id, valor) {
    const item = carrito.find(p => p.id == id);

    if (!item) return;

    const n = parseInt(valor, 10);

    if (!n || n <= 0) {
        carrito = carrito.filter(p => p.id != id);
    } else {
        item.cantidad = n;
    }

    renderCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(p => p.id != id);
    renderCarrito();
}

function volverClienteGeneral() {
    clienteId.value = '1';
    clienteNombreResuelto.textContent = 'Cliente General';
    clienteNombreResuelto.classList.remove('encontrado');
}

function cedulaValida(cedula) {
    return /^\d{10}$/.test(cedula) || /^\d{13}$/.test(cedula);
}

async function buscarClientePorCedula() {
    const cedula = clienteCedula.value.trim();

    if (!cedula) {
        volverClienteGeneral();
        return;
    }

    if (!cedulaValida(cedula)) {
        mostrarNotificacion('La cédula debe tener solo números: 10 dígitos (cédula) o 13 (RUC)', 'error');
        volverClienteGeneral();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/buscar/${encodeURIComponent(cedula)}`);

        if (response.status === 404) {
            abrirModalNuevoCliente(cedula);
            return;
        }

        if (!response.ok) {
            mostrarNotificacion('No se pudo verificar el cliente', 'error');
            volverClienteGeneral();
            return;
        }

        const cliente = await response.json();

        clienteId.value = cliente.id;
        clienteNombreResuelto.textContent = cliente.nombre;
        clienteNombreResuelto.classList.add('encontrado');

    } catch (error) {
        console.log('Error buscando cliente:', error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');
    }
}

function abrirModalNuevoCliente(cedula) {

    const overlay = document.createElement('div');
    overlay.className = 'overlay-modal';
    overlay.innerHTML = `
        <div class="modal-card modal-info">

            <button class="modal-cerrar-x" id="ncCerrar" aria-label="Cerrar">&times;</button>

            <h3>Nuevo cliente</h3>
            <p class="nuevo-cliente-sub">No existe un cliente con esa cédula. Cargá sus datos, o cerrá con la ✕ para dejarlo como Cliente General.</p>

            <form id="formNuevoCliente" class="form-nuevo-cliente">

                <label for="ncNombre">Nombre *</label>
                <input type="text" id="ncNombre" placeholder="Nombre y apellido" required>

                <label for="ncCedula">Cédula / RUC</label>
                <input type="text" id="ncCedula" value="${escaparHTML(cedula)}" readonly>

                <label for="ncTelefono">Teléfono</label>
                <input type="text" id="ncTelefono" inputmode="numeric" placeholder="Opcional">

                <label for="ncDireccion">Dirección</label>
                <input type="text" id="ncDireccion" placeholder="Opcional">

                <div class="modal-botones">
                    <button type="button" class="btn-modal-cancelar" id="ncGeneral">Cliente General</button>
                    <button type="submit" class="btn-modal-confirmar">Guardar cliente</button>
                </div>

            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = (dejarGeneral) => {
        if (dejarGeneral) volverClienteGeneral();
        overlay.remove();
    };

    overlay.querySelector('#ncCerrar').addEventListener('click', () => cerrar(true));
    overlay.querySelector('#ncGeneral').addEventListener('click', () => cerrar(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(true); });

    setTimeout(() => overlay.querySelector('#ncNombre').focus(), 50);

    overlay.querySelector('#formNuevoCliente').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = overlay.querySelector('#ncNombre').value.trim();

        if (!nombre) {
            mostrarNotificacion('El nombre es obligatorio', 'error');
            return;
        }

        const btn = overlay.querySelector('.btn-modal-confirmar');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        try {
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    telefono: overlay.querySelector('#ncTelefono').value.trim(),
                    cedula,
                    direccion: overlay.querySelector('#ncDireccion').value.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                mostrarNotificacion(data.error || 'No se pudo crear el cliente', 'error');
                btn.disabled = false;
                btn.textContent = 'Guardar cliente';
                return;
            }

            clienteId.value = data.id;
            clienteNombreResuelto.textContent = nombre;
            clienteNombreResuelto.classList.add('encontrado');

            mostrarNotificacion('Cliente creado y asignado a la venta');
            overlay.remove();

        } catch (error) {
            console.log(error);
            mostrarNotificacion('No se pudo conectar con el servidor', 'error');
            btn.disabled = false;
            btn.textContent = 'Guardar cliente';
        }
    });
}

function usuarioActualId() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        return usuario?.id || null;
    } catch (e) {
        return null;
    }
}

function calcularTotales() {
    const subtotal = carrito.reduce((s, item) => s + Number(item.precio) * item.cantidad, 0);
    const delivery = obtenerCostoDelivery();

    let descuento = 0;
    if (cuponAplicado) {
        descuento = cuponAplicado.tipo === 'monto'
            ? Math.min(cuponAplicado.valor, subtotal)
            : subtotal * cuponAplicado.valor / 100;
        descuento = Math.round(descuento * 100) / 100;
    }

    const total = Math.max(0, subtotal - descuento) + delivery;
    return { subtotal, descuento, delivery, total };
}

async function aplicarCupon() {
    const codigo = cuponCodigo.value.trim();
    if (!codigo) return;

    try {
        const response = await fetch(`${API_URL}/cupones/validar/${encodeURIComponent(codigo)}`);
        const data = await response.json();

        if (!response.ok) {
            cuponAplicado = null;
            mostrarNotificacion(data.error || 'Cupón no válido', 'error');
            renderCupon();
            renderCarrito();
            return;
        }

        cuponAplicado = { codigo: data.codigo, tipo: data.tipo, valor: Number(data.valor) };
        mostrarNotificacion(`Cupón ${data.codigo} aplicado`);
        renderCupon();
        renderCarrito();

    } catch (error) {
        console.log('Error cupón:', error);
        mostrarNotificacion('No se pudo validar el cupón', 'error');
    }
}

function quitarCupon() {
    cuponAplicado = null;
    cuponCodigo.value = '';
    renderCupon();
    renderCarrito();
}

function textoCupon(cupon) {
    return cupon.tipo === 'monto' ? `$${Number(cupon.valor).toFixed(2)}` : `${Number(cupon.valor)}%`;
}

function renderCupon() {
    if (cuponAplicado) {
        cuponCodigo.style.display = 'none';
        btnAplicarCupon.style.display = 'none';
        cuponAplicadoBox.style.display = 'flex';
        cuponAplicadoBox.innerHTML = `
            <span>🎟️ ${escaparHTML(cuponAplicado.codigo)} · ${textoCupon(cuponAplicado)} OFF</span>
            <button type="button" onclick="quitarCupon()" title="Quitar cupón">✕</button>
        `;
    } else {
        cuponCodigo.style.display = '';
        btnAplicarCupon.style.display = '';
        cuponAplicadoBox.style.display = 'none';
        cuponAplicadoBox.innerHTML = '';
    }
}

// "Finalizar Venta" abre el modal de cobro; la venta se confirma desde ahí.
function finalizarVenta() {
    if (carrito.length === 0) {
        mostrarNotificacion('Agregá al menos un producto antes de finalizar', 'error');
        return;
    }
    abrirModalCobro();
}

function abrirModalCobro() {
    const { descuento, delivery, total } = calcularTotales();
    const esEfectivo = metodoPagoActual === 'efectivo';

    const itemsHTML = carrito.map(item => `
        <div class="detalle-item">
            <span>${item.cantidad}x ${escaparHTML(item.nombre)}</span>
            <span>$${(Number(item.precio) * item.cantidad).toFixed(2)}</span>
        </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'overlay-modal';
    overlay.innerHTML = `
        <div class="modal-card modal-info">
            <h3>Confirmar venta</h3>

            <div class="detalle-items">${itemsHTML}</div>

            ${descuento > 0 ? `<div class="detalle-item"><span>Descuento${cuponAplicado ? ' (' + escaparHTML(cuponAplicado.codigo) + ')' : ''}</span><span>-$${descuento.toFixed(2)}</span></div>` : ''}

            ${delivery > 0 ? `<div class="detalle-item"><span>Costo de envío</span><span>$${delivery.toFixed(2)}</span></div>` : ''}

            <div class="detalle-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>

            ${esEfectivo ? `
            <div class="cobro-efectivo">
                <label for="efectivoRecibido">Efectivo recibido</label>
                <input type="number" id="efectivoRecibido" step="0.01" min="0" inputmode="decimal" placeholder="0.00">
                <div class="cobro-vuelto">
                    <span>Vuelto</span>
                    <strong id="vueltoValor">$0.00</strong>
                </div>
                <div id="cobroAviso" class="cobro-aviso"></div>
            </div>` : `
            <p class="cobro-transferencia">Pago por transferencia</p>`}

            <div class="modal-botones">
                <button class="btn-modal-cancelar" id="btnCancelarCobro">Cancelar</button>
                <button class="btn-modal-confirmar" id="btnConfirmarCobro">Confirmar venta</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = () => overlay.remove();
    const btnConfirmar = overlay.querySelector('#btnConfirmarCobro');

    overlay.querySelector('#btnCancelarCobro').addEventListener('click', cerrar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });

    let efectivoRecibido = 0;
    let vuelto = 0;

    if (esEfectivo) {
        const inputRecibido = overlay.querySelector('#efectivoRecibido');
        const vueltoValor = overlay.querySelector('#vueltoValor');
        const aviso = overlay.querySelector('#cobroAviso');

        const actualizar = () => {
            efectivoRecibido = Number(inputRecibido.value || 0);
            vuelto = efectivoRecibido - total;

            if (efectivoRecibido < total) {
                vueltoValor.textContent = '$0.00';
                aviso.textContent = `Faltan $${(total - efectivoRecibido).toFixed(2)}`;
                btnConfirmar.disabled = true;
            } else {
                vueltoValor.textContent = `$${vuelto.toFixed(2)}`;
                aviso.textContent = '';
                btnConfirmar.disabled = false;
            }
        };

        inputRecibido.addEventListener('input', actualizar);
        inputRecibido.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !btnConfirmar.disabled) btnConfirmar.click();
        });

        actualizar();
        setTimeout(() => inputRecibido.focus(), 50);
    }

    btnConfirmar.addEventListener('click', async () => {
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Procesando...';

        const data = await registrarVenta();

        if (!data) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = 'Confirmar venta';
            return;
        }

        cerrar();
        mostrarNotificacion('Venta registrada correctamente');

        const extras = esEfectivo ? { efectivo_recibido: efectivoRecibido, vuelto } : null;

        if (data.id) {
            mostrarModal(`
                <h3>Venta #${data.id} registrada</h3>
                <p class="venta-ok-texto">La venta se guardó correctamente.${esEfectivo ? ` Vuelto: <strong>$${vuelto.toFixed(2)}</strong>` : ''}</p>
                <button class="btn-imprimir-modal" onclick='imprimirComprobante(${data.id}, ${JSON.stringify(extras)})'>
                    <i class="fas fa-print"></i> Imprimir comprobante
                </button>
            `);
        }

        limpiarVenta();
    });
}

async function registrarVenta() {
    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente_id: clienteId.value || 1,
                usuario_id: usuarioActualId(),
                tipo: tipoPedido.value,
                costo_delivery: obtenerCostoDelivery(),
                metodo_pago: metodoPagoActual,
                cupon_codigo: cuponAplicado ? cuponAplicado.codigo : null,
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
            return null;
        }

        return data;

    } catch (error) {
        console.log('Error venta:', error);
        mostrarNotificacion('No se pudo conectar con el servidor. Intentá de nuevo.', 'error');
        return null;
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

    cuponAplicado = null;
    cuponCodigo.value = '';
    renderCupon();

    renderCarrito();
}

buscarProductoPOS.addEventListener('keyup', aplicarFiltros);

// Solo dígitos, máximo 13 (RUC)
clienteCedula.addEventListener('input', () => {
    clienteCedula.value = clienteCedula.value.replace(/\D/g, '').slice(0, 13);
});

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

btnAplicarCupon.addEventListener('click', aplicarCupon);
cuponCodigo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        aplicarCupon();
    }
});

metodoPago.querySelectorAll('.metodo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        metodoPago.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        metodoPagoActual = btn.dataset.metodo;
    });
});

cargarProductos();
renderCarrito();