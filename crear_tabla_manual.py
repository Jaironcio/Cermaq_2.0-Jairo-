#!/usr/bin/env python
"""
Script para crear la tabla ControlDiario manualmente
Ejecutar: python crear_tabla_manual.py
"""

import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def crear_tabla_control_diario():
    """Crea la tabla ControlDiario en la base de datos"""
    
    sql = """
    CREATE TABLE IF NOT EXISTS `cermaq_incidencias_incidencias_controldiario` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `centro_id` varchar(50) NOT NULL,
      `fecha` date NOT NULL,
      `anio` int(11) NOT NULL,
      `semana` int(11) NOT NULL,
      `dia` varchar(20) NOT NULL,
      `responsable` varchar(200) NOT NULL,
      `modulo` varchar(100) NOT NULL DEFAULT 'Hatchery',
      
      `hora_00_temp` decimal(5,2) DEFAULT NULL,
      `hora_00_ph` decimal(4,2) DEFAULT NULL,
      `hora_00_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `hora_04_temp` decimal(5,2) DEFAULT NULL,
      `hora_04_ph` decimal(4,2) DEFAULT NULL,
      `hora_04_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `hora_08_temp` decimal(5,2) DEFAULT NULL,
      `hora_08_ph` decimal(4,2) DEFAULT NULL,
      `hora_08_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `hora_12_temp` decimal(5,2) DEFAULT NULL,
      `hora_12_ph` decimal(4,2) DEFAULT NULL,
      `hora_12_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `hora_16_temp` decimal(5,2) DEFAULT NULL,
      `hora_16_ph` decimal(4,2) DEFAULT NULL,
      `hora_16_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `hora_20_temp` decimal(5,2) DEFAULT NULL,
      `hora_20_ph` decimal(4,2) DEFAULT NULL,
      `hora_20_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `promedio_temp` decimal(5,2) DEFAULT NULL,
      `promedio_ph` decimal(4,2) DEFAULT NULL,
      `promedio_oxigeno` decimal(5,2) DEFAULT NULL,
      
      `creado_en` datetime(6) NOT NULL,
      `actualizado_en` datetime(6) NOT NULL,
      
      PRIMARY KEY (`id`),
      UNIQUE KEY `centro_fecha_modulo_uniq` (`centro_id`, `fecha`, `modulo`),
      KEY `centro_id_idx` (`centro_id`),
      CONSTRAINT `fk_controldiario_centro` 
        FOREIGN KEY (`centro_id`) 
        REFERENCES `cermaq_incidencias_incidencias_centro` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            print("[OK] Tabla 'cermaq_incidencias_incidencias_controldiario' creada exitosamente")
            
            # Verificar que la tabla existe
            cursor.execute("SHOW TABLES LIKE 'cermaq_incidencias_incidencias_controldiario'")
            result = cursor.fetchone()
            
            if result:
                print("[OK] Verificacion: La tabla existe en la base de datos")
                
                # Mostrar estructura de la tabla
                cursor.execute("DESCRIBE cermaq_incidencias_incidencias_controldiario")
                columns = cursor.fetchall()
                print("\nEstructura de la tabla:")
                print("-" * 80)
                for col in columns:
                    print(f"  {col[0]:<25} {col[1]:<20} {col[2]:<10}")
                print("-" * 80)
                
                return True
            else:
                print("[ERROR] La tabla no se pudo crear")
                return False
                
    except Exception as e:
        print(f"[ERROR] Error al crear la tabla: {e}")
        return False

if __name__ == '__main__':
    print("Creando tabla ControlDiario...")
    print("=" * 80)
    
    if crear_tabla_control_diario():
        print("\nProceso completado exitosamente!")
        print("\nAhora puedes:")
        print("  1. Reiniciar el servidor: python manage.py runserver")
        print("  2. Acceder a Control Diario desde el reporte")
    else:
        print("\nHubo un problema al crear la tabla")
        print("Por favor, ejecuta el archivo SQL manualmente:")
        print("  mysql -u tu_usuario -p tu_base_de_datos < crear_tabla_control_diario.sql")
