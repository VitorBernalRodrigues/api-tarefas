const { DatabaseSync } = require('node:sqlite');

const banco = new DatabaseSync(process.env.DB_ARQUIVO || 'dados.db');

banco.exec('PRAGMA foreign_keys = ON');

banco.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL UNIQUE,
    descricao TEXT
  );

  CREATE TABLE IF NOT EXISTS tarefas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo       TEXT NOT NULL,
    descricao    TEXT,
    status       TEXT NOT NULL DEFAULT 'Pendente'
                 CHECK (status IN ('Pendente', 'Em Andamento', 'Concluída')),
    prazo        TEXT,
    usuario_id   INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    criado_em    TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    concluida_em TEXT
  );

  CREATE TABLE IF NOT EXISTS subtarefas (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    tarefa_id INTEGER NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
    titulo    TEXT NOT NULL,
    concluida INTEGER NOT NULL DEFAULT 0 CHECK (concluida IN (0, 1))
  );
`);

module.exports = banco;
