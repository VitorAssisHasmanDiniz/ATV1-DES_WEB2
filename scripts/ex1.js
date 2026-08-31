function gerarRelatorio() {
    if (pedidos.length === 0) {
        alert("Não há pedidos disponíveis")
        return
    }

    let total = 0
    let regiao1 = 0
    let regiao2 = 0
    let regiao3 = 0
    let maisCaro = pedidos[0]
    let maisBarato = pedidos[0]

    for (const pedido of pedidos) {
        total += pedido.valorTotal

        switch (pedido.regiao) {
            case 1:
                regiao1 += pedido.valorTotal
                break
            case 2:
                regiao2 += pedido.valorTotal
                break
            case 3:
                regiao3 += pedido.valorTotal
                break
        }

        if (pedido.valorTotal > maisCaro.valorTotal) {
            maisCaro = pedido
        }

        if (pedido.valorTotal < maisBarato.valorTotal) {
            maisBarato = pedido
        }
    }

    const media = total / pedidos.length

    alert(`
Número total de pedidos: ${pedidos.length}

Valor médio por pedido: R$ ${media.toFixed(2)}

Total Região 1: R$ ${regiao1.toFixed(2)}
Total Região 2: R$ ${regiao2.toFixed(2)}
Total Região 3: R$ ${regiao3.toFixed(2)}

Pedido mais caro:
Código: ${maisCaro.codigo}
Valor: R$ ${maisCaro.valorTotal.toFixed(2)}

Pedido mais barato:
Código: ${maisBarato.codigo}
Valor: R$ ${maisBarato.valorTotal.toFixed(2)}
`)
}


const form = document.querySelector("form")
const pedidosDiv = document.querySelector(".pedidos")

const pedidos = []

form.addEventListener("submit", function (event) {
    event.preventDefault()

    const codigo = document.querySelector("#pedido").value.trim()
    const regiao = Number(document.querySelector("#regiao").value)
    const distancia = Number(document.querySelector("#distancia").value)
    const pecas = Number(document.querySelector("#pecas").value)
    const precoCombustivel = Number(document.querySelector("#litro").value)
    const rastreamento = document.querySelector("#rastreamento").checked

    if (pedidos.some(pedido => pedido.codigo === codigo)) {
        alert("Código do pedido já cadastrado")
        return
    }

    let valorPeca

    while (regiao !== 1 && regiao !== 2 && regiao !== 3) {
        alert("Região inválida. Digite 1, 2 ou 3")
        return
    }

    switch (regiao) {
        case 1:
            valorPeca = 1.20
            break
        case 2:
            valorPeca = 1.30
            break
        case 3:
            valorPeca = 1.50
            break
    }

    let valorPecas

    if (pecas > 1000) {
        valorPecas =
            1000 * valorPeca +
            (pecas - 1000) * valorPeca * 0.88
    } else {
        valorPecas = pecas * valorPeca
    }

    const valorDistancia = distancia * precoCombustivel
    const valorRastreamento = rastreamento ? 200 : 0

    const valorTotal =
        valorPecas +
        valorDistancia +
        valorRastreamento

    const pedido = {
        codigo,
        regiao,
        distancia,
        pecas,
        rastreamento,
        valorTotal
    }

    pedidos.push(pedido)
    pedidosDiv.innerHTML += `
        <div>
            <p>Pedido: ${codigo}</p>
            <p>Região: ${regiao}</p>
            <p>Peças: ${pecas}</p>
            <p>Distância: ${distancia} km</p>
            <p>Rastreamento: ${rastreamento ? "Sim" : "Não"}</p>
            <p>Valor total: R$ ${valorTotal.toFixed(2)}</p>
        </div>
    `
    form.reset()
})

