
// ==================================================
// ATEDA - LISTADO DE ESTUDIANTES CON ALERTAS
// ==================================================

const API_ALERTAS = 'http://localhost:3000/api/alertas';

const mensajeEstudiantes = document.getElementById('mensajeEstudiantes');
const cuerpoTablaEstudiantes = document.getElementById('cuerpoTablaEstudiantes');

// ==================================================
// OBTENER ESTUDIANTES DESDE LA API
// ==================================================

const obtenerEstudiantes = async () => {

    try {

        const respuesta = await fetch(
            `${API_ALERTAS}/estudiantes`,
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
            throw new Error('No fue posible obtener los estudiantes');
        }

        const resultado = await respuesta.json();

        mostrarEstudiantes(resultado.estudiantes);

        mensajeEstudiantes.textContent =
            `Total de estudiantes con alertas: ${resultado.total}`;

    } catch (error) {

        console.error('Error al obtener estudiantes:', error);

        mensajeEstudiantes.textContent =
            'No fue posible cargar el listado de estudiantes';
    }
};

// ==================================================
// MOSTRAR ESTUDIANTES EN LA TABLA
// ==================================================

const mostrarEstudiantes = (estudiantes) => {

    cuerpoTablaEstudiantes.replaceChildren();

    estudiantes.forEach(estudiante => {

        const fila = document.createElement('tr');

        const datos = [
            estudiante.estudiante_id,
            `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`,
            `${estudiante.curso ?? 'Sin curso'} ${estudiante.seccion ?? ''}`,
            estudiante.nivel,
            estudiante.estado,
            estudiante.motivo
        ];

datos.forEach((dato, indice) => {

    const celda = document.createElement('td');

    if (indice === 1) {

        const enlace = document.createElement('a');

        enlace.href = `./ficha_estudiante.html?id=${encodeURIComponent(estudiante.estudiante_id)}`;

        enlace.textContent = dato;

        enlace.classList.add('enlace-estudiante');

        celda.appendChild(enlace);

    } else {

        celda.textContent = dato;

    }

    // Columna Nivel (índice 3)
    if (indice === 3) {
        celda.classList.add('nivel-alerta');
        celda.classList.add(`nivel-${estudiante.nivel.toLowerCase()}`);
    }

    // Columna Estado (índice 4)
    if (indice === 4) {
        celda.classList.add('estado-alerta');

        if (estudiante.estado === 'PENDIENTE') {
            celda.classList.add('estado-pendiente');
        }

        if (estudiante.estado === 'EN SEGUIMIENTO') {
            celda.classList.add('estado-seguimiento');
        }
    }

    fila.appendChild(celda);
});

        cuerpoTablaEstudiantes.appendChild(fila);
    });
};

// ==================================================
// INICIALIZACIÓN
// ==================================================

obtenerEstudiantes();
