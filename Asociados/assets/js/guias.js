// ================= SESIÓN =================
const sesion = JSON.parse(localStorage.getItem("sesion"));

if (!sesion || sesion.rol !== "guias") {
    window.location.href = "../index.html";
}

function cerrarSesion() {
    localStorage.removeItem("sesion");
    window.location.href = "../index.html";
}

// ================= CONTADOR DESDE DB =================
let contador = 1;

async function obtenerContador(){
    const { count } = await supabaseClient
        .from("guias")
        .select("*", { count: "exact", head: true });

    contador = (count || 0) + 1;
}

// ================= UTIL =================
function getVal(id) {
    let el = document.getElementById(id);
    return el ? el.value || "" : "";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
    mostrarModulo();
    await obtenerContador();

    setTimeout(() => {
        generarNumeroGuia();
        inicializarEventos();
    }, 100);
});

// ================= UI =================
function mostrarModulo() {
    document.getElementById("moduloGuias").innerHTML = document.getElementById("moduloGuias").innerHTML;
}

// ================= GUÍA =================
function generarNumeroGuia() {
    let ciudad = getVal("d_municipio") || "XXX";
    let prefijo = ciudad.substring(0,3).toUpperCase();

    let guia = prefijo + "-VRP" + String(contador).padStart(8,"0");

    let el = document.getElementById("numeroGuia");
    if (el) el.value = guia;

    return guia;
}

// ================= VOLUMÉTRICO =================
function calcularPesoVolumetrico() {
    let l = parseFloat(getVal("largo")) || 0;
    let a = parseFloat(getVal("ancho")) || 0;
    let h = parseFloat(getVal("alto")) || 0;
    return (l * a * h) / 5000;
}

// ================= TARIFA =================
function calcularTarifa(peso) {

    let volumetrico = calcularPesoVolumetrico();
    let pesoFinal = Math.max(peso, volumetrico);

    let tarifa = 0, excedente = 0;

    if(pesoFinal<=1) tarifa=0;
    else if(pesoFinal<=5) tarifa=1;
    else if(pesoFinal<=10) tarifa=2;
    else if(pesoFinal<=20) tarifa=3;
    else if(pesoFinal<=30) tarifa=4;
    else if(pesoFinal<=40) tarifa=5;
    else if(pesoFinal<=50) tarifa=6;
    else if(pesoFinal<=60) tarifa=7;
    else {
        tarifa=7;
        excedente=pesoFinal-60;
    }

    document.getElementById("tarifa").innerText = tarifa;
    document.getElementById("excedente").innerText = excedente.toFixed(2) + " kg";
    document.getElementById("volumetrico").innerText = volumetrico.toFixed(2);

    return {tarifa, pesoFinal};
}

// ================= PAGO =================
function calcularPago() {

    let total = parseFloat(getVal("total")) || 0;
    let pagado = parseFloat(getVal("pagado")) || 0;

    let restante = total - pagado;
    let estado = "Pendiente";

    if(restante <= 0 && total > 0){
        estado = "Pagado";
        restante = 0;
    }

    document.getElementById("restante").innerText = "$" + restante.toFixed(2);
    document.getElementById("estadoPago").innerText = estado;

    return {total, pagado, restante, estado};
}

// ================= EVENTOS =================
function inicializarEventos() {

    ["peso","largo","ancho","alto"].forEach(id => {
        let input = document.getElementById(id);
        if(input){
            input.addEventListener("input", () => {
                let peso = parseFloat(getVal("peso")) || 0;
                calcularTarifa(peso);
            });
        }
    });

    ["total","pagado"].forEach(id => {
        let input = document.getElementById(id);
        if(input){
            input.addEventListener("input", calcularPago);
        }
    });
}

// ================= GUARDAR EN SUPABASE =================
async function guardarDatos(data) {

    const { error } = await supabaseClient
        .from("guias")
        .insert([data]);

    if(error){
        console.error(error);
        alert("Error guardando en Supabase");
    }
}

// ================= BARRAS =================
function generarCodigoBarras(guia) {
    let canvas = document.createElement("canvas");

    JsBarcode(canvas, guia, {
        format:"CODE128",
        width:2,
        height:45,
        displayValue:false
    });

    return canvas.toDataURL("image/png");
}

