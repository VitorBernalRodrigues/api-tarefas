import * as banco from '../config/banco.js';

function listar() {
  return banco.prepare('SELECT * FROM usuarios ORDER BY nome').all();
}

function buscarPorId(id) {
  return banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
}

function existe(id) {
  return Boolean(banco.prepare('SELECT 1 FROM usuarios WHERE id = ?').get(id));
}

function criar({ nome, email }) {
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO usuarios (nome, email) VALUES (?, ?)')
    .run(nome, email);
  return lastInsertRowid;
}

function atualizar(id, { nome, email }) {
  banco.prepare('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?').run(nome, email, id);
}

function remover(id) {
  banco.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
}

export { listar, buscarPorId, existe, criar, atualizar, remover };
