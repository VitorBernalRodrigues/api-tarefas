import * as subtarefaService from '../services/subtarefaService.js';
import * as v from '../utils/validacao.js';

async function listar(req, res) {
  const tarefaId = req.query.tarefa_id ? v.idOpcional(req.query.tarefa_id, 'tarefa_id') : null;
  res.json(await subtarefaService.listar(tarefaId));
}

async function buscar(req, res) {
  res.json(await subtarefaService.buscarPorId(v.idDaRota(req)));
}

async function criar(req, res) {
  res.status(201).json(await subtarefaService.criar(req.body ?? {}));
}

async function atualizar(req, res) {
  res.json(await subtarefaService.atualizar(v.idDaRota(req), req.body ?? {}));
}

async function concluir(req, res) {
  res.json(await subtarefaService.concluir(v.idDaRota(req)));
}

async function remover(req, res) {
  await subtarefaService.remover(v.idDaRota(req));
  res.status(204).end();
}

export { listar, buscar, criar, atualizar, concluir, remover };
