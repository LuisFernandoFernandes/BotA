const Discord = require("discord.js");
const { connectDatabase } = require("./database.js");
const { commands } = require("./commands.js");
const { commandsData } = require("./commandsData.js");
const { token } = require("../config.json");
const client = new Discord.Client({ intents: 32767 });

const db = connectDatabase();

client.once("ready", async () => {
    console.log(`Bot está pronto como ${client.user.tag}!`);

    const existingCommands = await client.application.commands.fetch();

    const commandNames = Object.keys(commands);

    const commandsToDelete = existingCommands.filter(
        (command) => !commandNames.includes(command.name)
    );

    // Exclui os comandos que não estão na lista
    for (const command of commandsToDelete.values()) {
        try {
            await client.application.commands.delete(command.id);
            console.log(`Comando ${command.name} removido com sucesso`);
        } catch (error) {
            console.error(`Erro ao remover o comando ${command.name}:`, error);
        }
    }

    for (const commandName in commands) {
        client.user.setActivity(`/${commandName}`, { type: "WATCHING" });
    }

    try {
        for (const commandData of commandsData) {
            const command = await client.application?.commands.create(
                commandData
            );
            console.log("Comando criado:", command);
        }
    } catch (error) {
        console.error("Erro ao criar comando:", error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    const commandFunction = commands[commandName];
    console.log(commands);
    console.log(commandName);
    console.log(commandFunction);

    if (typeof commandFunction === "function") {
        await commandFunction(interaction, options);
    } else {
        console.error(
            `Comando ${commandName} não encontrado ou não é uma função.`
        );
    }
});

client.login(token);
