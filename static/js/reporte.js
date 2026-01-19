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

    // --- 6. Lógica de PDF Completo - Cuadrícula 2x2 (4 por página) ---
    
    const capturaButton = document.getElementById('exportCapturaBtn');
    
    if (capturaButton) {
        capturaButton.addEventListener('click', async function() {
            
            if (typeof html2canvas === 'undefined') {
                alert('Error: La librería html2canvas no está cargada.');
                return;
            }
            
            if (typeof window.jspdf === 'undefined') {
                alert('Error: La librería jsPDF no está cargada.');
                return;
            }
            
            const allCards = document.querySelectorAll('.incidencia-card-premium');
            
            if (allCards.length === 0) {
                alert('No hay incidencias para exportar.');
                return;
            }
            
            const originalText = capturaButton.innerHTML;
            capturaButton.innerHTML = '📋 Generando PDF...';
            capturaButton.disabled = true;
            
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape A4
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Ocultar botones de editar/eliminar
                const actionButtons = document.querySelectorAll('.card-actions-premium');
                actionButtons.forEach(btn => btn.style.display = 'none');
                
                // Configuración de cuadrícula 2x2 (más ancha)
                const margin = 5;
                const gap = 4;
                const cellWidth = (pageWidth - margin * 2 - gap) / 2;
                const cellHeight = (pageHeight - margin * 2 - gap) / 2;
                
                // Capturar todas las tarjetas
                const capturedCards = [];
                for (let i = 0; i < allCards.length; i++) {
                    const canvas = await html2canvas(allCards[i], {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });
                    capturedCards.push({
                        data: canvas.toDataURL('image/png'),
                        ratio: canvas.width / canvas.height
                    });
                }
                
                const totalCards = capturedCards.length;
                
                // Procesar tarjetas en grupos de 4
                for (let i = 0; i < totalCards; i++) {
                    const posInPage = i % 4;
                    
                    // Nueva página cada 4 tarjetas (excepto primera)
                    if (i > 0 && posInPage === 0) {
                        pdf.addPage();
                    }
                    
                    // Calcular posición en cuadrícula 2x2
                    const col = posInPage % 2;     // 0 o 1
                    const row = Math.floor(posInPage / 2); // 0 o 1
                    
                    // Coordenadas de la celda
                    const cellX = margin + col * (cellWidth + gap);
                    const cellY = margin + row * (cellHeight + gap);
                    
                    // Calcular tamaño de imagen manteniendo proporción
                    const imgRatio = capturedCards[i].ratio;
                    let imgWidth = cellWidth;
                    let imgHeight = imgWidth / imgRatio;
                    
                    // Si es muy alta, ajustar por altura
                    if (imgHeight > cellHeight) {
                        imgHeight = cellHeight;
                        imgWidth = imgHeight * imgRatio;
                    }
                    
                    // Centrar en la celda
                    const x = cellX + (cellWidth - imgWidth) / 2;
                    const y = cellY + (cellHeight - imgHeight) / 2;
                    
                    // Agregar imagen
                    pdf.addImage(capturedCards[i].data, 'PNG', x, y, imgWidth, imgHeight);
                }
                
                // Restaurar botones
                actionButtons.forEach(btn => btn.style.display = '');
                
                // Guardar PDF
                const fechaArchivo = new Date().toISOString().split('T')[0];
                pdf.save('Reporte_Completo_Incidencias_' + fechaArchivo + '.pdf');
                
                capturaButton.innerHTML = originalText;
                capturaButton.disabled = false;
                
            } catch (error) {
                console.error('Error al generar PDF:', error);
                alert('Error al generar el PDF.');
                
                const actionButtons = document.querySelectorAll('.card-actions-premium');
                actionButtons.forEach(btn => btn.style.display = '');
                
                capturaButton.innerHTML = originalText;
                capturaButton.disabled = false;
            }
        });
    }
    
    // --- 7. Lógica de Exportar PDF (Formato Ejecutivo con Tabla) ---
    
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

    // --- 8. Lógica de Resumen por Centros ---
    
    const resumenCentrosBtn = document.getElementById('exportResumenCentrosBtn');
    
    if (resumenCentrosBtn) {
        resumenCentrosBtn.addEventListener('click', function() {
            
            if (typeof window.jspdf === 'undefined') {
                alert('Error: La librería jsPDF no está cargada.');
                return;
            }
            
            const allCards = document.querySelectorAll('.incidencia-card-premium');
            
            const originalText = resumenCentrosBtn.innerHTML;
            resumenCentrosBtn.innerHTML = '📊 Generando...';
            resumenCentrosBtn.disabled = true;
            
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('l', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Definir los 3 centros PCC obligatorios
                const centrosPCC = ['Liquiñe', 'Cipreses', 'Trafún'];
                const centrosData = {};
                
                // Inicializar los 3 centros PCC con datos vacíos
                centrosPCC.forEach(centro => {
                    centrosData[centro] = { count: 0, tipos: [], estanques: [], turnos: new Set(), operarios: new Set() };
                });
                
                // Agrupar incidencias por centro (solo centros PCC)
                allCards.forEach(card => {
                    const centroEl = card.querySelector('.centro-nombre');
                    const tipoFallaEl = card.querySelector('.falla-descripcion');
                    const estanqueEl = card.querySelector('.ubicacion-item:nth-child(2) .ubi-value');
                    const turnoEl = card.querySelector('.ubicacion-item:nth-child(3) .ubi-value');
                    const operarioEl = card.querySelector('.operario-nombre');
                    
                    const centro = centroEl ? centroEl.textContent.trim() : '';
                    const tipoFalla = tipoFallaEl ? tipoFallaEl.textContent.trim() : 'Sin tipo';
                    const estanque = estanqueEl ? estanqueEl.textContent.trim() : '';
                    const turno = turnoEl ? turnoEl.textContent.trim() : '';
                    const operario = operarioEl ? operarioEl.textContent.trim() : '';
                    
                    // Solo procesar si el centro es uno de los 3 centros PCC
                    if (centrosPCC.includes(centro)) {
                        centrosData[centro].count++;
                        
                        if (tipoFalla && !centrosData[centro].tipos.includes(tipoFalla)) {
                            centrosData[centro].tipos.push(tipoFalla);
                        }
                        
                        if (estanque && estanque !== 'N/A' && !centrosData[centro].estanques.includes(estanque)) {
                            centrosData[centro].estanques.push(estanque);
                        }
                        
                        if (turno && turno !== 'N/A') {
                            centrosData[centro].turnos.add(turno);
                        }
                        
                        if (operario && operario !== 'N/A') {
                            centrosData[centro].operarios.add(operario);
                        }
                    }
                });
                
                // Colores
                const colorPrimario = [0, 139, 139];
                const colorRojo = [220, 53, 69];
                
                // Encabezado
                pdf.setFillColor(...colorPrimario);
                pdf.rect(0, 0, pageWidth, 25, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.text('REPORTE DE TURNO MONITOREO PCC', 15, 12);
                
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.text('Novedades de Pisciculturas', 15, 20);
                
                const fechaHoy = new Date().toISOString().split('T')[0];
                pdf.text('Fecha: ' + fechaHoy, pageWidth - 60, 15);
                
                // Tarjetas de centros (3 columnas - siempre 3 centros)
                const margin = 10;
                const gap = 8;
                const cardWidth = (pageWidth - margin * 2 - gap * 2) / 3;
                const cardHeight = pageHeight - 45;
                
                let col = 0;
                let startY = 32;
                
                centrosPCC.forEach((centro, index) => {
                    const data = centrosData[centro];
                    
                    const x = margin + col * (cardWidth + gap);
                    const y = startY;
                    
                    // Borde de tarjeta
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(0.5);
                    pdf.rect(x, y, cardWidth, cardHeight);
                    
                    // Encabezado turquesa
                    pdf.setFillColor(...colorPrimario);
                    pdf.rect(x, y, cardWidth, 12, 'F');
                    
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(centro.toUpperCase(), x + cardWidth / 2, y + 8, { align: 'center' });
                    
                    // Contenido
                    let textY = y + 22;
                    pdf.setTextColor(0, 0, 0);
                    
                    // Novedades
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text('Novedades', x + 5, textY);
                    textY += 8;
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(9);
                    
                    // Si no hay incidencias, mostrar mensaje
                    if (data.count === 0) {
                        pdf.text('No se registraron incidencias.', x + 5, textY);
                        textY += 10;
                    } else {
                        pdf.text('Se registraron ' + data.count + ' incidencia(s).', x + 5, textY);
                        textY += 8;
                        
                        // Turno(s)
                        if (data.turnos.size > 0) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text('Turno: ', x + 5, textY);
                            pdf.setFont('helvetica', 'normal');
                            pdf.text(Array.from(data.turnos).join(', '), x + 20, textY);
                            textY += 5;
                        }
                        
                        // Operario(s)
                        if (data.operarios.size > 0) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text('Operario: ', x + 5, textY);
                            pdf.setFont('helvetica', 'normal');
                            const operariosText = Array.from(data.operarios).join(', ');
                            pdf.text(operariosText.substring(0, 30), x + 22, textY);
                            textY += 5;
                        }
                        
                        // Estanques - ARREGLADO para mostrar todos
                        if (data.estanques.length > 0) {
                            pdf.setFont('helvetica', 'bold');
                            pdf.text('Estanques: ', x + 5, textY);
                            pdf.setFont('helvetica', 'normal');
                            const estanquesOrdenados = data.estanques.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
                            const estanquesText = estanquesOrdenados.join(', ');
                            
                            // Dividir en multiples lineas si es necesario
                            const maxWidth = cardWidth - 30;
                            const lines = pdf.splitTextToSize(estanquesText, maxWidth);
                            lines.forEach((line, idx) => {
                                pdf.text(line, x + (idx === 0 ? 25 : 5), textY);
                                if (idx < lines.length - 1) textY += 4;
                            });
                            textY += 5;
                        }
                    }
                    textY += 10;
                    
                    // Fallas/Alarmas (solo si hay)
                    if (data.tipos.length > 0) {
                        const boxHeight = Math.min(15 + data.tipos.length * 6, cardHeight - (textY - y) - 10);
                        
                        pdf.setDrawColor(...colorRojo);
                        pdf.setLineWidth(1);
                        pdf.rect(x + 3, textY, cardWidth - 6, boxHeight);
                        
                        pdf.setTextColor(...colorRojo);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(9);
                        pdf.text('Fallas/Alarmas', x + 5, textY + 6);
                        
                        textY += 12;
                        pdf.setFontSize(8);
                        data.tipos.slice(0, 8).forEach(tipo => {
                            pdf.text('• ' + tipo.substring(0, 40), x + 5, textY);
                            textY += 5;
                        });
                        
                        if (data.tipos.length > 8) {
                            pdf.text('... y ' + (data.tipos.length - 8) + ' más', x + 5, textY);
                        }
                    }
                    
                    col++;
                });
                
                pdf.save('Resumen_Centros_' + fechaHoy + '.pdf');
                
                resumenCentrosBtn.innerHTML = originalText;
                resumenCentrosBtn.disabled = false;
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error al generar el resumen.');
                resumenCentrosBtn.innerHTML = originalText;
                resumenCentrosBtn.disabled = false;
            }
        });
    }

});