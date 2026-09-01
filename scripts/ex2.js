const form = document.querySelector("form")
const funcionariosDiv = document.querySelector(".funcionarios")

const funcionarios = []

form.addEventListener("submit", function (event) {
    event.preventDefault()

    const codigo = document.querySelector("#codigo").value.trim()
    const horas = Number(document.querySelector("#horas").value)
    const categoria = document.querySelector("#categoria").value
    const turno = document.querySelector("#turno").value
    const avaliacao = Number(document.querySelector("#avaliacao").value)
    const salarioMinimo = Number(document.querySelector("#salarioMinimo").value)

    if (funcionarios.some(funcionario => funcionario.codigo === codigo)) {
        alert("Código do funcionário já cadastrado")
        return
    }

    if (codigo === "") {
        alert("Digite o código do funcionário")
        return
    }

    if (horas <= 0) {
        alert("Digite uma quantidade válida de horas")
        return
    }

    if (categoria !== "F" && categoria !== "G") {
        alert("Selecione uma categoria válida")
        return
    }

    if (turno !== "M" && turno !== "V" && turno !== "N") {
        alert("Selecione um turno válido")
        return
    }

    if (avaliacao < 0 || avaliacao > 10) {
        alert("A avaliação deve estar entre 0 e 10")
        return
    }

    if (salarioMinimo <= 0) {
        alert("Digite um salário mínimo válido")
        return
    }

    let percentualHora

    switch (categoria) {
        case "F":
            switch (turno) {
                case "M":
                    percentualHora = 0.10
                    break
                case "V":
                    percentualHora = 0.15
                    break
                case "N":
                    percentualHora = 0.20
                    break
            }
            break

        case "G":
            switch (turno) {
                case "M":
                    percentualHora = 0.30
                    break
                case "V":
                    percentualHora = 0.35
                    break
                case "N":
                    percentualHora = 0.40
                    break
            }
            break
    }

    const valorHora = salarioMinimo * percentualHora
    const salarioInicial = horas * valorHora

    let percentualAlimentacao

    if (salarioInicial <= 800) {
        percentualAlimentacao = 0.25
    } else if (salarioInicial <= 1200) {
        percentualAlimentacao = 0.20
    } else {
        percentualAlimentacao = 0.15
    }

    const auxilioAlimentacao =
        salarioInicial * percentualAlimentacao

    let percentualBonus

    if (avaliacao >= 9) {
        percentualBonus = 0.10
    } else if (avaliacao >= 7) {
        percentualBonus = 0.05
    } else if (avaliacao >= 5) {
        percentualBonus = 0.02
    } else {
        percentualBonus = 0
    }

    const bonus =
        salarioInicial * percentualBonus

    const salarioFinal =
        salarioInicial +
        auxilioAlimentacao +
        bonus

    const funcionario = {
        codigo,
        horas,
        categoria,
        turno,
        avaliacao,
        salarioInicial,
        auxilioAlimentacao,
        bonus,
        percentualBonus,
        salarioFinal
    }

    funcionarios.push(funcionario)

    funcionariosDiv.innerHTML += `
        <div>
            <p>Código: ${codigo}</p>
            <p>Categoria: ${categoria}</p>
            <p>Turno: ${turno}</p>
            <p>Horas: ${horas}</p>
            <p>Avaliação: ${avaliacao}</p>
            <p>Salário inicial: R$ ${salarioInicial.toFixed(2)}</p>
            <p>Auxílio-alimentação: R$ ${auxilioAlimentacao.toFixed(2)}</p>
            <p>Bônus: R$ ${bonus.toFixed(2)}</p>
            <p>Salário final: R$ ${salarioFinal.toFixed(2)}</p>
        </div>
    `

    form.reset()
})


function gerarRelatorio() {
    if (funcionarios.length === 0) {
        alert("Não há funcionários cadastrados")
        return
    }

    let totalSalarios = 0
    let totalFuncionarios = 0
    let totalGerentes = 0

    let salarioFuncionarios = 0
    let salarioGerentes = 0

    let bonus10 = 0
    let bonus5 = 0
    let bonus2 = 0
    let bonusNenhum = 0

    let maiorSalario = funcionarios[0]
    let menorSalario = funcionarios[0]

    for (const funcionario of funcionarios) {
        totalSalarios += funcionario.salarioFinal

        if (funcionario.categoria === "F") {
            totalFuncionarios++
            salarioFuncionarios += funcionario.salarioFinal
        }

        if (funcionario.categoria === "G") {
            totalGerentes++
            salarioGerentes += funcionario.salarioFinal
        }

        if (funcionario.percentualBonus === 0.10) {
            bonus10++
        } else if (funcionario.percentualBonus === 0.05) {
            bonus5++
        } else if (funcionario.percentualBonus === 0.02) {
            bonus2++
        } else {
            bonusNenhum++
        }

        if (funcionario.salarioFinal > maiorSalario.salarioFinal) {
            maiorSalario = funcionario
        }

        if (funcionario.salarioFinal < menorSalario.salarioFinal) {
            menorSalario = funcionario
        }
    }

    const mediaGeral =
        totalSalarios / funcionarios.length

    const mediaFuncionarios =
        totalFuncionarios > 0
            ? salarioFuncionarios / totalFuncionarios
            : 0

    const mediaGerentes =
        totalGerentes > 0
            ? salarioGerentes / totalGerentes
            : 0

    alert(`
RELATÓRIO MENSAL

Quantidade total de funcionários:
${funcionarios.length}

Média salarial geral:
R$ ${mediaGeral.toFixed(2)}

Média salarial dos funcionários:
R$ ${mediaFuncionarios.toFixed(2)}

Média salarial dos gerentes:
R$ ${mediaGerentes.toFixed(2)}

MAIOR SALÁRIO

Código: ${maiorSalario.codigo}
Categoria: ${maiorSalario.categoria}
Turno: ${maiorSalario.turno}
Valor: R$ ${maiorSalario.salarioFinal.toFixed(2)}

MENOR SALÁRIO

Código: ${menorSalario.codigo}
Categoria: ${menorSalario.categoria}
Turno: ${menorSalario.turno}
Valor: R$ ${menorSalario.salarioFinal.toFixed(2)}

BÔNUS

Bônus de 10%: ${bonus10}
Bônus de 5%: ${bonus5}
Bônus de 2%: ${bonus2}
Sem bônus: ${bonusNenhum}
`)
}