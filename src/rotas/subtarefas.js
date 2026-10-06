const { Router } = require('express');
const banco = require('../banco');
const { naoEncontrado, invalido, regraViolada } = require('../erros');
const v = require('../validacao');

const rotas = Router();

function buscarSubtarefa(id) {
  const subtarefa = banco.prepare('SELECT * FROM subtarefas WHERE id = ?').get(id);
  if (!subtarefa) throw naoEncontrado('Subtarefa');
  return subtarefa;
}

function buscarTarefaMae(tarefaId) {
  const tarefa = banco.prepare('SELECT * FROM tarefas WHERE id = ?').get(tarefaId);
  if (!tarefa) throw naoEncontrado('Tarefa');
  return tarefa;
}

function lerDados(corpo) {
  const tarefaId = v.idOpcional(corpo.tarefa_id, 'tarefa_id');
  if (!tarefaId) throw invalido('O campo "tarefa_id" é obrigatório.');
  if (corpo.concluida !== undefined && typeof corpo.concluida !== 'boolean') {
    throw invalido('O campo "concluida" deve ser true ou false.');
  }
  return {
    tarefa_id: tarefaId,
    titulo: v.textoObrigatorio(corpo.titulo, 'titulo'),
    concluida: corpo.concluida ? 1 : 0,
  };
}

function conferirTarefaMae(dados) {
  const tarefa = buscarTarefaMae(dados.tarefa_id);
  if (tarefa.status === 'Concluída' && !dados.concluida) {
    throw regraViolada('A tarefa já está concluída: reabra-a antes de adicionar subtarefas pendentes.');
  }
}

rotas.get('/', (req, res) => {
  if (req.query.tarefa_id) {
    const tarefaId = v.idOpcional(req.query.tarefa_id, 'tarefa_id');
    return res.json(banco.prepare('SELECT * FROM subtarefas WHERE tarefa_id = ?').all(tarefaId));
  }
  res.json(banco.prepare('SELECT * FROM subtarefas').all());
});

rotas.get('/:id', (req, res) => {
  res.json(buscarSubtarefa(v.idDaRota(req)));
});

rotas.post('/', (req, res) => {
  const dados = lerDados(req.body ?? {});
  conferirTarefaMae(dados);
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO subtarefas (tarefa_id, titulo, concluida) VALUES (?, ?, ?)')
    .run(dados.tarefa_id, dados.titulo, dados.concluida);
  res.status(201).json(buscarSubtarefa(lastInsertRowid));
});

rotas.put('/:id', (req, res) => {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  const dados = lerDados(req.body ?? {});
  conferirTarefaMae(dados);
  banco
    .prepare('UPDATE subtarefas SET tarefa_id = ?, titulo = ?, concluida = ? WHERE id = ?')
    .run(dados.tarefa_id, dados.titulo, dados.concluida, id);
  res.json(buscarSubtarefa(id));
});

rotas.patch('/:id/concluir', (req, res) => {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  banco.prepare('UPDATE subtarefas SET concluida = 1 WHERE id = ?').run(id);
  res.json(buscarSubtarefa(id));
});

rotas.delete('/:id', (req, res) => {
  const id = v.idDaRota(req);
  buscarSubtarefa(id);
  banco.prepare('DELETE FROM subtarefas WHERE id = ?').run(id);
  res.status(204).end();
});

module.exports = rotas;
