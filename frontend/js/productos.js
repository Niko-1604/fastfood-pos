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
                    ${cat.nombre}
                </option>
            `;

        });

    } catch (error) {

        console.log(error);

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
                ? `<img src="http://localhost:3000${producto.imagen}" alt="">`
                : `<span style="font-size:60px;">🍔</span>`
            }

                </div>

                <div class="producto-info">

                    <h3>${producto.nombre}</h3>

                    <p>${producto.descripcion || ''}</p>

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

        await response.json();

        limpiarFormulario();
        cargarProductos();

    } catch (error) {

        console.log(error);

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

    if (!confirm('¿Eliminar producto?')) return;

    try {

        await fetch(`${API_URL}/menu/${id}`, {
            method: 'DELETE'
        });

        cargarProductos();

    } catch (error) {

        console.log(error);

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

async function crearCategoria() {
    const nombre = document.getElementById('nuevaCategoria').value.trim();

    if (!nombre) {
        alert('Ingresa el nombre de la categoría');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/menu/categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Error al crear categoría');
            return;
        }

        alert('Categoría creada correctamente');

        document.getElementById('nuevaCategoria').value = '';

        cargarCategorias();

    } catch (error) {
        console.log(error);
    }
}

cargarCategorias();
cargarProductos();