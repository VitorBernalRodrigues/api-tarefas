import express from 'express';
import { ErroHttp } from './utils/erros.js';
import { erro as corpoDeErro } from './utils/resposta.js';
import { cors } from './utils/cors.js';
import usuarios from './rotas/usuarios.js';
import categorias from './rotas/categorias.js';
import tarefas from './rotas/tarefas.js';
import subtarefas from './rotas/subtarefas.js';

const app = express();
app.use(cors);
app.use(express.json());

const v1 = express.Router();

v1.get('/', (req, res) => {
  res.json({
    api: 'Gerenciamento de tarefas e produtividade de equipes',
    recursos: ['/usuarios', '/categorias', '/tarefas', '/subtarefas'],
  });
});

v1.use('/usuarios', usuarios);
v1.use('/categorias', categorias);
v1.use('/tarefas', tarefas);
v1.use('/subtarefas', subtarefas);

app.use('/api/v1', v1);

app.use((req, res) => {
  res.status(404).json(corpoDeErro('route_not_found', 'Rota não encontrada.'));
});

app.use((erro, req, res, next) => {
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json(corpoDeErro(erro.tipo, erro.message));
  }
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json(corpoDeErro('invalid_json', 'JSON inválido no corpo da requisição.'));
  }
  if (erro.code === 11000) {
    return res.status(409).json(corpoDeErro('conflict', 'Já existe um registro com esse valor único.'));
  }
  console.error(erro);
  res.status(500).json(corpoDeErro('internal_error', 'Erro interno do servidor.'));
});

export default app;
