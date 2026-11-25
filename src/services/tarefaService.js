import * as Tarefa from '../models/tarefaModel.js';
import * as Usuario from '../models/usuarioModel.js';
import * as Categoria from '../models/categoriaModel.js';
import * as Subtarefa from '../models/subtarefaModel.js';
import * as regras from './regras.js';
import { naoEncontrado, invalido } from '../utils/erros.js';
import * as v from '../utils/validacao.js';
import { paraApi } from '../utils/formato.js';

const STATUS_VALIDOS = ['Pendente', 'Em Andamento', 'Concluída'];

function camposEditaveis(tarefa) {
  return {
    titulo: tarefa.titulo,
    descricao: tarefa.descricao,
    status: tarefa.status,
    prazo: tarefa.prazo,
    usuario_id: tarefa.usuario_id,
    categoria_id: tarefa.categoria_id,
  };
}

async function conferirRelacionamentos(dados) {
  if (dados.usuario_id && !(await Usuario.buscarPorId(dados.usuario_id))) {
    throw naoEncontrado('Usuário');
  }
  if (dados.categoria_id && !(await Categoria.buscarPorId(dados.categoria_id))) {
    throw naoEncontrado('Categoria');
  }
}

function lerDados(corpo) {
  const status = corpo.status ?? 'Pendente';
  if (!STATUS_VALIDOS.includes(status)) {
    throw invalido(`Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`);
  }
  return {
    titulo: v.textoObrigatorio(corpo.titulo, 'titulo'),
    descricao: v.textoOpcional(corpo.descricao, 'descricao'),
    status,
    prazo: v.dataOpcional(corpo.prazo, 'prazo'),
    usuario_id: v.idOpcional(corpo.usuario_id, 'usuario_id'),
    categoria_id: v.idOpcional(corpo.categoria_id, 'categoria_id'),
  };
}

async function aplicarRegras(nova, atual) {
  const mudouResponsavel = nova.usuario_id && nova.usuario_id !== atual?.usuario_id;

  if (mudouResponsavel) {
    await regras.verificarUsuarioSemAtraso(nova.usuario_id);
  }

  if (nova.status === 'Em Andamento') {
    if (!nova.usuario_id) throw invalido('Atribua um responsável antes de iniciar a tarefa.');
    if (atual?.status !== 'Em Andamento' || mudouResponsavel) {
      await regras.verificarLimiteEmAndamento(nova.usuario_id, atual?.id ?? null);
    }
  }

  if (nova.status === 'Concluída' && atual && atual.status !== 'Concluída') {
    await regras.verificarSubtarefasConcluidas(atual.id);
  }
}

function dataConclusao(nova, atual) {
  if (nova.status !== 'Concluída') return null;
  if (atual?.status === 'Concluída') return atual.concluida_em;
  return new Date().toLocaleString('sv-SE');
}

function porPrazo(a, b) {
  if (!a.prazo) return b.prazo ? 1 : 0;
  if (!b.prazo) return -1;
  return a.prazo.localeCompare(b.prazo);
}

async function salvarAlteracoes(atual, nova) {
  await conferirRelacionamentos(nova);
  await aplicarRegras(nova, atual);
  await Tarefa.atualizar(atual.id, { ...camposEditaveis(nova), concluida_em: dataConclusao(nova, atual) });
  return buscarPorId(atual.id);
}

async function listar(query = {}) {
  const filtro = {};
  if (query.status) {
    filtro.status = query.status;
  }
  if (query.usuario_id) {
    filtro.usuario_id = v.idOpcional(query.usuario_id, 'usuario_id');
  }
  if (query.categoria_id) {
    filtro.categoria_id = v.idOpcional(query.categoria_id, 'categoria_id');
  }
  let tarefas = (await Tarefa.buscarTodas(filtro)).map(paraApi);
  if (query.atrasadas === 'true') {
    const dataHoje = regras.hoje();
    tarefas = tarefas.filter((t) => regras.estaAtrasada(t, dataHoje));
  }
  return tarefas.sort(porPrazo);
}

async function buscarPorId(id) {
  const tarefa = await Tarefa.buscarPorId(id);
  if (!tarefa) throw naoEncontrado('Tarefa');
  return paraApi(tarefa);
}

async function buscarComSubtarefas(id) {
  const tarefa = await buscarPorId(id);
  const subtarefas = (await Subtarefa.buscarTodas({ tarefa_id: id })).map(paraApi);
  return { tarefa, subtarefas };
}

async function criar(corpo) {
  const nova = lerDados(corpo);
  await conferirRelacionamentos(nova);
  await aplicarRegras(nova, null);
  const id = await Tarefa.inserir({
    ...nova,
    criado_em: new Date().toLocaleString('sv-SE'),
    concluida_em: dataConclusao(nova, null),
  });
  return buscarPorId(id.toHexString());
}

async function atualizar(id, corpo) {
  const atual = await buscarPorId(id);
  return salvarAlteracoes(atual, lerDados(corpo));
}

async function remover(id) {
  await buscarPorId(id);
  const subtarefas = await Subtarefa.buscarTodas({ tarefa_id: id });
  for (const subtarefa of subtarefas) {
    await Subtarefa.remover(subtarefa._id.toHexString());
  }
  await Tarefa.remover(id);
}

async function atribuir(id, usuarioId) {
  const atual = await buscarPorId(id);
  const usuario = v.idOpcional(usuarioId, 'usuario_id');
  if (!usuario) throw invalido('Informe o "usuario_id".');
  return salvarAlteracoes(atual, { ...atual, usuario_id: usuario });
}

async function iniciar(id) {
  const atual = await buscarPorId(id);
  return salvarAlteracoes(atual, { ...atual, status: 'Em Andamento' });
}

async function concluir(id) {
  const atual = await buscarPorId(id);
  return salvarAlteracoes(atual, { ...atual, status: 'Concluída' });
}

export {
  listar,
  buscarPorId,
  buscarComSubtarefas,
  criar,
  atualizar,
  remover,
  atribuir,
  iniciar,
  concluir,
};
