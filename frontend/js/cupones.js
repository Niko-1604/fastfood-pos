const formCupon = document.getElementById('formCupon');
const cuponId = document.getElementById('cuponId');
const codigoCupon = document.getElementById('codigoCupon');
const tipoCupon = document.getElementById('tipoCupon');
const valorCupon = document.getElementById('valorCupon');
const labelValor = document.getElementById('labelValor');
const expiracionCupon = document.getElementById('expiracionCupon');
const activoCupon = document.getElementById('activoCupon');
const btnCancelarCupon = document.getElementById('btnCancelarCupon');
const btnSubmitCupon = formCupon.querySelector('button[type="submit"]');
const tablaCupones = document.getElementById('tablaCupones');
const buscarCupon = document.getElementById('buscarCupon');
const tituloFormCupon = document.getElementById('tituloFormCupon');

let cuponesGlobal = [];

function textoDescuento(cupon) {
    return cupon.tipo === 'monto'
        ? `$${Number(cupon.valor).toFixed(2)}`
        : `${Number(cupon.valor)}%`;
}

function textoExpiracion(cupon) {
    if (!cupon.fecha_expiracion) return 'Sin vencimiento';
    const f = String(cupon.fecha_expiracion).slice(0, 10);
    return new Date(`${f}T00:00:00`).toLocaleDateString('es-EC', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function cuponVencido(cupon) {
    if (!cupon.fecha_expiracion) return false;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const exp = new Date(`${String(cupon.fecha_expiracion).slice(0, 10)}T00:00:00`);
    return exp < hoy;
}

async function cargarCupones() {
    try {
        const response = await fetch(`${API_URL}/cupones`);
        cuponesGlobal = await response.json();
        renderCupones(cuponesGlobal);
    } catch (error) {
        console.log(error);
        tablaCupones.innerHTML = `<tr><td colspan="5">No se pudieron cargar los cupones. Revisá tu conexión.</td></tr>`;
        mostrarNotificacion('No se pudieron cargar los cupones', 'error');
    }
}

function renderCupones(cupones) {

    tablaCupones.innerHTML = '';

    if (!cupones.length) {
        tablaCupones.innerHTML = `<tr><td colspan="5">No hay cupones registrados</td></tr>`;
        return;
    }

    cupones.forEach(cupon => {

        const vencido = cuponVencido(cupon);
        const estado = cupon.activo == 0
            ? { txt: 'Inactivo', clase: 'cupon-inactivo' }
            : vencido
                ? { txt: 'Vencido', clase: 'cupon-vencido' }
                : { txt: 'Activo', clase: 'cupon-activo' };

        tablaCupones.innerHTML += `
            <tr>
                <td><strong>${escaparHTML(cupon.codigo)}</strong></td>
                <td>${textoDescuento(cupon)}</td>
                <td>${textoExpiracion(cupon)}</td>
                <td><span class="cupon-estado ${estado.clase}">${estado.txt}</span></td>
                <td class="cupon-acciones">
                    <button class="btn-edit" onclick='editarCupon(${JSON.stringify(cupon)})'>Editar</button>
                    <button class="btn-flyer" title="Generar flyer" onclick='generarFlyer(${JSON.stringify(cupon)})'>
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="btn-delete" onclick="eliminarCupon(${cupon.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function actualizarLabelValor() {
    labelValor.textContent = tipoCupon.value === 'monto' ? 'Valor ($)' : 'Valor (%)';
    valorCupon.placeholder = tipoCupon.value === 'monto' ? '2.00' : '10';
}

tipoCupon.addEventListener('change', actualizarLabelValor);

formCupon.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = cuponId.value;

    const body = {
        codigo: codigoCupon.value.trim(),
        tipo: tipoCupon.value,
        valor: valorCupon.value,
        fecha_expiracion: expiracionCupon.value || null,
        activo: activoCupon.checked ? 1 : 0
    };

    try {
        const response = await fetch(
            id ? `${API_URL}/cupones/${id}` : `${API_URL}/cupones`,
            {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo guardar el cupón', 'error');
            return;
        }

        mostrarNotificacion(id ? 'Cupón actualizado' : 'Cupón creado');
        limpiarFormularioCupon();
        cargarCupones();

    } catch (error) {
        console.log(error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');
    }
});

function editarCupon(cupon) {
    cuponId.value = cupon.id;
    codigoCupon.value = cupon.codigo;
    tipoCupon.value = cupon.tipo;
    valorCupon.value = Number(cupon.valor);
    expiracionCupon.value = cupon.fecha_expiracion ? String(cupon.fecha_expiracion).slice(0, 10) : '';
    activoCupon.checked = cupon.activo != 0;

    actualizarLabelValor();

    tituloFormCupon.textContent = 'Editar Cupón';
    btnSubmitCupon.textContent = 'Guardar cambios';
    btnCancelarCupon.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminarCupon(id) {
    const confirmado = await mostrarConfirmacion('¿Eliminar este cupón?');
    if (!confirmado) return;

    try {
        const response = await fetch(`${API_URL}/cupones/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok) {
            mostrarNotificacion(data.error || 'No se pudo eliminar', 'error');
            return;
        }

        mostrarNotificacion('Cupón eliminado');
        cargarCupones();

    } catch (error) {
        console.log(error);
        mostrarNotificacion('No se pudo conectar con el servidor', 'error');
    }
}

function limpiarFormularioCupon() {
    formCupon.reset();
    cuponId.value = '';
    activoCupon.checked = true;
    actualizarLabelValor();

    tituloFormCupon.textContent = 'Nuevo Cupón';
    btnSubmitCupon.textContent = 'Crear Cupón';
    btnCancelarCupon.style.display = 'none';
}

btnCancelarCupon.addEventListener('click', limpiarFormularioCupon);

buscarCupon.addEventListener('keyup', () => {
    const texto = buscarCupon.value.toLowerCase().trim();
    const filtrados = cuponesGlobal.filter(c => (c.codigo || '').toLowerCase().includes(texto));
    renderCupones(filtrados);
});

// ---- Flyer imprimible ----

function logoFlyer() {
    const existente = document.querySelector('.logo-icon img');
    const src = existente ? existente.src : `${window.location.origin}/img/panda-logo.png`;

    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) { resolve(src); }
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });
}

