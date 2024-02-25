const axios = require("axios");
const { database } = require("./database.js");

async function trade(interaction) {
    const tipo = interaction.options.getString("tipo");
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const preco = interaction.options.getNumber("preco");
    const quantidade = interaction.options.getNumber("quantidade");
    let data = interaction.options.getString("data");

    if (!tipo || !ticker || !preco || !quantidade) {
        return interaction.reply(
            "Por favor, forneça o tipo (compra, venda, dividendo, bonificação), o ticker, o preço e a quantidade."
        );
    }

    if (!data) {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, "0");
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const year = now.getFullYear().toString();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        data = `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
    }

    database.cadastrarPosicao(
        interaction.user.id,
        ticker,
        tipo,
        preco,
        quantidade,
        data
    );

    await interaction.reply(
        `Trade de ${quantidade} ações de ${ticker} (${tipo}) registrado com sucesso.`
    );
}

async function portfolio(interaction) {
    const user = getUser(interaction);
    const query = "SELECT * FROM movimentacoes WHERE usuario_id = ?";
    const params = [user.id];
    const error = "Erro ao consultar movimentações:";

    try {
        const posicoes = await getPositions(
            await database.getConsulta(query, params, error)
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

async function showtrades(interaction) {
    const userId = await getUser(interaction).id;
    const options = interaction.options;
    const tipo = options.getString("tipo");
    const ticker = options.getString("ticker")?.toUpperCase();
    const dataInicial = options.getString("dataInicial");
    const dataFinal = options.getString("dataFinal");

    let query = "SELECT * FROM movimentacoes WHERE usuario_id = ?";
    let params = [userId];

    if (ticker) {
        query += " AND ticker = ?";
        params.push(ticker);
    }

    if (tipo) {
        query += " AND tipo = ?";
        params.push(tipo);
    }

    if (dataInicial && dataFinal) {
        const dataInicialFormatada = formatarData(dataInicial);
        const dataFinalFormatada = formatarData(dataFinal);
        query += " AND data BETWEEN ? AND ?";
        params.push(dataInicialFormatada, dataFinalFormatada);
    }

    try {
        const movimentacoes = await database.getConsulta(query, params);
        let response = `Movimentações do usuário:\n`;
        movimentacoes.forEach((movimentacao) => {
            response += `${movimentacao.data}    ${movimentacao.tipo}    ${movimentacao.ticker}    ${movimentacao.quantidade}    R$${movimentacao.preco}\n`;
        });
        await interaction.reply(response);
    } catch (error) {
        await interaction.reply(
            "Ocorreu um erro ao consultar as movimentações."
        );
    }
}

function formatarData(data) {
    const partesData = data.split("/");
    const dia = partesData[0];
    const mes = partesData[1];
    const ano =
        partesData.length === 2
            ? new Date().getFullYear().toString().slice(-2)
            : partesData[2].slice(-2);

    return `${dia}/${mes}/${ano}-${new Date().toLocaleTimeString("pt-BR", {
        hour12: false,
    })}`;
}

function getUser(interaction) {
    let user = interaction.options.getUser("usuario");
    if (!user) {
        user = interaction.user;
    }
    return user;
}

async function stock(interaction) {
    const ticker = interaction.options.getString("ticker");

    const url = `http://localhost:5000/companyinfo/stock/${ticker}`;
    console.log(url);

    try {
        const response = await axios.get(url);

        if (response.status !== 200) {
            throw new Error(`Erro ao obter os dados da ação ${ticker}`);
        }

        const data = response.data;

        // Exibe os dados da ação
        let message = `Dados da ação ${ticker}:\n`;
        let responseData = JSON.stringify(data, null, 2);

        // Divide a mensagem em partes menores
        const maxLength = 1900; // Limite de caracteres por mensagem
        let parts = [];
        while (responseData.length > 0) {
            parts.push(responseData.slice(0, maxLength));
            responseData = responseData.slice(maxLength);
        }

        // Envia a primeira parte da mensagem como resposta inicial
        await interaction.reply(parts.shift());

        // Envia as partes restantes como mensagens de acompanhamento
        for (const part of parts) {
            await interaction.followUp(part);
        }
    } catch (error) {
        console.error("Erro ao fazer a requisição:", error);
        await interaction.reply(`Erro ao obter os dados da ação ${ticker}`);
    }
}

const commands = {
    trade: trade,
    showtrades: showtrades,
    portfolio: portfolio,
    stock: stock,
};

module.exports = { commands };
