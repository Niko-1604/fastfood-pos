// Vaciado seguro + carga de categorías y productos desde scripts/productos.json
//
// Uso:
//   node scripts/importar.js              -> SIMULACRO (no toca nada, solo informa)
//   node scripts/importar.js --confirmar  -> EJECUTA el vaciado y la carga
//
// Conexión:
//   - Si existe RESET_DB_URL (mysql://user:pass@host:port/db) en el .env, usa esa
//     (para apuntar a Railway/producción).
//   - Si no, usa las variables DB_* del .env (base local).
//
// El .env está en .gitignore, así que las credenciales NO se suben al repo.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const mysql = require('mysql2/promise');

const CONFIRMAR = process.argv.includes('--confirmar');

function conexionConfig() {
    if (process.env.RESET_DB_URL) {
        const u = new URL(process.env.RESET_DB_URL);
        return {
            host: u.hostname,
            port: Number(u.port) || 3306,
            user: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
            database: u.pathname.replace(/^\//, '')
        };
    }
    return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
}

// Orden de borrado que respeta las llaves foráneas
const TABLAS_A_VACIAR = [
    'detalle_pedido',
    'pedidos',
    'movimientos_inventario',
    'inventario',
    'productos',
    'categorias'
];

async function main() {

    const productosPath = path.join(__dirname, 'productos.json');

    if (!fs.existsSync(productosPath)) {
        console.error('❌ Falta scripts/productos.json con la lista de productos.');
        process.exit(1);
    }

    const productos = JSON.parse(fs.readFileSync(productosPath, 'utf8'));
    const categorias = [...new Set(productos.map(p => (p.categoria || '').trim()).filter(Boolean))];

    const cfg = conexionConfig();
    const destino = process.env.RESET_DB_URL ? 'RAILWAY (producción)' : 'LOCAL';

    console.log('\n==== Importación FastFood ====');
    console.log(`Destino:     ${destino} -> ${cfg.host}:${cfg.port}/${cfg.database}`);
    console.log(`Categorías:  ${categorias.length} (${categorias.join(', ')})`);
    console.log(`Productos:   ${productos.length}`);
    console.log(`Modo:        ${CONFIRMAR ? '⚠️  EJECUTAR (borra y carga)' : '🔍 SIMULACRO (no toca nada)'}\n`);

    const conn = await mysql.createConnection(cfg);

    // Mostrar qué se borraría
    for (const tabla of [...TABLAS_A_VACIAR, 'clientes']) {
        try {
            const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${tabla}\``);
            const extra = tabla === 'clientes' ? ' (se conserva Cliente General id=1)' : '';
            console.log(`  - ${tabla}: ${n} filas actuales${extra}`);
        } catch (e) {
            console.log(`  - ${tabla}: (no existe o sin acceso)`);
        }
    }

    if (!CONFIRMAR) {
        console.log('\n🔍 SIMULACRO: no se ejecutó ningún cambio.');
        console.log('   Para aplicar de verdad: node scripts/importar.js --confirmar\n');
        await conn.end();
        return;
    }

    try {
        await conn.beginTransaction();

        for (const tabla of TABLAS_A_VACIAR) {
            await conn.query(`DELETE FROM \`${tabla}\``);
        }
        await conn.query('DELETE FROM clientes WHERE id <> 1');

        // Garantizar Cliente General
        await conn.query(
            "INSERT INTO clientes (id, nombre, telefono, email) VALUES (1,'Cliente General','0000000000','general@fastfood.com') " +
            "ON DUPLICATE KEY UPDATE nombre = 'Cliente General'"
        );

        // Crear categorías -> mapa nombre:id
        const catId = {};
        for (const nombre of categorias) {
            const [r] = await conn.query('INSERT INTO categorias (nombre, activo) VALUES (?, 1)', [nombre]);
            catId[nombre] = r.insertId;
        }

        // Insertar productos
        for (const p of productos) {
            const imagen = p.imagen ? `/uploads/productos/${p.imagen}` : '';
            await conn.query(
                'INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen, disponible) VALUES (?,?,?,?,?,1)',
                [catId[(p.categoria || '').trim()] || null, p.nombre, p.descripcion || '', Number(p.precio) || 0, imagen]
            );
        }

        await conn.commit();
        console.log(`\n✅ Listo: ${categorias.length} categorías y ${productos.length} productos cargados. Cliente General conservado.\n`);

    } catch (e) {
        await conn.rollback();
        console.error('\n❌ Error: se revirtió TODO, la base quedó como estaba.\n', e.message, '\n');
        process.exitCode = 1;
    } finally {
        await conn.end();
    }
}

main().catch(e => {
    console.error('❌ No se pudo conectar / ejecutar:', e.message);
    process.exit(1);
});
