// static/js/formulario_sj.js
// Versión con soporte completo para CRUD (crear y editar)

// --- 1. DATOS DE LA CASCADA (LÓGICA DE NEGOCIO SANTA JUANA) ---
const EQUIPOS_GENERICOS_ESTANQUE = {
    "Sensor oxigeno": { "Sistema Oxigenación": ["Oxigeno Alto", "Oxigeno Bajo", "Falla Sensor", "Oxigeno Inestable"] },
    "Bomba": { "Sistema RAS": ["Mecánico", "Electrica", "Termica"] },
    "Cono": { "Sistema Oxigenación": ["Fuga Oxigeno", "Oxigeno Alto", "Oxigeno Bajo"] },
    "Lamparas Sumergibles": { "Sistema RAS": ["Electrica"] }
};
const EQUIPOS_FRY = {
    "Sensor oxigeno": { "Sistema Oxigenación": ["Oxigeno Alto", "Oxigeno Bajo"] },
    "Caudal Ingreso": { "Sistema Agua Ingreso": ["Caudal Alto", "Caudal Bajo"] }
};
const EQUIPOS_ONGROWIN = {
    "Sensor oxigeno": { "Sistema Oxigenación": ["Oxigeno Alto", "Oxigeno Bajo"] },
    "PH": { "Sistema RAS": ["PH Alto", "PH Bajo"] },
    "Trickling": { "Sistema RAS": ["Mecánico"] },
    "Sensor de Caudal Ingreso": { "Sistema Agua Ingreso": ["Caudal Alto", "Caudal Bajo"] },
    "Bomba de Presion Conos": { "Sistema Oxigenación": ["Electrica", "Mecánico"] },
    "Bomba de Retorno": { "Sistema RAS": ["Electrica", "Mecánico"] },
    "Bomba de Lavado FTR": { "Sistema RAS": ["Electrica", "Mecánico"] }
};
const zonasFry = {};
for (let i = 1; i <= 34; i++) {
    zonasFry[`Estanque ${i}`] = EQUIPOS_FRY;
}
const zonasOngrowin = {};
for (let i = 35; i <= 49; i++) {
    zonasOngrowin[`Estanque ${i}`] = EQUIPOS_ONGROWIN;
}
const datosCascada = {
    "Smolt 1": {
        "zonas": {
            "Estanque 1": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 2": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 3": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 4": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 5": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 6": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 7": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 8": EQUIPOS_GENERICOS_ESTANQUE
        }
    },
    "Smolt 2": {
        "zonas": {
            "Estanque 9": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 10": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 11": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 12": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 13": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 14": EQUIPOS_GENERICOS_ESTANQUE,
            "Estanque 15": EQUIPOS_GENERICOS_ESTANQUE, "Estanque 16": EQUIPOS_GENERICOS_ESTANQUE
        }
    },
    "Fry": { "zonas": zonasFry },
    "Ongrowin": { "zonas": zonasOngrowin },
    "Hatchery 1": {
        "equipos": {
            "Sensor Oxigeno": { "Sistema Incubación": ["Oxigeno Alto", "Oxigeno Bajo", "Falla Sensor"] },
            "Sensor T°": { "Sistema Incubación": ["T° Alta", "T° Baja", "Falla Sensor"] }
        }
    },
    "Hatchery 2": {
        "equipos": {
            "Sensor Oxigeno": { "Sistema Incubación": ["Oxigeno Alto", "Oxigeno Bajo", "Falla Sensor"] },
            "Sensor T°": { "Sistema Incubación": ["T° Alta", "T° Baja", "Falla Sensor"] }
        }
    },
    "Biofiltro": {
        "equipos": {
            "Bomba Lavado FTR": { "Sistema RAS": ["Electrica", "Mecánico"] },
            "Bomba Retorno": { "Sistema RAS": ["Electrica", "Mecánico"] }
        }
    },
    "Agua Ingreso": { "equipos": { "Sensor Caudal": { "Sistema Agua Ingreso": ["Caudal Alto", "Caudal Bajo"] } } },
    "Agua Pozo": { "equipos": { "Bomba Pozo": { "Sistema Agua Ingreso": ["Electrica", "Mecánico"] } } },
    "Energia General": { "equipos": { "Generador 1": { "Sistema Energia": ["Falla Arranque", "Falla Electrica"] } } },
    "CCTV": { "equipos": { "Cámara": { "Sensores Innovex": ["Señal", "Falla Equipo"] } } }
};


