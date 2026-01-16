# 📊 Guía de Dashboards - Sistema de Control Cermaq

## 🎯 Resumen General

Se han implementado **11 dashboards** completos para el sistema de control de incidencias y parámetros de Cermaq Chile.

---

## 📋 Lista de Dashboards Disponibles

### **1. Dashboard General (Principal)**
- **URL**: `/dashboard/`
- **Descripción**: Vista general de incidencias con métricas principales
- **Características**:
  - 4 KPIs principales (Total incidencias, Centro líder, Tiempo promedio, Alto riesgo)
  - 5 gráficos interactivos (Chart.js)
  - Tabla de cumplimiento de KPIs por centro
  - Filtros por período y centro
  - Exportación a PDF

---

### **2. Dashboard de Salud Operacional en Tiempo Real** 🟢
- **URL**: `/dashboard/salud-operacional/`
- **Descripción**: Estado actual de todos los centros en tiempo real
- **Características**:
  - Semáforo por centro (verde/amarillo/rojo)
  - Incidencias últimas 24 horas
  - Tiempo desde último registro
  - Lista de registros recientes
  - Reloj en tiempo real

**Ideal para**: Supervisores que necesitan vista rápida del estado operacional

---

### **3. Dashboard de Tendencias y Predicciones** 📈
- **URL**: `/dashboard/tendencias/`
- **Descripción**: Análisis histórico y proyecciones
- **Características**:
  - Gráfico de tendencia de incidencias (30 días)
  - Promedio móvil de 7 días
  - Detección automática de anomalías
  - Evolución de parámetros (Temp, pH, Oxígeno)
  - Comparativa semanal

**Ideal para**: Planificación y prevención de problemas

---

### **4. Dashboard de Cumplimiento y Calidad** ✅
- **URL**: `/dashboard/cumplimiento/`
- **Descripción**: Métricas de desempeño del equipo
- **Características**:
  - % de cumplimiento general
  - Registros por responsable
  - Ranking de centros por desempeño
  - Calendario de cumplimiento (heatmap)
  - KPIs vs Metas

**Ideal para**: Jefes de calidad y supervisores de equipo

---

### **5. Dashboard de Análisis de Incidencias** 🔍
- **URL**: `/dashboard/analisis-incidencias/`
- **Descripción**: Profundización en problemas operacionales
- **Características**:
  - Top 10 incidencias más frecuentes
  - Distribución por tipo (pie chart)
  - Evolución temporal
  - Incidencias por módulo/estanque
  - Incidencias críticas sin resolver
  - Detección de incidencias recurrentes

**Ideal para**: Análisis de root cause y mejora continua

---

### **6. Dashboard de Comparación de Centros** 🏆
- **URL**: `/dashboard/comparacion-centros/`
- **Descripción**: Benchmarking entre ubicaciones
- **Características**:
  - Gráfico comparativo de todos los centros
  - Podio de mejores centros (🥇🥈🥉)
  - Ranking completo
  - Identificación de brechas
  - Mejores prácticas

**Ideal para**: Gerencia regional y competencia sana entre centros

---

### **7. Dashboard de Parámetros Críticos** 🌡️
- **URL**: `/dashboard/parametros-criticos/`
- **Descripción**: Monitoreo de Temperatura, pH y Oxígeno
- **Características**:
  - Valores actuales en tiempo real
  - Gráfico de evolución 24 horas
  - Rangos óptimos con indicadores de estado
  - Desviación estándar
  - Alertas visuales si está fuera de rango

**Ideal para**: Técnicos de operación y control de calidad del agua

---

### **8. Dashboard Ejecutivo** 👔
- **URL**: `/dashboard/ejecutivo/`
- **Descripción**: Resumen gerencial de alto nivel
- **Características**:
  - KPIs principales condensados
  - Tendencia general (mejorando/empeorando)
  - Resumen ejecutivo en texto
  - Mejor centro del período
  - Recomendaciones automáticas

**Ideal para**: Gerencia general y reportes ejecutivos

---

### **9. Dashboard de Productividad del Equipo** 👥
- **URL**: `/dashboard/productividad/`
- **Descripción**: Análisis del desempeño humano
- **Características**:
  - Registros por operario
  - Incidencias por turno
  - Tasa de completitud
  - Horarios de mayor actividad
  - Cumplimiento de metas individuales

**Ideal para**: Recursos humanos y gestión de personal

---

