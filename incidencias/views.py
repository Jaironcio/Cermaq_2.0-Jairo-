# incidencias/views.py (Versión Revertida a PCC)

from django.shortcuts import render, get_object_or_404, redirect
from .models import Centro, Operario, Incidencia
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status 
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required # IMPORTADO

# --- IMPORTACIONES ADICIONALES (Limpias) ---
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, Avg # Quitamos 'F' que no se usa aquí
from django.db.models.functions import TruncDate 
from .serializers import IncidenciaSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger 
# ---

# DATOS FIJOS DE MÓDULOS (Original)
DATOS_MODULOS_ESTANQUES = {
    "trafun": {
        "Módulo 400": ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410"],
        "Módulo 300": ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312"],
        "Módulo 200": ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212"],
        "Alevinaje B": ["116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130"],
        "Alevinaje A": ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115"]
    },
    "liquine": {
        "Módulo 100": ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140"],
        "Módulo 200": ["201", "202", "203", "204", "205", "206", "207"],
        "Módulo 300": ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313"],
        "Módulo 400": ["401", "402", "403", "404", "405", "406", "407", "408", "409"],
        "Módulo 500": ["501", "502", "503", "504", "505", "506", "507", "508"],
        "Alevinaje": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]
    },
    "cipreses": {
        "Módulo 100": ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116"],
        "Módulo 200": ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210"],
        "Módulo 300": ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316"],
        "Módulo 400": ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415"]
    },
    "santa_juana": {
        "Smolt 1": ["Estanque 1", "Estanque 2", "Estanque 3", "Estanque 4", "Estanque 5"],
        "Smolt 2": ["Estanque 6", "Estanque 7", "Estanque 8", "Estanque 9", "Estanque 10"],
        "Fry 1": ["Estanque A", "Estanque B", "Estanque C"],
        "Hatchery": ["Incubadora 1", "Incubadora 2", "Incubadora 3"],
    },
    "rahue": {}, "esperanza": {}, "hueyusca": {}, "pcc": {}
}

# --- VISTA 1: EL SELECTOR DE CENTROS (NUEVA PÁGINA DE INICIO) ---
@login_required
def vista_selector_centro(request):
    """
    Renderiza la nueva página principal para elegir entre PCC o Santa Juana.
    Si el usuario NO es admin (staff), lo redirige directo al dashboard.
    """
    if not request.user.is_staff:
        return redirect('dashboard')
        
    return render(request, 'seleccionar_centro.html')


# --- VISTA INTELIGENTE: Redirige al formulario correcto según el centro ---
@login_required
def vista_editar_incidencia_inteligente(request, pk):
    """
    Detecta si la incidencia es de Santa Juana o PCC y redirige al formulario correcto.
    """
    # Proteccion para visualizadores
    if not request.user.is_staff:
        return redirect('dashboard')

    incidencia = get_object_or_404(Incidencia, pk=pk)
    
    # Si el centro es Santa Juana, redirige a su formulario
    if incidencia.centro and incidencia.centro.slug == 'santa-juana':
        return redirect('editar_incidencia_santa_juana', pk=pk)
    else:
        # Si es otro centro, va al formulario PCC
        return redirect('editar_incidencia_pcc', pk=pk)


