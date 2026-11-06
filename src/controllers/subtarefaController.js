import * as Subtarefa from '../models/subtarefaModel.js';
import * as Tarefa from '../models/tarefaModel.js';
import { naoEncontrado, invalido, regraViolada } from '../utils/erros.js';
import * as v from '../utils/validacao.js';

function buscarSubtarefa(id) {
  const subtarefa = Subtarefa.buscarPorId(id);
  if (!subtarefa) throw naoEncontrado('Subtarefa');
  return subtarefa;
}

function buscarTarefaMae(tarefaId) {
  const tarefa = Tarefa.buscarPorId(tarefaId);
  if (!tarefa) throw naoEncontrado('Tarefa');
  return tarefa;
}

function lerDados(corpo) {
  const tarefaId = v.idOpcional(corpo.tarefa_id, 'tarefa_id');
  if (!tarefaId) throw invalido('O campo "tarefa_id" é obrigatório.');
  if (corpo.concluida !== undefined && typeof corpo.concluida !== 'boolean') {
    throw invalido('O campo "concluida" deve ser true ou false.');
  }
  return {
    tarefa_id: tarefaId,
    titulo: v.textoObrigatorio(corpo.titulo, 'titulo'),
    concluida: corpo.concluida ? 1 : 0,
  };
}

function conferirTarefaMae(dados) {
  const tarefa = buscarTarefaMae(dados.tarefa_id);
  if (tarefa.status === 'Concluída' && !dados.concluida) {
    throw regraViolada('A tarefa já está concluída: reabra-a antes de adicionar subtarefas pendentes.');
  }
}

function listar(req, res) {
  if (req.query.tarefa_id) {
    const tarefaId = v.idOpcional(req.query.tarefa_id, 'tarefa_id');
    return res.json(Subtarefa.listarPorTarefa(tarefaId));
  }
  res.json(Subtarefa.listar());
}

function buscar(req, res) {
  res.json(buscarSubtarefa(v.idDaRota(req)));
}

function criar(req, res) {
  const dados = lerDados(req.body ?? {});
  conferirTarefaMae(dados);
  const id = Subtarefa.criar(dados);
  res.status(201).json(buscarSubtarefa(id));
}

function atualizar(req, res) {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  const dados = lerDados(req.body ?? {});
  conferirTarefaMae(dados);
  Subtarefa.atualizar(id, dados);
  res.json(buscarSubtarefa(id));
}

function concluir(req, res) {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  Subtarefa.concluir(id);
  res.json(buscarSubtarefa(id));
}

function remover(req, res) {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  Subtarefa.remover(id);
  res.status(204).end();
}

export { listar, buscar, criar, atualizar, concluir, remover };
