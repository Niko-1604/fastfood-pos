// Respaldo completo de la base a un archivo .sql restaurable.
//
// Uso:
//   node scripts/backup.js
//
// Conexión: RESET_DB_URL (Railway) si existe, si no las DB_* del .env (local).
// El .sql se guarda en la carpeta backups/ del proyecto (ignorada por git).

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const mysql = require('mysql2/promise');

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

async function main() {
    const cfg = conexionConfig();
    const conn = await mysql.createConnection(cfg);

    const [tablasRows] = await conn.query('SHOW TABLES');
    const key = Object.keys(tablasRows[0] || {})[0];
    const tablas = tablasRows.map(r => r[key]);

    let sql = `-- Respaldo de ${cfg.database}\n-- Fecha: ${new Date().toISOString()}\n\n`;
    sql += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

    let totalFilas = 0;

    for (const t of tablas) {
        const [[create]] = await conn.query(`SHOW CREATE TABLE \`${t}\``);
        const ddl = create['Create Table'] || create['View'];

        sql += `-- ----- Tabla: ${t} -----\n`;
        sql += `DROP TABLE IF EXISTS \`${t}\`;\n${ddl};\n\n`;

        const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
        if (rows.length) {
            const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
            for (const row of rows) {
                const vals = Object.values(row).map(v => conn.escape(v)).join(', ');
                sql += `INSERT INTO \`${t}\` (${cols}) VALUES (${vals});\n`;
            }
            sql += '\n';
            totalFilas += rows.length;
        }
    }

    sql += 'SET FOREIGN_KEY_CHECKS=1;\n';

    const dir = path.join(__dirname, '..', '..', 'backups');
    fs.mkdirSync(dir, { recursive: true });

    const stamp = new Date().toISOString().replace(/:/g, '-').replace('T', '_').slice(0, 19);
    const file = path.join(dir, `backup-${stamp}.sql`);
    fs.writeFileSync(file, sql, 'utf8');

    console.log(`\n✅ Respaldo listo`);
    console.log(`   Archivo:  ${file}`);
    console.log(`   Tablas:   ${tablas.length}`);
    console.log(`   Filas:    ${totalFilas}`);
    console.log(`   Tamaño:   ${(sql.length / 1024).toFixed(1)} KB\n`);

    await conn.end();
}

main().catch(e => {
    console.error('❌ Error en el respaldo:', e.message);
    process.exit(1);
});