# --- VISTA 2: FORMULARIO SANTA JUANA (FUNCIONAL) ---
@login_required
def vista_formulario_santa_juana(request, pk=None):
    """
    Renderiza el formulario exclusivo de Santa Juana.
    """
    # Proteccion para visualizadores
    if not request.user.is_staff:
        return redirect('dashboard')

    incidencia_a_editar = None
    incidencia_json = 'null'
    
    # 1. Lógica para EDITAR (serializar datos completos de la incidencia)
    if pk:
        incidencia_a_editar = get_object_or_404(Incidencia, pk=pk)
        incidencia_json = json.dumps({
            'pk': incidencia_a_editar.pk,
            'fecha_hora': incidencia_a_editar.fecha_hora.isoformat() if incidencia_a_editar.fecha_hora else None,
            'turno': incidencia_a_editar.turno,
            'centro_id': incidencia_a_editar.centro_id,
            'modulo': incidencia_a_editar.modulo,
            'estanque': incidencia_a_editar.estanque,
            'tipo_incidencia': incidencia_a_editar.tipo_incidencia,
            'tipo_incidencia_normalizada': incidencia_a_editar.tipo_incidencia_normalizada,
            'tiempo_resolucion': incidencia_a_editar.tiempo_resolucion,
            'riesgo_peces': incidencia_a_editar.riesgo_peces,
            'perdida_economica': incidencia_a_editar.perdida_economica,
            'riesgo_personas': incidencia_a_editar.riesgo_personas,
            'observacion': incidencia_a_editar.observacion,
            'operario_contacto_id': incidencia_a_editar.operario_contacto_id,
        })

    # 2. Obtener Centros y Operarios (igual que en PCC)
    todos_los_centros = Centro.objects.all().order_by('nombre')
    
    # Convertimos el QuerySet de Centros a una lista simple de diccionarios (JSON)
    centros_list = list(todos_los_centros.values('id', 'nombre'))
    centros_json = json.dumps(centros_list)
    
    # --- NUEVA CORRECCIÓN (para el error de "Centro no encontrado") ---
    # Necesitamos encontrar el slug del centro actual para pasarlo al JS
    centro_sj = todos_los_centros.filter(slug='santa-juana').first()
    
    operarios_por_centro = {}
    operarios = Operario.objects.select_related('centro').all()
    for op in operarios:
        centro_id = op.centro.id
        if centro_id not in operarios_por_centro:
            operarios_por_centro[centro_id] = []
        operarios_por_centro[centro_id].append({
            'id': op.id,
            'nombre': op.nombre,
            'cargo': op.cargo,
            'telefono': op.telefono
        })

    # --- CORRECCIÓN FINAL DEL CONTEXTO ---
    contexto = {
        'centros_json': centros_json, # Para el JS que usaba 'CENTROS' (ya no se usa pero es bueno tenerlo)
        'datos_modulos_json': json.dumps(DATOS_MODULOS_ESTANQUES),
        'datos_operarios_json': json.dumps(operarios_por_centro),
        'incidencia_a_editar': incidencia_a_editar,
        'incidencia_a_editar_json': incidencia_json,
        
        # --- ESTAS SON LAS 2 LÍNEAS QUE FALTABAN ---
        'centros': todos_los_centros,  # Para el bucle {% for %} en <script id="centros-data">
        'centro_actual_slug': centro_sj.slug if centro_sj else '', # Para el data-centro-slug
        'es_admin': request.user.is_staff
    }
    
    # Renderiza el nuevo template de Santa Juana
    return render(request, 'formulario_santa_juana.html', contexto)

