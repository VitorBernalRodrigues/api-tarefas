const banco = require('../config/banco');

function listar() {
  return banco.prepare('SELECT * FROM categorias ORDER BY nome').all();
}

function buscarPorId(id) {
  return banco.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
}

function existe(id) {
  return Boolean(banco.prepare('SELECT 1 FROM categorias WHERE id = ?').get(id));
}

function criar({ nome, descricao }) {
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)')
    .run(nome, descricao);
  return lastInsertRowid;
}

function atualizar(id, { nome, descricao }) {
  banco.prepare('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?').run(nome, descricao, id);
}

function remover(id) {
  banco.prepare('DELETE FROM categorias WHERE id = ?').run(id);
}

module.exports = { listar, buscarPorId, existe, criar, atualizar, remover };
