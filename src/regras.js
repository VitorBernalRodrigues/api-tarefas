const banco = require('./banco');
const { regraViolada } = require('./erros');

const LIMITE_EM_ANDAMENTO = 3;

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

module.exports = {
  LIMITE_EM_ANDAMENTO,
  verificarLimiteEmAndamento,
};
