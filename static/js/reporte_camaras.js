// static/js/reporte_camaras.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del formulario
    const fecha = document.getElementById('fecha');
    const turno = document.getElementById('turno');
    const responsable = document.getElementById('responsable');
    
    // Botones de acción
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCaptura = document.getElementById('btnCaptura');
    const btnPDF = document.getElementById('btnPDF');
    
    // Centros
    const centros = ['rio_pescado', 'collin', 'lican', 'trafun'];
    
    // Horarios de turnos
    const horariosTurnos = {
        'Mañana': '09:00 - 14:30',
        'Tarde': '14:30 - 00:00',
        'Noche': '00:00 - 09:00'
    };
    
    // Actualizar horario cuando cambie el turno
    const turnoHorario = document.getElementById('turno-horario');
    turno.addEventListener('change', function() {
        turnoHorario.textContent = 'Horario: ' + horariosTurnos[this.value];
    });
    
    // Detectar modo edición desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const reporteIdEditar = urlParams.get('editar');
    let modoEdicion = false;
    
    if (reporteIdEditar) {
        modoEdicion = true;
        cargarReporteParaEditar(reporteIdEditar);
    }
    
    // Configurar event listeners para mostrar/ocultar campos de incidencias
    centros.forEach(centro => {
        const radioOk = document.getElementById(`${centro}_ok`);
        const radioIncidencia = document.getElementById(`${centro}_incidencia`);
        const inputContainer = document.getElementById(`${centro}_input`);
        
        radioOk.addEventListener('change', function() {
            if (this.checked) {
                inputContainer.classList.remove('active');
            }
        });
        
        radioIncidencia.addEventListener('change', function() {
            if (this.checked) {
                inputContainer.classList.add('active');
            }
        });
    });
    
    // Función para mostrar alertas
    function mostrarAlerta(mensaje, tipo) {
        const alertaContainer = document.getElementById('alerta-container');
        alertaContainer.innerHTML = `
            <div class="alerta alerta-${tipo}">
                ${mensaje}
            </div>
        `;
        
        setTimeout(() => {
            alertaContainer.innerHTML = '';
        }, 5000);
    }
    
    // Función para recopilar datos del formulario
    function recopilarDatos() {
        const datos = {
            fecha: fecha.value,
            turno: turno.value,
            responsable: responsable.value,
            centros: {}
        };
        
        centros.forEach(centro => {
            const radioIncidencia = document.getElementById(`${centro}_incidencia`);
            const tieneIncidencias = radioIncidencia.checked;
            const textarea = document.querySelector(`#${centro}_input textarea`);
            
            datos.centros[centro] = {
                tiene_incidencias: tieneIncidencias,
                descripcion: tieneIncidencias ? textarea.value : 'No se detectaron incidencias durante el monitoreo'
            };
        });
        
        return datos;
    }
    
    // Función para validar datos
    function validarDatos(datos) {
        if (!datos.fecha) {
            mostrarAlerta('⚠️ Por favor selecciona una fecha', 'error');
            return false;
        }
        
        if (!datos.responsable || datos.responsable.trim() === '') {
            mostrarAlerta('⚠️ Por favor ingresa el nombre del responsable', 'error');
            return false;
        }
        
        // Validar que si hay incidencias, se haya ingresado descripción
        for (const centro in datos.centros) {
            if (datos.centros[centro].tiene_incidencias) {
                if (!datos.centros[centro].descripcion || datos.centros[centro].descripcion.trim() === '') {
                    mostrarAlerta('⚠️ Por favor describe las incidencias detectadas', 'error');
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Guardar reporte
    btnGuardar.addEventListener('click', async function() {
        const datos = recopilarDatos();
        
        if (!validarDatos(datos)) {
            return;
        }
        
        btnGuardar.disabled = true;
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span>⏳</span> Guardando...';
        
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            const response = await fetch('/api/reporte-camaras/guardar/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(datos)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                if (modoEdicion) {
                    mostrarAlerta('✅ Reporte actualizado exitosamente', 'success');
                    // Redirigir a consulta después de 1.5 segundos
                    setTimeout(() => {
                        window.location.href = '/consulta-reportes-camaras/';
                    }, 1500);
                } else {
                    mostrarAlerta('✅ Reporte guardado exitosamente', 'success');
                }
            } else {
                mostrarAlerta('❌ Error al guardar: ' + (result.message || 'Error desconocido'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('❌ Error de conexión al guardar el reporte', 'error');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = textoOriginal;
        }
    });
    
    // Generar captura de pantalla
    btnCaptura.addEventListener('click', async function() {
        const datos = recopilarDatos();
        
        if (!validarDatos(datos)) {
            return;
        }
        
        btnCaptura.disabled = true;
        btnCaptura.innerHTML = '<span>⏳</span> Generando...';
        
        try {
            // Ocultar botones temporalmente
            const footer = document.querySelector('.acciones-footer');
            footer.style.display = 'none';
            
            const reporteContenido = document.getElementById('reporte-contenido');
            
            const canvas = await html2canvas(reporteContenido, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            // Restaurar botones
            footer.style.display = 'flex';
            
            // Descargar imagen
            const link = document.createElement('a');
            const fechaArchivo = datos.fecha.replace(/-/g, '');
            link.download = `Reporte_Camaras_${fechaArchivo}_${datos.turno}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            mostrarAlerta('✅ Captura generada exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al generar la captura', 'error');
        } finally {
            btnCaptura.disabled = false;
            btnCaptura.innerHTML = '<span>📸</span> Generar Captura';
        }
    });
    
    // Exportar a PDF
    btnPDF.addEventListener('click', function() {
        const datos = recopilarDatos();
        
        if (!validarDatos(datos)) {
            return;
        }
        
        btnPDF.disabled = true;
        btnPDF.innerHTML = '<span>⏳</span> Generando...';
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let y = 20;
            
            // Colores
            const colorPrimario = [23, 162, 184];
            const colorVerde = [40, 167, 69];
            const colorRojo = [220, 53, 69];
            
            // Encabezado
            doc.setFillColor(...colorPrimario);
            doc.rect(0, 0, pageWidth, 35, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Reporte Diario - Control de Cámaras', pageWidth / 2, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Río Pescado - Collín - Lican - Trafún', pageWidth / 2, 25, { align: 'center' });
            
            y = 45;
            
            // Información del reporte - Layout reorganizado
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            
            // Primera línea: Fecha y Turno
            doc.setFont('helvetica', 'bold');
            doc.text('Fecha:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.fecha, margin + 18, y);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Turno:', margin + 80, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.turno, margin + 98, y);
            
            y += 8;
            
            // Segunda línea: Horario y Responsable
            doc.setFont('helvetica', 'bold');
            doc.text('Horario:', margin, y);
            doc.setFont('helvetica', 'normal');
            const horario = horariosTurnos[datos.turno] || '';
            doc.text(horario, margin + 22, y);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Responsable:', margin + 80, y);
            doc.setFont('helvetica', 'normal');
            doc.text(datos.responsable, margin + 115, y);
            
            y += 15;
            
            // Línea separadora
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            
            y += 10;
            
            // Situación registrada
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.text('Situación registrada:', margin, y);
            
            y += 10;
            
            // Centros
            const nombrescentros = {
                'rio_pescado': 'Río Pescado',
                'collin': 'Collín',
                'lican': 'Lican',
                'trafun': 'Trafún'
            };
            
            doc.setFontSize(11);
            
            for (const centro in datos.centros) {
                const centroDatos = datos.centros[centro];
                const nombreCentro = nombrescentros[centro];
                
                // Bullet point
                if (centroDatos.tiene_incidencias) {
                    doc.setTextColor(...colorRojo);
                    doc.text('⚠', margin, y);
                } else {
                    doc.setTextColor(...colorVerde);
                    doc.text('✓', margin, y);
                }
                
                // Nombre del centro
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'bold');
                doc.text(nombreCentro + ':', margin + 5, y);
                
                // Descripción
                doc.setFont('helvetica', 'normal');
                const descripcion = centroDatos.descripcion;
                const maxWidth = pageWidth - margin - 60;
                const lines = doc.splitTextToSize(descripcion, maxWidth);
                
                doc.text(lines, margin + 35, y);
                
                y += (lines.length * 7) + 5;
                
                // Verificar si necesitamos nueva página
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
            }
            
            // Pie de página
            const totalPages = doc.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.setFont('helvetica', 'normal');
                
                const fechaGeneracion = new Date().toLocaleString('es-CL');
                doc.text('Generado: ' + fechaGeneracion, margin, 285);
                doc.text('Página ' + p + ' de ' + totalPages, pageWidth - 40, 285);
            }
            
            // Guardar PDF
            const fechaArchivo = datos.fecha.replace(/-/g, '');
            doc.save(`Reporte_Camaras_${fechaArchivo}_${datos.turno}.pdf`);
            
            mostrarAlerta('✅ PDF generado exitosamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al generar el PDF', 'error');
        } finally {
            btnPDF.disabled = false;
            btnPDF.innerHTML = '<span>📄</span> Exportar PDF';
        }
    });
    
    // Función para cargar reporte para editar
    async function cargarReporteParaEditar(id) {
        try {
            const response = await fetch(`/api/reporte-camaras/detalle/${id}/`);
            
            if (response.ok) {
                const data = await response.json();
                
                // Llenar formulario con datos existentes
                fecha.value = data.fecha;
                turno.value = data.turno;
                responsable.value = data.responsable;
                
                // Actualizar horario
                turnoHorario.textContent = 'Horario: ' + horariosTurnos[data.turno];
                
                // Llenar datos de centros
                centros.forEach(centro => {
                    const tieneIncidencias = data[`${centro}_tiene_incidencias`];
                    const descripcion = data[`${centro}_descripcion`];
                    
                    if (tieneIncidencias) {
                        document.getElementById(`${centro}_incidencia`).checked = true;
                        document.getElementById(`${centro}_input`).classList.add('active');
                        document.querySelector(`#${centro}_input textarea`).value = descripcion;
                    } else {
                        document.getElementById(`${centro}_ok`).checked = true;
                    }
                });
                
                // Cambiar texto del botón guardar
                btnGuardar.innerHTML = '<span>💾</span> Actualizar Reporte';
                
                mostrarAlerta('ℹ️ Editando reporte existente', 'info');
            } else {
                mostrarAlerta('❌ Error al cargar el reporte para editar', 'error');
            }
        } catch (error) {
            console.error('Error al cargar reporte:', error);
            mostrarAlerta('❌ Error de conexión al cargar el reporte', 'error');
        }
    }
    
    // Cargar reporte existente si hay uno para la fecha actual
    async function cargarReporteExistente() {
        const fechaActual = fecha.value;
        
        try {
            const response = await fetch(`/api/reporte-camaras/obtener/?fecha=${fechaActual}`);
            
            if (response.ok) {
                const data = await response.json();
                
                // Llenar formulario con datos existentes
                turno.value = data.turno;
                responsable.value = data.responsable;
                
                // Llenar datos de centros
                for (const centro in data.centros) {
                    const centroDatos = data.centros[centro];
                    
                    if (centroDatos.tiene_incidencias) {
                        document.getElementById(`${centro}_incidencia`).checked = true;
                        document.getElementById(`${centro}_input`).classList.add('active');
                        document.querySelector(`#${centro}_input textarea`).value = centroDatos.descripcion;
                    } else {
                        document.getElementById(`${centro}_ok`).checked = true;
                    }
                }
                
                mostrarAlerta('ℹ️ Se cargó un reporte existente para esta fecha', 'info');
            }
        } catch (error) {
            console.error('Error al cargar reporte:', error);
        }
    }
    
    // Cargar reporte cuando cambie la fecha
    fecha.addEventListener('change', cargarReporteExistente);
    
    // Cargar reporte al inicio si hay fecha
    if (fecha.value) {
        cargarReporteExistente();
    }
});
