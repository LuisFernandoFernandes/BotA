const { cadastrarPosicao } = require("./database.js");

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

    await interaction.reply(`Mostrando portfólio de ${user.username}.`);
}

const commands = {
    trade: trade,
    portfolio: portfolio,
};

module.exports = { commands };
