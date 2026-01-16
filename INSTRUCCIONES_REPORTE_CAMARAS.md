# Instrucciones para Activar el Sistema de Reporte de Cámaras

## ✅ Archivos Creados

Se han creado los siguientes archivos para el sistema de reporte de cámaras:

1. **Template HTML**: `templates/reporte_camaras.html`
2. **JavaScript**: `static/js/reporte_camaras.js`
3. **Modelo de BD**: Agregado en `incidencias/models.py` (clase `ReporteCamaras`)
4. **Vistas**: Agregadas en `incidencias/views.py`
5. **URLs**: Agregadas en `incidencias/urls.py`
6. **Admin**: Registrado en `incidencias/admin.py`
7. **Botón en selector**: Actualizado `templates/seleccionar_centro.html`

## 📋 Pasos para Activar el Sistema

### Paso 1: Crear las Migraciones

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
python manage.py makemigrations
```

Deberías ver un mensaje similar a:
```
Migrations for 'incidencias':
  incidencias/migrations/0XXX_reportecamaras.py
    - Create model ReporteCamaras
```

### Paso 2: Aplicar las Migraciones

Ejecuta el siguiente comando para crear la tabla en la base de datos:

```bash
python manage.py migrate
```

Deberías ver:
```
Running migrations:
  Applying incidencias.0XXX_reportecamaras... OK
```

### Paso 3: Verificar que Todo Funciona

1. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```

2. Abre tu navegador y ve a: `http://127.0.0.1:8000/`

3. Deberías ver el selector de centros con **3 botones**:
   - Formulario PCC (Trafun, Liquiñe, etc.)
   - Formulario Santa Juana
   - **📹 Reporte de Cámaras** ← NUEVO

4. Haz clic en "Reporte de Cámaras" para acceder al formulario

## 🎯 Características del Sistema

### Formulario de Reporte
- **4 Centros**: Río Pescado, Collín, Lican, Trafún
- **Campos**: Fecha, Turno (Mañana/Tarde/Noche), Responsable
- **Para cada centro**:
  - ✓ Sin incidencias (opción por defecto)
  - ⚠ Con incidencias (muestra campo de texto para describir)

### Funcionalidades
1. **💾 Guardar Reporte**: Guarda en la base de datos
2. **📸 Generar Captura**: Crea una imagen PNG del reporte
3. **📄 Exportar PDF**: Genera un PDF profesional del reporte

### Características Adicionales
- **Auto-carga**: Si existe un reporte para la fecha seleccionada, se carga automáticamente
- **Validación**: No permite guardar sin responsable o sin descripción de incidencias
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🔍 Verificar en el Admin de Django

1. Ve a: `http://127.0.0.1:8000/admin/`
2. Inicia sesión con tu usuario administrador
3. Deberías ver una nueva sección: **"Reportes de Cámaras"**
4. Desde ahí puedes ver, editar y eliminar reportes

## 📊 Estructura de la Base de Datos

La tabla `ReporteCamaras` contiene:

- `fecha`: Fecha del reporte
- `turno`: Mañana, Tarde o Noche
- `responsable`: Nombre del responsable
- Para cada centro (Río Pescado, Collín, Lican, Trafún):
  - `{centro}_tiene_incidencias`: Boolean
  - `{centro}_descripcion`: Texto con la descripción
- `creado_en`: Timestamp de creación
- `actualizado_en`: Timestamp de última actualización

## ⚠️ Solución de Problemas

### Error: "No module named 'ReporteCamaras'"
- Asegúrate de haber ejecutado `python manage.py makemigrations` y `python manage.py migrate`

### Error: "Table doesn't exist"
- Ejecuta: `python manage.py migrate incidencias`

### El botón no aparece en el selector
- Verifica que el archivo `templates/seleccionar_centro.html` tenga el botón agregado
- Reinicia el servidor: `Ctrl+C` y luego `python manage.py runserver`

### No se guardan los reportes
- Verifica que las migraciones se hayan aplicado correctamente
- Revisa la consola del navegador (F12) para ver errores de JavaScript
- Revisa la terminal del servidor para ver errores de Python

## 📝 Uso del Sistema

### Flujo Normal de Trabajo

1. **Acceder al sistema**: Click en "Reporte de Cámaras" desde el selector
2. **Seleccionar fecha y turno**: Por defecto muestra la fecha actual
3. **Ingresar responsable**: Nombre de quien realiza el reporte
4. **Revisar cada centro**:
   - Si no hay incidencias: Dejar marcado "✓ No se detectaron incidencias"
   - Si hay incidencias: Marcar "⚠ Se detectaron incidencias" y describir
5. **Guardar**: Click en "💾 Guardar Reporte"
6. **Exportar**: Usar "📸 Generar Captura" o "📄 Exportar PDF" según necesites

### Ejemplo de Descripción de Incidencia

```
1/14 cámaras fuera de servicio
Cámara PTZ Sala 3 sin señal desde las 14:00
```

## 🎨 Personalización

Si necesitas modificar el diseño o funcionalidad:

- **Estilos**: Edita el `<style>` en `templates/reporte_camaras.html`
- **Lógica**: Edita `static/js/reporte_camaras.js`
- **Centros**: Para agregar más centros, modifica:
  1. `incidencias/models.py` (agregar campos)
  2. `templates/reporte_camaras.html` (agregar tarjeta)
  3. `static/js/reporte_camaras.js` (agregar al array de centros)
  4. Ejecutar `makemigrations` y `migrate`

## ✨ Listo para Usar

Una vez completados los pasos 1 y 2, el sistema estará completamente funcional y listo para generar reportes diarios de cámaras.

---

**Fecha de creación**: 16 de Enero de 2026
**Versión**: 1.0
