
const API_USUARIOS = 'http://localhost:3000/api/usuarios';
const API_SESION = 'http://localhost:3000/api/auth/sesion';

const tablaUsuarios = document.getElementById('tablaUsuarios');
const mensajeLista = document.getElementById('mensajeLista');
const mensajeFormulario = document.getElementById('mensajeFormulario');

const formUsuario = document.getElementById('formUsuario');
const tituloFormulario = document.getElementById('tituloFormulario');

const idUsuario = document.getElementById('idUsuario');
const nombres = document.getElementById('nombres');
const apellidos = document.getElementById('apellidos');
const correo = document.getElementById('correo');
const idRol = document.getElementById('idRol');
const password = document.getElementById('password');

const grupoPassword = document.getElementById('grupoPassword');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');


// Realizar solicitudes a la API
const solicitarAPI = async (ruta, opciones = {}) => {
    const respuesta = await fetch(`${API_USUARIOS}${ruta}`, {
        ...opciones,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...opciones.headers
        }
    });

    const resultado = await respuesta.json();

    if (respuesta.status === 401) {
        window.location.replace('./login.html');
        throw new Error('La sesión ha finalizado');
    }

    if (!respuesta.ok) {
        throw new Error(
            resultado.mensaje || 'Error al realizar la operación'
        );
    }

    return resultado;
};


// Mostrar mensajes
const mostrarMensaje = (elemento, texto, esError = false) => {
    elemento.textContent = texto;
    elemento.className = esError ? 'error' : 'exito';
};


// Verificar acceso de administrador
const verificarAdministrador = async () => {
    try {
        const respuesta = await fetch(API_SESION, {
            credentials: 'include'
        });

        if (!respuesta.ok) {
            window.location.replace('./login.html');
            return false;
        }

        const resultado = await respuesta.json();

        if (resultado.usuario.rol !== 'Administrador') {
            window.location.replace('./inicio.html');
            return false;
        }

        return true;

    } catch (error) {
        mostrarMensaje(
            mensajeLista,
            'No se pudo verificar la sesión',
            true
        );

        return false;
    }
};


// Obtener los roles registrados
const cargarRoles = async () => {
    const resultado = await solicitarAPI('/roles');

    idRol.replaceChildren();

    const opcionInicial = document.createElement('option');
    opcionInicial.value = '';
    opcionInicial.textContent = 'Seleccionar rol';
    idRol.appendChild(opcionInicial);

    resultado.roles.forEach((rol) => {
        const opcion = document.createElement('option');

        opcion.value = rol.id_rol;
        opcion.textContent = rol.nombre;

        idRol.appendChild(opcion);
    });
};


// Crear un botón de acción
const crearBoton = (texto, clase, accion) => {
    const boton = document.createElement('button');

    boton.type = 'button';
    boton.textContent = texto;
    boton.className = clase;

    boton.addEventListener('click', accion);

    return boton;
};


