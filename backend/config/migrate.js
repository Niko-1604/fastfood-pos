const db = require('./db');

// Migraciones automáticas que se ejecutan al arrancar el servidor.
// Son idempotentes: revisan antes de aplicar, y funcionan en MySQL 8 y MariaDB.
// Esto permite montar el proyecto desde cero (importando el .sql viejo) sin
// que falle por columnas nuevas que el código necesita.

async function asegurarColumna(tabla, columna, definicion) {
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${tabla}\` LIKE ?`, [columna]);
    if (cols.length === 0) {
        await db.query(`ALTER TABLE \`${tabla}\` ADD COLUMN ${definicion}`);
        console.log(`✅ Migración: columna ${tabla}.${columna} creada`);
    }
}

async function asegurarIndiceUnico(tabla, indice, columna) {
    // Salta si ya hay CUALQUIER índice sobre esa columna (evita duplicar en Railway)
    const [idx] = await db.query(`SHOW INDEX FROM \`${tabla}\` WHERE Column_name = ?`, [columna]);
    if (idx.length === 0) {
        try {
            await db.query(`ALTER TABLE \`${tabla}\` ADD UNIQUE KEY \`${indice}\` (\`${columna}\`)`);
            console.log(`✅ Migración: índice único ${tabla}.${indice} creado`);
        } catch (e) {
            console.error(`⚠️ No se pudo crear el índice ${indice}:`, e.message);
        }
    }
}

async function correrMigraciones() {
    try {
        // Registra qué usuario (cajero) generó cada venta
        await asegurarColumna('pedidos', 'usuario_id', '`usuario_id` INT NULL AFTER `cliente_id`');

        // Método de pago y costo de envío por pedido
        await asegurarColumna('pedidos', 'metodo_pago', "`metodo_pago` VARCHAR(20) NOT NULL DEFAULT 'efectivo'");
        await asegurarColumna('pedidos', 'costo_delivery', '`costo_delivery` DECIMAL(10,2) NOT NULL DEFAULT 0.00');

        // Cédula del cliente (con índice único para evitar duplicados)
        await asegurarColumna('clientes', 'cedula', '`cedula` VARCHAR(20) NULL AFTER `nombre`');
        await asegurarIndiceUnico('clientes', 'cedula', 'cedula');
    } catch (err) {
        console.error('⚠️ Error corriendo migraciones automáticas:', err.message);
    }
}

module.exports = { correrMigraciones };
