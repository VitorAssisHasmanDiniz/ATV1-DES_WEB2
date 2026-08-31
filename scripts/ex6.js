const vendas = [];
const vendedores = {};

let metaMensal = 0;
let percentualBase = 0;

const formConfig = document.getElementById("formConfig");
const formVenda = document.getElementById("formVenda");
const divVendas = document.querySelector(".vendas");
const divRelatorio = document.querySelector(".relatorio");

const nomesRegiao = { "1": "Norte", "2": "Nordeste", "3": "Sudeste", "4": "Sul" };

formConfig.addEventListener("submit", function (e) {
    e.preventDefault();
    confirmarConfiguracao();
});

formVenda.addEventListener("submit", function (e) {
    e.preventDefault();
    cadastrarVenda();
});

function confirmarConfiguracao() {
    const meta = Number(document.getElementById("metaMensal").value);
    const percentual = Number(document.getElementById("percentualBase").value);

    if (!meta || meta <= 0) {
        alert("Informe uma meta mensal valida (maior que zero).");
        return;
    }

    if (!percentual || percentual <= 0) {
        alert("Informe um percentual base de comissao valido (maior que zero).");
        return;
    }

    metaMensal = meta;
    percentualBase = percentual / 100;

    formConfig.classList.add("oculto");
    formVenda.classList.remove("oculto");
}

function cadastrarVenda() {
    const codigoVenda = document.getElementById("codigoVenda").value.trim();
    const codigoVendedor = document.getElementById("codigoVendedor").value.trim();
    const regiao = document.getElementById("regiao").value;
    const valorVenda = Number(document.getElementById("valorVenda").value);
    const tipoCliente = document.getElementById("tipoCliente").value;

    if (codigoVenda === "") {
        alert("Informe o codigo da venda.");
        return;
    }

    const jaExiste = vendas.some((v) => v.codigoVenda === codigoVenda);
    if (jaExiste) {
        alert("Ja existe uma venda cadastrada com o codigo \"" + codigoVenda + "\". Use um codigo unico.");
        return;
    }

    if (codigoVendedor === "") {
        alert("Informe o codigo do vendedor.");
        return;
    }

    if (regiao === "" || !["1", "2", "3", "4"].includes(regiao)) {
        alert("Selecione uma regiao valida (1, 2, 3 ou 4).");
        return;
    }

    if (!valorVenda || valorVenda <= 0) {
        alert("Informe um valor de venda valido (maior que zero).");
        return;
    }

    if (tipoCliente === "" || !["PF", "PJ"].includes(tipoCliente)) {
        alert("Selecione um tipo de cliente valido (PF ou PJ).");
        return;
    }

    const comissaoBase = valorVenda * percentualBase;

    let percentualTipo = 0;
    if (tipoCliente === "PF") percentualTipo = 0.02;
    if (tipoCliente === "PJ") percentualTipo = 0.03;
    const bonusTipo = valorVenda * percentualTipo;

    let percentualRegiao = 0;
    if (regiao === "1" || regiao === "2") percentualRegiao = 0.01;
    if (regiao === "3") percentualRegiao = 0;
    if (regiao === "4") percentualRegiao = 0.005;
    const bonusRegiao = valorVenda * percentualRegiao;

    const comissaoTotal = comissaoBase + bonusTipo + bonusRegiao;

    const venda = {
        codigoVenda,
        codigoVendedor,
        regiao,
        nomeRegiao: nomesRegiao[regiao],
        valorVenda,
        tipoCliente,
        comissaoTotal,
    };

    vendas.push(venda);

    if (!vendedores[codigoVendedor]) {
        vendedores[codigoVendedor] = {
            codigoVendedor,
            valorTotalVendido: 0,
            comissaoTotalAcumulada: 0,
            qtdVendas: 0,
        };
    }

    const vendedor = vendedores[codigoVendedor];
    vendedor.valorTotalVendido += valorVenda;
    vendedor.comissaoTotalAcumulada += comissaoTotal;
    vendedor.qtdVendas += 1;

    renderizarVenda(venda, vendedor);
    formVenda.reset();
}

function renderizarVenda(venda, vendedor) {
    const card = document.createElement("div");
    card.classList.add("card");

    const bateuMeta = vendedor.valorTotalVendido >= metaMensal;
    if (bateuMeta) card.classList.add("meta");

    card.innerHTML = `
    <h3>Venda ${venda.codigoVenda}</h3>
    <p><strong>Vendedor:</strong> ${venda.codigoVendedor}</p>
    <p><strong>Regiao:</strong> ${venda.nomeRegiao}</p>
    <p><strong>Tipo de cliente:</strong> ${venda.tipoCliente}</p>
    <p><strong>Valor da venda:</strong> R$ ${venda.valorVenda.toFixed(2)}</p>
    <p><strong>Comissao da venda:</strong> R$ ${venda.comissaoTotal.toFixed(2)}</p>
    <p><strong>Total vendido pelo vendedor:</strong> R$ ${vendedor.valorTotalVendido.toFixed(2)}</p>
    <p><strong>Meta batida:</strong> ${bateuMeta ? "Sim" : "Nao"}</p>
  `;

    divVendas.appendChild(card);
}

