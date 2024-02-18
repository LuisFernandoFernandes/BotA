const commandsData = [
    {
        name: "trade",
        description: "Registra uma movimentação na carteira de ações.",
        options: [
            {
                name: "tipo",
                description:
                    "O tipo de movimentação (compra, venda, dividendo, bonificação).",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Compra",
                        value: "compra",
                    },
                    {
                        name: "Venda",
                        value: "venda",
                    },
                    {
                        name: "Dividendo",
                        value: "dividendo",
                    },
                    {
                        name: "Bonificação",
                        value: "bonificacao",
                    },
                ],
            },
            {
                name: "ticker",
                description: "O ticker da ação.",
                type: 3,
                required: true,
            },
            {
                name: "preco",
                description: "O preço da ação.",
                type: 10,
                required: true,
            },
            {
                name: "quantidade",
                description: "A quantidade de ações.",
                type: 10,
                required: true,
            },
            {
                name: "data",
                description:
                    "A data da movimentação (formato: DD/MM/AAAA-HH:MM:SS).",
                type: 3,
                required: false,
            },
        ],
    },
    {
        name: "portfolio",
        description: "Mostra a carteira de ações de um usuário.",
        options: [
            {
                name: "usuario",
                description:
                    "O usuário para o qual deseja verificar o portfólio.",
                type: 6, // Tipo 6 representa um usuário
                required: false, // Não é obrigatório fornecer esse valor
            },
        ],
    },
];

module.exports = { commandsData };
