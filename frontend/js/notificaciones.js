const LOGO_URL = null;

function asegurarContenedorNotificaciones() {

    let cont = document.getElementById('notificacionesContainer');

    if (!cont) {
        cont = document.createElement('div');
        cont.id = 'notificacionesContainer';
        document.body.appendChild(cont);
    }

    return cont;

}

function mostrarNotificacion(mensaje, tipo = 'exito') {

    const cont = asegurarContenedorNotificaciones();

    const icono = tipo === 'error' ? '⚠️' : '✅';

    const marca = LOGO_URL
        ? `<img class="notificacion-logo" src="${LOGO_URL}" alt="">`
        : `<span class="notificacion-icono">${icono}</span>`;

    const noti = document.createElement('div');
    noti.className = `notificacion ${tipo}`;
    noti.innerHTML = `
        ${marca}
        <span class="notificacion-texto">${mensaje}</span>
    `;

    cont.appendChild(noti);

    setTimeout(() => {
        noti.classList.add('saliendo');
        setTimeout(() => noti.remove(), 250);
    }, 3500);

}

function mostrarConfirmacion(mensaje, textoConfirmar = 'Eliminar') {

    return new Promise(resolve => {

        const overlay = document.createElement('div');
        overlay.className = 'overlay-modal';

        overlay.innerHTML = `
            <div class="modal-card">
                <div class="modal-icono">⚠️</div>
                <p class="modal-texto">${mensaje}</p>
                <div class="modal-botones">
                    <button class="btn-modal-cancelar">Cancelar</button>
                    <button class="btn-modal-confirmar">${textoConfirmar}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function cerrar(resultado) {
            overlay.remove();
            resolve(resultado);
        }

        overlay.querySelector('.btn-modal-cancelar').addEventListener('click', () => cerrar(false));
        overlay.querySelector('.btn-modal-confirmar').addEventListener('click', () => cerrar(true));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrar(false);
        });

    });

}

function mostrarModal(contenidoHTML) {

    const overlay = document.createElement('div');
    overlay.className = 'overlay-modal';

    overlay.innerHTML = `
        <div class="modal-card modal-info">
            ${contenidoHTML}
            <button class="btn-modal-cerrar">Cerrar</button>
        </div>
    `;

    document.body.appendChild(overlay);

    function cerrar() {
        overlay.remove();
    }

    overlay.querySelector('.btn-modal-cerrar').addEventListener('click', cerrar);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrar();
    });

}
