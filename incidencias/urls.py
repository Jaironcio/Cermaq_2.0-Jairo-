# incidencias/urls.py (Versión con Selector)

from django.urls import path
from . import views 

urlpatterns = [
    # 1. RUTA DE INICIO: Ahora apunta al selector
    path('', views.vista_selector_centro, name='home'), 
    
    # 2. RUTAS DEL FORMULARIO PCC
    # Ruta para "crear" (apunta a la vista renombrada)
    path('formulario/pcc/', views.vista_formulario_pcc, name='formulario_pcc'),
    # Ruta para "editar" PCC (apunta a la misma vista renombrada)
    path('formulario/pcc/editar/<int:pk>/', views.vista_formulario_pcc, name='editar_incidencia_pcc'), 

    # 3. RUTAS DEL FORMULARIO SANTA JUANA
    path('formulario/santa-juana/', views.vista_formulario_santa_juana, name='formulario_santa_juana'),
    path('formulario/santa-juana/editar/<int:pk>/', views.vista_formulario_santa_juana, name='editar_incidencia_santa_juana'),
    
    # 4. RUTA INTELIGENTE DE EDICIÓN (detecta el centro y redirige)
    path('editar/<int:pk>/', views.vista_editar_incidencia_inteligente, name='editar_incidencia'),
    
    # 5. OTRAS VISTAS (Reporte y Dashboard)
    path('reporte/', views.vista_reporte, name='reporte'),
    path('dashboard/', views.vista_dashboard, name='dashboard'),
    
    # 6. CONTROL DIARIO SANTA JUANA
    path('control-diario/santa-juana/', views.vista_control_diario_santa_juana, name='control_diario_santa_juana'),
    
    # 7. REPORTE DE CÁMARAS
    path('reporte-camaras/', views.vista_reporte_camaras, name='reporte_camaras'),
    
    # 8. APIs ()
    path('api/registrar-incidencia/', views.registrar_incidencia_api, name='api-registrar-incidencia'),
    path('api/incidencia/<int:pk>/delete/', views.delete_incidencia_api, name='api-delete-incidencia'),
    path('api/incidencia/<int:pk>/update/', views.update_incidencia_api, name='api-update-incidencia'),
    
    # 9. APIs CONTROL DIARIO
    path('api/control-diario/guardar/', views.guardar_control_diario_api, name='api-guardar-control-diario'),
    path('api/control-diario/obtener/', views.obtener_control_diario_api, name='api-obtener-control-diario'),
    
    # 10. APIs REPORTE DE CÁMARAS
    path('api/reporte-camaras/guardar/', views.guardar_reporte_camaras_api, name='api-guardar-reporte-camaras'),
    path('api/reporte-camaras/obtener/', views.obtener_reporte_camaras_api, name='api-obtener-reporte-camaras'),
    path('api/reporte-camaras/listar/', views.listar_reportes_camaras_api, name='api-listar-reportes-camaras'),
    path('api/reporte-camaras/detalle/<int:pk>/', views.detalle_reporte_camaras_api, name='api-detalle-reporte-camaras'),
    path('api/reporte-camaras/eliminar/<int:pk>/', views.eliminar_reporte_camaras_api, name='api-eliminar-reporte-camaras'),
    
    # 11. CONSULTA DE REPORTES DE CÁMARAS
    path('consulta-reportes-camaras/', views.vista_consulta_reportes_camaras, name='consulta_reportes_camaras'),
]