-- Script para corregir la tabla incidencias_reportecamaras
-- Eliminar la tabla existente y recrearla correctamente

DROP TABLE IF EXISTS `incidencias_reportecamaras`;

CREATE TABLE `incidencias_reportecamaras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `turno` varchar(20) NOT NULL,
  `responsable` varchar(200) NOT NULL,
  `rio_pescado_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
  `rio_pescado_descripcion` longtext NOT NULL DEFAULT 'No se detectaron incidencias durante el monitoreo',
  `collin_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
  `collin_descripcion` longtext NOT NULL DEFAULT 'No se detectaron incidencias durante el monitoreo',
  `lican_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
  `lican_descripcion` longtext NOT NULL DEFAULT 'No se detectaron incidencias durante el monitoreo',
  `trafun_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
  `trafun_descripcion` longtext NOT NULL DEFAULT 'No se detectaron incidencias durante el monitoreo',
  `creado_en` datetime(6) NOT NULL,
  `actualizado_en` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `incidencias_reportecamaras_fecha_turno_unique` (`fecha`, `turno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
