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

async function asegurarTablaCupones() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS cupones (
            id INT NOT NULL AUTO_INCREMENT,
            codigo VARCHAR(50) NOT NULL,
            tipo VARCHAR(20) NOT NULL DEFAULT 'porcentaje',
            valor DECIMAL(10,2) NOT NULL,
            fecha_expiracion DATE NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY codigo (codigo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

async function correrMigraciones() {
    try {
        // Registra qué usuario (cajero) generó cada venta
        await asegurarColumna('pedidos', 'usuario_id', '`usuario_id` INT NULL AFTER `cliente_id`');

        // Método de pago y costo de envío por pedido
        await asegurarColumna('pedidos', 'metodo_pago', "`metodo_pago` VARCHAR(20) NOT NULL DEFAULT 'efectivo'");
        await asegurarColumna('pedidos', 'costo_delivery', '`costo_delivery` DECIMAL(10,2) NOT NULL DEFAULT 0.00');

        // Descuento aplicado (cupón) por pedido
        await asegurarColumna('pedidos', 'descuento', '`descuento` DECIMAL(10,2) NOT NULL DEFAULT 0.00');
        await asegurarColumna('pedidos', 'cupon_codigo', '`cupon_codigo` VARCHAR(50) NULL');

        // Cédula del cliente (con índice único para evitar duplicados)
        await asegurarColumna('clientes', 'cedula', '`cedula` VARCHAR(20) NULL AFTER `nombre`');
        await asegurarIndiceUnico('clientes', 'cedula', 'cedula');

        // Tabla de cupones de descuento
        await asegurarTablaCupones();
    } catch (err) {
        console.error('⚠️ Error corriendo migraciones automáticas:', err.message);
    }
}

module.exports = { correrMigraciones };
