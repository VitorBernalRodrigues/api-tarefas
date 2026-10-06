const { Router } = require('express');
const banco = require('../banco');
const { naoEncontrado, invalido } = require('../erros');
const { textoObrigatorio, idDaRota } = require('../validacao');
const { hoje } = require('../regras');

const rotas = Router();

function buscarUsuario(id) {
  const usuario = banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  if (!usuario) throw naoEncontrado('Usuário');
  return usuario;
}

function lerDados(corpo) {
  const nome = textoObrigatorio(corpo.nome, 'nome');
  const email = textoObrigatorio(corpo.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalido('E-mail inválido.');
  return { nome, email };
}

rotas.get('/', (req, res) => {
  res.json(banco.prepare('SELECT * FROM usuarios ORDER BY nome').all());
});

rotas.get('/:id', (req, res) => {
  res.json(buscarUsuario(idDaRota(req)));
});

rotas.post('/', (req, res) => {
  const { nome, email } = lerDados(req.body ?? {});
  const { lastInsertRowid } = banco
    .prepare('INSERT INTO usuarios (nome, email) VALUES (?, ?)')
    .run(nome, email);
  res.status(201).json(buscarUsuario(lastInsertRowid));
});

rotas.put('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarUsuario(id);
  const { nome, email } = lerDados(req.body ?? {});
  banco.prepare('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?').run(nome, email, id);
  res.json(buscarUsuario(id));
});

rotas.delete('/:id', (req, res) => {
  const id = idDaRota(req);
  buscarUsuario(id);
  banco.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  res.status(204).end();
});

rotas.get('/:id/historico', (req, res) => {
  const usuario = buscarUsuario(idDaRota(req));
  const tarefas = banco
    .prepare('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY criado_em DESC')
    .all(usuario.id);

  const dataHoje = hoje();
  const concluidas = tarefas.filter((t) => t.status === 'Concluída');
  const noPrazo = concluidas.filter((t) => !t.prazo || t.concluida_em.slice(0, 10) <= t.prazo);
  const atrasadas = tarefas.filter((t) => t.status !== 'Concluída' && t.prazo && t.prazo < dataHoje);

  res.json({
    usuario,
    resumo: {
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === 'Pendente').length,
      em_andamento: tarefas.filter((t) => t.status === 'Em Andamento').length,
      concluidas: concluidas.length,
      concluidas_no_prazo: noPrazo.length,
      concluidas_com_atraso: concluidas.length - noPrazo.length,
      atrasadas_agora: atrasadas.length,
      taxa_no_prazo: concluidas.length ? Math.round((noPrazo.length / concluidas.length) * 100) : null,
      bloqueado: atrasadas.length > 0,
    },
    tarefas,
  });
});

module.exports = rotas;
