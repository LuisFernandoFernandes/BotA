const sqlite3 = require("sqlite3").verbose();

let db;

function connectDatabase() {
    db = new sqlite3.Database("database.db", (err) => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados:", err.message);
        } else {
            console.log("Conexão com o banco de dados estabelecida.");
            db.run(
                "CREATE TABLE IF NOT EXISTS movimentacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id TEXT, ticker TEXT, tipo TEXT, preco REAL, quantidade REAL)",
                (err) => {
                    if (err) {
                        console.error(
                            "Erro ao criar tabela de movimentacoes:",
                            err.message
                        );
                    } else {
                        console.log(
                            "Tabela de movimentacoes criada com sucesso."
                        );
                    }
                }
            );
        }
    });

    return db;
}

function cadastrarPosicao(usuarioId, ticker, tipo, preco, quantidade) {
    db.run(
        "INSERT INTO movimentacoes (usuario_id, ticker, tipo, preco, quantidade) VALUES (?, ?, ?, ?, ?)",
        [usuarioId, ticker, tipo, preco, quantidade],
        (err) => {
            if (err) {
                console.error("Erro ao cadastrar posição:", err.message);
            } else {
                console.log("Posição cadastrada com sucesso.");
            }
        }
    );
}

module.exports = { connectDatabase, cadastrarPosicao };