function gerarRelatorio() {
    if (vendas.length === 0) {
        alert("Nenhuma venda cadastrada ainda. Cadastre pelo menos uma venda antes de gerar o relatorio.");
        return;
    }

    const totalVendas = vendas.length;
    const listaVendedores = Object.values(vendedores);

    const valorPorRegiao = { "1": 0, "2": 0, "3": 0, "4": 0 };
    const valorPorTipoCliente = { PF: 0, PJ: 0 };
    vendas.forEach((v) => {
        valorPorRegiao[v.regiao] += v.valorVenda;
        valorPorTipoCliente[v.tipoCliente] += v.valorVenda;
    });

    let vendedorMaiorValor = listaVendedores[0];
    let vendedorMaiorComissao = listaVendedores[0];
    listaVendedores.forEach((vd) => {
        if (vd.valorTotalVendido > vendedorMaiorValor.valorTotalVendido) vendedorMaiorValor = vd;
        if (vd.comissaoTotalAcumulada > vendedorMaiorComissao.comissaoTotalAcumulada) vendedorMaiorComissao = vd;
    });

    const qtdBateramMeta = listaVendedores.filter((vd) => vd.valorTotalVendido >= metaMensal).length;

    const somaComissaoGeral = vendas.reduce((acc, v) => acc + v.comissaoTotal, 0);
    const comissaoMediaGeral = somaComissaoGeral / totalVendas;

    const comissaoPorRegiao = { "1": { soma: 0, qtd: 0 }, "2": { soma: 0, qtd: 0 }, "3": { soma: 0, qtd: 0 }, "4": { soma: 0, qtd: 0 } };
    vendas.forEach((v) => {
        comissaoPorRegiao[v.regiao].soma += v.comissaoTotal;
        comissaoPorRegiao[v.regiao].qtd += 1;
    });

    let html = `<h2>Relatorio de Performance de Vendas</h2>`;

    html += `<p><strong>Total de vendas registradas:</strong> ${totalVendas}</p>`;

    html += `<h3>Valor total vendido por regiao</h3>`;
    ["1", "2", "3", "4"].forEach((r) => {
        html += `<p>${nomesRegiao[r]}: R$ ${valorPorRegiao[r].toFixed(2)}</p>`;
    });

    html += `<h3>Valor total vendido por tipo de cliente</h3>`;
    html += `<p>Pessoa Fisica (PF): R$ ${valorPorTipoCliente["PF"].toFixed(2)}</p>`;
    html += `<p>Pessoa Juridica (PJ): R$ ${valorPorTipoCliente["PJ"].toFixed(2)}</p>`;

    html += `<h3>Destaques</h3>`;
    html += `
    <div class="item">
      <p><strong>Maior valor total de vendas:</strong> Vendedor ${vendedorMaiorValor.codigoVendedor}</p>
      <p>Valor total vendido: R$ ${vendedorMaiorValor.valorTotalVendido.toFixed(2)}</p>
    </div>
  `;
    html += `
    <div class="item">
      <p><strong>Maior comissao total:</strong> Vendedor ${vendedorMaiorComissao.codigoVendedor}</p>
      <p>Comissao total acumulada: R$ ${vendedorMaiorComissao.comissaoTotalAcumulada.toFixed(2)}</p>
    </div>
  `;

    html += `<h3>Metas</h3>`;
    html += `<p><strong>Vendedores que bateram a meta:</strong> ${qtdBateramMeta} de ${listaVendedores.length}</p>`;

    html += `<h3>Comissoes</h3>`;
    html += `<p><strong>Comissao media geral:</strong> R$ ${comissaoMediaGeral.toFixed(2)}</p>`;

    html += `<h3>Comissao media por regiao</h3>`;
    ["1", "2", "3", "4"].forEach((r) => {
        const dados = comissaoPorRegiao[r];
        const media = dados.qtd > 0 ? dados.soma / dados.qtd : 0;
        html += `<p>${nomesRegiao[r]}: R$ ${media.toFixed(2)}</p>`;
    });

    divRelatorio.innerHTML = html;
    divRelatorio.scrollIntoView({ behavior: "smooth" });
}