import * as banco from '../config/banco.js';

function listar() {
  return banco.prepare('SELECT * FROM subtarefas').all();
}

function listarPorTarefa(tarefaId) {
  return banco.prepare('SELECT * FROM subtarefas WHERE tarefa_id = ?').all(tarefaId);
}

function buscarPorId(id) {
  return banco.prepare('SELECT * FROM subtarefas WHERE id = ?').get(id);
}

function criar({ tarefa_id, titulo, concluida }) {
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO subtarefas (tarefa_id, titulo, concluida) VALUES (?, ?, ?)')
    .run(tarefa_id, titulo, concluida);
  return lastInsertRowid;
}

function atualizar(id, { tarefa_id, titulo, concluida }) {
  banco
    .prepare('UPDATE subtarefas SET tarefa_id = ?, titulo = ?, concluida = ? WHERE id = ?')
    .run(tarefa_id, titulo, concluida, id);
}

function concluir(id) {
  banco.prepare('UPDATE subtarefas SET concluida = 1 WHERE id = ?').run(id);
}

function remover(id) {
  banco.prepare('DELETE FROM subtarefas WHERE id = ?').run(id);
}

export { listar, listarPorTarefa, buscarPorId, criar, atualizar, concluir, remover };