// ================= PDF =================
async function generarPDF(){

    try{

        let guia = generarNumeroGuia();
        let paquetes = parseInt(getVal("paquetes")) || 1;
        let pesoVal = parseFloat(getVal("peso")) || 0;

        let {tarifa, pesoFinal} = calcularTarifa(pesoVal);
        let pago = calcularPago();

        const {jsPDF}=window.jspdf;

        let pdf=new jsPDF({
            orientation:"portrait",
            unit:"mm",
            format:[100,150]
        });

        let codigo=generarCodigoBarras(guia);

        // ===== QR =====
        let qrImg="";
        try{
            let qrCanvas=document.createElement("canvas");
            await QRCode.toCanvas(qrCanvas,guia);
            qrImg=qrCanvas.toDataURL("image/png");
        }catch(e){}

        let servicio = pesoFinal > 10 ? "EXPRESS" : "ECONÓMICO";
        let origen = getVal("r_municipio") || "ORIGEN";
        let destino = getVal("d_municipio") || "DESTINO";

        // ================= ETIQUETAS =================
        for(let i=1;i<=paquetes;i++){

            if(i>1) pdf.addPage([100,150]);

            // HEADER
            pdf.setFillColor(0,140,80);
            pdf.rect(0,0,100,12,"F");

            pdf.setTextColor(255,255,255);
            pdf.setFontSize(10);
            pdf.text("VIRA LOGISTICS",5,8);

            pdf.setTextColor(0,0,0);

            // GUÍA
            pdf.setFontSize(13);
            pdf.text(guia,5,20);

            pdf.setFontSize(8);
            pdf.text(i+"/"+paquetes,80,20);

            pdf.text(servicio,5,26);
            pdf.text(origen+" → "+destino,5,30);

            // DESTINATARIO
            pdf.rect(5,32,90,32);
            pdf.setFontSize(9);
            pdf.text("DESTINATARIO",7,37);

            pdf.setFontSize(8);
            pdf.text("Nombre: " + getVal("d_nombre"),7,42);
            pdf.text("Tel: " + getVal("d_tel"),7,46);
            pdf.text(getVal("d_calle") + ", " + getVal("d_colonia"),7,50);
            pdf.text(getVal("d_municipio"),7,54);

            // REMITENTE
            pdf.rect(5,66,90,32);
            pdf.setFontSize(9);
            pdf.text("REMITENTE",7,71);

            pdf.setFontSize(8);
            pdf.text("Nombre: " + getVal("r_nombre"),7,76);
            pdf.text("Tel: " + getVal("r_tel"),7,80);
            pdf.text(getVal("r_calle") + ", " + getVal("r_colonia"),7,84);
            pdf.text(getVal("r_municipio"),7,88);

            // INFO ENVÍO
            pdf.setFillColor(230,230,230);
            pdf.rect(5,100,90,10,"F");

            pdf.setFontSize(8);
            pdf.text("Peso: "+pesoFinal+" kg",7,106);
            pdf.text("Tarifa: "+tarifa,60,106);

            // BARRAS
            pdf.rect(5,112,90,28);
            pdf.addImage(codigo,"PNG",10,115,55,18);

            if(qrImg){
                pdf.addImage(qrImg,"PNG",70,115,20,20);
            }
        }

        // ================= CARTAPORTE =================
        pdf.addPage([100,150]);

        // HEADER
        pdf.setFillColor(0,140,80);
        pdf.rect(0,0,100,12,"F");

        pdf.setTextColor(255,255,255);
        pdf.setFontSize(10);
        pdf.text("CARTAPORTE - VIRA LOGISTICS",5,8);

        pdf.setTextColor(0,0,0);

        // GUÍA
        pdf.setFontSize(12);
        pdf.text("Guía: " + guia, 5, 18);

        // REMITENTE
        pdf.rect(5,22,90,28);
        pdf.setFontSize(9);
        pdf.text("REMITENTE",7,27);

        pdf.setFontSize(8);
        pdf.text("Nombre: " + getVal("r_nombre"), 7, 32);
        pdf.text("Tel: " + getVal("r_tel"), 7, 36);
        pdf.text("Dirección: " + getVal("r_calle") + ", " + getVal("r_colonia"), 7, 40);
        pdf.text("Municipio: " + getVal("r_municipio"), 7, 44);

        // DESTINATARIO
        pdf.rect(5,52,90,28);
        pdf.setFontSize(9);
        pdf.text("DESTINATARIO",7,57);

        pdf.setFontSize(8);
        pdf.text("Nombre: " + getVal("d_nombre"), 7, 62);
        pdf.text("Tel: " + getVal("d_tel"), 7, 66);
        pdf.text("Dirección: " + getVal("d_calle") + ", " + getVal("d_colonia"), 7, 70);
        pdf.text("Municipio: " + getVal("d_municipio"), 7, 74);

        // ENVÍO
        pdf.rect(5,82,90,22);
        pdf.setFontSize(9);
        pdf.text("ENVÍO",7,87);

        pdf.setFontSize(8);
        pdf.text("Peso final: " + pesoFinal + " kg", 7, 92);
        pdf.text("Paquetes: " + paquetes, 7, 96);
        pdf.text("Tarifa: " + tarifa, 50, 96);
        pdf.text("Servicio: " + servicio, 50, 92);

        // PAGO
        pdf.rect(5,106,90,18);
        pdf.setFontSize(9);
        pdf.text("PAGO",7,111);

        pdf.setFontSize(8);
        pdf.text("Total: $" + pago.total, 7, 116);
        pdf.text("Pagado: $" + pago.pagado, 50, 116);
        pdf.text("Restante: $" + pago.restante, 7, 120);
        pdf.text("Estado: " + pago.estado, 50, 120);

        // FIRMA
        pdf.rect(5,126,90,18);
        pdf.setFontSize(9);
        pdf.text("FIRMA DEL REMITENTE", 7, 131);

        pdf.line(20,142,80,142);
        pdf.setFontSize(7);
        pdf.text(getVal("r_nombre"), 30, 146);

        pdf.save("guia_"+guia+".pdf");

        // ===== GUARDAR EN SUPABASE =====
        await guardarDatos({
            guia,

            r_nombre:getVal("r_nombre"),
            r_tel:getVal("r_tel"),
            r_calle:getVal("r_calle"),
            r_colonia:getVal("r_colonia"),
            r_municipio:getVal("r_municipio"),

            d_nombre:getVal("d_nombre"),
            d_tel:getVal("d_tel"),
            d_calle:getVal("d_calle"),
            d_colonia:getVal("d_colonia"),
            d_municipio:getVal("d_municipio"),

            peso:pesoFinal,
            paquetes,
            tarifa,

            total:pago.total,
            pagado:pago.pagado,
            restante:pago.restante,
            estado:pago.estado,

            fecha:new Date().toLocaleDateString()
        });

        contador++;

        alert("🚀 Guía PRO generada y guardada");

    }catch(e){
        console.error(e);
        alert("Error al generar PDF");
    }
}
       