// --- 2. LÓGICA DEL FORMULARIO ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 3. DATOS DINÁMICOS (Leídos desde el HTML) ---
    const allOperariosData = JSON.parse(document.getElementById('operarios-data').textContent);
    const centrosList = JSON.parse(document.getElementById('centros-data').textContent);
    
    // --- 4. REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('incidenciaForm');
    const alertaContainer = document.getElementById('alerta-container');
    
    const centroSlug = form.dataset.centroSlug;
    const apiUrl = form.dataset.apiUrl;
    const homeUrl = form.dataset.homeUrl;
    const csrftoken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    const lugarSelect = document.getElementById('lugar');
    const zonaContainer = document.getElementById('zona-container');
    const zonaSelect = document.getElementById('zona');
    const equipoSelect = document.getElementById('equipo');
    const sistemaSelect = document.getElementById('sistema');
    const tipoFallaSelect = document.getElementById('tipo_falla');
    const operarioSelect = document.getElementById('operario_contacto');
    const centroHiddenInput = document.getElementById('id_centro_hidden');
    const afectaTodoModuloCheckbox = document.getElementById('afecta_todo_modulo');
    
    // Sistemas generales para incidencias de módulo completo
    const sistemasGenerales = {
        'Sistema de Sal / Salinidad': ['Baja Concentración de Sal', 'Alta Concentración de Sal', 'Alarma General Sistema Sal'],
        'Sistema de CAL': ['Alarma General Sistema CAL', 'Falla Sistema CAL'],
        'Sistema de Oxígeno General': ['Baja Concentración Oxígeno', 'Alta Concentración Oxígeno', 'Alarma Oxígeno General'],
        'Sistema de Nivel/Agua': ['Falla Sensor de Nivel', 'Alarma Nivel General']
    };
    
    // --- 5. FUNCIONES DE ALERTA Y CASCADA ---
    function mostrarAlerta(mensaje, tipo) {
        alertaContainer.innerHTML = ''; 
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo}`; 
        alerta.innerHTML = mensaje;
        alertaContainer.appendChild(alerta);
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 5000);
    }

    function fillSelect(selectElement, optionsArray) {
        const labelText = selectElement.previousElementSibling.textContent.replace(':', '');
        selectElement.innerHTML = `<option value="" disabled selected>Seleccione ${labelText}</option>`;
        
        if (optionsArray && optionsArray.length > 0) {
            optionsArray.forEach(option => {
                const value = (typeof option === 'object') ? option.id : option;
                const text = (typeof option === 'object') ? option.nombre : option;
                
                const opt = document.createElement('option');
                opt.value = value;
                opt.textContent = text;
                selectElement.appendChild(opt);
            });
            selectElement.disabled = false;
        } else {
            selectElement.disabled = true;
        }
    }

    // --- LÓGICA DE LA CASCADA (DUAL) ---
    lugarSelect.addEventListener('change', () => {
        const lugar = lugarSelect.value;
        const datosLugar = datosCascada[lugar];
        
        fillSelect(zonaSelect, []);
        fillSelect(equipoSelect, []);
        fillSelect(sistemaSelect, []);
        fillSelect(tipoFallaSelect, []);

        if (!datosLugar) return;

        if (datosLugar.zonas) {
            zonaContainer.classList.remove('hidden');
            zonaSelect.required = true;
            const zonas = Object.keys(datosLugar.zonas);
            fillSelect(zonaSelect, zonas);
        } else {
            zonaContainer.classList.add('hidden');
            zonaSelect.required = false; 
            const equipos = Object.keys(datosLugar.equipos || {});
            fillSelect(equipoSelect, equipos);
        }
    });

    zonaSelect.addEventListener('change', () => {
        const lugar = lugarSelect.value;
        const zona = zonaSelect.value;
        
        fillSelect(equipoSelect, []);
        fillSelect(sistemaSelect, []);
        fillSelect(tipoFallaSelect, []);
        
        const equipos = Object.keys(datosCascada[lugar]?.zonas[zona] || {});
        fillSelect(equipoSelect, equipos);
    });

    equipoSelect.addEventListener('change', () => {
        const lugar = lugarSelect.value;
        const zona = zonaSelect.value;
        const equipo = equipoSelect.value;

        fillSelect(sistemaSelect, []);
        fillSelect(tipoFallaSelect, []);

        let sistemas;
        if (datosCascada[lugar]?.zonas) {
            sistemas = Object.keys(datosCascada[lugar].zonas[zona]?.[equipo] || {});
        } else {
            sistemas = Object.keys(datosCascada[lugar].equipos?.[equipo] || {});
        }
        fillSelect(sistemaSelect, sistemas);
    });

    sistemaSelect.addEventListener('change', () => {
        const lugar = lugarSelect.value;
        const zona = zonaSelect.value;
        const equipo = equipoSelect.value;
        const sistema = sistemaSelect.value;

        fillSelect(tipoFallaSelect, []);

        let fallas;
        if (afectaTodoModuloCheckbox.checked) {
            // Si es incidencia general, usar fallas generales
            fallas = sistemasGenerales[sistema] || [];
        } else if (datosCascada[lugar]?.zonas) {
            fallas = datosCascada[lugar].zonas[zona]?.[equipo]?.[sistema] || [];
        } else {
            fallas = datosCascada[lugar].equipos?.[equipo]?.[sistema] || [];
        }
        fillSelect(tipoFallaSelect, fallas);
    });

    // --- LÓGICA DEL CHECKBOX "AFECTA TODO EL MÓDULO" ---
    afectaTodoModuloCheckbox.addEventListener('change', () => {
        if (afectaTodoModuloCheckbox.checked) {
            // Modo: Incidencia General
            // 1. Deshabilitar selector de Zona y asignar valor genérico
            zonaSelect.disabled = true;
            zonaSelect.required = false;
            zonaSelect.innerHTML = '<option value="GENERAL" selected>GENERAL - TODO EL SECTOR</option>';
            
            // 2. Deshabilitar y limpiar selector de Equipo
            equipoSelect.disabled = true;
            equipoSelect.required = false;
            equipoSelect.innerHTML = '<option value="TODO EL MÓDULO" selected>TODO EL MÓDULO</option>';
            
            // 3. Mostrar solo sistemas generales
            fillSelect(sistemaSelect, Object.keys(sistemasGenerales));
            fillSelect(tipoFallaSelect, []);
            
        } else {
            // Modo: Incidencia Específica (normal)
            // 1. Rehabilitar selector de Zona
            zonaSelect.disabled = false;
            zonaSelect.required = true;
            
            // 2. Restaurar funcionalidad normal
            const lugar = lugarSelect.value;
            
            if (lugar && datosCascada[lugar]?.zonas) {
                const zonas = Object.keys(datosCascada[lugar].zonas);
                fillSelect(zonaSelect, zonas);
            }
            
            fillSelect(equipoSelect, []);
            fillSelect(sistemaSelect, []);
            fillSelect(tipoFallaSelect, []);
        }
    });

    // --- 6. FUNCIÓN PARA CARGAR DATOS EN MODO EDICIÓN ---
    function cargarDatosEdicion(data) {
        if (data.fecha_hora) {
            document.getElementById('fecha_hora').value = data.fecha_hora.slice(0, 16);
        }
        if (data.turno) {
            document.getElementById('turno').value = data.turno;
        }
        if (data.modulo) {
            lugarSelect.value = data.modulo;
            lugarSelect.dispatchEvent(new Event('change'));
            setTimeout(() => {
                if (data.estanque && data.estanque !== "No Aplica") {
                    zonaSelect.value = data.estanque;
                    zonaSelect.dispatchEvent(new Event('change'));
                }
            }, 100);
        }
        if (data.riesgo_peces !== undefined) {
            document.getElementById('riesgo_peces').value = data.riesgo_peces ? 'true' : 'false';
        }
        if (data.riesgo_personas !== undefined) {
            document.getElementById('riesgo_personas').value = data.riesgo_personas ? 'true' : 'false';
        }
        if (data.perdida_economica !== undefined) {
            document.getElementById('perdida_economica').value = data.perdida_economica ? 'true' : 'false';
        }
        if (data.operario_contacto_id) {
            setTimeout(() => {
                document.getElementById('operario_contacto').value = data.operario_contacto_id;
            }, 200);
        }
        if (data.tiempo_resolucion) {
            document.getElementById('tiempo_resolucion').value = data.tiempo_resolucion;
        }
        if (data.observacion) {
            document.getElementById('observacion').value = data.observacion;
        }
    }

    // --- 7. INICIALIZACIÓN DEL FORMULARIO ---
    (function init() {
        try {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('fecha_hora').value = now.toISOString().slice(0, 16);
        } catch(e) { console.error("Error setting date", e); }

        fillSelect(lugarSelect, Object.keys(datosCascada));

        const centroActual = centrosList.find(c => c.slug === centroSlug);
        console.log('🏢 Buscando centro con slug:', centroSlug);
        console.log('🏢 Centro encontrado:', centroActual);
        
        if (centroActual) {
            // Mantener el ID como viene (puede ser string o número)
            centroHiddenInput.value = centroActual.id;
            console.log('✅ Centro ID asignado al input:', centroActual.id);
            console.log('✅ Tipo de ID:', typeof centroActual.id);
            
            const operariosDeCentro = allOperariosData[centroActual.id] || [];
            console.log('👷 Operarios encontrados:', operariosDeCentro);
            fillSelect(operarioSelect, operariosDeCentro);
        } else {
            console.error(`❌ Centro con slug '${centroSlug}' no encontrado.`);
            console.error('Centros disponibles:', centrosList);
            mostrarAlerta("Error crítico: No se pudo identificar el centro.", "danger");
        }

        const incidenciaDataElement = document.getElementById('incidencia-data');
        if (incidenciaDataElement && incidenciaDataElement.textContent.trim() !== 'null') {
            try {
                const incidenciaData = JSON.parse(incidenciaDataElement.textContent);
                cargarDatosEdicion(incidenciaData);
            } catch (e) {
                console.error('Error al cargar datos de edición:', e);
            }
        }
    })();
    
    // --- 8. LÓGICA DE ENVÍO ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (key === 'riesgo_peces' || key === 'riesgo_personas' || key === 'perdida_economica') {
                data[key] = (value === 'true');
            } else if (key === 'tiempo_resolucion' && value === "") {
                data[key] = null;
            } else if (value !== "") {
                // Mantener todos los valores como vienen (strings o números)
                data[key] = value;
            }
        }
        if (!formData.has('riesgo_peces')) data['riesgo_peces'] = false;
        if (!formData.has('riesgo_personas')) data['riesgo_personas'] = false;
        if (!formData.has('perdida_economica')) data['perdida_economica'] = false;
        
        if (zonaContainer.classList.contains('hidden')) {
            data['estanque'] = "No Aplica";
        }
        
        console.log('📤 Datos a enviar:', data);
        
        const incidenciaId = form.dataset.incidenciaId;
        const isEditMode = incidenciaId && incidenciaId !== '';
        const url = isEditMode ? form.dataset.updateUrl : apiUrl;
        const method = isEditMode ? 'PUT' : 'POST';
        
        const submitBtn = document.getElementById('submitForm');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(errorData => {
                    throw new Error(JSON.stringify(errorData));
                });
            }
        })
        .then(data => {
            const mensaje = isEditMode 
                ? `Incidencia actualizada exitosamente (ID: ${data.pk}).` 
                : `Incidencia registrada exitosamente (ID: ${data.pk}).`;
            mostrarAlerta(mensaje, 'success');
            setTimeout(() => {
                window.location.href = '/reporte/'; 
            }, 2000);
        })
        .catch(error => {
            console.error('Error al guardar:', error);
            let errorMessage = 'Error al guardar. Revise la consola.';
            try {
                const errorObj = JSON.parse(error.message);
                errorMessage = '<ul>';
                for (const key in errorObj) {
                    const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '); 
                    errorMessage += `<li><strong>${displayKey}:</strong> ${errorObj[key]}</li>`;
                }
                errorMessage += '</ul>';
            } catch (e) {
                errorMessage = `ERROR: ${error.message}`;
            }
            
            mostrarAlerta(errorMessage, 'danger');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

});