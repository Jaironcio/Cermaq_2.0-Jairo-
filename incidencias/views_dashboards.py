# incidencias/views_dashboards.py
# Vistas para los 10 dashboards adicionales

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Avg, Q, Sum, Max, Min
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Incidencia, Centro, Operario, ControlDiario
import json
from collections import defaultdict

# ============================================
# DASHBOARD 1: SALUD OPERACIONAL EN TIEMPO REAL
# ============================================
@login_required
def dashboard_salud_operacional(request):
    """Dashboard de estado actual de todos los centros en tiempo real"""
    
    # Obtener últimos registros de control diario por módulo
    try:
        ultimos_registros = ControlDiario.objects.all().order_by('-fecha', '-id')[:20]
    except:
        ultimos_registros = []
    
    # Incidencias de las últimas 24 horas
    hace_24h = timezone.now() - timedelta(hours=24)
    incidencias_recientes = Incidencia.objects.filter(fecha_hora__gte=hace_24h)
    
    # Calcular estado por módulo (semáforo)
    modulos_estado = []
    centros = Centro.objects.all()
    
    for centro in centros:
        incidencias_centro = incidencias_recientes.filter(centro=centro).count()
        
        # Lógica de semáforo
        if incidencias_centro == 0:
            estado = 'verde'
        elif incidencias_centro <= 2:
            estado = 'amarillo'
        else:
            estado = 'rojo'
        
        modulos_estado.append({
            'centro': centro.nombre,
            'incidencias': incidencias_centro,
            'estado': estado
        })
    
    # Tiempo desde último registro
    tiempo_ultimo_registro = {}
    for registro in ultimos_registros[:5]:
        tiempo_transcurrido = timezone.now() - timezone.make_aware(datetime.combine(registro.fecha, datetime.min.time()))
        tiempo_ultimo_registro[registro.modulo] = int(tiempo_transcurrido.total_seconds() / 3600)
    
    contexto = {
        'titulo': 'Salud Operacional en Tiempo Real',
        'modulos_estado': modulos_estado,
        'ultimos_registros': ultimos_registros,
        'tiempo_ultimo_registro': tiempo_ultimo_registro,
        'total_incidencias_24h': incidencias_recientes.count(),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/salud_operacional.html', contexto)


# ============================================
# DASHBOARD 2: TENDENCIAS Y PREDICCIONES
# ============================================
@login_required
def dashboard_tendencias(request):
    """Dashboard de análisis histórico y proyecciones"""
    
    # Datos de los últimos 30 días
    hace_30_dias = timezone.now() - timedelta(days=30)
    
    # Tendencia de incidencias
    incidencias_por_dia = Incidencia.objects.filter(
        fecha_hora__gte=hace_30_dias
    ).annotate(
        dia=TruncDate('fecha_hora')
    ).values('dia').annotate(
        total=Count('id')
    ).order_by('dia')
    
    # Convertir a formato para gráficos
    tendencia_labels = [item['dia'].strftime('%d/%m') for item in incidencias_por_dia]
    tendencia_data = [item['total'] for item in incidencias_por_dia]
    
    # Calcular promedio móvil de 7 días
    promedio_movil = []
    for i in range(len(tendencia_data)):
        inicio = max(0, i - 6)
        promedio = sum(tendencia_data[inicio:i+1]) / (i - inicio + 1)
        promedio_movil.append(round(promedio, 2))
    
    # Detectar anomalías (valores > 2 desviaciones estándar)
    if tendencia_data:
        promedio = sum(tendencia_data) / len(tendencia_data)
        desviacion = (sum((x - promedio) ** 2 for x in tendencia_data) / len(tendencia_data)) ** 0.5
        anomalias = [i for i, val in enumerate(tendencia_data) if abs(val - promedio) > 2 * desviacion]
    else:
        anomalias = []
    
    # Tendencia de parámetros (Control Diario)
    try:
        parametros_historicos = ControlDiario.objects.filter(
            fecha__gte=(timezone.now() - timedelta(days=30)).date()
        ).order_by('fecha')
        
        temp_data = [float(r.promedio_temp) if r.promedio_temp else 0 for r in parametros_historicos]
        ph_data = [float(r.promedio_ph) if r.promedio_ph else 0 for r in parametros_historicos]
        oxigeno_data = [float(r.promedio_oxigeno) if r.promedio_oxigeno else 0 for r in parametros_historicos]
        fechas_parametros = [r.fecha.strftime('%d/%m') for r in parametros_historicos]
    except:
        temp_data = []
        ph_data = []
        oxigeno_data = []
        fechas_parametros = []
    
    contexto = {
        'titulo': 'Tendencias y Predicciones',
        'tendencia_labels': json.dumps(tendencia_labels),
        'tendencia_data': json.dumps(tendencia_data),
        'promedio_movil': json.dumps(promedio_movil),
        'anomalias': json.dumps(anomalias),
        'temp_data': json.dumps(temp_data),
        'ph_data': json.dumps(ph_data),
        'oxigeno_data': json.dumps(oxigeno_data),
        'fechas_parametros': json.dumps(fechas_parametros),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/tendencias.html', contexto)


# ============================================
# DASHBOARD 3: CUMPLIMIENTO Y CALIDAD
# ============================================
@login_required
def dashboard_cumplimiento(request):
    """Dashboard de métricas de desempeño del equipo"""
    
    # Cumplimiento por responsable (Control Diario)
    hace_30_dias = (timezone.now() - timedelta(days=30)).date()
    
    try:
        registros_por_responsable = ControlDiario.objects.filter(
            fecha__gte=hace_30_dias
        ).values('responsable').annotate(
            total_registros=Count('id')
        ).order_by('-total_registros')[:10]
    except:
        registros_por_responsable = []
    
    # Tiempo promedio de respuesta a incidencias
    incidencias_recientes = Incidencia.objects.filter(
        fecha_hora__gte=timezone.now() - timedelta(days=30)
    )
    
    # Ranking de centros por desempeño
    centros_ranking = Centro.objects.annotate(
        total_incidencias=Count('incidencia', filter=Q(incidencia__fecha_hora__gte=timezone.now() - timedelta(days=30)))
    ).order_by('total_incidencias')
    
    # Calendario de cumplimiento (últimos 30 días)
    try:
        calendario_data = ControlDiario.objects.filter(
            fecha__gte=hace_30_dias
        ).values('fecha').annotate(
            registros=Count('id')
        ).order_by('fecha')
        
        calendario_labels = [item['fecha'].strftime('%d/%m') for item in calendario_data]
        calendario_values = [item['registros'] for item in calendario_data]
    except:
        calendario_labels = []
        calendario_values = []
    
    # KPIs vs Metas
    total_dias = 30
    try:
        dias_con_registro = ControlDiario.objects.filter(
            fecha__gte=hace_30_dias
        ).values('fecha').distinct().count()
        cumplimiento_porcentaje = round((dias_con_registro / total_dias) * 100, 1)
    except:
        cumplimiento_porcentaje = 0
    
    contexto = {
        'titulo': 'Cumplimiento y Calidad',
        'registros_por_responsable': registros_por_responsable,
        'centros_ranking': centros_ranking,
        'calendario_labels': json.dumps(calendario_labels),
        'calendario_values': json.dumps(calendario_values),
        'cumplimiento_porcentaje': cumplimiento_porcentaje,
        'total_incidencias': incidencias_recientes.count(),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/cumplimiento.html', contexto)


# ============================================
# DASHBOARD 4: ANÁLISIS DE INCIDENCIAS
# ============================================
@login_required
def dashboard_analisis_incidencias(request):
    """Dashboard de profundización en problemas operacionales"""
    
    hace_30_dias = timezone.now() - timedelta(days=30)
    incidencias = Incidencia.objects.filter(fecha_hora__gte=hace_30_dias)
    
    # Top 10 incidencias más frecuentes
    top_incidencias = incidencias.values('tipo_incidencia').annotate(
        total=Count('id')
    ).order_by('-total')[:10]
    
    # Distribución por tipo
    distribucion_tipo = incidencias.values('tipo_incidencia').annotate(
        total=Count('id')
    )
    
    # Evolución temporal
    evolucion = incidencias.annotate(
        dia=TruncDate('fecha_hora')
    ).values('dia').annotate(
        total=Count('id')
    ).order_by('dia')
    
    evolucion_labels = [item['dia'].strftime('%d/%m') for item in evolucion]
    evolucion_data = [item['total'] for item in evolucion]
    
    # Incidencias por módulo
    por_modulo = incidencias.values('modulo').annotate(
        total=Count('id')
    ).order_by('-total')[:10]
    
    # Incidencias críticas sin resolver (alto riesgo)
    criticas = incidencias.filter(
        Q(parametros_afectados__icontains='Oxígeno') | 
        Q(riesgo__icontains='Alto')
    ).order_by('-fecha_hora')[:10]
    
    # Incidencias recurrentes (mismo tipo > 3 veces)
    recurrentes = incidencias.values('tipo_incidencia', 'modulo').annotate(
        total=Count('id')
    ).filter(total__gte=3).order_by('-total')
    
    contexto = {
        'titulo': 'Análisis de Incidencias',
        'top_incidencias': top_incidencias,
        'distribucion_labels': json.dumps([item['tipo_incidencia'] for item in distribucion_tipo]),
        'distribucion_data': json.dumps([item['total'] for item in distribucion_tipo]),
        'evolucion_labels': json.dumps(evolucion_labels),
        'evolucion_data': json.dumps(evolucion_data),
        'por_modulo': por_modulo,
        'criticas': criticas,
        'recurrentes': recurrentes,
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/analisis_incidencias.html', contexto)


# ============================================
# DASHBOARD 5: COMPARACIÓN DE CENTROS
# ============================================
@login_required
def dashboard_comparacion_centros(request):
    """Dashboard de benchmarking entre ubicaciones"""
    
    hace_30_dias = timezone.now() - timedelta(days=30)
    centros = Centro.objects.all()
    
    # Datos comparativos por centro
    comparacion_data = []
    for centro in centros:
        incidencias_centro = Incidencia.objects.filter(
            centro=centro,
            fecha_hora__gte=hace_30_dias
        )
        
        comparacion_data.append({
            'centro': centro.nombre,
            'total_incidencias': incidencias_centro.count(),
            'incidencias_criticas': incidencias_centro.filter(riesgo__icontains='Alto').count(),
        })
    
    # Ordenar por desempeño (menos incidencias = mejor)
    comparacion_data.sort(key=lambda x: x['total_incidencias'])
    
    # Podio de mejores centros
    podio = comparacion_data[:3] if len(comparacion_data) >= 3 else comparacion_data
    
    # Datos para radar chart
    centros_nombres = [item['centro'] for item in comparacion_data]
    centros_incidencias = [item['total_incidencias'] for item in comparacion_data]
    
    contexto = {
        'titulo': 'Comparación de Centros',
        'comparacion_data': comparacion_data,
        'podio': podio,
        'centros_nombres': json.dumps(centros_nombres),
        'centros_incidencias': json.dumps(centros_incidencias),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/comparacion_centros.html', contexto)


# ============================================
# DASHBOARD 6: PARÁMETROS CRÍTICOS
# ============================================
@login_required
def dashboard_parametros_criticos(request):
    """Dashboard de foco en temperatura, pH y oxígeno"""
    
    # Obtener últimos registros
    try:
        ultimos_registros = ControlDiario.objects.all().order_by('-fecha', '-id')[:50]
        
        # Promedios actuales
        if ultimos_registros:
            ultimo = ultimos_registros[0]
            temp_actual = float(ultimo.promedio_temp) if ultimo.promedio_temp else 0
            ph_actual = float(ultimo.promedio_ph) if ultimo.promedio_ph else 0
            oxigeno_actual = float(ultimo.promedio_oxigeno) if ultimo.promedio_oxigeno else 0
        else:
            temp_actual = ph_actual = oxigeno_actual = 0
        
        # Datos para gráfico de 24h
        registros_24h = ultimos_registros[:6]  # Últimas 6 mediciones (24h)
        horas_labels = []
        temp_24h = []
        ph_24h = []
        oxigeno_24h = []
        
        for registro in reversed(list(registros_24h)):
            horas_labels.append(registro.fecha.strftime('%d/%m'))
            temp_24h.append(float(registro.promedio_temp) if registro.promedio_temp else 0)
            ph_24h.append(float(registro.promedio_ph) if registro.promedio_ph else 0)
            oxigeno_24h.append(float(registro.promedio_oxigeno) if registro.promedio_oxigeno else 0)
        
        # Calcular desviación estándar
        if temp_24h:
            temp_promedio = sum(temp_24h) / len(temp_24h)
            temp_desviacion = (sum((x - temp_promedio) ** 2 for x in temp_24h) / len(temp_24h)) ** 0.5
        else:
            temp_desviacion = 0
            
    except:
        temp_actual = ph_actual = oxigeno_actual = 0
        horas_labels = []
        temp_24h = ph_24h = oxigeno_24h = []
        temp_desviacion = 0
    
    # Rangos óptimos
    rangos_optimos = {
        'temp': {'min': 10, 'max': 14, 'actual': temp_actual},
        'ph': {'min': 6.5, 'max': 8.0, 'actual': ph_actual},
        'oxigeno': {'min': 8, 'max': 12, 'actual': oxigeno_actual}
    }
    
    contexto = {
        'titulo': 'Parámetros Críticos',
        'temp_actual': temp_actual,
        'ph_actual': ph_actual,
        'oxigeno_actual': oxigeno_actual,
        'horas_labels': json.dumps(horas_labels),
        'temp_24h': json.dumps(temp_24h),
        'ph_24h': json.dumps(ph_24h),
        'oxigeno_24h': json.dumps(oxigeno_24h),
        'rangos_optimos': rangos_optimos,
        'temp_desviacion': round(temp_desviacion, 2),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/parametros_criticos.html', contexto)


# ============================================
# DASHBOARD 7: EJECUTIVO (RESUMEN GERENCIAL)
# ============================================
@login_required
def dashboard_ejecutivo(request):
    """Dashboard de vista de alto nivel para gerencia"""
    
    hace_30_dias = timezone.now() - timedelta(days=30)
    
    # KPIs principales
    total_incidencias = Incidencia.objects.filter(fecha_hora__gte=hace_30_dias).count()
    incidencias_criticas = Incidencia.objects.filter(
        fecha_hora__gte=hace_30_dias,
        riesgo__icontains='Alto'
    ).count()
    
    # Tendencia general (comparar con mes anterior)
    hace_60_dias = timezone.now() - timedelta(days=60)
    incidencias_mes_anterior = Incidencia.objects.filter(
        fecha_hora__gte=hace_60_dias,
        fecha_hora__lt=hace_30_dias
    ).count()
    
    if incidencias_mes_anterior > 0:
        tendencia = ((total_incidencias - incidencias_mes_anterior) / incidencias_mes_anterior) * 100
        tendencia_texto = 'mejorando' if tendencia < 0 else 'empeorando'
    else:
        tendencia = 0
        tendencia_texto = 'estable'
    
    # Cumplimiento de objetivos
    try:
        dias_con_registro = ControlDiario.objects.filter(
            fecha__gte=hace_30_dias.date()
        ).values('fecha').distinct().count()
        cumplimiento_objetivo = round((dias_con_registro / 30) * 100, 1)
    except:
        cumplimiento_objetivo = 0
    
    # Centro con mejor desempeño
    mejor_centro = Centro.objects.annotate(
        total_inc=Count('incidencia', filter=Q(incidencia__fecha_hora__gte=hace_30_dias))
    ).order_by('total_inc').first()
    
    contexto = {
        'titulo': 'Dashboard Ejecutivo',
        'total_incidencias': total_incidencias,
        'incidencias_criticas': incidencias_criticas,
        'tendencia': round(abs(tendencia), 1),
        'tendencia_texto': tendencia_texto,
        'cumplimiento_objetivo': cumplimiento_objetivo,
        'mejor_centro': mejor_centro.nombre if mejor_centro else 'N/A',
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/ejecutivo.html', contexto)


# ============================================
# DASHBOARD 8: PRODUCTIVIDAD DEL EQUIPO
# ============================================
@login_required
def dashboard_productividad(request):
    """Dashboard de análisis del desempeño humano"""
    
    hace_30_dias = (timezone.now() - timedelta(days=30)).date()
    
    # Registros por operario
    try:
        registros_por_operario = ControlDiario.objects.filter(
            fecha__gte=hace_30_dias
        ).values('responsable').annotate(
            total=Count('id')
        ).order_by('-total')
        
        operarios_nombres = [item['responsable'] for item in registros_por_operario]
        operarios_totales = [item['total'] for item in registros_por_operario]
    except:
        operarios_nombres = []
        operarios_totales = []
    
    # Tasa de completitud por turno
    incidencias_por_turno = Incidencia.objects.filter(
        fecha_hora__gte=timezone.now() - timedelta(days=30)
    ).values('turno').annotate(
        total=Count('id')
    )
    
    contexto = {
        'titulo': 'Productividad del Equipo',
        'operarios_nombres': json.dumps(operarios_nombres),
        'operarios_totales': json.dumps(operarios_totales),
        'incidencias_por_turno': incidencias_por_turno,
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/productividad.html', contexto)


# ============================================
# DASHBOARD 9: ALERTAS Y ACCIONES PENDIENTES
# ============================================
@login_required
def dashboard_alertas(request):
    """Dashboard de centro de comando operacional"""
    
    # Alertas críticas activas (incidencias recientes de alto riesgo)
    alertas_criticas = Incidencia.objects.filter(
        fecha_hora__gte=timezone.now() - timedelta(hours=24),
        riesgo__icontains='Alto'
    ).order_by('-fecha_hora')
    
    # Incidencias sin resolver (últimas 48h)
    incidencias_pendientes = Incidencia.objects.filter(
        fecha_hora__gte=timezone.now() - timedelta(hours=48)
    ).order_by('-fecha_hora')[:20]
    
    # Checklist diario (verificar registros de hoy)
    hoy = timezone.now().date()
    try:
        registros_hoy = ControlDiario.objects.filter(fecha=hoy).count()
    except:
        registros_hoy = 0
    
    contexto = {
        'titulo': 'Alertas y Acciones Pendientes',
        'alertas_criticas': alertas_criticas,
        'incidencias_pendientes': incidencias_pendientes,
        'registros_hoy': registros_hoy,
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/alertas.html', contexto)


# ============================================
# DASHBOARD 10: ANÁLISIS DE COSTOS E IMPACTO
# ============================================
@login_required
def dashboard_costos(request):
    """Dashboard de ROI y análisis financiero"""
    
    hace_30_dias = timezone.now() - timedelta(days=30)
    
    # Costo estimado por tipo de incidencia (valores ejemplo)
    costos_tipo = {
        'Oxígeno Bajo': 5000,
        'Oxígeno Alto': 3000,
        'Temperatura Fuera de Rango': 4000,
        'pH Fuera de Rango': 3500,
        'Falla de Equipo': 8000,
        'Otro': 2000
    }
    
    # Calcular costo total
    incidencias = Incidencia.objects.filter(fecha_hora__gte=hace_30_dias)
    costo_total = 0
    costos_por_tipo = []
    
    for tipo, costo_unitario in costos_tipo.items():
        cantidad = incidencias.filter(tipo_incidencia__icontains=tipo).count()
        costo_tipo_total = cantidad * costo_unitario
        costo_total += costo_tipo_total
        
        if cantidad > 0:
            costos_por_tipo.append({
                'tipo': tipo,
                'cantidad': cantidad,
                'costo_unitario': costo_unitario,
                'costo_total': costo_tipo_total
            })
    
    # Tendencia de costos (últimos 6 meses)
    meses_labels = []
    meses_costos = []
    
    for i in range(6, 0, -1):
        inicio_mes = timezone.now() - timedelta(days=30*i)
        fin_mes = timezone.now() - timedelta(days=30*(i-1))
        
        incidencias_mes = Incidencia.objects.filter(
            fecha_hora__gte=inicio_mes,
            fecha_hora__lt=fin_mes
        ).count()
        
        costo_mes = incidencias_mes * 3500  # Costo promedio
        meses_labels.append(inicio_mes.strftime('%b'))
        meses_costos.append(costo_mes)
    
    contexto = {
        'titulo': 'Análisis de Costos e Impacto',
        'costo_total': costo_total,
        'costos_por_tipo': costos_por_tipo,
        'meses_labels': json.dumps(meses_labels),
        'meses_costos': json.dumps(meses_costos),
        'es_admin': request.user.is_staff,
    }
    
    return render(request, 'dashboards/costos.html', contexto)
