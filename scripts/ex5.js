const treinos = [];
const jogadores = {};

let cargaMaxima = 0;

const formConfig = document.getElementById("formConfig");
const formTreino = document.getElementById("formTreino");
const divTreinos = document.querySelector(".treinos");
const divRelatorio = document.querySelector(".relatorio");

formConfig.addEventListener("submit", function (e) {
    e.preventDefault();
    confirmarConfiguracao();
});

formTreino.addEventListener("submit", function (e) {
    e.preventDefault();
    cadastrarTreino();
});

function confirmarConfiguracao() {
    const carga = Number(document.getElementById("cargaMaxima").value);

    if (!carga || carga <= 0) {
        alert("Informe uma carga maxima semanal valida (maior que zero).");
        return;
    }

    cargaMaxima = carga;

    formConfig.classList.add("oculto");
    formTreino.classList.remove("oculto");
}

function cadastrarTreino() {
    const codigoTreino = document.getElementById("codigoTreino").value.trim();
    const nomeJogador = document.getElementById("nomeJogador").value.trim();
    const posicao = document.getElementById("posicao").value;
    const tipoTreino = document.getElementById("tipoTreino").value;
    const duracao = Number(document.getElementById("duracao").value);
    let intensidade = document.getElementById("intensidade").value;

    if (codigoTreino === "") {
        alert("Informe o codigo do treino.");
        return;
    }

    const jaExiste = treinos.some((t) => t.codigoTreino === codigoTreino);
    if (jaExiste) {
        alert("Ja existe um treino cadastrado com o codigo \"" + codigoTreino + "\". Use um codigo unico.");
        return;
    }

    if (nomeJogador === "") {
        alert("Informe o nome do jogador.");
        return;
    }

    if (posicao === "" || !["G", "Z", "M", "A"].includes(posicao)) {
        alert("Selecione uma posicao valida (G, Z, M ou A).");
        return;
    }

    if (tipoTreino === "" || !["F", "T", "E"].includes(tipoTreino)) {
        alert("Selecione um tipo de treino valido (F, T ou E).");
        return;
    }

    if (!duracao || duracao <= 0) {
        alert("Informe uma duracao valida (maior que zero).");
        return;
    }

    intensidade = validarIntensidade(intensidade);
    if (intensidade === null) {
        return;
    }

    let nomePosicao = "";
    switch (posicao) {
        case "G":
            nomePosicao = "Goleiro";
            break;
        case "Z":
            nomePosicao = "Zagueiro";
            break;
        case "M":
            nomePosicao = "Meio-campo";
            break;
        case "A":
            nomePosicao = "Atacante";
            break;
    }

    let nomeTipo = "";
    let multiplicadorTipo = 1;
    switch (tipoTreino) {
        case "F":
            nomeTipo = "Fisico";
            multiplicadorTipo = 1.5;
            break;
        case "T":
            nomeTipo = "Tecnico";
            multiplicadorTipo = 1.2;
            break;
        case "E":
            nomeTipo = "Estrategico";
            multiplicadorTipo = 1.0;
            break;
    }

    const carga = (duracao / 10) * intensidade * multiplicadorTipo;

    const treino = {
        codigoTreino,
        nomeJogador,
        posicao,
        nomePosicao,
        tipoTreino,
        nomeTipo,
        duracao,
        intensidade,
        carga,
    };

    treinos.push(treino);

    if (!jogadores[nomeJogador]) {
        jogadores[nomeJogador] = {
            nome: nomeJogador,
            posicao,
            nomePosicao,
            cargaTotal: 0,
            qtdTreinos: 0,
            risco: false,
        };
    }

    const jogador = jogadores[nomeJogador];
    jogador.cargaTotal += carga;
    jogador.qtdTreinos += 1;
    jogador.risco = jogador.cargaTotal > cargaMaxima;

    renderizarTreino(treino, jogador);
    formTreino.reset();
}

function validarIntensidade(valor) {
    let valido = false;
    let numero;

    while (!valido) {
        numero = Number(valor);

        if (valor !== "" && !isNaN(numero) && Number.isInteger(numero) && numero >= 1 && numero <= 10) {
            valido = true;
        } else {
            valor = prompt("Intensidade invalida.\nDigite um numero inteiro de 1 a 10:");
            if (valor === null) {
                return null;
            }
            valor = valor.trim();
        }
    }

    return numero;
}

