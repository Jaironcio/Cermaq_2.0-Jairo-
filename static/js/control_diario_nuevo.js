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
    
    // Exportar a Excel
    document.getElementById('btnExportarExcel').addEventListener('click', () => {
        const anio = document.getElementById('anio').value;
        const semana = document.getElementById('semana').value;
        const dia = document.getElementById('dia').value;
        const responsable = document.getElementById('responsable').value;
        const modulo = document.getElementById('modulo').value;
        
        const datos = [];
        
        // Encabezado
        datos.push(['Control Total Piscicultura']);
        datos.push([`Año: ${anio} | Semana: ${semana} | Día: ${dia}`]);
        datos.push([`Responsable: ${responsable}`]);
        datos.push([`Módulo: ${modulo}`]);
        datos.push([]);
        
        // Tabla de datos
        datos.push(['Hora', 'Temp (°C)', 'pH', 'Oxígeno (mg/L)']);
        
        horas.forEach(hora => {
            const temp = document.getElementById(`hora_${hora}_temp`).value || '-';
            const ph = document.getElementById(`hora_${hora}_ph`).value || '-';
            const oxigeno = document.getElementById(`hora_${hora}_oxigeno`).value || '-';
            datos.push([`${hora}:00`, temp, ph, oxigeno]);
        });
        
        // Promedios
        const promTemp = document.getElementById('prom_temp').textContent;
        const promPh = document.getElementById('prom_ph').textContent;
        const promOxigeno = document.getElementById('prom_oxigeno').textContent;
        datos.push(['PROMEDIO', promTemp, promPh, promOxigeno]);
        
        // Crear libro de Excel
        const ws = XLSX.utils.aoa_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Control Diario');
        
        // Descargar
        const filename = `Control_Diario_${modulo}_${anio}_Sem${semana}_${dia}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        mostrarAlerta('✅ Excel exportado exitosamente', 'success');
    });
    
    // Exportar a PDF
    document.getElementById('btnExportarPDF').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const anio = document.getElementById('anio').value;
        const semana = document.getElementById('semana').value;
        const dia = document.getElementById('dia').value;
        const responsable = document.getElementById('responsable').value;
        const modulo = document.getElementById('modulo').value;
        
        // Título
        doc.setFontSize(18);
        doc.setTextColor(23, 162, 184);
        doc.text('Control Total Piscicultura', 105, 20, { align: 'center' });
        
        // Información
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Año: ${anio} | Semana: ${semana} | Día: ${dia}`, 20, 35);
        doc.text(`Responsable: ${responsable}`, 20, 42);
        doc.text(`Módulo: ${modulo}`, 20, 49);
        
        // Tabla
        const tableData = [];
        horas.forEach(hora => {
            const temp = document.getElementById(`hora_${hora}_temp`).value || '-';
            const ph = document.getElementById(`hora_${hora}_ph`).value || '-';
            const oxigeno = document.getElementById(`hora_${hora}_oxigeno`).value || '-';
            tableData.push([`${hora}:00`, temp, ph, oxigeno]);
        });
        
        // Promedios
        const promTemp = document.getElementById('prom_temp').textContent;
        const promPh = document.getElementById('prom_ph').textContent;
        const promOxigeno = document.getElementById('prom_oxigeno').textContent;
        tableData.push(['PROMEDIO', promTemp, promPh, promOxigeno]);
        
        // Dibujar tabla
        doc.autoTable({
            startY: 60,
            head: [['Hora', 'Temp (°C)', 'pH', 'Oxígeno (mg/L)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [23, 162, 184] },
            footStyles: { fillColor: [212, 237, 218], textColor: [21, 87, 36] }
        });
        
        // Descargar
        const filename = `Control_Diario_${modulo}_${anio}_Sem${semana}_${dia}.pdf`;
        doc.save(filename);
        
        mostrarAlerta('✅ PDF exportado exitosamente', 'success');
    });
    
});
