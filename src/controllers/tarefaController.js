import * as Tarefa from '../models/tarefaModel.js';
import * as Usuario from '../models/usuarioModel.js';
import * as Categoria from '../models/categoriaModel.js';
import * as Subtarefa from '../models/subtarefaModel.js';
import * as regras from '../models/regras.js';
import * as tarefaView from '../views/tarefaView.js';
import { naoEncontrado, invalido } from '../utils/erros.js';
import * as v from '../utils/validacao.js';

const STATUS_VALIDOS = ['Pendente', 'Em Andamento', 'Concluída'];

function buscarTarefa(id) {
  const tarefa = Tarefa.buscarPorId(id);
  if (!tarefa) throw naoEncontrado('Tarefa');
  return tarefa;
}

function conferirRelacionamentos(dados) {
  if (dados.usuario_id && !Usuario.existe(dados.usuario_id)) {
    throw naoEncontrado('Usuário');
  }
  if (dados.categoria_id && !Categoria.existe(dados.categoria_id)) {
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

function aplicarRegras(nova, atual) {
  const mudouResponsavel = nova.usuario_id && nova.usuario_id !== atual?.usuario_id;

  if (mudouResponsavel) {
    regras.verificarUsuarioSemAtraso(nova.usuario_id);
  }

  if (nova.status === 'Em Andamento') {
    if (!nova.usuario_id) throw invalido('Atribua um responsável antes de iniciar a tarefa.');
    if (atual?.status !== 'Em Andamento' || mudouResponsavel) {
      regras.verificarLimiteEmAndamento(nova.usuario_id, atual?.id ?? 0);
    }
  }

  if (nova.status === 'Concluída' && atual && atual.status !== 'Concluída') {
    regras.verificarSubtarefasConcluidas(atual.id);
  }
}

function dataConclusao(nova, atual) {
  if (nova.status !== 'Concluída') return null;
  if (atual?.status === 'Concluída') return atual.concluida_em;
  return new Date().toLocaleString('sv-SE');
}

function salvarAlteracoes(atual, nova) {
  conferirRelacionamentos(nova);
  aplicarRegras(nova, atual);
  Tarefa.atualizar(atual.id, { ...nova, concluida_em: dataConclusao(nova, atual) });
  return buscarTarefa(atual.id);
}

function listar(req, res) {
  const filtros = {};
  if (req.query.status) {
    filtros.status = req.query.status;
  }
  if (req.query.usuario_id) {
    filtros.usuario_id = v.idOpcional(req.query.usuario_id, 'usuario_id');
  }
  if (req.query.categoria_id) {
    filtros.categoria_id = v.idOpcional(req.query.categoria_id, 'categoria_id');
  }
  if (req.query.atrasadas === 'true') {
    filtros.atrasadas = true;
  }
  res.json(Tarefa.listar(filtros));
}

function buscar(req, res) {
  const tarefa = buscarTarefa(v.idDaRota(req));
  res.json(tarefaView.detalhe(tarefa, Subtarefa.listarPorTarefa(tarefa.id)));
}

function criar(req, res) {
  const nova = lerDados(req.body ?? {});
  conferirRelacionamentos(nova);
  aplicarRegras(nova, null);
  const id = Tarefa.criar({ ...nova, concluida_em: dataConclusao(nova, null) });
  res.status(201).json(buscarTarefa(id));
}

function atualizar(req, res) {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(salvarAlteracoes(atual, lerDados(req.body ?? {})));
}

function remover(req, res) {
  const tarefa = buscarTarefa(v.idDaRota(req));
  Tarefa.remover(tarefa.id);
  res.status(204).end();
}

function atribuir(req, res) {
  const atual = buscarTarefa(v.idDaRota(req));
  const usuarioId = v.idOpcional(req.body?.usuario_id, 'usuario_id');
  if (!usuarioId) throw invalido('Informe o "usuario_id".');
  res.json(salvarAlteracoes(atual, { ...atual, usuario_id: usuarioId }));
}

function iniciar(req, res) {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(salvarAlteracoes(atual, { ...atual, status: 'Em Andamento' }));
}

function concluir(req, res) {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(salvarAlteracoes(atual, { ...atual, status: 'Concluída' }));
}

export { listar, buscar, criar, atualizar, remover, atribuir, iniciar, concluir };
