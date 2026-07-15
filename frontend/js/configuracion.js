const formCategoria = document.getElementById('formCategoria');
const categoriaIdInput = document.getElementById('categoriaId');
const nombreCategoriaInput = document.getElementById('nombreCategoria');
const btnCancelarCategoria = document.getElementById('btnCancelarCategoria');
const listaCategorias = document.getElementById('listaCategorias');
const btnSubmitCategoria = formCategoria.querySelector('button[type="submit"]');

async function cargarCategorias() {

    try {

        const response = await fetch(`${API_URL}/menu/categorias`);
        const categorias = await response.json();

        renderCategorias(categorias);

    } catch (error) {

        console.log(error);

    }

}

function renderCategorias(categorias) {

    listaCategorias.innerHTML = '';

    if (categorias.length === 0) {
        listaCategorias.innerHTML = '<p class="empty-msg">No hay categorías registradas</p>';
        return;
    }

    categorias.forEach(cat => {

        listaCategorias.innerHTML += `
            <div class="categoria-item">

                <div class="categoria-info">
                    <strong>${cat.icono || '🏷️'} ${cat.nombre}</strong>
                    <small>${cat.productos} producto${cat.productos == 1 ? '' : 's'}</small>
                </div>

                <div class="categoria-actions">

                    <button class="btn-edit"
                        onclick='editarCategoria(${JSON.stringify(cat)})'>
                        Editar
                    </button>

                    <button class="btn-delete"
                        onclick="eliminarCategoria(${cat.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;

    });

}

formCategoria.addEventListener('submit', async (e) => {

    e.preventDefault();

    const id = categoriaIdInput.value;
    const nombre = nombreCategoriaInput.value.trim();

    try {

        const response = await fetch(
            id ? `${API_URL}/menu/categorias/${id}` : `${API_URL}/menu/categorias`,
            {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'Error', 'error');
            return;
        }

        mostrarNotificacion(id ? 'Categoría actualizada' : 'Categoría creada');
        limpiarFormularioCategoria();
        cargarCategorias();

    } catch (error) {

        console.log(error);

    }

});

function editarCategoria(cat) {

    categoriaIdInput.value = cat.id;
    nombreCategoriaInput.value = cat.nombre;

    btnSubmitCategoria.textContent = 'Guardar cambios';
    btnCancelarCategoria.style.display = 'inline-block';

    nombreCategoriaInput.focus();

}

async function eliminarCategoria(id) {

    const confirmado = await mostrarConfirmacion('¿Eliminar esta categoría?');
    if (!confirmado) return;

    try {

        const response = await fetch(`${API_URL}/menu/categorias/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo eliminar', 'error');
            return;
        }

        mostrarNotificacion('Categoría eliminada correctamente');
        cargarCategorias();

    } catch (error) {

        console.log(error);

    }

}

function limpiarFormularioCategoria() {

    formCategoria.reset();
    categoriaIdInput.value = '';

    btnSubmitCategoria.textContent = 'Crear categoría';
    btnCancelarCategoria.style.display = 'none';

}

btnCancelarCategoria.addEventListener('click', limpiarFormularioCategoria);

cargarCategorias();

const formPassword = document.getElementById('formPassword');
const passwordActual = document.getElementById('passwordActual');
const passwordNueva = document.getElementById('passwordNueva');
const passwordConfirmar = document.getElementById('passwordConfirmar');

formPassword.addEventListener('submit', async (e) => {

    e.preventDefault();

    if (passwordNueva.value !== passwordConfirmar.value) {
        mostrarNotificacion('La nueva contraseña y su confirmación no coinciden', 'error');
        return;
    }

    try {

        const response = await fetch(`${API_URL}/usuarios/perfil/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                passwordActual: passwordActual.value,
                passwordNueva: passwordNueva.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'Error al actualizar la contraseña', 'error');
            return;
        }

        mostrarNotificacion('Contraseña actualizada correctamente');
        formPassword.reset();

    } catch (error) {

        console.log(error);

    }

});

const secciones = {
    categorias: {
        el: document.getElementById('seccionCategorias'),
        titulo: 'Cargar Categoría',
        subtitulo: 'Creá, editá o eliminá las categorías del menú'
    },
    password: {
        el: document.getElementById('seccionPassword'),
        titulo: 'Cambiar Contraseña',
        subtitulo: 'Actualizá tu contraseña de acceso'
    }
};

const tituloConfig = document.getElementById('tituloConfig');
const subtituloConfig = document.getElementById('subtituloConfig');
const submenuLinks = document.querySelectorAll('.submenu-link');

function mostrarSeccionConfig(nombre) {

    Object.values(secciones).forEach(s => s.el.style.display = 'none');
    secciones[nombre].el.style.display = '';

    submenuLinks.forEach(link =>
        link.classList.toggle('active', link.dataset.seccion === nombre)
    );

    tituloConfig.textContent = secciones[nombre].titulo;
    subtituloConfig.textContent = secciones[nombre].subtitulo;

}

submenuLinks.forEach(link => {

    link.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccionConfig(link.dataset.seccion);
    });

});
