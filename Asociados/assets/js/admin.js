// ================= INIT =================
async function initAdmin(){
    verificarSesion?.();

    await cargarDashboard();
    await cargarFinanzas();
    await cargarCorte();
    await cargarGuias();
}

// ================= SUPABASE =================
const supabase = window.supabaseClient;

// ================= DASHBOARD =================
async function cargarDashboard(){

    const { data } = await supabase.from("guias").select("*");

    let totalIngresos = 0;
    let totalPendiente = 0;

    data.forEach(g=>{
        totalIngresos += Number(g.pagado || 0);
        totalPendiente += Number(g.restante || 0);
    });

    document.getElementById("totalGuias").innerText = data.length;
    document.getElementById("ingresos").innerText = "$" + totalIngresos.toFixed(2);
    document.getElementById("pendiente").innerText = "$" + totalPendiente.toFixed(2);
}

// ================= FINANZAS =================
async function cargarFinanzas(){

    const { data } = await supabase.from("guias").select("*");

    let cont = document.getElementById("listaFinanzas");
    cont.innerHTML = "";

    data.forEach((g)=>{

        cont.innerHTML += `
        <div class="card-finanza">
            <b>${g.guia}</b><br>
            ${g.d_nombre || ""}<br>

            Total: $${g.total || 0}<br>
            Pagado: $${g.pagado || 0}<br>

            ${
                g.estado === "Pagado"
                ? `<span style="color:green">✔ Pagado</span>`
                : `<button onclick="marcarPagado('${g.id}')">Pagar</button>`
            }
        </div>`;
    });
}

// ================= PAGAR =================
async function marcarPagado(id){

    await supabase
    .from("guias")
    .update({
        pagado: supabase.raw("total"),
        restante: 0,
        estado: "Pagado"
    })
    .eq("id", id);

    initAdmin();
}

// ================= CORTE =================
async function cargarCorte(){

    const { data } = await supabase.from("guias").select("*");

    let hoy = new Date().toLocaleDateString();

    let total=0,pagado=0,pendiente=0;

    data.forEach(g=>{
        if(g.fecha === hoy){
            total += Number(g.total || 0);
            pagado += Number(g.pagado || 0);
            pendiente += Number(g.restante || 0);
        }
    });

    document.getElementById("totalHoy").innerText="$"+total;
    document.getElementById("pagadoHoy").innerText="$"+pagado;
    document.getElementById("pendienteHoy").innerText="$"+pendiente;
}

// ================= GUIAS =================
async function cargarGuias(){

    const { data } = await supabase.from("guias").select("*");

    let cont = document.getElementById("listaGuias");
    cont.innerHTML = "";

    if(data.length === 0){
        cont.innerHTML = "<p>No hay guías</p>";
        return;
    }

    data.forEach((g)=>{

        cont.innerHTML += `
        <div class="card-finanza">
            <b>${g.guia}</b><br>
            👤 ${g.d_nombre || ""}<br>
            📍 ${g.d_municipio || ""}<br>

            Estado: <b>${g.estadoEnvio || "Pendiente"}</b>

            <div class="acciones">
                <button onclick="cambiarEstado('${g.id}','${g.estadoEnvio}')">📦</button>
                <button onclick="editarGuiaPro('${g.id}')">✏</button>
                <button onclick="reimprimirGuia('${g.id}')">🖨</button>
                <button onclick="eliminarGuia('${g.id}')">🗑</button>
            </div>
        </div>`;
    });
}

// ================= BUSCAR =================
async function buscarGuias(){

    let texto = document.getElementById("buscador").value.toLowerCase();

    const { data } = await supabase.from("guias").select("*");

    let cont = document.getElementById("listaGuias");
    cont.innerHTML = "";

    data
    .filter(g =>
        (g.guia || "").toLowerCase().includes(texto) ||
        (g.d_nombre || "").toLowerCase().includes(texto)
    )
    .forEach(g=>{
        cont.innerHTML += `
        <div class="card-finanza">
            <b>${g.guia}</b><br>
            ${g.d_nombre || ""}

            <div class="acciones">
                <button onclick="reimprimirGuia('${g.id}')">🖨</button>
            </div>
        </div>`;
    });
}

// ================= ELIMINAR =================
async function eliminarGuia(id){

    if(confirm("¿Eliminar guía?")){
        await supabase.from("guias").delete().eq("id", id);
        initAdmin();
    }
}

// ================= ESTADO =================
async function cambiarEstado(id, actual){

    let estados=["Pendiente","En tránsito","Entregado"];
    let index = estados.indexOf(actual || "Pendiente");

    let nuevo = estados[(index+1)%3];

    await supabase
    .from("guias")
    .update({ estadoEnvio: nuevo })
    .eq("id", id);

    cargarGuias();
}

// ================= EDITAR =================
let guiaEditando=null;

async function editarGuiaPro(id){

    const { data } = await supabase
    .from("guias")
    .select("*")
    .eq("id", id)
    .single();

    guiaEditando = id;

    document.getElementById("edit_nombre").value = data.d_nombre || "";
    document.getElementById("edit_tel").value = data.d_tel || "";
    document.getElementById("edit_destino").value = data.d_municipio || "";
    document.getElementById("edit_total").value = data.total || 0;

    document.getElementById("modalEditar").style.display="flex";
}

async function guardarEdicion(){

    await supabase
    .from("guias")
    .update({
        d_nombre: document.getElementById("edit_nombre").value,
        d_tel: document.getElementById("edit_tel").value,
        d_municipio: document.getElementById("edit_destino").value,
        total: parseFloat(document.getElementById("edit_total").value)
    })
    .eq("id", guiaEditando);

    cerrarModal();
    cargarGuias();
}

// ================= MODAL =================
function cerrarModal(){
    document.getElementById("modalEditar").style.display="none";
}