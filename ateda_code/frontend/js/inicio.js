
const API_AUTH = 'http://localhost:3000/api/auth';

const mensajeUsuario = document.getElementById('mensajeUsuario');
const mensajeError = document.getElementById('mensajeError');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Verificar si existe una sesión activa
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

// HU-003: Cerrar sesión
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

btnCerrarSesion.addEventListener('click', cerrarSesion);

verificarSesion();