// Mostrar usuarios en la tabla
const cargarUsuarios = async () => {
    try {
        mensajeLista.textContent = 'Cargando usuarios...';
        tablaUsuarios.replaceChildren();

        const resultado = await solicitarAPI('/');

        resultado.usuarios.forEach((usuario) => {
            const fila = document.createElement('tr');

            const valores = [
                usuario.id_usuario,
                `${usuario.nombres} ${usuario.apellidos}`,
                usuario.correo,
                usuario.rol,
                usuario.activo ? 'Activo' : 'Inactivo'
            ];

            valores.forEach((valor) => {
                const celda = document.createElement('td');
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            const celdaAcciones = document.createElement('td');
            const contenedor = document.createElement('div');

            contenedor.className = 'acciones-tabla';

            const btnEditar = crearBoton(
                'Editar',
                'secundario',
                () => editarUsuario(usuario.id_usuario)
            );

            const btnEstado = crearBoton(
                usuario.activo ? 'Desactivar' : 'Activar',
                usuario.activo ? 'peligro' : 'secundario',
                () => cambiarEstado(usuario)
            );

            contenedor.append(btnEditar, btnEstado);
            celdaAcciones.appendChild(contenedor);
            fila.appendChild(celdaAcciones);

            tablaUsuarios.appendChild(fila);
        });

        mensajeLista.textContent =
            `${resultado.usuarios.length} usuario(s) registrado(s).`;

    } catch (error) {
        mostrarMensaje(mensajeLista, error.message, true);
    }
};


// Restablecer formulario para registrar usuarios
const limpiarFormulario = () => {
    formUsuario.reset();

    idUsuario.value = '';
    tituloFormulario.textContent = 'Registrar usuario';
    btnGuardar.textContent = 'Registrar usuario';

    grupoPassword.hidden = false;
    password.required = true;

    btnCancelar.hidden = true;
    mensajeFormulario.textContent = '';
};


// Cargar los datos de un usuario para editar
const editarUsuario = async (id) => {
    try {
        const resultado = await solicitarAPI(`/${id}`);
        const usuario = resultado.usuario;

        idUsuario.value = usuario.id_usuario;
        nombres.value = usuario.nombres;
        apellidos.value = usuario.apellidos;
        correo.value = usuario.correo;
        idRol.value = usuario.id_rol;

        tituloFormulario.textContent = 'Modificar usuario';
        btnGuardar.textContent = 'Guardar cambios';

        // La API de modificación no cambia contraseñas.
        grupoPassword.hidden = true;
        password.required = false;
        password.value = '';

        btnCancelar.hidden = false;
        mensajeFormulario.textContent = '';

        formUsuario.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

    } catch (error) {
        mostrarMensaje(mensajeFormulario, error.message, true);
    }
};


// Registrar o modificar usuario
const guardarUsuario = async (event) => {
    event.preventDefault();

    const datos = {
        nombres: nombres.value.trim(),
        apellidos: apellidos.value.trim(),
        correo: correo.value.trim(),
        id_rol: Number(idRol.value)
    };

    const editando = idUsuario.value !== '';

    if (!editando) {
        datos.password = password.value;
    }

    const ruta = editando ? `/${idUsuario.value}` : '/';
    const metodo = editando ? 'PUT' : 'POST';

    btnGuardar.disabled = true;

    try {
        const resultado = await solicitarAPI(ruta, {
            method: metodo,
            body: JSON.stringify(datos)
        });

        limpiarFormulario();

        mostrarMensaje(
            mensajeFormulario,
            resultado.mensaje
        );

        await cargarUsuarios();

    } catch (error) {
        mostrarMensaje(
            mensajeFormulario,
            error.message,
            true
        );

    } finally {
        btnGuardar.disabled = false;
    }
};


// Activar o desactivar un usuario
const cambiarEstado = async (usuario) => {
    const nuevoEstado = !usuario.activo;

    const accion = nuevoEstado ? 'activar' : 'desactivar';

    const confirmado = confirm(
        `¿Deseas ${accion} a ${usuario.nombres} ${usuario.apellidos}?`
    );

    if (!confirmado) {
        return;
    }

    try {
        const resultado = await solicitarAPI(
            `/${usuario.id_usuario}/estado`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    activo: nuevoEstado
                })
            }
        );

        mostrarMensaje(mensajeLista, resultado.mensaje);
        await cargarUsuarios();

    } catch (error) {
        mostrarMensaje(mensajeLista, error.message, true);
    }
};


// Inicializar pantalla
const iniciarGestionUsuarios = async () => {
    const autorizado = await verificarAdministrador();

    if (!autorizado) {
        return;
    }

    try {
        await cargarRoles();
        await cargarUsuarios();

    } catch (error) {
        mostrarMensaje(mensajeLista, error.message, true);
    }
};


// Eventos
formUsuario.addEventListener('submit', guardarUsuario);
btnCancelar.addEventListener('click', limpiarFormulario);


// Ejecutar
iniciarGestionUsuarios();
