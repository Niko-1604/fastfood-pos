const db = require('./db');

// Migraciones automáticas que se ejecutan al arrancar el servidor.
// Son idempotentes: revisan antes de aplicar, y funcionan en MySQL 8 y MariaDB.

async function asegurarColumna(tabla, columna, definicion) {
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${tabla}\` LIKE ?`, [columna]);
    if (cols.length === 0) {
        await db.query(`ALTER TABLE \`${tabla}\` ADD COLUMN ${definicion}`);
        console.log(`✅ Migración: columna ${tabla}.${columna} creada`);
    }
}

async function correrMigraciones() {
    try {
        // Registra qué usuario (cajero) generó cada venta
        await asegurarColumna('pedidos', 'usuario_id', '`usuario_id` INT NULL AFTER `cliente_id`');
    } catch (err) {
        console.error('⚠️ Error corriendo migraciones automáticas:', err.message);
    }
}

module.exports = { correrMigraciones };
