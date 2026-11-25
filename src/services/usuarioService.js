import * as Usuario from '../models/usuarioModel.js';
import * as Tarefa from '../models/tarefaModel.js';
import { naoEncontrado, invalido, conflito } from '../utils/erros.js';
import { textoObrigatorio } from '../utils/validacao.js';
import { paraApi } from '../utils/formato.js';

function lerDados(corpo) {
  const nome = textoObrigatorio(corpo.nome, 'nome');
  const email = textoObrigatorio(corpo.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalido('E-mail inválido.');
  return { nome, email };
}

async function conferirEmailUnico(email, idAtual = null) {
  const mesmos = await Usuario.buscarTodas({ email });
  if (mesmos.some((u) => u._id.toHexString() !== idAtual)) {
    throw conflito('Já existe um usuário com esse e-mail.');
  }
}

async function listar() {
  const usuarios = await Usuario.buscarTodas();
  return usuarios.map(paraApi).sort((a, b) => a.nome.localeCompare(b.nome));
}

async function buscarPorId(id) {
  const usuario = await Usuario.buscarPorId(id);
  if (!usuario) throw naoEncontrado('Usuário');
  return paraApi(usuario);
}

async function criar(corpo) {
  const dados = lerDados(corpo);
  await conferirEmailUnico(dados.email);
  const id = await Usuario.inserir({ ...dados, criado_em: new Date().toLocaleString('sv-SE') });
  return buscarPorId(id.toHexString());
}

async function atualizar(id, corpo) {
  await buscarPorId(id);
  const dados = lerDados(corpo);
  await conferirEmailUnico(dados.email, id);
  await Usuario.atualizar(id, dados);
  return buscarPorId(id);
}

async function remover(id) {
  await buscarPorId(id);
  const tarefas = await Tarefa.buscarTodas({ usuario_id: id });
  for (const tarefa of tarefas) {
    await Tarefa.atualizar(tarefa._id.toHexString(), { usuario_id: null });
  }
  await Usuario.remover(id);
}

async function historico(id) {
  const usuario = await buscarPorId(id);
  const tarefas = (await Tarefa.buscarTodas({ usuario_id: id }))
    .map(paraApi)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  return { usuario, tarefas };
}

export { listar, buscarPorId, criar, atualizar, remover, historico };
