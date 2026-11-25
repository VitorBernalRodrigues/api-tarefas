import * as usuarioService from '../services/usuarioService.js';
import * as usuarioView from '../views/usuarioView.js';
import { idDaRota } from '../utils/validacao.js';
import { hoje } from '../services/regras.js';

async function listar(req, res) {
  res.json(await usuarioService.listar());
}

async function buscar(req, res) {
  res.json(await usuarioService.buscarPorId(idDaRota(req)));
}

async function criar(req, res) {
  res.status(201).json(await usuarioService.criar(req.body ?? {}));
}

async function atualizar(req, res) {
  res.json(await usuarioService.atualizar(idDaRota(req), req.body ?? {}));
}

async function remover(req, res) {
  await usuarioService.remover(idDaRota(req));
  res.status(204).end();
}

async function historico(req, res) {
  const { usuario, tarefas } = await usuarioService.historico(idDaRota(req));
  res.json(usuarioView.historico(usuario, tarefas, hoje()));
}

export { listar, buscar, criar, atualizar, remover, historico };
