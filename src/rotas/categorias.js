const { Router } = require('express');
const banco = require('../banco');
const { naoEncontrado } = require('../erros');
const { textoObrigatorio, textoOpcional, idDaRota } = require('../validacao');

const rotas = Router();

function buscarCategoria(id) {
  const categoria = banco.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
  if (!categoria) throw naoEncontrado('Categoria');
  return categoria;
}

function lerDados(corpo) {
  return {
    nome: textoObrigatorio(corpo.nome, 'nome'),
    descricao: textoOpcional(corpo.descricao, 'descricao'),
  };
}

rotas.get('/', (req, res) => {
  res.json(banco.prepare('SELECT * FROM categorias ORDER BY nome').all());
});

rotas.get('/:id', (req, res) => {
  res.json(buscarCategoria(idDaRota(req)));
});

rotas.post('/', (req, res) => {
  const { nome, descricao } = lerDados(req.body ?? {});
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO categorias (nome, descricao) VALUES (?, ?)')
    .run(nome, descricao);
  res.status(201).json(buscarCategoria(lastInsertRowid));
});

rotas.put('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarCategoria(id);
  const { nome, descricao } = lerDados(req.body ?? {});
  banco.prepare('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?').run(nome, descricao, id);
  res.json(buscarCategoria(id));
});

rotas.delete('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarCategoria(id);
  banco.prepare('DELETE FROM categorias WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = rotas;
