// static/js/formulario.js

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. OBTENER LOS ELEMENTOS ---
    const formElement = document.getElementById('incidenciaForm');
    const MODO_EDICION = formElement.dataset.incidenciaId !== '';
    const INCIDENCIA_ID = formElement.dataset.incidenciaId;

    const allSections = document.querySelectorAll('.form-section');
    const seccionTipoIncidencia = document.getElementById('section-tipo-incidencia');
    const seccionModulos = document.getElementById('section-modulos-estanques');
    const seccionSensores = document.getElementById('section-sistema-sensores');
    const seccionRiesgos = document.getElementById('section-evaluacion-riesgos');
    const seccionOperario = document.getElementById('section-contacto-operario');
    
    const centroSelect = document.getElementById('centro');
    const moduloSelect = document.getElementById('modulo');
    const estanqueSelect = document.getElementById('estanque');
    const operarioSelect = document.getElementById('operarioContacto');
    const sensorDetectadoSelect = document.getElementById('sensorDetectado');

    const tipoModulosRadio = document.getElementById('tipoModulos');
    const tipoSensoresRadio = document.getElementById('tipoSensores');
    
    const tiempoResolucionInput = document.getElementById('tiempoResolucion');
    const submitButton = document.getElementById('submitForm');
    
    const operarioInfoDiv = document.getElementById('info-operario-selected');
    const operarioNombreSpan = document.getElementById('operario-nombre-display');
    const operarioCargoSpan = document.getElementById('operario-cargo-display');
    const operarioTelefonoSpan = document.getElementById('operario-telefono-display');

    
    // --- 2. FUNCIONES AYUDANTES ---

    function rellenarSelectSimple(selectElement, items, prompt) {
        selectElement.innerHTML = ''; 
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = prompt;
        selectElement.appendChild(defaultOption);
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item; 
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    function rellenarSelectOperarios(items) {
        operarioSelect.innerHTML = '';
        operarioSelect.removeAttribute('required'); // Operario es opcional
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione un operario';
        operarioSelect.appendChild(defaultOption);
        items.forEach(op => {
            const option = document.createElement('option');
            option.value = op.id;
            option.textContent = op.nombre;
            operarioSelect.appendChild(option);
        });
    }

    function validarInputComa(e) {
        let value = e.target.value;
        value = value.replace(/[^0-9,]/g, ''); 
        const firstCommaIndex = value.indexOf(',');
        if (firstCommaIndex !== -1) {
            let partAfterComma = value.substring(firstCommaIndex + 1);
            partAfterComma = partAfterComma.replace(/,/g, '');
            value = value.substring(0, firstCommaIndex + 1) + partAfterComma;
        }
        e.target.value = value;
    }

    function setupParametroCascada(checkId, nivelSelectId, valorInputId) {
        const check = document.getElementById(checkId);
        const nivelLabel = document.querySelector(`label[for="${nivelSelectId}"]`);
        const nivelSelect = document.getElementById(nivelSelectId);
        const valorInput = valorInputId ? document.getElementById(valorInputId) : null;

        if (!check || !nivelLabel || !nivelSelect) {
            console.warn('Faltan elementos para la cascada del parámetro:', checkId);
            return () => {}; // Devuelve una función vacía
        }

        function toggleCheck() {
            if (check.checked) {
                nivelLabel.classList.remove('hidden-input');
                nivelSelect.classList.remove('hidden-input');
                toggleNivel(); 
            } else {
                nivelLabel.classList.add('hidden-input');
                nivelSelect.classList.add('hidden-input');
                if (valorInput) {
                    valorInput.classList.add('hidden-input');
                }
            }
        }
        
        function toggleNivel() {
            if (valorInput) {
                if (nivelSelect.value === 'alta' || nivelSelect.value === 'baja') {
                    valorInput.classList.remove('hidden-input');
                } else {
                    valorInput.classList.add('hidden-input');
                }
            }
        }

        check.addEventListener('change', toggleCheck);
        nivelSelect.addEventListener('change', toggleNivel);

        if (valorInput) {
            valorInput.addEventListener('input', validarInputComa);
        }
        
        return toggleCheck; // Devolvemos la función para llamarla en modo edición
    }

    // --- 3. LÓGICA DE POBLAR MENÚS (REESTRUCTURADO) ---
    
    function poblarOperarios() {
        const centroId = centroSelect.value;
        if (centroId && window.DATOS_OPERARIOS && window.DATOS_OPERARIOS[centroId]) {
            rellenarSelectOperarios(window.DATOS_OPERARIOS[centroId]);
        } else {
            rellenarSelectOperarios([]);
        }
    }

    function poblarModulos() {
        if (!window.DATOS_MODULOS) { return; }
        const centroId = centroSelect.value;
        if (centroId && window.DATOS_MODULOS[centroId]) {
            const modulosDelCentro = window.DATOS_MODULOS[centroId];
            const nombresDeModulos = Object.keys(modulosDelCentro);
            rellenarSelectSimple(moduloSelect, nombresDeModulos, 'Seleccione un módulo');
        } else {
            rellenarSelectSimple(moduloSelect, [], 'Seleccione un módulo');
        }
        // Siempre limpiar estanques al cambiar de centro
        rellenarSelectSimple(estanqueSelect, [], 'Seleccione un estanque');
    }

    function poblarEstanques() {
        if (!window.DATOS_MODULOS) { return; }
        const centroId = centroSelect.value;
        const moduloNombre = moduloSelect.value;
        if (centroId && moduloNombre && window.DATOS_MODULOS[centroId] && window.DATOS_MODULOS[centroId][moduloNombre]) {
            const estanquesDelModulo = window.DATOS_MODULOS[centroId][moduloNombre];
            rellenarSelectSimple(estanqueSelect, estanquesDelModulo, 'Seleccione un estanque');
        } else {
            rellenarSelectSimple(estanqueSelect, [], 'Seleccione un estanque');
        }
    }

    // --- 4. LÓGICA DE EVENTOS (Listeners) ---
    
    centroSelect.addEventListener('change', function() {
        const centroId = centroSelect.value;
        if (centroId) {
            seccionTipoIncidencia.classList.remove('hidden');
            poblarOperarios(); // <--- Llamar a la función
            poblarModulos();   // <--- Llamar a la función
        } else {
            seccionTipoIncidencia.classList.add('hidden');
            poblarOperarios();
            poblarModulos();
        }
        if (!MODO_EDICION) {
            seccionModulos.classList.add('hidden');
            seccionSensores.classList.add('hidden');
            seccionRiesgos.classList.add('hidden');
            seccionOperario.classList.add('hidden');
            tipoModulosRadio.checked = false;
            tipoSensoresRadio.checked = false;
        }
        operarioInfoDiv.classList.add('info-operario-hidden');
    });

    moduloSelect.addEventListener('change', poblarEstanques); // <--- Llamar a la función

    tipoModulosRadio.addEventListener('change', function() {
        if (tipoModulosRadio.checked) {
            seccionModulos.classList.remove('hidden');
            seccionSensores.classList.add('hidden');
            if (!MODO_EDICION) {
                seccionRiesgos.classList.add('hidden');
                seccionOperario.classList.add('hidden');
            }
        }
    });
    
    tipoSensoresRadio.addEventListener('change', function() {
        if (tipoSensoresRadio.checked) {
            seccionSensores.classList.remove('hidden');
            seccionModulos.classList.add('hidden');
            if (!MODO_EDICION) {
                seccionRiesgos.classList.add('hidden');
                seccionOperario.classList.add('hidden');
            }
        }
    });

    // --- 5. LÓGICA DE PARÁMETROS (Oxígeno, Temp, etc.) ---
    const toggleOxigeno = setupParametroCascada('oxigeno', 'oxigenoNivel', 'valorOxigeno');
    const toggleTemperatura = setupParametroCascada('temperatura', 'temperaturaNivel', 'valorTemperatura');
    const toggleTurbidez = setupParametroCascada('turbidez', 'turbidezNivel', 'valorTurbidez');
    const toggleConductividad = setupParametroCascada('conductividad', 'conductividadNivel');

    // --- 6. LÓGICA DE CASCADA (Secciones 5 y 6) ---
    function mostrarSeccionRiesgos() {
        if (!seccionModulos.classList.contains('hidden') || !seccionSensores.classList.contains('hidden')) {
            seccionRiesgos.classList.remove('hidden');
        }
    }

    estanqueSelect.addEventListener('change', function() {
        if (estanqueSelect.value) { mostrarSeccionRiesgos(); } 
        else if (!MODO_EDICION) { seccionRiesgos.classList.add('hidden'); }
    });

    sensorDetectadoSelect.addEventListener('change', function() {
        if (sensorDetectadoSelect.value) { mostrarSeccionRiesgos(); } 
        else if (!MODO_EDICION) { seccionRiesgos.classList.add('hidden'); }
    });

    tiempoResolucionInput.addEventListener('input', function() {
        if (tiempoResolucionInput.value) {
            seccionOperario.classList.remove('hidden');
        } else if (!MODO_EDICION) {
            seccionOperario.classList.add('hidden');
        }
    });

    // --- 7. LÓGICA DE MOSTRAR INFO OPERARIO ---
    operarioSelect.addEventListener('change', function() {
        const operarioId = operarioSelect.value;
        const centroId = centroSelect.value;
        if (operarioId && centroId && window.DATOS_OPERARIOS && window.DATOS_OPERARIOS[centroId]) {
            const operarios = window.DATOS_OPERARIOS[centroId];
            const operario = operarios.find(op => op.id == operarioId);
            if (operario) {
                operarioNombreSpan.textContent = operario.nombre;
                operarioCargoSpan.textContent = operario.cargo;
                operarioTelefonoSpan.textContent = operario.telefono;
                operarioInfoDiv.classList.remove('info-operario-hidden');
            }
        } else {
            operarioInfoDiv.classList.add('info-operario-hidden');
        }
    });

    // --- 8. LÓGICA DE "MODO EDICIÓN" (MÁS ROBUSTA) ---
    if (MODO_EDICION && window.INCIDENCIA_A_EDITAR) {
        const data = window.INCIDENCIA_A_EDITAR;
        console.log('Modo edición - Datos cargados:', data);
        console.log('Centro seleccionado:', centroSelect.value);
        console.log('Datos módulos disponibles:', window.DATOS_MODULOS);

        // 1. Poblar las listas que dependen del Centro
        // (El centro ya está seleccionado por Django)
        poblarOperarios();
        poblarModulos();
        
        // 2. Seleccionar el Operario
        if (data.operario_contacto_id) {
            operarioSelect.value = data.operario_contacto_id;
            // Disparamos 'change' para que se muestre la info del operario
            operarioSelect.dispatchEvent(new Event('change')); 
        }
        
        // 3. Seleccionar el Módulo
        if (data.modulo) {
            // Si el módulo no existe en la lista, agregarlo
            if (!Array.from(moduloSelect.options).some(opt => opt.value === data.modulo)) {
                const opt = document.createElement('option');
                opt.value = data.modulo;
                opt.textContent = data.modulo;
                moduloSelect.appendChild(opt);
            }
            moduloSelect.value = data.modulo;
            
            // 4. Poblar la lista de Estanques
            poblarEstanques();
            
            // 5. Seleccionar el Estanque
            if (data.estanque) {
                // Si el estanque no existe en la lista, agregarlo
                if (!Array.from(estanqueSelect.options).some(opt => opt.value === data.estanque)) {
                    const opt = document.createElement('option');
                    opt.value = data.estanque;
                    opt.textContent = data.estanque;
                    estanqueSelect.appendChild(opt);
                }
                estanqueSelect.value = data.estanque;
            }
        }

        // 6. Marcar checkboxes de parámetros
        data.parametros_afectados.forEach(paramId => {
            if (paramId) { // paramId es "oxigeno", "pH", etc.
                const check = document.getElementById(paramId);
                if (check) {
                    check.checked = true;
                }
            }
        });
        
        // 7. Disparar los toggles de los parámetros para mostrar los selects/inputs
        toggleOxigeno();
        toggleTemperatura();
        toggleTurbidez();
        toggleConductividad();
    }


    // --- 9. LÓGICA DE ENVIAR FORMULARIO ---
    
    function getCsrfToken() {
        return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    }

    submitButton.addEventListener('click', function() {
        
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            alert('Error de seguridad. (CSRF Token missing)');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';

        // 1. Recolectar datos
        const parametros = Array.from(document.querySelectorAll('input[name="parametros"]:checked'))
                                .map(cb => cb.value)
                                .join(',');

        const riesgoPeces = document.querySelector('input[name="riesgoPeces"]:checked')?.value === 'si';
        const perdidaEconomica = document.querySelector('input[name="perdidaEconomica"]:checked')?.value === 'si';
        const riesgoPersonas = document.querySelector('input[name="riesgoPersonas"]:checked')?.value === 'si';
        
        const data = {
            fecha_hora: document.getElementById('fechaHora').value,
            turno: document.getElementById('turno').value,
            centro: document.getElementById('centro').value || null,
            tipo_incidencia: document.querySelector('input[name="tipoIncidencia"]:checked')?.value || '',
            modulo: document.getElementById('modulo').value,
            estanque: document.getElementById('estanque').value,
            parametros_afectados: parametros,
            oxigeno_nivel: document.getElementById('oxigenoNivel').value,
            oxigeno_valor: document.getElementById('valorOxigeno').value,
            temperatura_nivel: document.getElementById('temperaturaNivel').value,
            temperatura_valor: document.getElementById('valorTemperatura').value,
            conductividad_nivel: document.getElementById('conductividadNivel').value,
            turbidez_nivel: document.getElementById('turbidezNivel').value,
            turbidez_valor: document.getElementById('valorTurbidez').value,
            sistema_sensor: document.getElementById('sistemaSensor').value,
            sensor_detectado: document.getElementById('sensorDetectado').value,
            sensor_nivel: document.getElementById('sensorNivel').value,
            sensor_valor: document.getElementById('valorSensor').value,
            tiempo_resolucion: document.getElementById('tiempoResolucion').value || null,
            riesgo_peces: riesgoPeces,
            perdida_economica: perdidaEconomica,
            riesgo_personas: riesgoPersonas,
            observacion: document.getElementById('observacion').value,
            operario_contacto: document.getElementById('operarioContacto').value || null,
            tipo_incidencia_normalizada: document.getElementById('tipoIncidenciaNormalizada').value,
        };

        // 2. Decidir a qué API llamar
        let url = '/api/registrar-incidencia/';
        let method = 'POST';
        
        if (MODO_EDICION) {
            url = `/api/incidencia/${INCIDENCIA_ID}/update/`;
            method = 'PUT';
        }

        // 3. Enviar los datos
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) { return response.json(); }
            return response.json().then(errorData => {
                throw new Error(JSON.stringify(errorData));
            });
        })
        .then(data => {
            if (MODO_EDICION) {
                alert('¡Incidencia actualizada con éxito!');
                window.location.href = '/reporte/';
            } else {
                alert('¡Incidencia registrada con éxito!');
                formElement.reset();
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error al guardar:', error.message);
            alert('ERROR: No se pudo guardar la incidencia. Revisa la consola (F12).\n' + error.message);
            submitButton.disabled = false;
            submitButton.textContent = MODO_EDICION ? 'Actualizar Incidencia' : 'Registrar Incidencia';
        });

    });

});