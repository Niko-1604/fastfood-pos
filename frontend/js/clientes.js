const tablaClientes = document.getElementById('tablaClientes');
const formCliente = document.getElementById('formCliente');
const buscarCliente = document.getElementById('buscarCliente');

let clientesGlobal = [];

async function cargarClientes() {

    try {

        const response = await fetch(`${API_URL}/clientes`);
        clientesGlobal = await response.json();

        renderClientes(clientesGlobal);

    } catch (error) {

        console.log('Error:', error);

        tablaClientes.innerHTML = `
            <tr>
                <td colspan="5">
                    No se pudieron cargar los clientes. Revisá tu conexión e intentá de nuevo.
                </td>
            </tr>
        `;

        mostrarNotificacion('No se pudieron cargar los clientes', 'error');

    }

}

function renderClientes(clientes) {

    tablaClientes.innerHTML = '';

    if (clientes.length === 0) {
        tablaClientes.innerHTML = `
            <tr>
                <td colspan="5">No se encontraron clientes</td>
            </tr>
        `;
        return;
    }

    const esAdmin = rolActual() === 'admin';

    clientes.forEach(cliente => {

        const botonEliminar = esAdmin
            ? `<button class="btn-delete" onclick='eliminarCliente(${cliente.id})'>Eliminar</button>`
            : '';

        tablaClientes.innerHTML += `
            <tr>
                <td>${escaparHTML(cliente.nombre)}</td>
                <td>${escaparHTML(cliente.telefono || '')}</td>
                <td>${escaparHTML(cliente.cedula || '')}</td>
                <td>${escaparHTML(cliente.direccion || '')}</td>
                <td>
                    <button class="btn-edit" onclick='editarCliente(${JSON.stringify(cliente)})'>
                        Editar
                    </button>
                    ${botonEliminar}
                </td>
            </tr>
        `;

    });

}

if (buscarCliente) {
    buscarCliente.addEventListener('keyup', () => {

        const texto = buscarCliente.value.toLowerCase().trim();

        const filtrados = clientesGlobal.filter(c =>
            (c.nombre || '').toLowerCase().includes(texto) ||
            (c.cedula || '').toLowerCase().includes(texto) ||
            (c.telefono || '').toLowerCase().includes(texto)
        );

        renderClientes(filtrados);

    });
}

function rolActual() {
    try {
        return (JSON.parse(localStorage.getItem('usuario'))?.rol || '').toLowerCase();
    } catch (e) {
        return '';
    }
}

formCliente.addEventListener('submit', async (e) => {

    e.preventDefault();

    const id = document.getElementById('clienteId').value;

    const cliente = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        cedula: document.getElementById('cedula').value,
        direccion: document.getElementById('direccion').value
    };

    try {

        let response;

        if (id) {

            response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cliente)
            });

        } else {

            response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cliente)
            });

        }

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo guardar el cliente', 'error');
            return;
        }

        limpiarFormulario();
        cargarClientes();

    } catch (error) {

        console.log(error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');

    }

});

function editarCliente(cliente) {

    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('telefono').value = cliente.telefono;
    document.getElementById('cedula').value = cliente.cedula;
    document.getElementById('direccion').value = cliente.direccion;

}

async function eliminarCliente(id) {

    const confirmado = await mostrarConfirmacion('¿Eliminar este cliente?');
    if (!confirmado) return;

    try {

        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo eliminar el cliente', 'error');
            return;
        }

        mostrarNotificacion('Cliente eliminado correctamente');
        cargarClientes();

    } catch (error) {

        console.log(error);

    }

}

function limpiarFormulario() {

    formCliente.reset();
    document.getElementById('clienteId').value = '';

}

cargarClientes();