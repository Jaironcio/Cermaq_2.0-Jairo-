// static/js/reporte.js

document.addEventListener('DOMContentLoaded', function () {
    
    // --- 1. Obtener Elementos ---
    const aplicarBtn = document.getElementById('aplicarFiltrosBtn');
    const resetBtn = document.getElementById('resetFiltrosBtn');
    
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroTipo = document.getElementById('filtroTipoIncidencia');
    const filtroTurno = document.getElementById('filtroTurno');
    const filtroCentro = document.getElementById('filtroCentro');
    
    // --- 2. Poner los valores actuales en los filtros ---
    const currentParams = new URLSearchParams(window.location.search);
    
    filtroFecha.value = currentParams.get('fecha') || '';
    filtroTipo.value = currentParams.get('tipo') || '';
    filtroTurno.value = currentParams.get('turno') || '';
    filtroCentro.value = currentParams.get('centro') || '';

    // --- 3. Lógica de Botones de Filtro ---
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', function () {
            const params = new URLSearchParams();
            if (filtroFecha.value) { params.set('fecha', filtroFecha.value); }
            if (filtroTipo.value) { params.set('tipo', filtroTipo.value); }
            if (filtroTurno.value) { params.set('turno', filtroTurno.value); }
            if (filtroCentro.value) { params.set('centro', filtroCentro.value); }
            window.location.search = params.toString();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            window.location.pathname = '/reporte/';
        });
    }
    
    // --- 4. Actualizar contadores ---
    const incidenciasFiltradas = document.querySelectorAll('.incidencia-card-premium').length;
    const incidenciasFiltradasHeader = document.getElementById('incidenciasFiltradasHeader');
    if (incidenciasFiltradasHeader) {
        incidenciasFiltradasHeader.textContent = incidenciasFiltradas;
    }

    // --- 5. Lógica de Botones CRUD (Eliminar) usando delegación de eventos ---
    
    function getCsrfToken() {
        const tokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (tokenElement) { return tokenElement.value; }
        console.error('¡No se encontró el CSRF Token!');
        return null;
    }

    // Usar delegación de eventos en el documento para capturar clicks en botones de eliminar
    document.addEventListener('click', function(e) {
        // Verificar si el click fue en un botón de eliminar o en un elemento dentro de él
        const deleteBtn = e.target.closest('.btn-delete');
        
        if (!deleteBtn) {
            return; // No es un botón de eliminar, ignorar
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const card = deleteBtn.closest('.incidencia-card-premium');
        const incidenciaId = deleteBtn.getAttribute('data-id');
        const csrfToken = getCsrfToken();

        console.log('Eliminar clickeado - ID:', incidenciaId);

        if (!incidenciaId) {
            alert('Error: No se pudo obtener el ID de la incidencia.');
            return;
        }

        if (!csrfToken) {
            alert('Error: No se encontró el token CSRF.');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar esta incidencia #' + incidenciaId + '?')) {
            return;
        }

        fetch('/api/incidencia/' + incidenciaId + '/delete/', {
            method: 'DELETE',
            headers: { 
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            console.log('Respuesta:', response.status);
            if (response.ok) {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(function() {
                    card.remove();
                    var incidenciasActuales = document.querySelectorAll('.incidencia-card-premium').length;
                    document.getElementById('incidenciasFiltradasHeader').textContent = incidenciasActuales;
                    alert('Incidencia eliminada correctamente.');
                }, 500);
            } else {
                alert('Error: No se pudo eliminar. Código: ' + response.status);
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('Error de conexión: ' + error.message);
        });
    });

    // --- 6. Lógica de Exportar PDF (Formato Ejecutivo con Tabla) ---
    
    const pdfButton = document.getElementById('exportPdfBtn');

    if (pdfButton) {
        pdfButton.addEventListener('click', function() {
            
            if (typeof window.jspdf === 'undefined') {
                alert('Error: La librería PDF no está cargada.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const allCards = document.querySelectorAll('.incidencia-card-premium');
            
            if (allCards.length === 0) {
                alert('No hay incidencias para exportar.');
                return;
            }

            const originalText = pdfButton.innerHTML;
            pdfButton.innerHTML = '📄 Generando...';
            pdfButton.disabled = true;

            // Crear PDF en formato horizontal para tabla
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Colores corporativos Cermaq
            const colorPrimario = [0, 102, 102];    // #006666
            const colorSecundario = [0, 139, 139];  // #008B8B
            const colorVerde = [40, 167, 69];       // Verde KPI
            const colorAmarillo = [255, 193, 7];    // Amarillo KPI
            const colorRojo = [220, 53, 69];        // Rojo KPI
            
            // --- ENCABEZADO ---
            pdf.setFillColor(...colorPrimario);
            pdf.rect(0, 0, pageWidth, 28, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('REPORTE DE INCIDENCIAS', 15, 13);
            
            pdf.setFontSize(12);
            pdf.text('CERMAQ CHILE', 15, 21);
            
            // Fecha del reporte
            const fechaHoy = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormateada = fechaHoy.toLocaleDateString('es-CL', opcionesFecha);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1), pageWidth - 100, 13);
            
            // Total de incidencias
            pdf.setFont('helvetica', 'bold');
            pdf.text('Total: ' + allCards.length + ' incidencias', pageWidth - 100, 21);
            
            // --- TABLA DE DATOS ---
            let y = 38;
            const margin = 8;
            const colWidths = [10, 32, 26, 18, 22, 45, 70, 28, 28]; // Anchos de columna ajustados
            const headers = ['N°', 'Centro', 'Fecha', 'Hora', 'Turno', 'Ubicación', 'Tipo de Incidencia', 'Tiempo', 'Estado'];
            
            // Función para dibujar encabezado de tabla
            function dibujarEncabezadoTabla() {
                pdf.setFillColor(...colorSecundario);
                pdf.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                
                let xPos = margin + 2;
                headers.forEach((header, i) => {
                    pdf.text(header, xPos, y + 7);
                    xPos += colWidths[i];
                });
                
                y += 12;
            }
            
            dibujarEncabezadoTabla();
            
            // Extraer datos de las tarjetas y dibujar filas
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            
            let rowIndex = 0;
            allCards.forEach((card, index) => {
                // Verificar si necesitamos nueva página
                if (y > pageHeight - 25) {
                    pdf.addPage();
                    y = 15;
                    dibujarEncabezadoTabla();
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8);
                }
                
                // Extraer datos de la tarjeta con selectores correctos
                const centroEl = card.querySelector('.centro-nombre');
                const fechaEl = card.querySelector('.fecha-valor');
                const horaEl = card.querySelector('.hora-valor');
                const turnoEl = card.querySelector('.ubicacion-item:nth-child(3) .ubi-value');
                const moduloEl = card.querySelector('.ubicacion-item:nth-child(1) .ubi-value');
                const estanqueEl = card.querySelector('.ubicacion-item:nth-child(2) .ubi-value');
                const tipoFallaEl = card.querySelector('.falla-descripcion');
                const kpiValueEl = card.querySelector('.kpi-value');
                const kpiStatusEl = card.querySelector('.kpi-status');
                
                // Obtener valores con limpieza
                const centro = centroEl ? centroEl.textContent.trim() : 'Sin centro';
                const fecha = fechaEl ? fechaEl.textContent.trim() : 'Sin fecha';
                const hora = horaEl ? horaEl.textContent.trim() : '--:--';
                const turno = turnoEl ? turnoEl.textContent.trim() : 'Sin turno';
                const modulo = moduloEl ? moduloEl.textContent.trim() : '';
                const estanque = estanqueEl ? estanqueEl.textContent.trim() : '';
                
                // Construir ubicación
                let ubicacion = 'Sin ubicación';
                if (modulo && modulo !== 'N/A' && estanque && estanque !== 'N/A') {
                    ubicacion = modulo + ' / Est. ' + estanque;
                } else if (modulo && modulo !== 'N/A') {
                    ubicacion = modulo;
                } else if (estanque && estanque !== 'N/A') {
                    ubicacion = 'Est. ' + estanque;
                }
                
                const tipoFalla = tipoFallaEl ? tipoFallaEl.textContent.trim() : 'Sin clasificar';
                
                // Extraer tiempo y estado del KPI
                let tiempo = 'Sin dato';
                let estado = 'Sin dato';
                if (kpiValueEl) {
                    const kpiText = kpiValueEl.textContent.trim();
                    const tiempoMatch = kpiText.match(/(\d+)\s*min/);
                    if (tiempoMatch) {
                        tiempo = tiempoMatch[1] + ' min';
                    }
                }
                if (kpiStatusEl) {
                    const statusText = kpiStatusEl.textContent.trim();
                    if (statusText.includes('Cumple')) {
                        estado = 'Cumple KPI';
                    } else if (statusText.includes('Fuera')) {
                        estado = 'Fuera KPI';
                    } else if (statusText.includes('Crítico')) {
                        estado = 'Crítico';
                    } else {
                        estado = statusText;
                    }
                }
                
                // Alternar color de fila
                if (rowIndex % 2 === 0) {
                    pdf.setFillColor(248, 249, 250);
                    pdf.rect(margin, y - 3, pageWidth - (margin * 2), 9, 'F');
                }
                
                // Dibujar línea divisoria sutil
                pdf.setDrawColor(230, 230, 230);
                pdf.line(margin, y + 5, pageWidth - margin, y + 5);
                
                // Dibujar datos
                pdf.setTextColor(50, 50, 50);
                let xPos = margin + 2;
                
                const rowData = [
                    String(index + 1),
                    centro.length > 14 ? centro.substring(0, 14) + '...' : centro,
                    fecha,
                    hora,
                    turno,
                    ubicacion.length > 20 ? ubicacion.substring(0, 20) + '...' : ubicacion,
                    tipoFalla.length > 35 ? tipoFalla.substring(0, 35) + '...' : tipoFalla,
                    tiempo,
                    estado
                ];
                
                rowData.forEach((data, i) => {
                    // Color especial para columna de estado
                    if (i === 8) {
                        if (data.includes('Cumple')) {
                            pdf.setTextColor(...colorVerde);
                        } else if (data.includes('Fuera')) {
                            pdf.setTextColor(200, 150, 0);
                        } else if (data.includes('Crítico')) {
                            pdf.setTextColor(...colorRojo);
                        }
                        pdf.setFont('helvetica', 'bold');
                    }
                    
                    // Color especial para número de fila
                    if (i === 0) {
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(...colorPrimario);
                    }
                    
                    pdf.text(data, xPos, y + 3);
                    xPos += colWidths[i];
                    
                    // Restaurar estilo después de cada celda especial
                    if (i === 0 || i === 8) {
                        pdf.setTextColor(50, 50, 50);
                        pdf.setFont('helvetica', 'normal');
                    }
                });
                
                y += 9;
                rowIndex++;
            });
            
            // --- PIE DE PÁGINA ---
            const totalPages = pdf.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                pdf.setPage(p);
                pdf.setFontSize(8);
                pdf.setTextColor(128, 128, 128);
                pdf.setFont('helvetica', 'normal');
                
                const fechaGeneracion = new Date().toLocaleString('es-CL');
                pdf.text('Generado: ' + fechaGeneracion + ' | Sistema de Gestión de Incidencias - Cermaq Chile', margin, pageHeight - 6);
                pdf.text('Página ' + p + ' de ' + totalPages, pageWidth - 30, pageHeight - 6);
            }

            // Guardar PDF
            const fechaArchivo = new Date().toISOString().split('T')[0];
            pdf.save('Reporte_Incidencias_Cermaq_' + fechaArchivo + '.pdf');
            
            pdfButton.innerHTML = originalText;
            pdfButton.disabled = false;
        });
    }

});