const btnCalcular = document.getElementById("btnCalcular");

btnCalcular.onclick = () => {

const cp = document.getElementById("cp").value.trim();
const peso = parseFloat(document.getElementById("peso").value);
const largo = parseFloat(document.getElementById("largo").value);
const ancho = parseFloat(document.getElementById("ancho").value);
const alto = parseFloat(document.getElementById("alto").value);

/* VALIDACIÓN */
if(
    cp === "" ||
    isNaN(peso) ||
    isNaN(largo) ||
    isNaN(ancho) ||
    isNaN(alto)
){
    alert("⚠️ Completa todos los campos correctamente");
    return;
}

/* CÁLCULOS */
const pesoVol = (largo * ancho * alto) / 5000;
const pesoCobrado = Math.max(peso, pesoVol);

let precio = 65;

if(pesoCobrado > 10){
    precio += (pesoCobrado - 10) * 3;
}

/* MENSAJE COMPLETO (ARREGLADO) */
const mensaje = `📦 Cotización ViraPack

📍 Código Postal: ${cp}

📦 Datos del paquete:
- Peso: ${peso} kg
- Medidas: ${largo} x ${ancho} x ${alto} cm`;
/* WHATSAPP */
const telefono = "5214945135656";

window.open(
`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
"_blank"
);

};