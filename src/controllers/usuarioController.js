import * as Usuario from '../models/usuarioModel.js';
import * as Tarefa from '../models/tarefaModel.js';
import * as usuarioView from '../views/usuarioView.js';
import { naoEncontrado, invalido } from '../utils/erros.js';
import { textoObrigatorio, idDaRota } from '../utils/validacao.js';
import { hoje } from '../models/regras.js';

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

export { listar, buscar, criar, atualizar, remover, historico };
