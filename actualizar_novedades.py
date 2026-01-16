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
    
    print("Actualizando valores por defecto de 'incidencias' a 'novedades'...")
    
    # Actualizar registros existentes que tengan el texto antiguo
    sql_updates = [
        "UPDATE incidencias_reportecamaras SET rio_pescado_descripcion = 'No se detectaron novedades durante el monitoreo' WHERE rio_pescado_descripcion = 'No se detectaron incidencias durante el monitoreo'",
        "UPDATE incidencias_reportecamaras SET collin_descripcion = 'No se detectaron novedades durante el monitoreo' WHERE collin_descripcion = 'No se detectaron incidencias durante el monitoreo'",
        "UPDATE incidencias_reportecamaras SET lican_descripcion = 'No se detectaron novedades durante el monitoreo' WHERE lican_descripcion = 'No se detectaron incidencias durante el monitoreo'",
        "UPDATE incidencias_reportecamaras SET trafun_descripcion = 'No se detectaron novedades durante el monitoreo' WHERE trafun_descripcion = 'No se detectaron incidencias durante el monitoreo'"
    ]
    
    for sql in sql_updates:
        cursor.execute(sql)
        print(f"Actualizado: {cursor.rowcount} registros")
    
    conn.commit()
    print("Base de datos actualizada exitosamente!")
    
    cursor.close()
    conn.close()
    
except MySQLdb.Error as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Error inesperado: {e}")
