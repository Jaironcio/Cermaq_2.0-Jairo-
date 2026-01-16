-- Script SQL para crear la tabla ControlDiario manualmente
-- Ejecutar este script en tu base de datos MySQL/MariaDB

-- Crear tabla cermaq_incidencias_incidencias_controldiario
CREATE TABLE IF NOT EXISTS `cermaq_incidencias_incidencias_controldiario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `centro_id` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `anio` int(11) NOT NULL,
  `semana` int(11) NOT NULL,
  `dia` varchar(20) NOT NULL,
  `responsable` varchar(200) NOT NULL,
  `modulo` varchar(100) NOT NULL DEFAULT 'Hatchery',
  
  -- Hora 00:00
  `hora_00_temp` decimal(5,2) DEFAULT NULL,
  `hora_00_ph` decimal(4,2) DEFAULT NULL,
  `hora_00_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Hora 04:00
  `hora_04_temp` decimal(5,2) DEFAULT NULL,
  `hora_04_ph` decimal(4,2) DEFAULT NULL,
  `hora_04_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Hora 08:00
  `hora_08_temp` decimal(5,2) DEFAULT NULL,
  `hora_08_ph` decimal(4,2) DEFAULT NULL,
  `hora_08_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Hora 12:00
  `hora_12_temp` decimal(5,2) DEFAULT NULL,
  `hora_12_ph` decimal(4,2) DEFAULT NULL,
  `hora_12_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Hora 16:00
  `hora_16_temp` decimal(5,2) DEFAULT NULL,
  `hora_16_ph` decimal(4,2) DEFAULT NULL,
  `hora_16_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Hora 20:00
  `hora_20_temp` decimal(5,2) DEFAULT NULL,
  `hora_20_ph` decimal(4,2) DEFAULT NULL,
  `hora_20_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Promedios
  `promedio_temp` decimal(5,2) DEFAULT NULL,
  `promedio_ph` decimal(4,2) DEFAULT NULL,
  `promedio_oxigeno` decimal(5,2) DEFAULT NULL,
  
  -- Metadata
  `creado_en` datetime(6) NOT NULL,
  `actualizado_en` datetime(6) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `cermaq_incidencias_inci_centro_id_fecha_modulo_e8c7d4a5_uniq` (`centro_id`, `fecha`, `modulo`),
  KEY `cermaq_incidencias_inci_centro_id_f8b9c3a1_fk_cermaq_in` (`centro_id`),
  CONSTRAINT `cermaq_incidencias_inci_centro_id_f8b9c3a1_fk_cermaq_in` 
    FOREIGN KEY (`centro_id`) 
    REFERENCES `cermaq_incidencias_incidencias_centro` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla creada exitosamente' AS resultado;
