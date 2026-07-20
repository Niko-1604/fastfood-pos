-- Registra qué usuario (cajero/admin) generó cada venta.
-- Ejecutar una sola vez sobre la base de datos (local y producción/Railway).
-- Es idempotente: si la columna ya existe, no hace nada.

ALTER TABLE `pedidos`
    ADD COLUMN IF NOT EXISTS `usuario_id` INT(11) NULL AFTER `cliente_id`;

-- Clave foránea opcional (si el usuario se elimina, la venta conserva histórico con usuario_id = NULL).
-- Descomentar solo si no existe ya una FK con este nombre:
-- ALTER TABLE `pedidos`
--     ADD CONSTRAINT `fk_pedidos_usuario`
--     FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;
