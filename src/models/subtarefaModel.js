import { ObjectId } from 'mongodb';
import { obterBanco } from '../config/banco.js';

function colecao() {
  return obterBanco().collection('subtarefas');
}

export async function inserir(subtarefa) {
  const resultado = await colecao().insertOne(subtarefa);
  return resultado.insertedId;
}

export async function buscarTodas(filtro = {}) {
  return colecao().find(filtro).toArray();
}

export async function buscarPorId(id) {
  if (!ObjectId.isValid(id)) return null;
  return colecao().findOne({ _id: new ObjectId(id) });
}

export async function atualizar(id, campos) {
  if (!ObjectId.isValid(id)) return false;
  const resultado = await colecao().updateOne({ _id: new ObjectId(id) }, { $set: campos });
  return resultado.matchedCount > 0;
}

export async function remover(id) {
  if (!ObjectId.isValid(id)) return false;
  const resultado = await colecao().deleteOne({ _id: new ObjectId(id) });
  return resultado.deletedCount > 0;
}
