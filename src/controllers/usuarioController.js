const Usuario = require('../models/usuarioModel');
const Tarefa = require('../models/tarefaModel');
const usuarioView = require('../views/usuarioView');
const { naoEncontrado, invalido } = require('../utils/erros');
const { textoObrigatorio, idDaRota } = require('../utils/validacao');
const { hoje } = require('../models/regras');

function buscarUsuario(id) {
  const usuario = Usuario.buscarPorId(id);
  if (!usuario) throw naoEncontrado('Usuário');
  return usuario;
}

function lerDados(corpo) {
  const nome = textoObrigatorio(corpo.nome, 'nome');
  const email = textoObrigatorio(corpo.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalido('E-mail inválido.');
  return { nome, email };
}

function listar(req, res) {
  res.json(Usuario.listar());
}

function buscar(req, res) {
  res.json(buscarUsuario(idDaRota(req)));
}

function criar(req, res) {
  const id = Usuario.criar(lerDados(req.body ?? {}));
  res.status(201).json(buscarUsuario(id));
}

function atualizar(req, res) {
  const id = idDaRota(req);
  buscarUsuario(id);
  Usuario.atualizar(id, lerDados(req.body ?? {}));
  res.json(buscarUsuario(id));
}

function remover(req, res) {
  const id = idDaRota(req);
  buscarUsuario(id);
  Usuario.remover(id);
  res.status(204).end();
}

function historico(req, res) {
  const usuario = buscarUsuario(idDaRota(req));
  const tarefas = Tarefa.listarPorUsuario(usuario.id);
  res.json(usuarioView.historico(usuario, tarefas, hoje()));
}

module.exports = { listar, buscar, criar, atualizar, remover, historico };
