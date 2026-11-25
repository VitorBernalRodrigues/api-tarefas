import * as tarefaService from '../services/tarefaService.js';
import * as tarefaView from '../views/tarefaView.js';
import { idDaRota } from '../utils/validacao.js';

async function listar(req, res) {
  res.json(await tarefaService.listar(req.query));
}

async function buscar(req, res) {
  const { tarefa, subtarefas } = await tarefaService.buscarComSubtarefas(idDaRota(req));
  res.json(tarefaView.detalhe(tarefa, subtarefas));
}

async function criar(req, res) {
  res.status(201).json(await tarefaService.criar(req.body ?? {}));
}

async function atualizar(req, res) {
  res.json(await tarefaService.atualizar(idDaRota(req), req.body ?? {}));
}

async function remover(req, res) {
  await tarefaService.remover(idDaRota(req));
  res.status(204).end();
}

async function atribuir(req, res) {
  res.json(await tarefaService.atribuir(idDaRota(req), req.body?.usuario_id));
}

async function iniciar(req, res) {
  res.json(await tarefaService.iniciar(idDaRota(req)));
}

async function concluir(req, res) {
  res.json(await tarefaService.concluir(idDaRota(req)));
}

export { listar, buscar, criar, atualizar, remover, atribuir, iniciar, concluir };
