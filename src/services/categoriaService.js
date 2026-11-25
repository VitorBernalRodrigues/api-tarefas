import * as Categoria from '../models/categoriaModel.js';
import * as Tarefa from '../models/tarefaModel.js';
import { naoEncontrado, conflito } from '../utils/erros.js';
import { textoObrigatorio, textoOpcional } from '../utils/validacao.js';
import { paraApi } from '../utils/formato.js';

function lerDados(corpo) {
  return {
    nome: textoObrigatorio(corpo.nome, 'nome'),
    descricao: textoOpcional(corpo.descricao, 'descricao'),
  };
}

async function conferirNomeUnico(nome, idAtual = null) {
  const mesmas = await Categoria.buscarTodas({ nome });
  if (mesmas.some((c) => c._id.toHexString() !== idAtual)) {
    throw conflito('Já existe uma categoria com esse nome.');
  }
}

async function listar() {
  const categorias = await Categoria.buscarTodas();
  return categorias.map(paraApi).sort((a, b) => a.nome.localeCompare(b.nome));
}

async function buscarPorId(id) {
  const categoria = await Categoria.buscarPorId(id);
  if (!categoria) throw naoEncontrado('Categoria');
  return paraApi(categoria);
}

async function criar(corpo) {
  const dados = lerDados(corpo);
  await conferirNomeUnico(dados.nome);
  const id = await Categoria.inserir(dados);
  return buscarPorId(id.toHexString());
}

async function atualizar(id, corpo) {
  await buscarPorId(id);
  const dados = lerDados(corpo);
  await conferirNomeUnico(dados.nome, id);
  await Categoria.atualizar(id, dados);
  return buscarPorId(id);
}

async function remover(id) {
  await buscarPorId(id);
  const tarefas = await Tarefa.buscarTodas({ categoria_id: id });
  for (const tarefa of tarefas) {
    await Tarefa.atualizar(tarefa._id.toHexString(), { categoria_id: null });
  }
  await Categoria.remover(id);
}

export { listar, buscarPorId, criar, atualizar, remover };
