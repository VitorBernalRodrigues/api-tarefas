import * as categoriaService from '../services/categoriaService.js';
import { lista } from '../utils/resposta.js';
import { idDaRota } from '../utils/validacao.js';

async function listar(req, res) {
  res.json(lista(await categoriaService.listar()));
}

async function buscar(req, res) {
  res.json(await categoriaService.buscarPorId(idDaRota(req)));
}

async function criar(req, res) {
  res.status(201).json(await categoriaService.criar(req.body ?? {}));
}

async function atualizar(req, res) {
  res.json(await categoriaService.atualizar(idDaRota(req), req.body ?? {}));
}

async function remover(req, res) {
  await categoriaService.remover(idDaRota(req));
  res.status(204).end();
}

export { listar, buscar, criar, atualizar, remover };
