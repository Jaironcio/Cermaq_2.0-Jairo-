# 🔧 Solución Rápida - Crear Tabla Control Diario

## Problema
La tabla `cermaq_incidencias_incidencias_controldiario` no existe en la base de datos porque Django requiere MariaDB 10.5+ pero tienes la versión 10.4.32.

## ✅ Solución: Ejecutar SQL Manualmente

### Opción 1: Usando phpMyAdmin (MÁS FÁCIL)

1. Abre **phpMyAdmin** en tu navegador: `http://localhost/phpmyadmin`

2. Selecciona tu base de datos (probablemente se llama `cermaq_incidencias` o similar)

3. Haz clic en la pestaña **SQL**

4. Copia y pega este código SQL completo:

```sql
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
```

5. Haz clic en el botón **Continuar** o **Go**

6. Deberías ver el mensaje: "1 fila afectada" o "Query OK"

---

### Opción 2: Usando MySQL desde la línea de comandos

1. Abre **PowerShell** o **CMD**

2. Conéctate a MySQL:
```bash
mysql -u root -p
```

3. Selecciona tu base de datos:
```sql
USE cermaq_incidencias;
```

4. Copia y pega el SQL de arriba

5. Verifica que la tabla se creó:
```sql
SHOW TABLES LIKE '%controldiario%';
```

---

### Opción 3: Usando el archivo SQL

1. Abre **PowerShell** en la carpeta del proyecto

2. Ejecuta:
```bash
mysql -u root -p cermaq_incidencias < crear_tabla_control_diario.sql
```

---

## ✅ Verificar que Funcionó

Después de ejecutar el SQL, verifica:

1. **En phpMyAdmin:**
   - Ve a tu base de datos
   - Busca la tabla `cermaq_incidencias_incidencias_controldiario`
   - Debería aparecer en la lista de tablas

2. **Desde el navegador:**
   - Recarga la página: http://127.0.0.1:8000/control-diario/santa-juana/
   - Ahora debería cargar sin errores

---

## 🎉 Listo para Usar

Una vez creada la tabla:

1. **Recarga la página** en tu navegador (F5)
2. Deberías ver el formulario de Control Diario funcionando
3. Puedes empezar a registrar datos

---

## 📝 Notas Importantes

- La tabla se crea con todos los campos necesarios
- Los promedios se calculan automáticamente
- Puedes tener múltiples registros por día (uno por módulo)
- La clave única es: centro + fecha + módulo

---

## 🆘 Si Sigue sin Funcionar

1. Verifica que el servidor Django esté corriendo:
   ```bash
   python manage.py runserver
   ```

2. Verifica que la tabla existe:
   ```sql
   SHOW TABLES LIKE '%controldiario%';
   ```

3. Si hay error de Foreign Key, primero verifica que existe la tabla de centros:
   ```sql
   SHOW TABLES LIKE '%centro%';
   ```

---

¡Eso es todo! Una vez ejecutado el SQL, el módulo de Control Diario estará completamente funcional. 🚀
