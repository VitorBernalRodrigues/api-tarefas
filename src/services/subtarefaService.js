import * as Subtarefa from '../models/subtarefaModel.js';
import * as Tarefa from '../models/tarefaModel.js';
import { naoEncontrado, invalido, regraViolada } from '../utils/erros.js';
import * as v from '../utils/validacao.js';
import { paraApi } from '../utils/formato.js';

function lerDados(corpo) {
  const tarefaId = v.idOpcional(corpo.tarefa_id, 'tarefa_id');
  if (!tarefaId) throw invalido('O campo "tarefa_id" é obrigatório.');
  if (corpo.concluida !== undefined && typeof corpo.concluida !== 'boolean') {
    throw invalido('O campo "concluida" deve ser true ou false.');
  }
  return {
    tarefa_id: tarefaId,
    titulo: v.textoObrigatorio(corpo.titulo, 'titulo'),
    concluida: corpo.concluida ?? false,
  };
}

async function conferirTarefaMae(dados) {
  const tarefa = await Tarefa.buscarPorId(dados.tarefa_id);
  if (!tarefa) throw naoEncontrado('Tarefa');
  if (tarefa.status === 'Concluída' && !dados.concluida) {
    throw regraViolada('A tarefa já está concluída: reabra-a antes de adicionar subtarefas pendentes.');
  }
}

async function listar(tarefaId = null) {
  const filtro = tarefaId ? { tarefa_id: tarefaId } : {};
  const subtarefas = await Subtarefa.buscarTodas(filtro);
  return subtarefas.map(paraApi);
}

async function buscarPorId(id) {
  const subtarefa = await Subtarefa.buscarPorId(id);
  if (!subtarefa) throw naoEncontrado('Subtarefa');
  return paraApi(subtarefa);
}

async function criar(corpo) {
  const dados = lerDados(corpo);
  await conferirTarefaMae(dados);
  const id = await Subtarefa.inserir(dados);
  return buscarPorId(id.toHexString());
}

async function atualizar(id, corpo) {
  await buscarPorId(id);
  const dados = lerDados(corpo);
  await conferirTarefaMae(dados);
  await Subtarefa.atualizar(id, dados);
  return buscarPorId(id);
}

async function concluir(id) {
  await buscarPorId(id);
  await Subtarefa.atualizar(id, { concluida: true });
  return buscarPorId(id);
}

async function remover(id) {
  await buscarPorId(id);
  await Subtarefa.remover(id);
}

export { listar, buscarPorId, criar, atualizar, concluir, remover };
