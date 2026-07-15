const tablaUsuarios = document.getElementById('tablaUsuarios');
const buscarUsuario = document.getElementById('buscarUsuario');
const formUsuario = document.getElementById('formUsuario');
const passwordUsuario = document.getElementById('passwordUsuario');
const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
const btnSubmitUsuario = formUsuario.querySelector('button[type="submit"]');

let usuariosGlobal = [];

async function cargarUsuarios() {

    try {

        const response = await fetch(`${API_URL}/usuarios`);

        const usuarios = await response.json();

        usuariosGlobal = usuarios;

        renderUsuarios(usuarios);

    } catch (error) {

        console.log(error);

    }

}

function renderUsuarios(usuarios) {

    tablaUsuarios.innerHTML = '';

    if (usuarios.length === 0) {

        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay usuarios registrados
                </td>
            </tr>
        `;

        return;

    }

    usuarios.forEach(usuario => {

        tablaUsuarios.innerHTML += `
            <tr>

                <td>
                    ${usuario.nombre}
                </td>

                <td>
                    ${usuario.email}
                </td>

                <td>

                    <span class="${
                        usuario.rol === 'admin' || usuario.rol === 'administrador'
                        ? 'rol-admin'
                        : 'rol-cajero'
                    }">

                        ${usuario.rol}

                    </span>

                </td>

                <td>

                    <span class="${
                        usuario.activo == 1
                        ? 'estado-activo'
                        : 'estado-inactivo'
                    }">

                        ${
                            usuario.activo == 1
                            ? 'Activo'
                            : 'Inactivo'
                        }

                    </span>

                </td>

                <td class="usuario-actions">

                    <button class="btn-edit"
                        onclick='editarUsuario(${JSON.stringify(usuario)})'>
                        Editar
                    </button>

                    <button class="btn-delete"
                        onclick="eliminarUsuario(${usuario.id})">
                        Eliminar
                    </button>

                </td>

            </tr>
        `;

    });

}

formUsuario.addEventListener('submit', async (e) => {

    e.preventDefault();

    const id = document.getElementById('usuarioId').value;

    try {

        const response = await fetch(
            id ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`,
            {

                method: id ? 'PUT' : 'POST',

                headers:{
                    'Content-Type':'application/json'
                },

                body:JSON.stringify({

                    nombre:
                        document.getElementById('nombreUsuario').value,

                    correo:
                        document.getElementById('correoUsuario').value,

                    password:
                        passwordUsuario.value,

                    rol:
                        document.getElementById('rolUsuario').value

                })

            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.error || 'Error');
            return;

        }

        alert(id ? 'Usuario actualizado' : 'Usuario creado');

        limpiarFormularioUsuario();

        cargarUsuarios();

    } catch (error) {

        console.log(error);

    }

});

function editarUsuario(usuario) {

    document.getElementById('usuarioId').value = usuario.id;
    document.getElementById('nombreUsuario').value = usuario.nombre;
    document.getElementById('correoUsuario').value = usuario.email;
    document.getElementById('rolUsuario').value = usuario.rol;

    passwordUsuario.value = '';
    passwordUsuario.required = false;
    passwordUsuario.placeholder = 'Nueva contraseña (dejar en blanco para no cambiarla)';

    btnSubmitUsuario.textContent = 'Guardar cambios';
    btnCancelarEdicion.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });

}

async function eliminarUsuario(id) {

    if (!confirm('¿Eliminar este usuario?')) return;

    try {

        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.error || 'Error al eliminar');
            return;

        }

        cargarUsuarios();

    } catch (error) {

        console.log(error);

    }

}

function limpiarFormularioUsuario() {

    formUsuario.reset();

    document.getElementById('usuarioId').value = '';

    passwordUsuario.required = true;
    passwordUsuario.placeholder = 'Contraseña';

    btnSubmitUsuario.textContent = 'Crear Usuario';
    btnCancelarEdicion.style.display = 'none';

}

btnCancelarEdicion.addEventListener('click', limpiarFormularioUsuario);

buscarUsuario.addEventListener('keyup', () => {

    const texto =
        buscarUsuario.value.toLowerCase();

    const filtrados =
        usuariosGlobal.filter(user =>

            user.nombre
                .toLowerCase()
                .includes(texto)

            ||

            user.email
                .toLowerCase()
                .includes(texto)

        );

    renderUsuarios(filtrados);

});

cargarUsuarios();