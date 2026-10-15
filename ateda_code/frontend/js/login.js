const formularioLogin = document.getElementById('form-login');

formularioLogin.addEventListener('submit', async (event) =>{
    event.preventDefault();

    // Obtenemos los datos ingresados en el formulario
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    // Agrupar los datos de un objeto

    const credenciales = {
        correo: correo,
        password: password
    };

    try{

        //Enviar las credenciales al servidor Express
        const respuesta = await fetch('http://localhost:3000/api/auth/login',{
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credenciales)
        });

        // Convertir la respuesta JSON en un objeto JavaScript
        const resultado = await respuesta.json();

        if(!respuesta.ok){
            alert(resultado.mensaje);
            return;
        }
        console.log('Sesión iniciada:', resultado.usuario);

        window.location.href = './inicio.html';

    }catch(error){
        console.error('Error al conectar con el servidor: ', error);
        alert('No fue posible conectar con el servidor');
    }
});