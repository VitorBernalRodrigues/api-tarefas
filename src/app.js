const express = require('express');
const { ErroHttp } = require('./erros');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    api: 'Gerenciamento de tarefas e produtividade de equipes',
    recursos: ['/usuarios', '/categorias', '/tarefas', '/subtarefas'],
  });
});

app.use('/usuarios', require('./rotas/usuarios'));

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  if (erro.code === 'ERR_SQLITE_ERROR' && /UNIQUE/.test(erro.message)) {
    return res.status(409).json({ erro: 'Já existe um registro com esse valor único.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
