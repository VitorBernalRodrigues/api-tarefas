const { Router } = require('express');
const banco = require('../banco');
const { naoEncontrado, invalido } = require('../erros');
const v = require('../validacao');

const rotas = Router();
const STATUS_VALIDOS = ['Pendente', 'Em Andamento', 'Concluída'];

function buscarTarefa(id) {
  const tarefa = banco.prepare('SELECT * FROM tarefas WHERE id = ?').get(id);
  if (!tarefa) throw naoEncontrado('Tarefa');
  return tarefa;
}

function conferirRelacionamentos(dados) {
  if (dados.usuario_id && !banco.prepare('SELECT 1 FROM usuarios WHERE id = ?').get(dados.usuario_id)) {
    throw naoEncontrado('Usuário');
  }
  if (dados.categoria_id && !banco.prepare('SELECT 1 FROM categorias WHERE id = ?').get(dados.categoria_id)) {
    throw naoEncontrado('Categoria');
  }
}

function lerDados(corpo) {
  const status = corpo.status ?? 'Pendente';
  if (!STATUS_VALIDOS.includes(status)) {
    throw invalido(`Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.`);
  }
  return {
    titulo: v.textoObrigatorio(corpo.titulo, 'titulo'),
    descricao: v.textoOpcional(corpo.descricao, 'descricao'),
    status,
    prazo: v.dataOpcional(corpo.prazo, 'prazo'),
    usuario_id: v.idOpcional(corpo.usuario_id, 'usuario_id'),
    categoria_id: v.idOpcional(corpo.categoria_id, 'categoria_id'),
  };
}

function aplicarRegras(nova, atual) {
  if (nova.status === 'Em Andamento' && !nova.usuario_id) {
    throw invalido('Atribua um responsável antes de iniciar a tarefa.');
  }
}

function dataConclusao(nova, atual) {
  if (nova.status !== 'Concluída') return null;
  if (atual?.status === 'Concluída') return atual.concluida_em;
  return new Date().toLocaleString('sv-SE');
}

function atualizar(atual, nova) {
  conferirRelacionamentos(nova);
  aplicarRegras(nova, atual);
  banco
    .prepare(`UPDATE tarefas SET titulo = ?, descricao = ?, status = ?, prazo = ?,
              usuario_id = ?, categoria_id = ?, concluida_em = ? WHERE id = ?`)
    .run(nova.titulo, nova.descricao, nova.status, nova.prazo,
         nova.usuario_id, nova.categoria_id, dataConclusao(nova, atual), atual.id);
  return buscarTarefa(atual.id);
}

rotas.get('/', (req, res) => {
  res.json(banco.prepare('SELECT * FROM tarefas ORDER BY prazo IS NULL, prazo').all());
});

rotas.get('/:id', (req, res) => {
  const tarefa = buscarTarefa(v.idDaRota(req));
  tarefa.subtarefas = banco.prepare('SELECT * FROM subtarefas WHERE tarefa_id = ?').all(tarefa.id);
  res.json(tarefa);
});

rotas.post('/', (req, res) => {
  const nova = lerDados(req.body ?? {});
  conferirRelacionamentos(nova);
  aplicarRegras(nova, null);
  const { lastInsertRowid } = banco
    .prepare(`INSERT INTO tarefas (titulo, descricao, status, prazo, usuario_id, categoria_id, concluida_em)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(nova.titulo, nova.descricao, nova.status, nova.prazo,
         nova.usuario_id, nova.categoria_id, dataConclusao(nova, null));
  res.status(201).json(buscarTarefa(lastInsertRowid));
});

rotas.put('/:id', (req, res) => {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(atualizar(atual, lerDados(req.body ?? {})));
});

rotas.delete('/:id', (req, res) => {
  const tarefa = buscarTarefa(v.idDaRota(req));
  banco.prepare('DELETE FROM tarefas WHERE id = ?').run(tarefa.id);
  res.status(204).end();
});

rotas.patch('/:id/atribuir', (req, res) => {
  const atual = buscarTarefa(v.idDaRota(req));
  const usuarioId = v.idOpcional(req.body?.usuario_id, 'usuario_id');
  if (!usuarioId) throw invalido('Informe o "usuario_id".');
  res.json(atualizar(atual, { ...atual, usuario_id: usuarioId }));
});

rotas.patch('/:id/iniciar', (req, res) => {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(atualizar(atual, { ...atual, status: 'Em Andamento' }));
});

rotas.patch('/:id/concluir', (req, res) => {
  const atual = buscarTarefa(v.idDaRota(req));
  res.json(atualizar(atual, { ...atual, status: 'Concluída' }));
});

module.exports = rotas;
