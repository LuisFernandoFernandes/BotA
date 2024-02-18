const sqlite3 = require("sqlite3").verbose();

let db;

function connectDatabase() {
    db = new sqlite3.Database("database.db", (err) => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados:", err.message);
        } else {
            console.log("Conexão com o banco de dados estabelecida.");
            db.run(
                "CREATE TABLE IF NOT EXISTS movimentacoes (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id TEXT, ticker TEXT, tipo TEXT, preco REAL, quantidade REAL, data TEXT)",
                (err) => {
                    if (err) {
                        console.error(
                            "Erro ao criar tabela de movimentacoes:",
                            err.message
                        );
                    }
                }
            );
        }
    });

    return db;
}

function cadastrarPosicao(usuarioId, ticker, tipo, preco, quantidade, data) {
    db.run(
        "INSERT INTO movimentacoes (usuario_id, ticker, tipo, preco, quantidade, data) VALUES (?, ?, ?, ?, ?, ?)",
        [usuarioId, ticker, tipo, preco, quantidade, data],
        (err) => {
            if (err) {
                console.error("Erro ao cadastrar posição:", err.message);
            } else {
                console.log("Posição cadastrada com sucesso.");
            }
        }
    );
}

function getConsulta(query, params, error = "") {
    console.log(query);
    console.log(params.join(","));
    return new Promise((resolve, reject) => {
        db.all(query, params.join(","), (err, rows) => {
            if (err) {
                console.error(error, err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const database = {
    connectDatabase,
    cadastrarPosicao,
    getConsulta,
};

module.exports = {
    database,
};