# --- VISTA 1: EL FORMULARIO (Nombre original 'vista_formulario') ---
@login_required
def vista_formulario_pcc(request, pk=None): 
    
    # Proteccion para visualizadores
    if not request.user.is_staff:
        return redirect('dashboard')

    incidencia_a_editar = None
    incidencia_json = 'null'

    if pk:
        incidencia_a_editar = get_object_or_404(Incidencia, pk=pk)
        incidencia_json = json.dumps({
            'pk': incidencia_a_editar.pk,
            'fecha_hora': incidencia_a_editar.fecha_hora.isoformat() if incidencia_a_editar.fecha_hora else None,
            'turno': incidencia_a_editar.turno,
            'centro_id': incidencia_a_editar.centro_id,
            'tipo_incidencia': incidencia_a_editar.tipo_incidencia,
            'modulo': incidencia_a_editar.modulo,
            'estanque': incidencia_a_editar.estanque,
            'parametros_afectados': incidencia_a_editar.parametros_afectados.split(',') if incidencia_a_editar.parametros_afectados else [],
            'oxigeno_nivel': incidencia_a_editar.oxigeno_nivel,
            'oxigeno_valor': incidencia_a_editar.oxigeno_valor,
            'temperatura_nivel': incidencia_a_editar.temperatura_nivel,
            'temperatura_valor': incidencia_a_editar.temperatura_valor,
            'conductividad_nivel': incidencia_a_editar.conductividad_nivel,
            'turbidez_nivel': incidencia_a_editar.turbidez_nivel,
            'turbidez_valor': incidencia_a_editar.turbidez_valor,
            'sistema_sensor': incidencia_a_editar.sistema_sensor,
            'sensor_detectado': incidencia_a_editar.sensor_detectado,
            'sensor_nivel': incidencia_a_editar.sensor_nivel,
            'sensor_valor': incidencia_a_editar.sensor_valor,
            'tiempo_resolucion': incidencia_a_editar.tiempo_resolucion,
            'riesgo_peces': incidencia_a_editar.riesgo_peces,
            'perdida_economica': incidencia_a_editar.perdida_economica,
            'riesgo_personas': incidencia_a_editar.riesgo_personas,
            'observacion': incidencia_a_editar.observacion,
            'operario_contacto_id': incidencia_a_editar.operario_contacto_id,
            'tipo_incidencia_normalizada': incidencia_a_editar.tipo_incidencia_normalizada,
        })
    
    todos_los_centros = Centro.objects.all().order_by('nombre')
    operarios_por_centro = {}
    operarios = Operario.objects.select_related('centro').all()
    for op in operarios:
        centro_id = op.centro.id
        if centro_id not in operarios_por_centro:
            operarios_por_centro[centro_id] = []
        operarios_por_centro[centro_id].append({
            'id': op.id,
            'nombre': op.nombre,
            'cargo': op.cargo,
            'telefono': op.telefono
        })

    contexto = {
        'centros': todos_los_centros,
        'datos_modulos_json': json.dumps(DATOS_MODULOS_ESTANQUES),
        'datos_operarios_json': json.dumps(operarios_por_centro),
        'incidencia_a_editar': incidencia_a_editar,
        'incidencia_a_editar_json': incidencia_json,
        'es_admin': request.user.is_staff
    }
    
    # Renderiza el formulario original
    return render(request, 'formulario.html', contexto)


# --- VISTA 2: LA PÁGINA DE REPORTES (Original) ---
@login_required
def vista_reporte(request):
    
    lista_de_incidencias = Incidencia.objects.select_related(
        'centro', 'operario_contacto'
    ).all().order_by('-fecha_hora')
    
    filtro_fecha = request.GET.get('fecha', None)
    filtro_turno = request.GET.get('turno', None)
    filtro_centro = request.GET.get('centro', None)
    filtro_tipo = request.GET.get('tipo', None)

    if filtro_fecha:
        lista_de_incidencias = lista_de_incidencias.filter(fecha_hora__date=filtro_fecha)
    if filtro_turno:
        lista_de_incidencias = lista_de_incidencias.filter(turno=filtro_turno)
    if filtro_centro:
        lista_de_incidencias = lista_de_incidencias.filter(centro_id=filtro_centro)
    if filtro_tipo:
        lista_de_incidencias = lista_de_incidencias.filter(tipo_incidencia=filtro_tipo)

    todos_los_centros = Centro.objects.all().order_by('nombre')
    
    # Paginación: 15 incidencias por página
    paginator = Paginator(lista_de_incidencias, 15)
    page = request.GET.get('page', 1)
    
    try:
        incidencias_paginadas = paginator.page(page)
    except PageNotAnInteger:
        incidencias_paginadas = paginator.page(1)
    except EmptyPage:
        incidencias_paginadas = paginator.page(paginator.num_pages)
    
    centro_actual_slug = None
    if filtro_centro:
        centro_obj = Centro.objects.filter(id=filtro_centro).first()
        if centro_obj:
            centro_actual_slug = centro_obj.slug
    
    contexto = {
        'incidencias': incidencias_paginadas,
        'centros': todos_los_centros,
        'filtros_aplicados': request.GET,
        'es_admin': request.user.is_staff,
        'total_incidencias': paginator.count,
        'centro_actual': centro_actual_slug,
    }
    
    return render(request, 'reporte.html', contexto)


