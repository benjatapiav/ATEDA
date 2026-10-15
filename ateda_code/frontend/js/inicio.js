console.log('PRUEBA: inicio.js se está ejecutando');

const verificarSesion = async () => {

    try{
        const respuesta = await fetch(
            'http://localhost:3000/api/auth/sesion',
            {
                credentials: 'include'
            }
        );
        if(!respuesta.ok){
            window.location.replace('./login.html');
            return;
        }

        const resultado = await respuesta.json();

        document.getElementById('mensajeUsuario').textContent = 
            `Bienvenido, ${resultado.usuario.nombres}. Rol:${resultado.usuario.rol}`
    }catch(error){
        console.error('Error al verificar sesión:', error);
        window.location.replace('/login.html');
    }
};
verificarSesion();