async function generarFlyer(cupon) {

    const logo = await logoFlyer();
    const descuento = textoDescuento(cupon);
    const vigencia = cupon.fecha_expiracion
        ? `Válido hasta el ${textoExpiracion(cupon)}`
        : 'Sin fecha de vencimiento';

    const ventana = window.open('', '_blank', 'width=520,height=720');
    if (!ventana) {
        mostrarNotificacion('Permití las ventanas emergentes para generar el flyer', 'error');
        return;
    }

    ventana.document.open();
    ventana.document.write(`
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Cupón ${escaparHTML(cupon.codigo)}</title>
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI', Arial, sans-serif; background:#fff; }
    .flyer {
        width:420px; margin:20px auto; border:3px dashed #ef4444; border-radius:24px;
        padding:36px 30px; text-align:center; color:#111;
    }
    .flyer img { width:90px; height:90px; object-fit:contain; margin-bottom:10px; }
    .neg { font-size:22px; font-weight:800; letter-spacing:.5px; }
    .lema { font-size:12px; color:#777; margin-bottom:18px; }
    .off { font-size:64px; font-weight:900; color:#ef4444; line-height:1; margin:6px 0; }
    .off small { font-size:22px; }
    .desc { font-size:15px; color:#333; margin-bottom:20px; }
    .codigo-wrap { margin:18px 0; }
    .codigo-label { font-size:12px; color:#777; text-transform:uppercase; letter-spacing:2px; }
    .codigo { display:inline-block; margin-top:6px; font-size:28px; font-weight:800; letter-spacing:2px;
              background:#111; color:#fff; padding:10px 24px; border-radius:12px; }
    .vigencia { margin-top:20px; font-size:13px; color:#555; }
    .pie { margin-top:8px; font-size:11px; color:#999; }
    @media print { .flyer { margin:0 auto; } @page { margin:8mm; } }
</style></head>
<body>
    <div class="flyer">
        <img src="${logo}" alt="">
        <div class="neg">FastFood Manibe</div>
        <div class="lema">Comida rápida</div>

        <div class="off">${cupon.tipo === 'monto' ? '<small>$</small>' + Number(cupon.valor).toFixed(2) : Number(cupon.valor) + '<small>%</small>'}</div>
        <div class="desc">de descuento en tu compra</div>

        <div class="codigo-wrap">
            <div class="codigo-label">Usá el código</div>
            <div class="codigo">${escaparHTML(cupon.codigo)}</div>
        </div>

        <div class="vigencia">${vigencia}</div>
        <div class="pie">Presentá este cupón en el local · Pallatanga y Cosanga E8-130</div>
    </div>
</body></html>`);
    ventana.document.close();
    ventana.focus();
    ventana.onload = () => setTimeout(() => ventana.print(), 200);
}

actualizarLabelValor();
cargarCupones();
