const ordens = [];

const form = document.getElementById("formOrdem");
const divOrdens = document.querySelector(".ordens");
const divRelatorio = document.querySelector(".relatorio");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  cadastrarOrdem();
});

function cadastrarOrdem() {
  const codigoOrdem = document.getElementById("codigoOrdem").value.trim();
  const codigoProduto = document.getElementById("codigoProduto").value.trim();
  let tipoProduto = document.getElementById("tipoProduto").value;
  const quantidade = Number(document.getElementById("quantidade").value);
  const custoUnitario = Number(document.getElementById("custoUnitario").value);
  const estoqueInicial = Number(document.getElementById("estoqueInicial").value);

  if (codigoOrdem === "") {
    alert("Informe o codigo da ordem.");
    return;
  }

  const jaExiste = ordens.some((o) => o.codigoOrdem === codigoOrdem);
  if (jaExiste) {
    alert("Ja existe uma ordem cadastrada com o codigo \"" + codigoOrdem + "\". Use um codigo unico.");
    return;
  }

  if (codigoProduto === "") {
    alert("Informe o codigo do produto.");
    return;
  }

  tipoProduto = validarTipoProduto(tipoProduto);
  if (tipoProduto === null) {
    return;
  }

  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade produzida valida (maior que zero).");
    return;
  }

  if (!custoUnitario || custoUnitario <= 0) {
    alert("Informe um custo unitario valido (maior que zero).");
    return;
  }

  if (estoqueInicial < 0 || isNaN(estoqueInicial)) {
    alert("Informe um estoque inicial valido (zero ou maior).");
    return;
  }

  let nomeTipo = "";
  let custoUnitarioAjustado = custoUnitario;

  switch (tipoProduto) {
    case "1":
      nomeTipo = "Padrao";
      custoUnitarioAjustado = custoUnitario;
      break;
    case "2":
      nomeTipo = "Premium";
      custoUnitarioAjustado = custoUnitario * 1.1;
      break;
    case "3":
      nomeTipo = "Sob encomenda";
      custoUnitarioAjustado = custoUnitario * 1.2;
      break;
  }

  const estoqueFinal = estoqueInicial + quantidade;
  const custoTotal = quantidade * custoUnitarioAjustado;

  let alertaEstoque = "Normal";
  if (estoqueFinal > 5000) {
    alertaEstoque = "Alto";
  } else if (estoqueFinal < 500) {
    alertaEstoque = "Critico";
  }

  const ordem = {
    codigoOrdem,
    codigoProduto,
    tipoProduto,
    nomeTipo,
    quantidade,
    custoUnitario,
    custoUnitarioAjustado,
    estoqueInicial,
    estoqueFinal,
    custoTotal,
    alertaEstoque,
  };

  ordens.push(ordem);
  renderizarOrdem(ordem);
  form.reset();
}

function validarTipoProduto(valor) {
  let valido = false;

  while (!valido) {
    switch (valor) {
      case "1":
      case "2":
      case "3":
        valido = true;
        break;
      default:
        valor = prompt(
          "Tipo de produto invalido.\nDigite 1 (Padrao), 2 (Premium) ou 3 (Sob encomenda):"
        );
        if (valor === null) {
          return null;
        }
        valor = valor.trim();
        break;
    }
  }

  return valor;
}

function renderizarOrdem(ordem) {
  const card = document.createElement("div");
  card.classList.add("card");

  if (ordem.alertaEstoque === "Alto") card.classList.add("alto");
  if (ordem.alertaEstoque === "Critico") card.classList.add("critico");

  card.innerHTML = `
    <h3>Ordem ${ordem.codigoOrdem}</h3>
    <p><strong>Produto:</strong> ${ordem.codigoProduto}</p>
    <p><strong>Tipo:</strong> ${ordem.nomeTipo}</p>
    <p><strong>Quantidade produzida:</strong> ${ordem.quantidade}</p>
    <p><strong>Custo unitario ajustado:</strong> R$ ${ordem.custoUnitarioAjustado.toFixed(2)}</p>
    <p><strong>Custo total:</strong> R$ ${ordem.custoTotal.toFixed(2)}</p>
    <p><strong>Estoque inicial:</strong> ${ordem.estoqueInicial}</p>
    <p><strong>Estoque final:</strong> ${ordem.estoqueFinal}</p>
    <p><strong>Alerta de estoque:</strong> ${ordem.alertaEstoque}</p>
  `;

  divOrdens.appendChild(card);
}

