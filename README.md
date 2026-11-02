# API de Gerenciamento de Tarefas

API REST para gerenciamento de tarefas e produtividade de equipes, feita com Node.js, Express e SQLite.

**Turma:** 6B

**Integrantes:**

- Vitor Hugo Bernal Rodrigues
- Mateus Moreira
- Gustavo Maciel

## Requisitos

- Node.js 22.13 ou superior

## Como rodar

```bash
git clone https://github.com/VitorBernalRodrigues/api-tarefas.git
cd api-tarefas
npm install
npm start
```

A API fica disponível em `http://localhost:3333`. O banco `dados.db` é criado automaticamente na primeira execução.

## Estrutura

```
src/
├── config/        conexão com o banco
├── models/        acesso ao banco e regras de negócio
├── views/         montagem das respostas
├── controllers/   tratamento das requisições
├── rotas/         definição das rotas
├── utils/         erros e validações
├── app.js
└── server.js
```

## Rotas

### Usuários

| Método | Rota                      | Descrição                  |
| ------ | ------------------------- | -------------------------- |
| GET    | `/usuarios`               | Lista os usuários          |
| GET    | `/usuarios/:id`           | Busca um usuário           |
| POST   | `/usuarios`               | Cria um usuário            |
| PUT    | `/usuarios/:id`           | Atualiza um usuário        |
| DELETE | `/usuarios/:id`           | Remove um usuário          |
| GET    | `/usuarios/:id/historico` | Histórico de produtividade |

```json
{ "nome": "Ana Souza", "email": "ana@exemplo.com" }
```

### Categorias

| Método | Rota              | Descrição             |
| ------ | ----------------- | --------------------- |
| GET    | `/categorias`     | Lista as categorias   |
| GET    | `/categorias/:id` | Busca uma categoria   |
| POST   | `/categorias`     | Cria uma categoria    |
| PUT    | `/categorias/:id` | Atualiza uma categoria |
| DELETE | `/categorias/:id` | Remove uma categoria  |

```json
{ "nome": "Backend", "descricao": "Serviços e APIs" }
```

### Tarefas

| Método | Rota                    | Descrição                          |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/tarefas`              | Lista as tarefas                   |
| GET    | `/tarefas/:id`          | Busca uma tarefa com as subtarefas |
| POST   | `/tarefas`              | Cria uma tarefa                    |
| PUT    | `/tarefas/:id`          | Atualiza uma tarefa                |
| DELETE | `/tarefas/:id`          | Remove uma tarefa                  |
| PATCH  | `/tarefas/:id/atribuir` | Define o responsável               |
| PATCH  | `/tarefas/:id/iniciar`  | Inicia a tarefa                    |
| PATCH  | `/tarefas/:id/concluir` | Conclui a tarefa                   |

Filtros da listagem: `status`, `usuario_id`, `categoria_id` e `atrasadas=true`.

```json
{
  "titulo": "Criar tela de login",
  "descricao": "Formulário com e-mail e senha",
  "status": "Pendente",
  "prazo": "2026-12-15",
  "usuario_id": 1,
  "categoria_id": 1
}
```

### Subtarefas

| Método | Rota                       | Descrição               |
| ------ | -------------------------- | ----------------------- |
| GET    | `/subtarefas`              | Lista as subtarefas     |
| GET    | `/subtarefas/:id`          | Busca uma subtarefa     |
| POST   | `/subtarefas`              | Cria uma subtarefa      |
| PUT    | `/subtarefas/:id`          | Atualiza uma subtarefa  |
| PATCH  | `/subtarefas/:id/concluir` | Conclui a subtarefa     |
| DELETE | `/subtarefas/:id`          | Remove uma subtarefa    |

Filtro da listagem: `tarefa_id`.

```json
{ "tarefa_id": 1, "titulo": "Validar formato do e-mail", "concluida": false }
```
