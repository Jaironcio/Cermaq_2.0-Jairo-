// Control Diario - JavaScript
document.addEventListener('DOMContentLoaded', () => {
    
    const horas = ['00', '04', '08', '12', '16', '20'];
    const parametros = ['temp', 'ph', 'oxigeno'];
    
    // Actualizar displays del header
    function actualizarDisplays() {
        document.getElementById('display-anio').textContent = document.getElementById('anio').value;
        document.getElementById('display-semana').textContent = document.getElementById('semana').value;
        document.getElementById('display-dia').textContent = document.getElementById('dia').value;
    }
    
    // Event listeners para actualizar displays
    document.getElementById('anio').addEventListener('change', actualizarDisplays);
    document.getElementById('semana').addEventListener('change', actualizarDisplays);
    document.getElementById('dia').addEventListener('change', actualizarDisplays);
    
    // Manejo de pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const module = tab.dataset.module;
            document.getElementById('module-title').textContent = module;
            document.getElementById('modulo').value = module;
        });
    });
    
    // Calcular promedios automáticamente
    function calcularPromedios() {
        parametros.forEach(param => {
            let suma = 0;
            let count = 0;
            
            horas.forEach(hora => {
                const input = document.getElementById(`hora_${hora}_${param}`);
                const valor = parseFloat(input.value);
                
                if (!isNaN(valor) && valor > 0) {
                    suma += valor;
                    count++;
                }
            });
            
            const promedio = count > 0 ? (suma / count).toFixed(2) : '-';
            document.getElementById(`prom_${param}`).textContent = promedio;
        });
    }
    
    // Agregar event listeners a todos los inputs para calcular promedios
    parametros.forEach(param => {
        horas.forEach(hora => {
            const input = document.getElementById(`hora_${hora}_${param}`);
            input.addEventListener('input', calcularPromedios);
        });
    });
    
    // Mostrar alerta
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
    
    // Recopilar datos del formulario
    function recopilarDatos() {
        const datos = {
            centro_id: document.getElementById('centro_id').value,
            fecha: document.getElementById('fecha').value,
            anio: parseInt(document.getElementById('anio').value),
            semana: parseInt(document.getElementById('semana').value),
            dia: document.getElementById('dia').value,
            responsable: document.getElementById('responsable').value,
            modulo: document.getElementById('modulo').value,
        };
        
        horas.forEach(hora => {
            parametros.forEach(param => {
                const input = document.getElementById(`hora_${hora}_${param}`);
                const valor = input.value;
                datos[`hora_${hora}_${param}`] = valor ? parseFloat(valor) : null;
            });
        });
        
        return datos;
                }
            } else {
                mostrarAlerta('❌ Error al guardar: ' + (result.message || 'Error desconocido'), 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('❌ Error de conexión al guardar el registro', 'danger');
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Registro';
        }
    });
    
    // Cargar registro existente
    btnCargar.addEventListener('click', async () => {
        const fecha = document.getElementById('fecha').value;
        const modulo = document.getElementById('modulo').value;
        
        if (!fecha) {
            mostrarAlerta('⚠️ Por favor seleccione una fecha', 'danger');
            return;
        }
        
        btnCargar.disabled = true;
        btnCargar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        
        try {
            const response = await fetch(`/api/control-diario/obtener/?fecha=${fecha}&centro_id=${centroId}&modulo=${modulo}`);
            
            if (response.ok) {
                const data = await response.json();
                
                document.getElementById('anio').value = data.anio;
                document.getElementById('semana').value = data.semana;
                document.getElementById('dia').value = data.dia;
                document.getElementById('responsable').value = data.responsable;
                document.getElementById('modulo').value = data.modulo;
                
                horas.forEach(hora => {
                    parametros.forEach(param => {
                        const input = document.getElementById(`hora_${hora}_${param}`);
                        const valor = data[`hora_${hora}_${param}`];
                        input.value = valor ? parseFloat(valor) : '';
                    });
                });
                
                if (data.promedio_temp) {
                    document.getElementById('prom_temp').textContent = parseFloat(data.promedio_temp).toFixed(2);
                }
                if (data.promedio_ph) {
                    document.getElementById('prom_ph').textContent = parseFloat(data.promedio_ph).toFixed(2);
                }
                if (data.promedio_oxigeno) {
                    document.getElementById('prom_oxigeno').textContent = parseFloat(data.promedio_oxigeno).toFixed(2);
                }
                
                mostrarAlerta('✅ Registro cargado exitosamente', 'success');
            } else {
                mostrarAlerta('ℹ️ No hay registro para esta fecha', 'info');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('❌ Error al cargar el registro', 'danger');
        } finally {
            btnCargar.disabled = false;
            btnCargar.innerHTML = '<i class="fas fa-download"></i> Cargar Registro';
        }
    });
    
    // Exportar a Excel
    btnExportarExcel.addEventListener('click', () => {
        const datos = recopilarDatos();
        
        const wsData = [
            ['CONTROL DIARIO DE PARÁMETROS - SANTA JUANA'],
            [],
            ['Fecha:', datos.fecha, 'Año:', datos.anio],
            ['Día:', datos.dia, 'Semana:', datos.semana],
            ['Responsable:', datos.responsable, 'Módulo:', datos.modulo],
            [],
            ['Hora', 'Temperatura (°C)', 'pH', 'Oxígeno (mg/L)'],
        ];
        
        horas.forEach(hora => {
            wsData.push([
                `${hora}:00`,
                datos[`hora_${hora}_temp`] || '-',
                datos[`hora_${hora}_ph`] || '-',
                datos[`hora_${hora}_oxigeno`] || '-'
            ]);
        });
        
        const promTemp = document.getElementById('prom_temp').textContent;
        const promPh = document.getElementById('prom_ph').textContent;
        const promOxigeno = document.getElementById('prom_oxigeno').textContent;
        
        wsData.push(['PROMEDIO', promTemp, promPh, promOxigeno]);
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        ws['!cols'] = [
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Control Diario');
        XLSX.writeFile(wb, `Control_Diario_${datos.fecha}_${datos.modulo}.xlsx`);
        
        mostrarAlerta('✅ Excel exportado exitosamente', 'success');
    });
    
    // Exportar a PDF
    btnExportarPDF.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const datos = recopilarDatos();
        
        doc.setFontSize(16);
        doc.text('Control Diario de Parámetros', 105, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Santa Juana', 105, 28, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Fecha: ${datos.fecha}`, 20, 45);
        doc.text(`Año: ${datos.anio}`, 120, 45);
        doc.text(`Día: ${datos.dia}`, 20, 52);
        doc.text(`Semana: ${datos.semana}`, 120, 52);
        doc.text(`Responsable: ${datos.responsable}`, 20, 59);
        doc.text(`Módulo: ${datos.modulo}`, 120, 59);
        
        const tableData = [];
        horas.forEach(hora => {
            tableData.push([
                `${hora}:00`,
                datos[`hora_${hora}_temp`] || '-',
                datos[`hora_${hora}_ph`] || '-',
                datos[`hora_${hora}_oxigeno`] || '-'
            ]);
        });
        
        const promTemp = document.getElementById('prom_temp').textContent;
        const promPh = document.getElementById('prom_ph').textContent;
        const promOxigeno = document.getElementById('prom_oxigeno').textContent;
        
        tableData.push(['PROMEDIO', promTemp, promPh, promOxigeno]);
        
        doc.autoTable({
            startY: 70,
            head: [['Hora', 'Temperatura (°C)', 'pH', 'Oxígeno (mg/L)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [26, 138, 138] },
            styles: { fontSize: 10 }
        });
        
        doc.save(`Control_Diario_${datos.fecha}_${datos.modulo}.pdf`);
        
        mostrarAlerta('✅ PDF exportado exitosamente', 'success');
    });
    
});
