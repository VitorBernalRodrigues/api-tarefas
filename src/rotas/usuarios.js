const { Router } = require('express');
const banco = require('../banco');
const { naoEncontrado, invalido } = require('../erros');
const { textoObrigatorio, idDaRota } = require('../validacao');

const rotas = Router();

function buscarUsuario(id) {
  const usuario = banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  if (!usuario) throw naoEncontrado('Usuário');
  return usuario;
}

function lerDados(corpo) {
  const nome = textoObrigatorio(corpo.nome, 'nome');
  const email = textoObrigatorio(corpo.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalido('E-mail inválido.');
  return { nome, email };
}

rotas.get('/', (req, res) => {
  res.json(banco.prepare('SELECT * FROM usuarios ORDER BY nome').all());
});

rotas.get('/:id', (req, res) => {
  res.json(buscarUsuario(idDaRota(req)));
});

rotas.post('/', (req, res) => {
  const { nome, email } = lerDados(req.body ?? {});
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO usuarios (nome, email) VALUES (?, ?)')
    .run(nome, email);
  res.status(201).json(buscarUsuario(lastInsertRowid));
});

rotas.put('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarUsuario(id);
  const { nome, email } = lerDados(req.body ?? {});
  banco.prepare('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?').run(nome, email, id);
  res.json(buscarUsuario(id));
});

rotas.delete('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarUsuario(id);
  banco.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = rotas;