# --- VISTA 3: DASHBOARD (Original) ---
@login_required
def vista_dashboard(request):
    
    periodo_filtro = request.GET.get('periodo', 'all')
    centro_filtro = request.GET.get('centro', None)

    base_query = Incidencia.objects.all()
    fecha_limite = None
    if periodo_filtro == 'week':
        fecha_limite = timezone.now() - timedelta(days=7)
    elif periodo_filtro == 'month':
        fecha_limite = timezone.now() - timedelta(days=30)
    elif periodo_filtro == 'quarter':
        fecha_limite = timezone.now() - timedelta(days=90)
    
    if fecha_limite:
        base_query = base_query.filter(fecha_hora__gte=fecha_limite)
    if centro_filtro:
        base_query = base_query.filter(centro_id=centro_filtro)

    total_incidencias = base_query.count()
    alto_riesgo_count = base_query.filter(Q(riesgo_peces=True) | Q(riesgo_personas=True)).count()
    promedio_dict = base_query.filter(tiempo_resolucion__isnull=False).aggregate(avg_tiempo=Avg('tiempo_resolucion'))
    promedio_resolucion = int(promedio_dict['avg_tiempo']) if promedio_dict['avg_tiempo'] else 0

    chart_centro_query = base_query.filter(centro__isnull=False) \
        .values('centro__nombre') \
        .annotate(count=Count('id')) \
        .order_by('-count')
    chart_centro_labels = [item['centro__nombre'] for item in chart_centro_query]
    chart_centro_counts = [item['count'] for item in chart_centro_query]
    centro_mas_incidencias = chart_centro_labels[0] if chart_centro_labels else "-"

    chart_tendencia_query = base_query \
        .annotate(dia=TruncDate('fecha_hora')) \
        .values('dia') \
        .annotate(count=Count('id')) \
        .order_by('dia')
    chart_tendencia_labels = [item['dia'].strftime('%Y-%m-%d') for item in chart_tendencia_query]
    chart_tendencia_data = [item['count'] for item in chart_tendencia_query]

    modulos_count = base_query.filter(tipo_incidencia='modulos').count()
    sensores_count = base_query.filter(tipo_incidencia='sensores').count()
    chart_tipos_data = [modulos_count, sensores_count]
    
    chart_operario_query = base_query.filter(operario_contacto__isnull=False) \
        .values('operario_contacto__nombre') \
        .annotate(count=Count('id')) \
        .order_by('-count')[:7]
    chart_operario_labels = [item['operario_contacto__nombre'] for item in chart_operario_query]
    chart_operario_data = [item['count'] for item in chart_operario_query]

    chart_clasificacion_query = base_query.filter(tipo_incidencia_normalizada__isnull=False) \
        .exclude(tipo_incidencia_normalizada='') \
        .values('tipo_incidencia_normalizada') \
        .annotate(count=Count('id')) \
        .order_by('-count')
    chart_clasificacion_labels = [item['tipo_incidencia_normalizada'] for item in chart_clasificacion_query]
    chart_clasificacion_data = [item['count'] for item in chart_clasificacion_query]

    # --- NUEVO: Agrupación por Categoría Mayor ---
    mapping_categorias = {
        'Falla Operacional': ['Estanque en manejo especial', 'Estanque en flashing', 'Estanque con cambio de peces', 'Recambio de agua'],
        'Falla Sensores': ['Falla sensor CO2', 'Falla sensor T°', 'Falla sensor pH'],
        'Problemas Eléctricos / Conectividad': ['Corte de energía', 'Falla en plataforma de monitoreo', 'Sin señal o conectividad'],
        'Incidencia Normal': ['Temperatura baja', 'Temperatura alta', 'CO2 alto', 'CO2 bajo'],
        'Sin Comunicación': ['Llamada no contestada', 'Celular centro apagado']
    }
    
    # Inicializar contadores
    conteo_categorias = {
        'Falla Operacional': 0,
        'Falla Sensores': 0,
        'Problemas Eléctricos / Conectividad': 0,
        'Incidencia Normal': 0,
        'Sin Comunicación': 0,
        'Otros': 0
    }

    # Clasificar "al vuelo"
    todos_los_tipos = base_query.values_list('tipo_incidencia_normalizada', flat=True)
    
    for tipo_texto in todos_los_tipos:
        if not tipo_texto: continue
        encontrado = False
        for categoria, lista_tipos in mapping_categorias.items():
            if tipo_texto in lista_tipos:
                conteo_categorias[categoria] += 1
                encontrado = True
                break
        if not encontrado:
            conteo_categorias['Otros'] += 1
            
    # Preparar arrays para el gráfico
    chart_categorias_labels = list(conteo_categorias.keys())
    chart_categorias_data = list(conteo_categorias.values())
    # ---------------------------------------------

    # Calcular KPIs (simulado para el ejemplo)
    centros = Centro.objects.all()
    kpi_lista_final = []
    
    for c in centros:
        total_c = base_query.filter(centro=c).count()
        en_kpi = base_query.filter(centro=c, tiempo_resolucion__lte=20).count()
        porcentaje = 0
        if total_c > 0:
            porcentaje = int((en_kpi / total_c) * 100)
        
        kpi_lista_final.append({
            'centro_nombre': c.nombre,
            'total_incidencias': total_c,
            'en_kpi': en_kpi,
            'porcentaje': porcentaje,
            'cumple_meta': porcentaje >= 80
        })

    contexto = {
        'total_incidencias': total_incidencias,
        'alto_riesgo_count': alto_riesgo_count,
        'promedio_resolucion': promedio_resolucion,
        'centro_mas_incidencias': centro_mas_incidencias,
        
        'chart_centro_labels_json': json.dumps(chart_centro_labels),
        'chart_centro_counts_json': json.dumps(chart_centro_counts),
        
        'chart_tendencia_labels_json': json.dumps(chart_tendencia_labels),
        'chart_tendencia_data_json': json.dumps(chart_tendencia_data),
        
        'chart_tipos_data_json': json.dumps(chart_tipos_data),
        
        'chart_operario_labels_json': json.dumps(chart_operario_labels),
        'chart_operario_data_json': json.dumps(chart_operario_data),

        'chart_clasificacion_labels_json': json.dumps(chart_clasificacion_labels),
        'chart_clasificacion_data_json': json.dumps(chart_clasificacion_data),
        
        # NUEVO: Gráfico por Categorías
        'chart_categorias_labels_json': json.dumps(chart_categorias_labels),
        'chart_categorias_data_json': json.dumps(chart_categorias_data),
        
        'kpi_data': kpi_lista_final,
        'centros': Centro.objects.all().order_by('nombre'),
        'filtros_aplicados': request.GET,
        'es_admin': request.user.is_staff
    }
    
    return render(request, 'dashboard.html', contexto)


