function verificarSesion(rol){
    const sesion = JSON.parse(localStorage.getItem("sesion"));

    if(!sesion){
        window.location.href = "../index.html";
        return;
    }

    if(rol && sesion.rol !== rol){
        alert("Acceso no autorizado");
        window.location.href = "../index.html";
    }
}

function cerrarSesion(){
    localStorage.removeItem("sesion");
    window.location.href = "../index.html";
}