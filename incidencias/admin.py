# incidencias/admin.py
from django.contrib import admin
from .models import Centro, Operario, Incidencia, ControlDiario, ReporteCamaras

# Personalizar el admin de Centro
@admin.register(Centro)
class CentroAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'slug')
    search_fields = ('nombre', 'slug')

# Personalizar el admin de Operario
@admin.register(Operario)
class OperarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'cargo', 'centro', 'telefono')
    list_filter = ('centro', 'cargo')
    search_fields = ('nombre', 'cargo')

# Personalizar el admin de Incidencia
@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_centro_nombre', 'fecha_hora', 'turno', 'modulo', 'tipo_incidencia', 'riesgo_peces')
    list_filter = ('centro', 'turno', 'tipo_incidencia', 'riesgo_peces', 'riesgo_personas')
    search_fields = ('centro__nombre', 'modulo', 'estanque', 'observacion', 'tipo_incidencia_normalizada')
    date_hierarchy = 'fecha_hora'
    
    def get_centro_nombre(self, obj):
        return obj.centro.nombre if obj.centro else "Sin centro"
    get_centro_nombre.short_description = 'Centro'
    get_centro_nombre.admin_order_field = 'centro'

# Personalizar el admin de ControlDiario
@admin.register(ControlDiario)
class ControlDiarioAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'centro', 'modulo', 'dia', 'responsable', 'promedio_temp', 'promedio_ph', 'promedio_oxigeno')
    list_filter = ('centro', 'modulo', 'fecha')
    search_fields = ('responsable', 'dia')
    date_hierarchy = 'fecha'

# Personalizar el admin de ReporteCamaras
@admin.register(ReporteCamaras)
class ReporteCamarasAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'turno', 'responsable', 'get_resumen_incidencias', 'creado_en')
    list_filter = ('turno', 'fecha', 'rio_pescado_tiene_incidencias', 'collin_tiene_incidencias', 'lican_tiene_incidencias', 'trafun_tiene_incidencias')
    search_fields = ('responsable', 'rio_pescado_descripcion', 'collin_descripcion', 'lican_descripcion', 'trafun_descripcion')
    date_hierarchy = 'fecha'
    
    def get_resumen_incidencias(self, obj):
        incidencias = []
        if obj.rio_pescado_tiene_incidencias:
            incidencias.append('Río Pescado')
        if obj.collin_tiene_incidencias:
            incidencias.append('Collín')
        if obj.lican_tiene_incidencias:
            incidencias.append('Lican')
        if obj.trafun_tiene_incidencias:
            incidencias.append('Trafún')
        return ', '.join(incidencias) if incidencias else 'Sin incidencias'
    get_resumen_incidencias.short_description = 'Centros con Incidencias'