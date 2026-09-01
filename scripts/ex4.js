const reservas = []

let valorBase = 0
let valorCafe = 0

const formConfig = document.getElementById("formConfig")
const formReserva = document.getElementById("formReserva")
const divReservas = document.querySelector(".reservas")
const divRelatorio = document.querySelector(".relatorio")

formConfig.addEventListener("submit", function (e) {
    e.preventDefault()
    confirmarConfiguracao()
})

formReserva.addEventListener("submit", function (e) {
    e.preventDefault()
    cadastrarReserva()
})

function confirmarConfiguracao() {
    const base = Number(document.getElementById("valorBase").value)
    const cafe = Number(document.getElementById("valorCafe").value)

    if (!base || base <= 0) {
        alert("Informe um valor base da diaria valido (maior que zero).")
        return
    }

    if (cafe < 0 || isNaN(cafe)) {
        alert("Informe um valor de cafe da manha valido (zero ou maior).")
        return
    }

    valorBase = base
    valorCafe = cafe

    formConfig.classList.add("oculto")
    formReserva.classList.remove("oculto")
}

function cadastrarReserva() {
    const codigoReserva = document.getElementById("codigoReserva").value.trim()
    const tipoQuarto = document.getElementById("tipoQuarto").value
    const temporada = document.getElementById("temporada").value
    const diarias = Number(document.getElementById("diarias").value)
    const hospedes = Number(document.getElementById("hospedes").value)
    const cafeIncluso = document.getElementById("cafeIncluso").value

    if (codigoReserva === "") {
        alert("Informe o codigo da reserva.")
        return
    }

    const jaExiste = reservas.some((r) => r.codigoReserva === codigoReserva)
    if (jaExiste) {
        alert("Ja existe uma reserva cadastrada com o codigo \"" + codigoReserva + "\". Use um codigo unico.")
        return
    }

    if (tipoQuarto === "" || !["S", "L", "P"].includes(tipoQuarto)) {
        alert("Selecione um tipo de quarto valido (S, L ou P).")
        return
    }

    if (temporada === "" || !["B", "A", "F"].includes(temporada)) {
        alert("Selecione uma temporada valida (B, A ou F).")
        return
    }

    if (!diarias || diarias <= 0) {
        alert("Informe uma quantidade de diarias valida (maior que zero).")
        return
    }

    if (!hospedes || hospedes <= 0) {
        alert("Informe um numero de hospedes valido (maior que zero).")
        return
    }

    if (cafeIncluso === "" || !["S", "N"].includes(cafeIncluso)) {
        alert("Informe se o cafe da manha esta incluso (S ou N).")
        return
    }

    let nomeTipo = ""
    let multiplicadorTipo = 1

    switch (tipoQuarto) {
        case "S":
            nomeTipo = "Standard"
            multiplicadorTipo = 1
            break
        case "L":
            nomeTipo = "Luxo"
            multiplicadorTipo = 1.5
            break
        case "P":
            nomeTipo = "Premium"
            multiplicadorTipo = 2
            break
    }

    let nomeTemporada = ""
    let ajusteTemporada = 0

    switch (temporada) {
        case "B":
            nomeTemporada = "Baixa"
            ajusteTemporada = 0
            break
        case "A":
            nomeTemporada = "Alta"
            ajusteTemporada = 0.25
            break
        case "F":
            nomeTemporada = "Feriado"
            ajusteTemporada = 0.4
            break
    }

    const valorDiariaAjustada = valorBase * multiplicadorTipo
    const valorDiariaFinal = valorDiariaAjustada * (1 + ajusteTemporada)

    const temCafe = cafeIncluso === "S"
    const cafeTotal = temCafe ? valorCafe * hospedes * diarias : 0

    const valorTotal = valorDiariaFinal * diarias + cafeTotal

    const reserva = {
        codigoReserva,
        tipoQuarto,
        nomeTipo,
        temporada,
        nomeTemporada,
        diarias,
        hospedes,
        cafeIncluso,
        temCafe,
        valorDiariaFinal,
        cafeTotal,
        valorTotal,
    }

    reservas.push(reserva)
    renderizarReserva(reserva)
    formReserva.reset()
}

function renderizarReserva(reserva) {
    const card = document.createElement("div")
    card.classList.add("card")

    if (reserva.temCafe) card.classList.add("cafe")

    card.innerHTML = `
    <h3>Reserva ${reserva.codigoReserva}</h3>
    <p><strong>Quarto:</strong> ${reserva.nomeTipo}</p>
    <p><strong>Temporada:</strong> ${reserva.nomeTemporada}</p>
    <p><strong>Diarias:</strong> ${reserva.diarias}</p>
    <p><strong>Hospedes:</strong> ${reserva.hospedes}</p>
    <p><strong>Diaria final:</strong> R$ ${reserva.valorDiariaFinal.toFixed(2)}</p>
    <p><strong>Cafe da manha:</strong> ${reserva.temCafe ? "Incluso" : "Nao incluso"}</p>
    <p><strong>Valor total:</strong> R$ ${reserva.valorTotal.toFixed(2)}</p>
  `

    divReservas.appendChild(card)
}

