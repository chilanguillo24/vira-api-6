const usuarios = {
    admin: {
        password: "1234",
        rol: "admin",
        ruta: "dashboard/admin.html"
    },
    guias: {
        password: "1234",
        rol: "guias",
        ruta: "dashboard/guias.html"
    }
};

function login() {
    const user = document.getElementById("usuario").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("error");

    error.innerText = "";

    if (usuarios[user] && usuarios[user].password === pass) {

        // Guardar sesión
        localStorage.setItem("sesion", JSON.stringify({
            usuario: user,
            rol: usuarios[user].rol
        }));

        // Mostrar loader
        mostrarLoader();

        // Simular carga tipo sistema real
        setTimeout(() => {
            window.location.href = usuarios[user].ruta;
        }, 1200);

    } else {
        error.innerText = "Credenciales incorrectas";
    }
}

/* LOADER */
function mostrarLoader() {
    const loader = document.createElement("div");
    loader.classList.add("loader");

    loader.innerHTML = "<div class='spinner'></div>";

    document.body.appendChild(loader);
}