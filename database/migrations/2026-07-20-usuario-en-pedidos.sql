-- Registra qué usuario (cajero/admin) generó cada venta.
-- Ejecutar UNA sola vez sobre cada base de datos (local y producción/Railway).

-- ------------------------------------------------------------------
-- OPCIÓN A — MySQL 8 (Railway) y también válida en MariaDB:
-- ------------------------------------------------------------------
ALTER TABLE `pedidos` ADD COLUMN `usuario_id` INT NULL AFTER `cliente_id`;
-- Si al correrla dice "Duplicate column name 'usuario_id'", la columna
-- ya existe: la migración ya estaba aplicada, no hay que hacer nada más.

-- ------------------------------------------------------------------
-- OPCIÓN B — solo MariaDB (idempotente, no falla si ya existe):
-- ------------------------------------------------------------------
-- ALTER TABLE `pedidos` ADD COLUMN IF NOT EXISTS `usuario_id` INT NULL AFTER `cliente_id`;

-- ------------------------------------------------------------------
-- FK opcional (la venta conserva histórico aunque se borre el usuario):
-- ------------------------------------------------------------------
-- ALTER TABLE `pedidos`
--     ADD CONSTRAINT `fk_pedidos_usuario`
--     FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
