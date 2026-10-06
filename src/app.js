const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    api: 'Gerenciamento de tarefas e produtividade de equipes',
    recursos: ['/usuarios', '/categorias', '/tarefas', '/subtarefas'],
  });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
