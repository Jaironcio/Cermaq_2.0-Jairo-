# 📊 Control Diario - Instrucciones de Instalación

## ✅ Archivos Creados

Se ha implementado exitosamente el módulo de **Control Diario** para Santa Juana con los siguientes componentes:

### 1. **Modelo de Base de Datos**
- `incidencias/models.py` - Modelo `ControlDiario` agregado

### 2. **Vistas y APIs**
- `incidencias/views.py` - 3 nuevas funciones:
  - `vista_control_diario_santa_juana()` - Vista principal
  - `guardar_control_diario_api()` - API para guardar registros
  - `obtener_control_diario_api()` - API para cargar registros

### 3. **Rutas**
- `incidencias/urls.py` - Rutas agregadas:
  - `/control-diario/santa-juana/` - Página principal
  - `/api/control-diario/guardar/` - API POST
  - `/api/control-diario/obtener/` - API GET

### 4. **Templates**
- `templates/control_diario_santa_juana.html` - Interfaz completa con tabla de registro

### 5. **JavaScript**
- `static/js/control_diario.js` - Lógica de:
  - Cálculo automático de promedios
  - Guardado y carga de registros
  - Exportación a Excel y PDF

### 6. **CSS**
- `static/css/control_diario.css` - Estilos personalizados para la tabla

### 7. **Integración**
- `templates/reporte.html` - Botón "📊 Control Diario" agregado en la barra lateral

---

## 🚀 Pasos para Activar el Módulo

### Paso 1: Actualizar MariaDB (Opcional pero Recomendado)

Tu versión actual de MariaDB es **10.4.32**, pero Django requiere **10.5+**.

**Opción A: Actualizar MariaDB**
```bash
# Descargar e instalar MariaDB 10.5 o superior desde:
# https://mariadb.org/download/
```

**Opción B: Ajustar configuración de Django (temporal)**

Edita `settings.py` y agrega:
```python
DATABASES = {
    'default': {
        # ... tu configuración actual ...
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

### Paso 2: Crear Migraciones

```bash
python manage.py makemigrations
```

Deberías ver:
```
Migrations for 'incidencias':
  incidencias/migrations/0XXX_controldiario.py
    - Create model ControlDiario
```

### Paso 3: Aplicar Migraciones

```bash
python manage.py migrate
```

### Paso 4: Registrar en Admin (Opcional)

Edita `incidencias/admin.py` y agrega:

```python
from .models import ControlDiario

@admin.register(ControlDiario)
class ControlDiarioAdmin(admin.ModelAdmin):
    list_display = ['fecha', 'centro', 'modulo', 'dia', 'responsable', 'promedio_temp', 'promedio_ph', 'promedio_oxigeno']
    list_filter = ['centro', 'modulo', 'fecha']
    search_fields = ['responsable', 'dia']
    date_hierarchy = 'fecha'
```

### Paso 5: Iniciar el Servidor

```bash
python manage.py runserver
```

---

## 📋 Cómo Usar el Control Diario

### Acceso
1. Inicia sesión como administrador
2. Ve a **Reporte** (menú principal)
3. En la barra lateral, haz clic en **📊 Control Diario**

### Registro de Datos
1. **Completa la información del registro:**
   - Año (automático)
   - Semana (se calcula automáticamente al seleccionar fecha)
   - Día (se calcula automáticamente al seleccionar fecha)
   - Fecha
   - Responsable
   - Módulo (Hatchery, Fry, Smolt 1, Smolt 2, Ongrowin)

2. **Ingresa los parámetros por hora:**
   - 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
   - Temperatura (°C)
   - pH
   - Oxígeno (mg/L)

3. **Los promedios se calculan automáticamente** mientras ingresas los datos

4. **Guarda el registro** haciendo clic en "💾 Guardar Registro"

### Cargar Registro Existente
1. Selecciona la fecha
2. Haz clic en "📥 Cargar Registro"
3. Los datos se cargarán automáticamente si existe un registro para esa fecha

### Exportar Datos
- **Excel:** Haz clic en "📊 Excel Diario (General)" para descargar archivo .xlsx
- **PDF:** Haz clic en "📄 PDF Diario (General)" para descargar archivo .pdf

---

## 🎯 Características Implementadas

### ✅ Funcionalidades Principales
- [x] Registro de parámetros por hora (6 mediciones diarias)
- [x] Cálculo automático de promedios
- [x] Guardado en base de datos
- [x] Carga de registros existentes
- [x] Exportación a Excel
- [x] Exportación a PDF
- [x] Validación de campos
- [x] Alertas de éxito/error
- [x] Historial de registros recientes (últimos 30)
- [x] Responsive design (funciona en tablets y móviles)

### 🔒 Seguridad
- Solo usuarios administradores pueden acceder
- Protección CSRF en todas las peticiones
- Validación de datos en backend

### 📊 Mejoras Futuras Sugeridas
- [ ] Gráficos de tendencias por semana/mes
- [ ] Alertas automáticas si valores están fuera de rango
- [ ] Autoguardado cada 2 minutos
- [ ] Importación desde sensores IoT
- [ ] Comparación entre módulos
- [ ] Reportes mensuales automáticos

---

## 🐛 Solución de Problemas

### Error: "No module named 'openpyxl'"
```bash
pip install openpyxl
```

### Error: "CSRF token missing"
Verifica que `{% csrf_token %}` esté presente en el template.

### Los promedios no se calculan
Verifica que los inputs tengan valores numéricos válidos.

### No se puede guardar el registro
1. Verifica que la fecha y responsable estén completos
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que las migraciones se hayan aplicado correctamente

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12 → Console)
2. Revisa los logs del servidor Django
3. Verifica que todas las migraciones estén aplicadas: `python manage.py showmigrations`

---

## 📝 Notas Técnicas

### Estructura de la Base de Datos

El modelo `ControlDiario` incluye:
- **Identificación:** centro, fecha, módulo (unique_together)
- **Metadata:** año, semana, día, responsable
- **Mediciones:** 6 horas × 3 parámetros = 18 campos
- **Promedios:** calculados automáticamente al guardar
- **Timestamps:** creado_en, actualizado_en

### APIs Disponibles

**POST /api/control-diario/guardar/**
```json
{
  "centro_id": "santa-juana",
  "fecha": "2026-01-13",
  "anio": 2026,
  "semana": 2,
  "dia": "Lunes",
  "responsable": "Jorge Cárdenas",
  "modulo": "Hatchery",
  "hora_00_temp": 12.5,
  "hora_00_ph": 7.2,
  "hora_00_oxigeno": 8.5,
  ...
}
```

**GET /api/control-diario/obtener/?fecha=2026-01-13&centro_id=santa-juana&modulo=Hatchery**

---

¡El módulo de Control Diario está listo para usar! 🎉
