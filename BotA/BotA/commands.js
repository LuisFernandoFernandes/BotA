const { cadastrarPosicao } = require("./database.js");
const { consultarMovimentacoes } = require("./database.js");

async function trade(interaction) {
    const tipo = interaction.options.getString("tipo");
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const preco = interaction.options.getNumber("preco");
    const quantidade = interaction.options.getNumber("quantidade");

    if (!tipo || !ticker || !preco || !quantidade) {
        return interaction.reply(
            "Por favor, forneça o tipo (compra, venda, dividendo, bonificação), o ticker, o preço e a quantidade."
        );
    }

    await cadastrarPosicao(
        interaction.user.id,
        ticker,
        tipo,
        preco,
        quantidade
    );
    await interaction.reply(
        `Trade de ${quantidade} ações de ${ticker} (${tipo}) registrado com sucesso.`
    );
}

async function portfolio(interaction) {
    let user = interaction.options.getUser("usuario");
    if (!user) {
        user = interaction.user;
    }

    try {
        const posicoes = await getPositions(
            await consultarMovimentacoes(user.id)
        );

        let response = `Portfólio de ${user.username}:\n`;
        for (const ticker in posicoes) {
            const posicao = posicoes[ticker];
            response += `${ticker} - Preço Médio: ${posicao.precoMedio.toFixed(
                2
            )} - Quantidade: ${posicao.quantidade.toFixed(
                2
            )} - Dividendo: ${posicao.dividendo.toFixed(2)}\n`;
        }
        await interaction.reply(response);
    } catch (error) {
        await interaction.reply(
            "Ocorreu um erro ao consultar as movimentações."
        );
    }
}

async function getPositions(movimentacoes) {
    const movimentacoesPorTicker = agruparMovimentacoesPorTicker(movimentacoes);
    const portfolio = {};

    for (const ticker in movimentacoesPorTicker) {
        let dividendo = 0;
        let totalInvestido = 0;
        let quantidade = 0;

        for (const movimentacao of movimentacoesPorTicker[ticker]) {
            switch (movimentacao.tipo.toUpperCase()) {
                case "COMPRA":
                    totalInvestido +=
                        movimentacao.preco * movimentacao.quantidade;
                    quantidade += movimentacao.quantidade;
                    break;
                case "VENDA":
                    quantidade -= movimentacao.quantidade;
                    totalInvestido -=
                        movimentacao.quantidade * portfolio[ticker].precoMedio;
                    break;
                case "DIVIDENDO":
                    dividendo += movimentacao.quantidade * movimentacao.preco;
                    break;
                case "BONIFICAÇÃO":
                    quantidade += movimentacao.quantidade;
                    break;
                default:
                    console.log("Tipo de movimentação inválido");
                    break;
            }
        }

        if (quantidade > 0) {
            portfolio[ticker] = {
                precoMedio: totalInvestido / quantidade,
                quantidade,
                dividendo,
            };
        }
    }

    return portfolio;
}

function agruparMovimentacoesPorTicker(movimentacoes) {
    const movimentacoesPorTicker = {};

    for (const movimentacao of movimentacoes) {
        const { ticker } = movimentacao;
        if (!movimentacoesPorTicker[ticker]) {
            movimentacoesPorTicker[ticker] = [];
        }
        movimentacoesPorTicker[ticker].push(movimentacao);
    }

    return movimentacoesPorTicker;
}

const commands = {
    trade: trade,
    portfolio: portfolio,
};

module.exports = { commands };
