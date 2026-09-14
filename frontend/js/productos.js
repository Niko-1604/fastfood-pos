const productosGrid = document.getElementById('productosGrid');
const formProducto = document.getElementById('formProducto');
const categoriaSelect = document.getElementById('categoria');
const buscarProducto = document.getElementById('buscarProducto');

let productosGlobal = [];

async function cargarCategorias() {

    try {

        const response = await fetch(`${API_URL}/menu/categorias`);
        const categorias = await response.json();

        categoriaSelect.innerHTML = '';

        categorias.forEach(cat => {

            categoriaSelect.innerHTML += `
                <option value="${cat.id}">
                    ${escaparHTML(cat.nombre)}
                </option>
            `;

        });

    } catch (error) {

        console.log(error);
        mostrarNotificacion('No se pudieron cargar las categorías', 'error');

    }

}

async function cargarProductos() {

    try {

        const response = await fetch(`${API_URL}/menu`);
        const productos = await response.json();

        productosGlobal = productos;

        renderProductos(productos);

    } catch (error) {

        console.log(error);

        productosGrid.innerHTML = `
            <div class="loading">
                No se pudieron cargar los productos. Revisá tu conexión e intentá de nuevo.
            </div>
        `;

        mostrarNotificacion('No se pudieron cargar los productos', 'error');

    }

}

function renderProductos(productos) {

    productosGrid.innerHTML = '';

    if (productos.length === 0) {

        productosGrid.innerHTML = `
            <div class="loading">
                No hay productos
            </div>
        `;

        return;

    }

    productos.forEach(producto => {

        productosGrid.innerHTML += `
            <div class="producto-card">

                <div class="producto-img">

                    ${producto.imagen
                ? `<img src="${SERVER_URL}${producto.imagen}" alt="">`
                : `<span style="font-size:60px;">🍔</span>`
            }

                </div>

                <div class="producto-info">

                    <h3>${escaparHTML(producto.nombre)}</h3>

                    <p>${escaparHTML(producto.descripcion || '')}</p>

                    <div class="precio">
                        $${Number(producto.precio).toFixed(2)}
                    </div>

                    <div class="producto-actions">

                        <button class="btn-edit"
                            onclick='editarProducto(${JSON.stringify(producto)})'>
                            Editar
                        </button>

                        <button class="btn-delete"
                            onclick='eliminarProducto(${producto.id})'>
                            Eliminar
                        </button>

                    </div>

                </div>

            </div>
        `;

    });

}

formProducto.addEventListener('submit', async (e) => {

    e.preventDefault();

    const id = document.getElementById('productoId').value;

    const formData = new FormData();

    formData.append('categoria_id', categoriaSelect.value);
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('precio', document.getElementById('precio').value);

    const imagenFile = document.getElementById('imagen').files[0];

    if (imagenFile) {
        formData.append('imagen', imagenFile);
    }

    formData.append(
        'imagen_actual',
        document.getElementById('imagenActual').value
    );

    try {

        let response;

        if (id) {
            response = await fetch(`${API_URL}/menu/${id}`, {

                method: 'PUT',
                body: formData

            });
        } else {
            response = await fetch(`${API_URL}/menu`, {

                method: 'POST',
                body: formData

            });
        }

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo guardar el producto', 'error');
            return;
        }

        mostrarNotificacion(id ? 'Producto actualizado' : 'Producto creado');

        limpiarFormulario();
        cargarProductos();

    } catch (error) {

        console.log(error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');

    }

});

function editarProducto(producto) {

    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcion').value = producto.descripcion;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('imagen').value = producto.imagen;
    categoriaSelect.value = producto.categoria_id;

}

async function eliminarProducto(id) {

    const confirmado = await mostrarConfirmacion('¿Eliminar este producto?');
    if (!confirmado) return;

    try {

        const response = await fetch(`${API_URL}/menu/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo eliminar el producto', 'error');
            return;
        }

        mostrarNotificacion('Producto eliminado correctamente');
        cargarProductos();

    } catch (error) {

        console.log(error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');

    }

}

function limpiarFormulario() {

    formProducto.reset();
    document.getElementById('productoId').value = '';

}

buscarProducto.addEventListener('keyup', () => {

    const texto = buscarProducto.value.toLowerCase();

    const filtrados = productosGlobal.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    renderProductos(filtrados);

});

cargarCategorias();
cargarProductos();