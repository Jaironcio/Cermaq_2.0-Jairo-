// static/js/consulta_reportes_camaras.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    const turno = document.getElementById('turno');
    const responsable = document.getElementById('responsable');
    const centroIncidencias = document.getElementById('centroIncidencias');
    
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    
    const tablaBody = document.getElementById('tablaBody');
    const resultadosCount = document.getElementById('resultadosCount');
    const loadingContainer = document.getElementById('loadingContainer');
    const tablaContainer = document.getElementById('tablaContainer');
    
    // Establecer fecha hasta como hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    fechaHasta.value = hoy;
    
    // Establecer fecha desde como hace 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    fechaDesde.value = hace30Dias.toISOString().split('T')[0];
    
    // Nombres de centros
    const nombresCentros = {
        'rio_pescado': 'Río Pescado',
        'collin': 'Collín',
        'lican': 'Lican',
        'trafun': 'Trafún'
    };
    
    // Horarios de turnos
    const horariosTurnos = {
        'Mañana': '09:00 - 14:30',
        'Tarde': '14:30 - 00:00',
        'Noche': '00:00 - 09:00'
    };
    
    // Función para buscar reportes
    async function buscarReportes() {
        const filtros = {
            fecha_desde: fechaDesde.value,
            fecha_hasta: fechaHasta.value,
            turno: turno.value,
            responsable: responsable.value.trim(),
            centro_incidencias: centroIncidencias.value
        };
        
        // Construir query string
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filtros)) {
            if (value) {
                params.append(key, value);
            }
        }
        
        // Mostrar loading
        loadingContainer.style.display = 'block';
        tablaContainer.style.display = 'none';
        
        try {
            const response = await fetch(`/api/reporte-camaras/listar/?${params.toString()}`);
            const data = await response.json();
            
            if (response.ok) {
                mostrarResultados(data.reportes);
            } else {
                console.error('Error al obtener reportes:', data);
                mostrarMensajeVacio('Error al cargar los reportes');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensajeVacio('Error de conexión');
        } finally {
            loadingContainer.style.display = 'none';
            tablaContainer.style.display = 'block';
        }
    }
    
    // Función para mostrar resultados
    function mostrarResultados(reportes) {
        if (!reportes || reportes.length === 0) {
            mostrarMensajeVacio('No se encontraron reportes con los filtros seleccionados');
            resultadosCount.textContent = '0 reportes encontrados';
            return;
        }
        
        resultadosCount.textContent = `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} encontrado${reportes.length !== 1 ? 's' : ''}`;
        
        let html = '';
        reportes.forEach(reporte => {
            const centrosConIncidencias = [];
            if (reporte.rio_pescado_tiene_incidencias) centrosConIncidencias.push('Río Pescado');
            if (reporte.collin_tiene_incidencias) centrosConIncidencias.push('Collín');
            if (reporte.lican_tiene_incidencias) centrosConIncidencias.push('Lican');
            if (reporte.trafun_tiene_incidencias) centrosConIncidencias.push('Trafún');
            
            const tieneIncidencias = centrosConIncidencias.length > 0;
            const badgeClass = tieneIncidencias ? 'badge-warning' : 'badge-success';
            const badgeText = tieneIncidencias ? '⚠ Con Novedades' : '✓ Sin Novedades';
            
            html += `
                <tr>
                    <td>${formatearFecha(reporte.fecha)}</td>
                    <td>${reporte.turno}</td>
                    <td>${reporte.responsable}</td>
                    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                    <td>${centrosConIncidencias.length > 0 ? centrosConIncidencias.join(', ') : 'Ninguno'}</td>
                    <td>
                        <div class="acciones-grupo">
                            <button class="btn-ver" onclick="verDetalle(${reporte.id})" title="Ver detalles">👁</button>
                            <button class="btn-editar" onclick="editarReporte(${reporte.id})" title="Editar">✏️</button>
                            <button class="btn-eliminar" onclick="eliminarReporte(${reporte.id})" title="Eliminar">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tablaBody.innerHTML = html;
    }
    
    // Función para mostrar mensaje vacío
    function mostrarMensajeVacio(mensaje) {
        tablaBody.innerHTML = `
            <tr>
                <td colspan="6" class="mensaje-vacio">
                    <div class="mensaje-vacio-icon">📋</div>
                    <div>${mensaje}</div>
                </td>
            </tr>
        `;
    }
    
    // Función para formatear fecha
    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr + 'T00:00:00');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}-${mes}-${anio}`;
    }
    
    // Función para ver detalle (global para que funcione desde el HTML)
    window.verDetalle = async function(id) {
        try {
            const response = await fetch(`/api/reporte-camaras/detalle/${id}/`);
            const reporte = await response.json();
            
            if (response.ok) {
                mostrarModalDetalle(reporte);
            } else {
                alert('Error al cargar el detalle del reporte');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    };
    
    // Función para mostrar modal con detalle
    function mostrarModalDetalle(reporte) {
        const modal = document.getElementById('modalDetalle');
        const modalBody = document.getElementById('modalBody');
        
        let centrosHTML = '';
        const centros = ['rio_pescado', 'collin', 'lican', 'trafun'];
        
        centros.forEach(centro => {
            const tieneIncidencias = reporte[`${centro}_tiene_incidencias`];
            const descripcion = reporte[`${centro}_descripcion`];
            const icono = tieneIncidencias ? '⚠' : '✓';
            const borderColor = tieneIncidencias ? '#dc3545' : '#28a745';
            
            centrosHTML += `
                <div class="centro-detalle" style="border-left-color: ${borderColor}">
                    <div class="centro-detalle-nombre">${icono} ${nombresCentros[centro]}</div>
                    <div class="centro-detalle-descripcion">${descripcion}</div>
                </div>
            `;
        });
        
        modalBody.innerHTML = `
            <div class="detalle-item">
                <div class="detalle-label">Fecha</div>
                <div class="detalle-value">${formatearFecha(reporte.fecha)}</div>
            </div>
            
            <div class="detalle-item">
                <div class="detalle-label">Turno</div>
                <div class="detalle-value">${reporte.turno} (${horariosTurnos[reporte.turno]})</div>
            </div>
            
            <div class="detalle-item">
                <div class="detalle-label">Responsable</div>
                <div class="detalle-value">${reporte.responsable}</div>
            </div>
            
            <div class="detalle-item">
                <div class="detalle-label">Estado de Cámaras por Centro</div>
                ${centrosHTML}
            </div>
            
            <div class="detalle-item">
                <div class="detalle-label">Fecha de Registro</div>
                <div class="detalle-value">${formatearFechaHora(reporte.creado_en)}</div>
            </div>
        `;
        
        modal.classList.add('active');
    };
    
    // Función para cerrar modal (global)
    window.cerrarModal = function() {
        const modal = document.getElementById('modalDetalle');
        modal.classList.remove('active');
    };
    
    // Cerrar modal al hacer click fuera
    document.getElementById('modalDetalle').addEventListener('click', function(e) {
        if (e.target === this) {
            window.cerrarModal();
        }
    });
    
    // Función para formatear fecha y hora
    function formatearFechaHora(fechaStr) {
        const fecha = new Date(fechaStr);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        return `${dia}-${mes}-${anio} ${horas}:${minutos}`;
    }
    
    // Event listeners
    btnFiltrar.addEventListener('click', buscarReportes);
    
    btnLimpiar.addEventListener('click', function() {
        fechaDesde.value = hace30Dias.toISOString().split('T')[0];
        fechaHasta.value = hoy;
        turno.value = '';
        responsable.value = '';
        centroIncidencias.value = '';
        
        mostrarMensajeVacio('Usa los filtros para buscar reportes');
        resultadosCount.textContent = '0 reportes encontrados';
    });
    
    // Permitir buscar con Enter en los campos de texto
    responsable.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarReportes();
        }
    });
    
    // Función para editar reporte (global)
    window.editarReporte = function(id) {
        // Redirigir al formulario de reporte con el ID para editar
        window.location.href = `/reporte-camaras/?editar=${id}`;
    };
    
    // Función para eliminar reporte (global)
    window.eliminarReporte = async function(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            const response = await fetch(`/api/reporte-camaras/eliminar/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert('✅ Reporte eliminado exitosamente');
                buscarReportes(); // Recargar la lista
            } else {
                alert('❌ Error al eliminar: ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error de conexión al eliminar el reporte');
        }
    };
    
    // Cargar reportes iniciales
    buscarReportes();
});
