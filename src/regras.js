const banco = require('./banco');
const { regraViolada } = require('./erros');

const LIMITE_EM_ANDAMENTO = 3;

function hoje() {
  return new Date().toLocaleDateString('sv-SE');
}

function verificarLimiteEmAndamento(usuarioId, tarefaId = 0) {
  const { total } = banco
    .prepare(`SELECT COUNT(*) AS total FROM tarefas
              WHERE usuario_id = ? AND status = 'Em Andamento' AND id <> ?`)
    .get(usuarioId, tarefaId);

  if (total >= LIMITE_EM_ANDAMENTO) {
    throw regraViolada(
      `O usuário já tem ${LIMITE_EM_ANDAMENTO} tarefas em andamento. Conclua uma antes de iniciar outra.`
    );
  }
}

function verificarUsuarioSemAtraso(usuarioId) {
  const { total } = banco
    .prepare(`SELECT COUNT(*) AS total FROM tarefas
              WHERE usuario_id = ? AND status <> 'Concluída' AND prazo < ?`)
    .get(usuarioId, hoje());

  if (total > 0) {
    throw regraViolada(
      `O usuário está bloqueado: possui ${total} tarefa(s) atrasada(s). Regularize antes de receber novas tarefas.`
    );
  }
}

module.exports = {
  LIMITE_EM_ANDAMENTO,
  hoje,
  verificarLimiteEmAndamento,
  verificarUsuarioSemAtraso,
};
