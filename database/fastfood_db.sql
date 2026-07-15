CREATE DATABASE IF NOT EXISTS `fastfood_db` CHARACTER SET utf8mb4;
USE `fastfood_db`;

-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: fastfood_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Hamburguesas','🍔',1,'2026-05-07 15:06:18'),(2,'Pizzas','🍕',1,'2026-05-07 15:06:18'),(3,'Bebidas','🥤',1,'2026-05-07 15:06:18'),(4,'Postres','🍦',1,'2026-05-07 15:06:18'),(5,'Combos','🍟',1,'2026-05-07 15:06:18'),(6,'Hamburguesas Grill',NULL,0,'2026-05-11 18:09:31'),(7,'Salchipapas',NULL,1,'2026-05-11 18:09:31'),(8,'Mixtas',NULL,1,'2026-05-11 18:09:31'),(9,'Papi',NULL,1,'2026-05-11 18:09:31'),(10,'Bebidas',NULL,1,'2026-05-11 18:09:31'),(11,'Adicionales',NULL,1,'2026-05-11 18:09:31'),(12,'Domicilio',NULL,1,'2026-05-11 23:28:02'),(13,'Pruebas',NULL,1,'2026-05-12 16:17:41'),(14,'Postres QA',NULL,0,'2026-07-15 16:16:55'),(15,'Alitas',NULL,1,'2026-07-15 16:19:10');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Cliente General','0000000000','general@fastfood.com',NULL,'2026-05-07 15:06:18'),(3,'María García','0987654321','maria-teran@email.com','San bartolo','2026-05-07 15:06:18'),(4,'Nicolhai','0961572313','nicolahi.casa@proconty.com','Prueba de Clientes','2026-05-07 17:00:45'),(5,'Belen Casa','0961572313','nicolahi.cs16@gmail.com','Pallatanga y cosanga E8-130','2026-05-07 22:24:01'),(6,'Juan Yambiza','0961572313','juanito@belen.com','AV. DE LAS GALAXIAS\nDIAGONAL AL CLUB CAMPESTRE LA UTE','2026-05-07 22:40:09'),(7,'Nicol Arriaga','0961572313','Pruebas@gmail.com','Paul Rivet y Jose Orton','2026-05-12 16:18:05');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedido`
--

DROP TABLE IF EXISTS `detalle_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedido`
--

LOCK TABLES `detalle_pedido` WRITE;
/*!40000 ALTER TABLE `detalle_pedido` DISABLE KEYS */;
INSERT INTO `detalle_pedido` VALUES (1,1,9,1,1.50,1.50),(2,1,8,1,6.00,6.00),(3,1,7,1,7.00,7.00),(4,2,9,1,1.50,1.50),(5,2,5,1,5.50,5.50),(6,2,3,1,4.50,4.50),(7,2,2,1,5.00,5.00),(8,2,7,1,7.00,7.00),(9,3,11,3,4.50,13.50),(10,3,4,1,1.00,1.00),(11,4,11,1,4.50,4.50),(12,4,10,1,9.99,9.99),(13,4,4,1,1.00,1.00),(14,4,3,1,4.50,4.50),(15,4,12,3,0.25,0.75),(16,5,12,2,0.25,0.50),(17,6,10,1,9.99,9.99),(18,6,7,1,7.00,7.00),(19,6,6,1,5.50,5.50),(20,6,5,1,5.50,5.50),(21,7,6,1,5.50,5.50),(22,7,7,1,7.00,7.00),(23,8,6,1,5.50,5.50),(24,8,7,1,7.00,7.00),(25,9,17,1,1.00,1.00),(26,10,7,1,7.00,7.00),(27,11,16,1,4.50,4.50),(28,12,7,1,7.00,7.00),(29,13,14,1,5.25,5.25),(30,14,6,1,5.50,5.50);
/*!40000 ALTER TABLE `detalle_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `stock_actual` int(11) DEFAULT 0,
  `stock_minimo` int(11) DEFAULT 5,
  `unidad` varchar(50) DEFAULT 'unidad',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,1,20,5,'unidad','2026-05-07 15:41:07'),(2,2,14,5,'unidad','2026-05-07 20:51:11'),(3,3,9,3,'unidad','2026-05-07 22:41:03'),(4,4,48,10,'unidad','2026-05-07 22:41:03'),(5,5,15,3,'unidad','2026-05-12 16:52:57'),(6,1,20,5,'unidad','2026-05-07 16:57:12'),(7,2,14,5,'unidad','2026-05-07 20:51:11'),(8,3,9,3,'unidad','2026-05-07 22:41:03'),(9,4,48,10,'unidad','2026-05-07 22:41:03'),(10,5,11,2,'unidad','2026-05-12 16:52:57'),(11,11,7,5,'unidad','2026-05-07 22:41:03'),(12,12,10,5,'unidad','2026-05-12 16:18:30'),(13,13,1,5,'unidad','2026-07-15 17:25:19'),(14,14,0,5,'unidad','2026-07-15 16:04:50'),(15,15,0,5,'unidad','2026-07-15 16:16:55'),(16,16,0,5,'unidad','2026-07-15 16:19:31');
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos_inventario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `producto_id` int(11) NOT NULL,
  `tipo` enum('entrada','salida') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,11,'entrada',1,'Ingreso manual','2026-05-07 21:31:37'),(2,11,'entrada',10,'Ingreso manual','2026-05-07 21:31:46'),(3,5,'salida',5,'Salida manual','2026-05-07 21:31:53'),(4,5,'entrada',10,'Ingreso manual','2026-05-07 21:53:13'),(5,3,'entrada',1,'Ingreso manual','2026-05-07 22:27:03'),(6,12,'entrada',15,'Ingreso manual','2026-05-12 15:42:17'),(7,13,'salida',1,'Salida manual','2026-05-12 16:48:31'),(8,13,'entrada',2,'Ingreso manual','2026-07-15 17:25:19');
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','preparando','listo','entregado','pagado','cancelado') DEFAULT 'pagado',
  `tipo` enum('local','para_llevar','delivery') DEFAULT 'local',
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,1,14.50,'pagado','local','Prueba','2026-05-07 20:38:32','2026-07-15 18:02:24'),(2,1,23.50,'pagado','local','Prueba','2026-05-07 20:51:11','2026-07-15 18:02:24'),(3,5,14.50,'pagado','para_llevar','Pedido debe salir En 5','2026-05-07 22:24:48','2026-07-15 18:02:24'),(4,6,20.74,'pagado','para_llevar','Pedido Listo','2026-05-07 22:41:03','2026-07-15 18:02:24'),(5,5,0.50,'pagado','local','','2026-05-12 16:18:30','2026-07-15 18:02:24'),(6,5,27.99,'pagado','local','','2026-05-12 16:52:57','2026-07-15 18:02:24'),(7,1,12.50,'pagado','para_llevar','','2026-07-15 16:03:43','2026-07-15 18:02:24'),(8,3,12.50,'pagado','local','Pare llevar','2026-07-15 16:05:07','2026-07-15 18:02:24'),(9,1,1.00,'pagado','local','','2026-07-15 17:31:07','2026-07-15 18:02:24'),(10,3,7.00,'pagado','para_llevar','','2026-07-15 17:44:37','2026-07-15 18:02:24'),(11,1,4.50,'pagado','local','','2026-07-15 17:49:03','2026-07-15 18:02:24'),(12,3,7.00,'pagado','local','','2026-07-15 17:51:08','2026-07-15 18:02:24'),(13,1,5.25,'pagado','local','','2026-07-15 17:54:49','2026-07-15 18:02:24'),(14,1,5.50,'pagado','local','','2026-07-15 18:01:49','2026-07-15 18:02:24');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria_id` int(11) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,1,'Hamburguesa Clásica','Carne, queso, lechuga, tomate y salsa especial',3.50,'',0,'2026-05-07 15:41:07'),(2,1,'Hamburguesa Doble','Doble carne, doble queso y vegetales',5.00,'',0,'2026-05-07 15:41:07'),(3,2,'Pizza Personal','Pizza individual con queso y pepperoni',4.50,'/uploads/productos/1778526217999.jpg',1,'2026-05-07 15:41:07'),(4,3,'Cola Personal','Bebida gaseosa personal',1.00,'',1,'2026-05-07 15:41:07'),(5,5,'Combo Hamburguesa','Hamburguesa clásica + papas + bebida',5.50,'',1,'2026-05-07 15:41:07'),(6,1,'Hamburguesa Clásica','Carne y queso',5.50,'',1,'2026-05-07 16:56:58'),(7,1,'Hamburguesa BBQ','BBQ y tocino',7.00,'',1,'2026-05-07 16:56:58'),(8,2,'Pizza Personal','Pizza pepperoni',6.00,'',0,'2026-05-07 16:56:58'),(9,3,'Coca Cola','Bebida',2.00,'',0,'2026-05-07 16:56:58'),(10,5,'Combo Full','Hamburguesa + papas + cola',9.99,'',1,'2026-05-07 16:56:58'),(11,1,'HAmburguesa','Hamburguesa manine tocino papas',4.50,'/uploads/productos/1778174641136.jpg',1,'2026-05-07 17:24:01'),(12,5,'Lonchera ','Plastico Llevar',0.25,'/uploads/productos/1778193590109.jpg',0,'2026-05-07 22:39:50'),(13,1,'PRuebas','Pruebas',2.36,'',0,'2026-05-12 16:19:05'),(14,1,'Hamburguesa Tapa Arterias','Hamburguesa tal tal tañ',5.25,'',1,'2026-07-15 16:04:50'),(15,14,'Helado QA','prueba',2.50,'',0,'2026-07-15 16:16:55'),(16,15,'Alistas Chili','Alistas Chili',4.50,'',0,'2026-07-15 16:19:31'),(17,1,'QA Sin Inventario',NULL,1.00,'',0,'2026-07-15 17:30:56');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','cajero','cocina') DEFAULT 'cajero',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador','admin@fastfood.com','$2b$10$.17kZ6kU3zLHTUS7CW4Ae.py3J.LYIe.rfQZv78SVzxPNWP9Qo7YK','admin',1,'2026-05-07 15:06:18'),(4,'Patty Terán','matekasa@gmail.com','admin','admin',1,'2026-05-12 15:01:33'),(5,'admins','admin@pruebas.com','admin','admin',1,'2026-05-12 16:57:00'),(6,'nico','nico@pruebas.com','$2b$10$.17kZ6kU3zLHTUS7CW4Ae.py3J.LYIe.rfQZv78SVzxPNWP9Qo7YK','cajero',1,'2026-05-12 16:57:51');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-15 13:02:41
