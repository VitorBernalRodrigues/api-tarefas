import * as Categoria from '../models/categoriaModel.js';
import { naoEncontrado } from '../utils/erros.js';
import { textoObrigatorio, textoOpcional, idDaRota } from '../utils/validacao.js';

function buscarCategoria(id) {
  const categoria = Categoria.buscarPorId(id);
  if (!categoria) throw naoEncontrado('Categoria');
  return categoria;
}

function lerDados(corpo) {
  return {
    nome: textoObrigatorio(corpo.nome, 'nome'),
    descricao: textoOpcional(corpo.descricao, 'descricao'),
  };
}

function listar(req, res) {
  res.json(Categoria.listar());
}

function buscar(req, res) {
  res.json(buscarCategoria(idDaRota(req)));
}

function criar(req, res) {
  const id = Categoria.criar(lerDados(req.body ?? {}));
  res.status(201).json(buscarCategoria(id));
}

function atualizar(req, res) {
  const id = idDaRota(req);
  buscarCategoria(id);
  Categoria.atualizar(id, lerDados(req.body ?? {}));
  res.json(buscarCategoria(id));
}

function remover(req, res) {
  const id = idDaRota(req);
  buscarCategoria(id);
  Categoria.remover(id);
  res.status(204).end();
}

export { listar, buscar, criar, atualizar, remover };
