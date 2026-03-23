function cargar(seccion) {
    const titulo = document.getElementById("titulo");
    const contenido = document.getElementById("contenido");

    switch (seccion) {
        case "inicio":
            titulo.innerText = "Inicio";
            contenido.innerHTML = "Panel principal del sistema";
            break;

        case "usuarios":
            titulo.innerText = "Usuarios";
            contenido.innerHTML = "Gestión de usuarios próximamente...";
            break;

        case "reportes":
            titulo.innerText = "Reportes";
            contenido.innerHTML = "Reportes del sistema...";
            break;

        case "rutas":
            titulo.innerText = "Rutas";
            contenido.innerHTML = "Rutas asignadas...";
            break;

        case "entregas":
            titulo.innerText = "Entregas";
            contenido.innerHTML = "Control de entregas...";
            break;
    }
}
function cargar(seccion) {
    const titulo = document.getElementById("titulo");
    const contenido = document.getElementById("contenido");

    switch (seccion) {
        case "inicio":
            titulo.innerText = "Inicio";
            contenido.innerHTML = `
                <div class="card">
                    <h3>Bienvenido</h3>
                    <p>Panel de control del sistema.</p>
                </div>
            `;
            break;

        case "usuarios":
            titulo.innerText = "Usuarios";
            contenido.innerHTML = `
                <div class="card">
                    <h3>Gestión de usuarios</h3>
                    <p>Aquí podrás administrar usuarios.</p>
                </div>
            `;
            break;

        case "reportes":
            titulo.innerText = "Reportes";
            contenido.innerHTML = `
                <div class="card">
                    <h3>Reportes</h3>
                    <p>Visualización de datos.</p>
                </div>
            `;
            break;

        case "rutas":
            titulo.innerText = "Rutas";
            contenido.innerHTML = `
                <div class="card">
                    <h3>Rutas asignadas</h3>
                    <p>Listado de rutas.</p>
                </div>
            `;
            break;

        case "entregas":
            titulo.innerText = "Entregas";
            contenido.innerHTML = `
                <div class="card">
                    <h3>Control de entregas</h3>
                    <p>Seguimiento de entregas.</p>
                </div>
            `;
            break;
    }
}