function renderizarTreino(treino, jogador) {
    const card = document.createElement("div");
    card.classList.add("card");

    if (jogador.risco) card.classList.add("risco");

    card.innerHTML = `
    <h3>Treino ${treino.codigoTreino}</h3>
    <p><strong>Jogador:</strong> ${treino.nomeJogador}</p>
    <p><strong>Posicao:</strong> ${treino.nomePosicao}</p>
    <p><strong>Tipo:</strong> ${treino.nomeTipo}</p>
    <p><strong>Duracao:</strong> ${treino.duracao} min</p>
    <p><strong>Intensidade:</strong> ${treino.intensidade}</p>
    <p><strong>Carga do treino:</strong> ${treino.carga.toFixed(2)}</p>
    <p><strong>Carga semanal do jogador:</strong> ${jogador.cargaTotal.toFixed(2)}</p>
    <p><strong>Risco de lesao:</strong> ${jogador.risco ? "Sim" : "Nao"}</p>
  `;

    divTreinos.appendChild(card);
}

function gerarRelatorio() {
    if (treinos.length === 0) {
        alert("Nenhum treino cadastrado ainda. Cadastre pelo menos um treino antes de gerar o relatorio.");
        return;
    }

    const totalTreinos = treinos.length;
    const listaJogadores = Object.values(jogadores);

    let jogadorMaiorCarga = listaJogadores[0];
    let jogadorMenorCarga = listaJogadores[0];
    listaJogadores.forEach((j) => {
        if (j.cargaTotal > jogadorMaiorCarga.cargaTotal) jogadorMaiorCarga = j;
        if (j.cargaTotal < jogadorMenorCarga.cargaTotal) jogadorMenorCarga = j;
    });

    const qtdRisco = listaJogadores.filter((j) => j.risco).length;

    const cargaPorTipo = { F: { soma: 0, qtd: 0 }, T: { soma: 0, qtd: 0 }, E: { soma: 0, qtd: 0 } };
    treinos.forEach((t) => {
        cargaPorTipo[t.tipoTreino].soma += t.carga;
        cargaPorTipo[t.tipoTreino].qtd += 1;
    });

    const dadosPosicao = { G: { qtd: 0, soma: 0 }, Z: { qtd: 0, soma: 0 }, M: { qtd: 0, soma: 0 }, A: { qtd: 0, soma: 0 } };
    treinos.forEach((t) => {
        dadosPosicao[t.posicao].qtd += 1;
        dadosPosicao[t.posicao].soma += t.carga;
    });

    const nomesPosicao = { G: "Goleiro", Z: "Zagueiro", M: "Meio-campo", A: "Atacante" };
    const nomesTipo = { F: "Fisico", T: "Tecnico", E: "Estrategico" };

    let html = `<h2>Relatorio de Carga e Risco de Lesao</h2>`;

    html += `<p><strong>Total de treinos cadastrados:</strong> ${totalTreinos}</p>`;

    html += `<h3>Jogadores</h3>`;
    listaJogadores.forEach((j) => {
        html += `
      <div class="item ${j.risco ? "risco" : ""}">
        <p><strong>${j.nome}</strong> (${j.nomePosicao})</p>
        <p>Carga semanal total: ${j.cargaTotal.toFixed(2)}</p>
        <p>Quantidade de treinos: ${j.qtdTreinos}</p>
        <p>Risco de lesao: ${j.risco ? "Sim" : "Nao"}</p>
      </div>
    `;
    });

    html += `<h3>Destaques</h3>`;
    html += `<p><strong>Maior carga semanal:</strong> ${jogadorMaiorCarga.nome} (${jogadorMaiorCarga.nomePosicao}) - ${jogadorMaiorCarga.cargaTotal.toFixed(2)} pts em ${jogadorMaiorCarga.qtdTreinos} treinos</p>`;
    html += `<p><strong>Menor carga semanal:</strong> ${jogadorMenorCarga.nome} (${jogadorMenorCarga.nomePosicao}) - ${jogadorMenorCarga.cargaTotal.toFixed(2)} pts em ${jogadorMenorCarga.qtdTreinos} treinos</p>`;
    html += `<p><strong>Jogadores com risco de lesao:</strong> ${qtdRisco}</p>`;

    html += `<h3>Carga media por tipo de treino</h3>`;
    ["F", "T", "E"].forEach((tipo) => {
        const dados = cargaPorTipo[tipo];
        const media = dados.qtd > 0 ? dados.soma / dados.qtd : 0;
        html += `<p>${nomesTipo[tipo]} (${tipo}): ${media.toFixed(2)} pts</p>`;
    });

    html += `<h3>Por posicao</h3>`;
    ["G", "Z", "M", "A"].forEach((pos) => {
        const dados = dadosPosicao[pos];
        const media = dados.qtd > 0 ? dados.soma / dados.qtd : 0;
        html += `
      <div class="item">
        <p><strong>${nomesPosicao[pos]} (${pos})</strong></p>
        <p>Total de treinos: ${dados.qtd}</p>
        <p>Carga media: ${media.toFixed(2)} pts</p>
      </div>
    `;
    });

    divRelatorio.innerHTML = html;
    divRelatorio.scrollIntoView({ behavior: "smooth" });
}