### **10. Dashboard de Alertas y Acciones Pendientes** 🔔
- **URL**: `/dashboard/alertas/`
- **Descripción**: Centro de comando operacional
- **Características**:
  - Alertas críticas activas (últimas 24h)
  - Incidencias pendientes (últimas 48h)
  - Registros completados hoy
  - Reloj en tiempo real
  - Priorización visual

**Ideal para**: Operadores en turno y respuesta rápida

---

### **11. Dashboard de Análisis de Costos e Impacto** 💰
- **URL**: `/dashboard/costos/`
- **Descripción**: ROI y análisis financiero
- **Características**:
  - Costo total mensual estimado
  - Costos por tipo de incidencia
  - Tendencia de costos (6 meses)
  - Ahorro potencial calculado
  - Justificación de inversiones

**Ideal para**: Gerencia financiera y toma de decisiones de inversión

---

## 🎨 Características Comunes

Todos los dashboards incluyen:

- ✅ **Diseño moderno** con gradientes turquesa corporativos
- ✅ **Responsive design** (móvil, tablet, desktop)
- ✅ **Navegación integrada** entre dashboards
- ✅ **Gráficos interactivos** con Chart.js
- ✅ **Tarjetas KPI** grandes y coloridas
- ✅ **Animaciones suaves** y efectos hover
- ✅ **Sidebar de navegación** unificado
- ✅ **Exportación** (donde aplica)

---

## 🚀 Cómo Acceder

### Desde el Dashboard Principal:
1. Ir a: `http://127.0.0.1:8000/dashboard/`
2. En el sidebar derecho, sección "Dashboards"
3. Click en cualquier dashboard deseado

### Acceso Directo:
- Dashboard General: `/dashboard/`
- Salud Operacional: `/dashboard/salud-operacional/`
- Tendencias: `/dashboard/tendencias/`
- Cumplimiento: `/dashboard/cumplimiento/`
- Análisis: `/dashboard/analisis-incidencias/`
- Comparación: `/dashboard/comparacion-centros/`
- Parámetros: `/dashboard/parametros-criticos/`
- Ejecutivo: `/dashboard/ejecutivo/`
- Productividad: `/dashboard/productividad/`
- Alertas: `/dashboard/alertas/`
- Costos: `/dashboard/costos/`

---

## 📊 Datos Utilizados

Los dashboards consumen datos de:

1. **Modelo Incidencia**: Registros de incidencias operacionales
2. **Modelo ControlDiario**: Parámetros de temperatura, pH y oxígeno
3. **Modelo Centro**: Información de centros de cultivo
4. **Modelo Operario**: Datos de responsables

---

## 🔧 Archivos Técnicos

### Backend:
- **Vistas**: `incidencias/views_dashboards.py` (10 vistas)
- **URLs**: `incidencias/urls.py` (rutas configuradas)
- **Importación**: `incidencias/views.py` (líneas 670-684)

### Frontend:
- **Templates**: `templates/dashboards/*.html` (11 archivos)
- **Base**: `templates/dashboards/base_dashboard.html`
- **CSS**: `static/css/dashboard.css` (estilos mejorados)
- **JavaScript**: Chart.js (CDN)

---

## 💡 Recomendaciones de Uso

### Para Operadores:
- **Salud Operacional**: Vista principal durante el turno
- **Alertas**: Revisar al inicio y fin de turno
- **Parámetros Críticos**: Monitoreo continuo

### Para Supervisores:
- **Cumplimiento**: Revisión diaria
- **Productividad**: Revisión semanal
- **Tendencias**: Planificación mensual

### Para Gerencia:
- **Ejecutivo**: Revisión diaria
- **Comparación de Centros**: Revisión mensual
- **Costos**: Revisión mensual/trimestral

---

## 🎯 Próximos Pasos Sugeridos

1. **Crear tabla ControlDiario** en la base de datos (ver `SOLUCION_RAPIDA.md`)
2. **Registrar datos** en Control Diario para poblar gráficos
3. **Configurar alertas automáticas** por email/SMS
4. **Integrar sensores IoT** para datos en tiempo real
5. **Personalizar rangos óptimos** por centro/módulo

---

## 📞 Soporte

Para dudas o problemas:
- Revisar logs del servidor Django
- Verificar que las tablas existan en la BD
- Comprobar que hay datos para el período seleccionado

---

**Fecha de creación**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Control de Incidencias y Parámetros - Cermaq Chile
