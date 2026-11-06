import * as banco from '../config/banco.js';
import { hoje } from './regras.js';

function listar(filtros) {
  const condicoes = [];
  const valores = [];
  if (filtros.status) {
    condicoes.push('status = ?');
    valores.push(filtros.status);
  }
  if (filtros.usuario_id) {
    condicoes.push('usuario_id = ?');
    valores.push(filtros.usuario_id);
  }
  if (filtros.categoria_id) {
    condicoes.push('categoria_id = ?');
    valores.push(filtros.categoria_id);
  }
  if (filtros.atrasadas) {
    condicoes.push("status <> 'Concluída' AND prazo < ?");
    valores.push(hoje());
  }
  const where = condicoes.length ? 'WHERE ' + condicoes.join(' AND ') : '';
  return banco.prepare(`SELECT * FROM tarefas ${where} ORDER BY prazo IS NULL, prazo`).all(...valores);
}

function listarPorUsuario(usuarioId) {
  return banco
    .prepare('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY criado_em DESC')
    .all(usuarioId);
}

function buscarPorId(id) {
  return banco.prepare('SELECT * FROM tarefas WHERE id = ?').get(id);
}

function criar(tarefa) {
  const { lastInsertRowid } = banco
    .prepare(`INSERT INTO tarefas (titulo, descricao, status, prazo, usuario_id, categoria_id, concluida_em)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(tarefa.titulo, tarefa.descricao, tarefa.status, tarefa.prazo,
         tarefa.usuario_id, tarefa.categoria_id, tarefa.concluida_em);
  return lastInsertRowid;
}

function atualizar(id, tarefa) {
  banco
    .prepare(`UPDATE tarefas SET titulo = ?, descricao = ?, status = ?, prazo = ?,
              usuario_id = ?, categoria_id = ?, concluida_em = ? WHERE id = ?`)
    .run(tarefa.titulo, tarefa.descricao, tarefa.status, tarefa.prazo,
         tarefa.usuario_id, tarefa.categoria_id, tarefa.concluida_em, id);
}

function remover(id) {
  banco.prepare('DELETE FROM tarefas WHERE id = ?').run(id);
}

export { listar, listarPorUsuario, buscarPorId, criar, atualizar, remover };
