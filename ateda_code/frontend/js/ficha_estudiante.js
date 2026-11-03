
const API_ALERTAS = 'http://localhost:3000/api/alertas';

// ==================================================
// OBTENER IDENTIFICADOR DESDE LA URL
// ==================================================

const parametros = new URLSearchParams(window.location.search);
const estudianteId = parametros.get('id');

// ==================================================
// OBTENER FICHA DEL ESTUDIANTE
// ==================================================

const obtenerFichaEstudiante = async () => {

    const mensajeFicha = document.getElementById('mensajeFicha');

    if (!estudianteId) {
        mensajeFicha.textContent = 'No se indicó un estudiante.';
        return;
    }

    try {

        const respuesta = await fetch(
            `${API_ALERTAS}/estudiantes/${encodeURIComponent(estudianteId)}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('./login.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No fue posible obtener la ficha del estudiante');
        }

        const resultado = await respuesta.json();

        mostrarFichaEstudiante(resultado.estudiante);

        mensajeFicha.textContent = 'Información cargada correctamente.';

    } catch (error) {

        console.error('Error al obtener ficha:', error);

        mensajeFicha.textContent =
            'No fue posible cargar la información del estudiante.';
    }
};


// ==================================================
// MOSTRAR INFORMACIÓN DEL ESTUDIANTE
// ==================================================

const mostrarFichaEstudiante = (estudiante) => {

    document.getElementById('estudianteId').textContent =
        estudiante.estudiante_id;

    document.getElementById('nombreEstudiante').textContent =
        `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`;

    document.getElementById('fechaNacimiento').textContent =
        estudiante.fecha_nacimiento
            ? estudiante.fecha_nacimiento.substring(0, 10).split('-').reverse().join('/')
            : 'Sin información';

    document.getElementById('cursoEstudiante').textContent =
        `${estudiante.curso ?? 'Sin curso'} ${estudiante.seccion ?? ''}`;

    document.getElementById('nivelAlerta').textContent =
        estudiante.nivel ?? 'Sin alerta activa';

    document.getElementById('estadoAlerta').textContent =
        estudiante.estado ?? 'Sin alerta activa';

    document.getElementById('motivoAlerta').textContent =
        estudiante.motivo ?? 'Sin motivo registrado';

    // ==================================================
    // CONTROLAR VISIBILIDAD DEL BOTÓN DE SEGUIMIENTO
    // ==================================================

    const botonIniciarSeguimiento =
        document.getElementById('botonIniciarSeguimiento');

    botonIniciarSeguimiento.hidden =
        estudiante.estado !== 'PENDIENTE' || !estudiante.alerta_id;

    if (!botonIniciarSeguimiento.hidden) {
        botonIniciarSeguimiento.dataset.alertaId = estudiante.alerta_id;
    } else {
        delete botonIniciarSeguimiento.dataset.alertaId;
    }

    
    // ==================================================
    // CONTROLAR VISIBILIDAD DEL FORMULARIO DE INTERVENCIÓN
    // ==================================================

    const seccionRegistrarIntervencion =
        document.getElementById('seccionRegistrarIntervencion');

    seccionRegistrarIntervencion.hidden =
        estudiante.estado !== 'EN SEGUIMIENTO' || !estudiante.alerta_id;

    if (!seccionRegistrarIntervencion.hidden) {
        seccionRegistrarIntervencion.dataset.alertaId = estudiante.alerta_id;
    } else {
        delete seccionRegistrarIntervencion.dataset.alertaId;
    }

    
// ==================================================
// CONTROLAR VISIBILIDAD DEL BOTÓN CERRAR CASO
// ==================================================

const botonCerrarCaso =
    document.getElementById('botonCerrarCaso');

botonCerrarCaso.hidden =
    estudiante.estado !== 'EN SEGUIMIENTO' || !estudiante.alerta_id;

if (!botonCerrarCaso.hidden) {
    botonCerrarCaso.dataset.alertaId = estudiante.alerta_id;
} else {
    delete botonCerrarCaso.dataset.alertaId;
}


};



// ==================================================
// OBTENER HISTORIAL DE SEGUIMIENTO
// ==================================================

const obtenerHistorialSeguimiento = async () => {

    const contenedor = document.getElementById('historialSeguimiento');

    if (!estudianteId) {
        return;
    }

    try {

        const respuesta = await fetch(
            `${API_ALERTAS}/estudiantes/${encodeURIComponent(estudianteId)}/seguimientos`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('./login.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No fue posible obtener el historial');
        }

        const resultado = await respuesta.json();

        mostrarHistorialSeguimiento(resultado.intervenciones);

    } catch (error) {

        console.error('Error al obtener historial:', error);

        contenedor.textContent =
            'No fue posible cargar el historial de seguimiento.';
    }
};

// ==================================================
// MOSTRAR HISTORIAL DE SEGUIMIENTO
// ==================================================

const mostrarHistorialSeguimiento = (seguimientos) => {

    const contenedor = document.getElementById('historialSeguimiento');

    contenedor.replaceChildren();

    if (!Array.isArray(seguimientos)) {
        contenedor.textContent = 'No fue posible interpretar el historial.';
        return;
    }

    if (seguimientos.length === 0) {
        contenedor.textContent =
            'Este estudiante todavía no tiene intervenciones registradas.';
        return;
    }

    seguimientos.forEach(seguimiento => {

        const tarjeta = document.createElement('article');
        tarjeta.classList.add('tarjeta-seguimiento');

        const campos = [
            ['Fecha', seguimiento.fecha
                ? seguimiento.fecha.substring(0, 10).split('-').reverse().join('/')
                : 'Sin fecha'],
            ['Profesional', seguimiento.profesional ?? 'No registrado'],
            ['Rol', seguimiento.responsable_rol ?? 'No registrado'],
            ['Acción', seguimiento.accion ?? 'Sin información'],
            ['Resultado', seguimiento.resultado ?? 'Sin información'],
            ['Estado del caso', seguimiento.estado_caso ?? 'Sin información']
        ];

        campos.forEach(([etiqueta, valor]) => {

            const fila = document.createElement('div');
            fila.classList.add('campo-seguimiento');

            const titulo = document.createElement('strong');
            titulo.textContent = `${etiqueta}: `;

            const contenido = document.createElement('span');
            contenido.textContent = valor;

            fila.appendChild(titulo);
            fila.appendChild(contenido);

            tarjeta.appendChild(fila);
        });

        contenedor.appendChild(tarjeta);
    });
};



// ==================================================
// INICIAR SEGUIMIENTO DE UNA ALERTA
// ==================================================

const iniciarSeguimiento = async () => {

    const boton = document.getElementById('botonIniciarSeguimiento');
    const mensaje = document.getElementById('mensajeAccionAlerta');

    const alertaId = boton.dataset.alertaId;

    if (!alertaId) {
        mensaje.textContent = 'No se encontró una alerta válida.';
        return;
    }

    const confirmar = window.confirm(
        '¿Deseas iniciar el seguimiento de este estudiante?'
    );

    if (!confirmar) {
        return;
    }

    boton.disabled = true;
    mensaje.textContent = 'Iniciando seguimiento...';

    try {

        const respuesta = await fetch(
            `${API_ALERTAS}/${encodeURIComponent(alertaId)}/iniciar-seguimiento`,
            {
                method: 'PATCH',
                credentials: 'include'
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('./login.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No fue posible iniciar el seguimiento');
        }

        mensaje.textContent = 'Seguimiento iniciado correctamente.';

        await obtenerFichaEstudiante();

    } catch (error) {

        console.error('Error al iniciar seguimiento:', error);

        mensaje.textContent = 'No fue posible iniciar el seguimiento.';
        boton.disabled = false;
    }
};


// ==================================================
// REGISTRAR INTERVENCIÓN DE SEGUIMIENTO
// ==================================================

const registrarIntervencion = async (evento) => {

    evento.preventDefault();

    const formulario = document.getElementById('formularioIntervencion');

    const seccion = document.getElementById('seccionRegistrarIntervencion');

    const boton = document.getElementById('botonRegistrarIntervencion');

    const mensaje = document.getElementById('mensajeIntervencion');

    const alertaId = seccion.dataset.alertaId;

    const accion = document.getElementById('accionIntervencion').value.trim();

    const resultado = document.getElementById('resultadoIntervencion').value.trim();

    if (!alertaId || !accion) {
        mensaje.textContent = 'Debe ingresar una acción válida.';
        return;
    }

    boton.disabled = true;
    mensaje.textContent = 'Registrando intervención...';

    try {

        const respuesta = await fetch(
            `${API_ALERTAS}/${encodeURIComponent(alertaId)}/intervenciones`,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accion,
                    resultado: resultado || null
                })
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('./login.html');
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'Error al registrar intervención');
        }

        formulario.reset();

        mensaje.textContent = 'Intervención registrada correctamente.';

        await obtenerHistorialSeguimiento();

    } catch (error) {

        console.error('Error al registrar intervención:', error);

        mensaje.textContent = error.message;

    } finally {

        boton.disabled = false;

    }

};


 // ==================================================
 // MOSTRAR FORMULARIO DE CIERRE DE CASO
 // ==================================================

const mostrarFormularioCierre = () => {

    const seccionCerrarCaso =
        document.getElementById('seccionCerrarCaso');

    const botonCerrarCaso =
        document.getElementById('botonCerrarCaso');

    const mensajeCierre =
        document.getElementById('mensajeCierre');

    seccionCerrarCaso.hidden = false;

    botonCerrarCaso.hidden = true;

    mensajeCierre.textContent = '';

};


// ==================================================
// CANCELAR CIERRE DE CASO
// ==================================================

const cancelarCierreCaso = () => {

    const seccionCerrarCaso =
        document.getElementById('seccionCerrarCaso');

    const botonCerrarCaso =
        document.getElementById('botonCerrarCaso');

    const formulario =
        document.getElementById('formularioCerrarCaso');

    seccionCerrarCaso.hidden = true;

    botonCerrarCaso.hidden = false;

    formulario.reset();

};



// ==================================================
// CONFIRMAR CIERRE DE CASO
// ==================================================

const confirmarCierreCaso = async (evento) => {

    evento.preventDefault();

    const formulario =
        document.getElementById('formularioCerrarCaso');

    const boton =
        document.getElementById('botonConfirmarCierre');

    const botonCerrarCaso =
        document.getElementById('botonCerrarCaso');

    const seccionCerrarCaso =
        document.getElementById('seccionCerrarCaso');

    const mensaje =
        document.getElementById('mensajeCierre');

    const alertaId = botonCerrarCaso.dataset.alertaId;

    const motivoCierre =
        document.getElementById('motivoCierre').value;

    const observacionCierre =
        document.getElementById('observacionCierre').value.trim();

    // ==================================================
    // VALIDAR DATOS
    // ==================================================

    if (!alertaId || !motivoCierre || !observacionCierre) {
        mensaje.textContent = 'Debe completar todos los campos.';
        return;
    }

    const confirmar = window.confirm(
        '¿Está seguro de que desea cerrar este caso?'
    );

    if (!confirmar) {
        return;
    }

    boton.disabled = true;
    mensaje.textContent = 'Cerrando caso...';

    try {

        // ==================================================
        // ENVIAR SOLICITUD AL BACKEND
        // ==================================================

        const respuesta = await fetch(
            `${API_ALERTAS}/${encodeURIComponent(alertaId)}/cerrar-caso`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    motivoCierre,
                    observacionCierre
                })
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('./login.html');
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'Error al cerrar el caso');
        }

        // ==================================================
        // ACTUALIZAR INTERFAZ
        // ==================================================

        formulario.reset();

        seccionCerrarCaso.hidden = true;

        document.getElementById('mensajeAccionAlerta')
            .textContent = 'Caso cerrado correctamente.';

        await obtenerFichaEstudiante();

        await obtenerHistorialSeguimiento();

    } catch (error) {

        console.error('Error al cerrar caso:', error);

        mensaje.textContent = error.message;

    } finally {

        boton.disabled = false;

    }

};


// ==================================================
// EVENTOS
// ==================================================

document.getElementById('botonIniciarSeguimiento')
    .addEventListener('click', iniciarSeguimiento);


document.getElementById('formularioIntervencion')
    .addEventListener('submit', registrarIntervencion);

document.getElementById('botonCerrarCaso')
    .addEventListener('click', mostrarFormularioCierre);

document.getElementById('botonCancelarCierre')
    .addEventListener('click', cancelarCierreCaso);

document.getElementById('formularioCerrarCaso')
    .addEventListener('submit', confirmarCierreCaso);
// ==================================================
// INICIAR CARGA
// ==================================================

obtenerFichaEstudiante();
obtenerHistorialSeguimiento();