function gerarRelatorio() {
    if (reservas.length === 0) {
        alert("Nenhuma reserva cadastrada ainda. Cadastre pelo menos uma reserva antes de gerar o relatorio.")
        return
    }

    const totalReservas = reservas.length

    const somaValorTotal = reservas.reduce((acc, r) => acc + r.valorTotal, 0)
    const mediaValorReserva = somaValorTotal / totalReservas

    const valorPorTipo = { S: 0, L: 0, P: 0 }
    const valorPorTemporada = { B: 0, A: 0, F: 0 }
    reservas.forEach((r) => {
        valorPorTipo[r.tipoQuarto] += r.valorTotal
        valorPorTemporada[r.temporada] += r.valorTotal
    })

    let reservaMaisCara = reservas[0]
    let reservaMaisBarata = reservas[0]
    reservas.forEach((r) => {
        if (r.valorTotal > reservaMaisCara.valorTotal) reservaMaisCara = r
        if (r.valorTotal < reservaMaisBarata.valorTotal) reservaMaisBarata = r
    })

    const qtdComCafe = reservas.filter((r) => r.temCafe).length
    const qtdSemCafe = reservas.filter((r) => !r.temCafe).length

    const ocupacaoTotal = reservas.reduce((acc, r) => acc + r.diarias * r.hospedes, 0)
    const totalHospedes = reservas.reduce((acc, r) => acc + r.hospedes, 0)
    const valorMedioPorHospede = somaValorTotal / totalHospedes

    let html = `<h2>Relatorio de Ocupacao e Faturamento</h2>`

    html += `<p><strong>Total de reservas cadastradas:</strong> ${totalReservas}</p>`
    html += `<p><strong>Valor medio por reserva:</strong> R$ ${mediaValorReserva.toFixed(2)}</p>`

    html += `<h3>Valor total por tipo de quarto</h3>`
    html += `<p>Standard (S): R$ ${valorPorTipo["S"].toFixed(2)}</p>`
    html += `<p>Luxo (L): R$ ${valorPorTipo["L"].toFixed(2)}</p>`
    html += `<p>Premium (P): R$ ${valorPorTipo["P"].toFixed(2)}</p>`

    html += `<h3>Valor total por temporada</h3>`
    html += `<p>Baixa (B): R$ ${valorPorTemporada["B"].toFixed(2)}</p>`
    html += `<p>Alta (A): R$ ${valorPorTemporada["A"].toFixed(2)}</p>`
    html += `<p>Feriado (F): R$ ${valorPorTemporada["F"].toFixed(2)}</p>`

    html += `<h3>Reserva mais cara</h3>`
    html += `
    <div class="tipo-item">
      <p><strong>Codigo:</strong> ${reservaMaisCara.codigoReserva}</p>
      <p><strong>Tipo:</strong> ${reservaMaisCara.nomeTipo}</p>
      <p><strong>Temporada:</strong> ${reservaMaisCara.nomeTemporada}</p>
      <p><strong>Hospedes:</strong> ${reservaMaisCara.hospedes}</p>
      <p><strong>Valor:</strong> R$ ${reservaMaisCara.valorTotal.toFixed(2)}</p>
    </div>
  `

    html += `<h3>Reserva mais barata</h3>`
    html += `
    <div class="tipo-item">
      <p><strong>Codigo:</strong> ${reservaMaisBarata.codigoReserva}</p>
      <p><strong>Tipo:</strong> ${reservaMaisBarata.nomeTipo}</p>
      <p><strong>Temporada:</strong> ${reservaMaisBarata.nomeTemporada}</p>
      <p><strong>Hospedes:</strong> ${reservaMaisBarata.hospedes}</p>
      <p><strong>Valor:</strong> R$ ${reservaMaisBarata.valorTotal.toFixed(2)}</p>
    </div>
  `

    html += `<h3>Cafe da manha</h3>`
    html += `<p>Reservas com cafe incluso: ${qtdComCafe}</p>`
    html += `<p>Reservas sem cafe: ${qtdSemCafe}</p>`

    html += `<h3>Ocupacao</h3>`
    html += `<p><strong>Ocupacao total (diarias x hospedes):</strong> ${ocupacaoTotal}</p>`
    html += `<p><strong>Valor medio por hospede:</strong> R$ ${valorMedioPorHospede.toFixed(2)}</p>`

    divRelatorio.innerHTML = html
    divRelatorio.scrollIntoView({ behavior: "smooth" })
}