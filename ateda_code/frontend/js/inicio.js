
const API_AUTH = 'http://localhost:3000/api/auth';

const mensajeUsuario = document.getElementById('mensajeUsuario');
const mensajeError = document.getElementById('mensajeError');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// ==================================================
// VERIFICAR SI EXISTE UNA SESIÓN ACTIVA
// ==================================================

const verificarSesion = async () => {
    try {
        const respuesta = await fetch(`${API_AUTH}/sesion`, {
            credentials: 'include'
        });

        if (!respuesta.ok) {
            window.location.replace('./login.html');
            return;
        }

        const resultado = await respuesta.json();

        mensajeUsuario.textContent =
            `Bienvenido, ${resultado.usuario.nombres}. Rol: ${resultado.usuario.rol}`;

        btnCerrarSesion.disabled = false;

    } catch (error) {
        console.error('Error al verificar sesión:', error);
        mensajeUsuario.textContent = 'No se pudo verificar la sesión.';
        mensajeError.textContent = 'Comprueba que el servidor esté funcionando.';
    }
};

// ==================================================
// OBTENER RESUMEN DE ALERTAS ACTIVAS
// ==================================================

const obtenerResumenAlertas = async () => {

    const mensajeAlertas = document.getElementById('mensajeAlertas');

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/alertas/resumen',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!respuesta.ok) {
            throw new Error('No fue posible obtener el resumen de alertas');
        }

        const resultado = await respuesta.json();

        document.getElementById('contadorAzul').textContent =
            resultado.resumen.AZUL;

        document.getElementById('contadorAmarillo').textContent =
            resultado.resumen.AMARILLO;

        document.getElementById('contadorNaranja').textContent =
            resultado.resumen.NARANJA;

        document.getElementById('contadorRojo').textContent =
            resultado.resumen.ROJO;

        mensajeAlertas.textContent =
            'Resumen de alertas actualizado correctamente';

    } catch (error) {

        console.error('Error al obtener resumen de alertas:', error);

        mensajeAlertas.textContent =
            'No fue posible cargar el resumen de alertas';
    }
};

// ==================================================
// HU-003: CERRAR SESIÓN
// ==================================================

const cerrarSesion = async () => {

    btnCerrarSesion.disabled = true;
    mensajeError.textContent = '';

    try {
        const respuesta = await fetch(`${API_AUTH}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!respuesta.ok) {
            throw new Error('No fue posible cerrar la sesión');
        }

        window.location.replace('./login.html');

    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mensajeError.textContent = error.message;
        btnCerrarSesion.disabled = false;
    }
};

// ==================================================
// EVENTOS E INICIALIZACIÓN
// ==================================================

btnCerrarSesion.addEventListener('click', cerrarSesion);

verificarSesion();
obtenerResumenAlertas();