# --- APIs (Originales) ---

@csrf_exempt
@api_view(['POST'])
def registrar_incidencia_api(request):
    if request.method == 'POST':
        serializer = IncidenciaSerializer(data=request.data) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
@api_view(['PUT'])
def update_incidencia_api(request, pk):
    try:
        incidencia = Incidencia.objects.get(pk=pk)
    except Incidencia.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = IncidenciaSerializer(incidencia, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        print(serializer.errors) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
@api_view(['DELETE'])
def delete_incidencia_api(request, pk):
    
    incidencia = get_object_or_404(Incidencia, pk=pk)
    
    if request.method == 'DELETE':
        incidencia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


# --- VISTAS PARA CONTROL DIARIO ---
@login_required
def vista_control_diario_santa_juana(request):
    """
    Vista principal para el Control Diario de parámetros (Temp, pH, Oxígeno)
    Versión simplificada sin consultas a la BD
    """
    if not request.user.is_staff:
        return redirect('dashboard')
    
    from datetime import date
    
    # Buscar centro Santa Juana (si no existe, crear uno temporal)
    centro_sj = Centro.objects.filter(slug='santa-juana').first()
    
    if not centro_sj:
        # Crear un objeto temporal para evitar errores
        class CentroTemp:
            id = 'santa-juana'
            nombre = 'Santa Juana'
            slug = 'santa-juana'
        centro_sj = CentroTemp()
    
    fecha_actual = date.today()
    
    contexto = {
        'centro': centro_sj,
        'fecha_actual': fecha_actual,
        'anio_actual': fecha_actual.year,
        'es_admin': request.user.is_staff
    }
    
    return render(request, 'control_diario_santa_juana.html', contexto)


@csrf_exempt
@api_view(['POST'])
def guardar_control_diario_api(request):
    """
    API para guardar o actualizar un registro de Control Diario
    Versión que verifica si la tabla existe antes de intentar guardar
    """
    from datetime import datetime
    
    if request.method == 'POST':
        data = request.data
        
        try:
            # Intentar importar el modelo
            try:
                from .models import ControlDiario
            except ImportError:
                return Response({
                    'success': False,
                    'message': 'El modelo ControlDiario no está disponible. Por favor, ejecuta las migraciones.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Verificar si la tabla existe
            from django.db import connection
            table_name = 'cermaq_incidencias_incidencias_controldiario'
            
            with connection.cursor() as cursor:
                cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
                if not cursor.fetchone():
                    return Response({
                        'success': False,
                        'message': 'La tabla de Control Diario no existe. Por favor, ejecuta el script SQL: crear_tabla_control_diario.sql'
                    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            centro = Centro.objects.get(id=data.get('centro_id'))
            fecha = datetime.strptime(data.get('fecha'), '%Y-%m-%d').date()
            modulo = data.get('modulo', 'Hatchery')
            
            control, created = ControlDiario.objects.get_or_create(
                centro=centro,
                fecha=fecha,
                modulo=modulo,
                defaults={
                    'anio': data.get('anio'),
                    'semana': data.get('semana'),
                    'dia': data.get('dia'),
                    'responsable': data.get('responsable', ''),
                }
            )
            
            if not created:
                control.anio = data.get('anio')
                control.semana = data.get('semana')
                control.dia = data.get('dia')
                control.responsable = data.get('responsable', '')
            
            for hora in ['00', '04', '08', '12', '16', '20']:
                for param in ['temp', 'ph', 'oxigeno']:
                    field_name = f'hora_{hora}_{param}'
                    value = data.get(field_name)
                    if value:
                        setattr(control, field_name, float(value))
            
            control.save()
            
            return Response({
                'success': True,
                'message': 'Control diario guardado exitosamente',
                'id': control.id,
                'promedio_temp': str(control.promedio_temp) if control.promedio_temp else None,
                'promedio_ph': str(control.promedio_ph) if control.promedio_ph else None,
                'promedio_oxigeno': str(control.promedio_oxigeno) if control.promedio_oxigeno else None,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error al guardar: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
@api_view(['GET'])
def obtener_control_diario_api(request):
    """
    API para obtener un registro de Control Diario por fecha
    Versión que verifica si la tabla existe antes de consultar
    """
    from datetime import datetime
    
    fecha_str = request.GET.get('fecha')
    centro_id = request.GET.get('centro_id')
    modulo = request.GET.get('modulo', 'Hatchery')
    
    if not fecha_str or not centro_id:
        return Response({'error': 'Faltan parámetros'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Intentar importar el modelo
        try:
            from .models import ControlDiario
        except ImportError:
            return Response({
                'error': 'El modelo ControlDiario no está disponible'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Verificar si la tabla existe
        from django.db import connection
        table_name = 'cermaq_incidencias_incidencias_controldiario'
        
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
            if not cursor.fetchone():
                return Response({
                    'error': 'La tabla de Control Diario no existe. Por favor, ejecuta el script SQL.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        control = ControlDiario.objects.filter(
            centro_id=centro_id,
            fecha=fecha,
            modulo=modulo
        ).first()
        
        if control:
            data = {
                'id': control.id,
                'fecha': str(control.fecha),
                'anio': control.anio,
                'semana': control.semana,
                'dia': control.dia,
                'responsable': control.responsable,
                'modulo': control.modulo,
            }
            
            for hora in ['00', '04', '08', '12', '16', '20']:
                for param in ['temp', 'ph', 'oxigeno']:
                    field_name = f'hora_{hora}_{param}'
                    value = getattr(control, field_name)
                    data[field_name] = str(value) if value else None
            
            data['promedio_temp'] = str(control.promedio_temp) if control.promedio_temp else None
            data['promedio_ph'] = str(control.promedio_ph) if control.promedio_ph else None
            data['promedio_oxigeno'] = str(control.promedio_oxigeno) if control.promedio_oxigeno else None
            
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- VISTAS PARA REPORTE DE CÁMARAS ---
@login_required
def vista_reporte_camaras(request):
    """
    Vista principal para el Reporte de Cámaras
    """
    if not request.user.is_staff:
        return redirect('dashboard')
    
    from datetime import date
    
    fecha_actual = date.today()
    
    contexto = {
        'fecha_actual': fecha_actual,
        'es_admin': request.user.is_staff
    }
    
    return render(request, 'reporte_camaras.html', contexto)


@csrf_exempt
@api_view(['POST'])
def guardar_reporte_camaras_api(request):
    """
    API para guardar o actualizar un reporte de cámaras
    """
    from datetime import datetime
    
    if request.method == 'POST':
        data = request.data
        
        try:
            try:
                from .models import ReporteCamaras
            except ImportError:
                return Response({
                    'success': False,
                    'message': 'El modelo ReporteCamaras no está disponible. Por favor, ejecuta las migraciones.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            fecha = datetime.strptime(data.get('fecha'), '%Y-%m-%d').date()
            turno = data.get('turno')
            responsable = data.get('responsable')
            centros_data = data.get('centros', {})
            
            reporte, created = ReporteCamaras.objects.get_or_create(
                fecha=fecha,
                turno=turno,
                defaults={
                    'responsable': responsable,
                }
            )
            
            if not created:
                reporte.responsable = responsable
            
            for centro_key, centro_info in centros_data.items():
                field_incidencia = f'{centro_key}_tiene_incidencias'
                field_descripcion = f'{centro_key}_descripcion'
                
                setattr(reporte, field_incidencia, centro_info.get('tiene_incidencias', False))
                setattr(reporte, field_descripcion, centro_info.get('descripcion', ''))
            
            reporte.save()
            
            return Response({
                'success': True,
                'message': 'Reporte de cámaras guardado exitosamente',
                'id': reporte.id,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error al guardar: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
@api_view(['GET'])
def obtener_reporte_camaras_api(request):
    """
    API para obtener un reporte de cámaras por fecha
    """
    from datetime import datetime
    
    fecha_str = request.GET.get('fecha')
    
    if not fecha_str:
        return Response({'error': 'Falta el parámetro fecha'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        try:
            from .models import ReporteCamaras
        except ImportError:
            return Response({
                'error': 'El modelo ReporteCamaras no está disponible'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        reporte = ReporteCamaras.objects.filter(fecha=fecha).first()
        
        if reporte:
            data = {
                'id': reporte.id,
                'fecha': str(reporte.fecha),
                'turno': reporte.turno,
                'responsable': reporte.responsable,
                'centros': {
                    'rio_pescado': {
                        'tiene_incidencias': reporte.rio_pescado_tiene_incidencias,
                        'descripcion': reporte.rio_pescado_descripcion
                    },
                    'collin': {
                        'tiene_incidencias': reporte.collin_tiene_incidencias,
                        'descripcion': reporte.collin_descripcion
                    },
                    'lican': {
                        'tiene_incidencias': reporte.lican_tiene_incidencias,
                        'descripcion': reporte.lican_descripcion
                    },
                    'trafun': {
                        'tiene_incidencias': reporte.trafun_tiene_incidencias,
                        'descripcion': reporte.trafun_descripcion
                    }
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- VISTAS PARA CONSULTA DE REPORTES DE CÁMARAS ---
@login_required
def vista_consulta_reportes_camaras(request):
    """
    Vista para consultar y filtrar reportes de cámaras
    """
    if not request.user.is_staff:
        return redirect('dashboard')
    
    return render(request, 'consulta_reportes_camaras.html')


@csrf_exempt
@api_view(['GET'])
def listar_reportes_camaras_api(request):
    """
    API para listar reportes de cámaras con filtros
    """
    from datetime import datetime
    
    try:
        try:
            from .models import ReporteCamaras
        except ImportError:
            return Response({
                'error': 'El modelo ReporteCamaras no está disponible'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Obtener parámetros de filtro
        fecha_desde = request.GET.get('fecha_desde')
        fecha_hasta = request.GET.get('fecha_hasta')
        turno_filtro = request.GET.get('turno')
        responsable_filtro = request.GET.get('responsable')
        centro_incidencias = request.GET.get('centro_incidencias')
        
        # Iniciar query
        reportes = ReporteCamaras.objects.all()
        
        # Aplicar filtros
        if fecha_desde:
            reportes = reportes.filter(fecha__gte=fecha_desde)
        
        if fecha_hasta:
            reportes = reportes.filter(fecha__lte=fecha_hasta)
        
        if turno_filtro:
            reportes = reportes.filter(turno=turno_filtro)
        
        if responsable_filtro:
            reportes = reportes.filter(responsable__icontains=responsable_filtro)
        
        if centro_incidencias:
            field_name = f'{centro_incidencias}_tiene_incidencias'
            filter_dict = {field_name: True}
            reportes = reportes.filter(**filter_dict)
        
        # Ordenar por fecha descendente
        reportes = reportes.order_by('-fecha', '-creado_en')
        
        # Serializar datos
        reportes_data = []
        for reporte in reportes:
            reportes_data.append({
                'id': reporte.id,
                'fecha': str(reporte.fecha),
                'turno': reporte.turno,
                'responsable': reporte.responsable,
                'rio_pescado_tiene_incidencias': reporte.rio_pescado_tiene_incidencias,
                'collin_tiene_incidencias': reporte.collin_tiene_incidencias,
                'lican_tiene_incidencias': reporte.lican_tiene_incidencias,
                'trafun_tiene_incidencias': reporte.trafun_tiene_incidencias,
                'creado_en': reporte.creado_en.isoformat(),
            })
        
        return Response({
            'success': True,
            'reportes': reportes_data,
            'total': len(reportes_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['GET'])
def detalle_reporte_camaras_api(request, pk):
    """
    API para obtener el detalle completo de un reporte de cámaras
    """
    try:
        try:
            from .models import ReporteCamaras
        except ImportError:
            return Response({
                'error': 'El modelo ReporteCamaras no está disponible'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        reporte = ReporteCamaras.objects.filter(id=pk).first()
        
        if reporte:
            data = {
                'id': reporte.id,
                'fecha': str(reporte.fecha),
                'turno': reporte.turno,
                'responsable': reporte.responsable,
                'rio_pescado_tiene_incidencias': reporte.rio_pescado_tiene_incidencias,
                'rio_pescado_descripcion': reporte.rio_pescado_descripcion,
                'collin_tiene_incidencias': reporte.collin_tiene_incidencias,
                'collin_descripcion': reporte.collin_descripcion,
                'lican_tiene_incidencias': reporte.lican_tiene_incidencias,
                'lican_descripcion': reporte.lican_descripcion,
                'trafun_tiene_incidencias': reporte.trafun_tiene_incidencias,
                'trafun_descripcion': reporte.trafun_descripcion,
                'creado_en': reporte.creado_en.isoformat(),
                'actualizado_en': reporte.actualizado_en.isoformat(),
            }
            
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['DELETE'])
def eliminar_reporte_camaras_api(request, pk):
    """
    API para eliminar un reporte de cámaras
    """
    try:
        try:
            from .models import ReporteCamaras
        except ImportError:
            return Response({
                'error': 'El modelo ReporteCamaras no está disponible'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        reporte = ReporteCamaras.objects.filter(id=pk).first()
        
        if reporte:
            reporte.delete()
            return Response({
                'success': True,
                'message': 'Reporte eliminado exitosamente'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Reporte no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