function gerarRelatorio() {
  if (ordens.length === 0) {
    alert("Nenhuma ordem cadastrada ainda. Cadastre pelo menos uma ordem antes de gerar o relatorio.");
    return;
  }

  const totalOrdens = ordens.length;

  const estoquePorTipo = { Padrao: 0, Premium: 0, "Sob encomenda": 0 };
  ordens.forEach((o) => {
    estoquePorTipo[o.nomeTipo] += o.estoqueFinal;
  });

  const somaCustoTotal = ordens.reduce((acc, o) => acc + o.custoTotal, 0);
  const mediaCustoTotal = somaCustoTotal / totalOrdens;

  let ordemMaiorCusto = ordens[0];
  let ordemMenorCusto = ordens[0];
  ordens.forEach((o) => {
    if (o.custoTotal > ordemMaiorCusto.custoTotal) ordemMaiorCusto = o;
    if (o.custoTotal < ordemMenorCusto.custoTotal) ordemMenorCusto = o;
  });

  const qtdAlertaAlto = ordens.filter((o) => o.alertaEstoque === "Alto").length;
  const qtdAlertaCritico = ordens.filter((o) => o.alertaEstoque === "Critico").length;

  const produtos = {};
  ordens.forEach((o) => {
    if (!produtos[o.codigoProduto]) {
      produtos[o.codigoProduto] = { estoqueFinal: 0, valorInvestido: 0 };
    }
    produtos[o.codigoProduto].estoqueFinal += o.estoqueFinal;
    produtos[o.codigoProduto].valorInvestido += o.custoTotal;
  });

  let html = `<h2>Relatorio Consolidado de Producao</h2>`;

  html += `<p><strong>Total de ordens registradas:</strong> ${totalOrdens}</p>`;

  html += `<h3>Estoque final total por tipo de produto</h3>`;
  html += `<p>Padrao: ${estoquePorTipo["Padrao"]}</p>`;
  html += `<p>Premium: ${estoquePorTipo["Premium"]}</p>`;
  html += `<p>Sob encomenda: ${estoquePorTipo["Sob encomenda"]}</p>`;

  html += `<h3>Custos</h3>`;
  html += `<p><strong>Media de custo total por ordem:</strong> R$ ${mediaCustoTotal.toFixed(2)}</p>`;
  html += `<p><strong>Maior custo total:</strong> Ordem ${ordemMaiorCusto.codigoOrdem} - R$ ${ordemMaiorCusto.custoTotal.toFixed(2)}</p>`;
  html += `<p><strong>Menor custo total:</strong> Ordem ${ordemMenorCusto.codigoOrdem} - R$ ${ordemMenorCusto.custoTotal.toFixed(2)}</p>`;

  html += `<h3>Alertas de estoque</h3>`;
  html += `<p>Ordens com estoque alto (&gt; 5000): ${qtdAlertaAlto}</p>`;
  html += `<p>Ordens com estoque critico (&lt; 500): ${qtdAlertaCritico}</p>`;

  html += `<h3>Consolidado por produto</h3>`;
  for (const codigo in produtos) {
    const p = produtos[codigo];
    html += `
      <div class="produto-item">
        <p><strong>Produto:</strong> ${codigo}</p>
        <p>Estoque final consolidado: ${p.estoqueFinal}</p>
        <p>Valor total investido: R$ ${p.valorInvestido.toFixed(2)}</p>
      </div>
    `;
  }

  divRelatorio.innerHTML = html;
  divRelatorio.scrollIntoView({ behavior: "smooth" });
}