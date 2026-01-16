import MySQLdb

# Conectar a la base de datos
try:
    conn = MySQLdb.connect(
        host='127.0.0.1',
        user='root',
        passwd='',
        db='cermaq_incidencias',
        port=3306
    )
    
    cursor = conn.cursor()
    
    # Eliminar tabla existente
    print("Eliminando tabla existente...")
    cursor.execute("DROP TABLE IF EXISTS `incidencias_reportecamaras`")
    
    # Crear tabla nueva con estructura correcta
    print("Creando tabla con estructura correcta...")
    sql = """
    CREATE TABLE `incidencias_reportecamaras` (
      `id` bigint(20) NOT NULL AUTO_INCREMENT,
      `fecha` date NOT NULL,
      `turno` varchar(20) NOT NULL,
      `responsable` varchar(200) NOT NULL,
      `rio_pescado_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
      `rio_pescado_descripcion` longtext NOT NULL,
      `collin_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
      `collin_descripcion` longtext NOT NULL,
      `lican_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
      `lican_descripcion` longtext NOT NULL,
      `trafun_tiene_incidencias` tinyint(1) NOT NULL DEFAULT 0,
      `trafun_descripcion` longtext NOT NULL,
      `creado_en` datetime(6) NOT NULL,
      `actualizado_en` datetime(6) NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `incidencias_reportecamaras_fecha_turno_unique` (`fecha`, `turno`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """
    
    cursor.execute(sql)
    
    conn.commit()
    print("Tabla corregida exitosamente!")
    
    cursor.close()
    conn.close()
    
except MySQLdb.Error as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Error inesperado: {e}")
