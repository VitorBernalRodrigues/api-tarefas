import * as Tarefa from '../models/tarefaModel.js';
import * as Subtarefa from '../models/subtarefaModel.js';
import { regraViolada } from '../utils/erros.js';

const LIMITE_EM_ANDAMENTO = 3;

function hoje() {
  return new Date().toLocaleDateString('sv-SE');
}

function estaAtrasada(tarefa, dataHoje = hoje()) {
  return tarefa.status !== 'Concluída' && Boolean(tarefa.prazo) && tarefa.prazo < dataHoje;
}

async function verificarLimiteEmAndamento(usuarioId, tarefaId = null) {
  const emAndamento = await Tarefa.buscarTodas({ usuario_id: usuarioId, status: 'Em Andamento' });
  const total = emAndamento.filter((t) => t._id.toHexString() !== tarefaId).length;

  if (total >= LIMITE_EM_ANDAMENTO) {
    throw regraViolada(
      `O usuário já tem ${LIMITE_EM_ANDAMENTO} tarefas em andamento. Conclua uma antes de iniciar outra.`
    );
  }
}

async function verificarUsuarioSemAtraso(usuarioId) {
  const tarefas = await Tarefa.buscarTodas({ usuario_id: usuarioId });
  const dataHoje = hoje();
  const total = tarefas.filter((t) => estaAtrasada(t, dataHoje)).length;

  if (total > 0) {
    throw regraViolada(
      `O usuário está bloqueado: possui ${total} tarefa(s) atrasada(s). Regularize antes de receber novas tarefas.`
    );
  }
}

async function verificarSubtarefasConcluidas(tarefaId) {
  const pendentes = await Subtarefa.buscarTodas({ tarefa_id: tarefaId, concluida: false });
  const total = pendentes.length;

  if (total > 0) {
    throw regraViolada(
      `A tarefa não pode ser concluída: há ${total} subtarefa(s) pendente(s).`
    );
  }
}

export {
  LIMITE_EM_ANDAMENTO,
  hoje,
  estaAtrasada,
  verificarLimiteEmAndamento,
  verificarUsuarioSemAtraso,
  verificarSubtarefasConcluidas,
};
