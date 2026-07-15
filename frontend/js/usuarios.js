const tablaUsuarios = document.getElementById('tablaUsuarios');
const buscarUsuario = document.getElementById('buscarUsuario');
const formUsuario = document.getElementById('formUsuario');

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
                <td colspan="4">
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

            </tr>
        `;

    });

}

formUsuario.addEventListener('submit', async (e) => {

    e.preventDefault();

    try {

        const response = await fetch(`${API_URL}/usuarios`, {

            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({

                nombre:
                    document.getElementById('nombreUsuario').value,

                correo:
                    document.getElementById('correoUsuario').value,

                password:
                    document.getElementById('passwordUsuario').value,

                rol:
                    document.getElementById('rolUsuario').value

            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.error || 'Error');
            return;

        }

        alert('Usuario creado');

        formUsuario.reset();

        cargarUsuarios();

    } catch (error) {

        console.log(error);

    }

});

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