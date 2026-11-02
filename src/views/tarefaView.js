function detalhe(tarefa, subtarefas) {
  tarefa.subtarefas = subtarefas;
  return tarefa;
}

module.exports = { detalhe };
