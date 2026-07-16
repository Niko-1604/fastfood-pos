const tablaClientes = document.getElementById('tablaClientes');
const formCliente = document.getElementById('formCliente');

async function cargarClientes() {

    try {

        const response = await fetch(`${API_URL}/clientes`);
        const clientes = await response.json();

        tablaClientes.innerHTML = '';

        clientes.forEach(cliente => {

            tablaClientes.innerHTML += `
                <tr>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.telefono || ''}</td>
                    <td>${cliente.cedula || ''}</td>
                    <td>${cliente.direccion || ''}</td>
                    <td>
                        <button class="btn-edit" onclick='editarCliente(${JSON.stringify(cliente)})'>
                            Editar
                        </button>

                        <button class="btn-delete" onclick='eliminarCliente(${cliente.id})'>
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;

        });

    } catch (error) {

        console.log('Error:', error);

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