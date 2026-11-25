# API de Gerenciamento de Tarefas

API REST para gerenciamento de tarefas e produtividade de equipes, feita com Node.js, Express e MongoDB.

**Turma:** 6B

**Integrantes:**

- Vitor Hugo Bernal Rodrigues
- Mateus Moreira
- Gustavo Maciel

## Requisitos

- Node.js 22.13 ou superior
- Docker (para subir o MongoDB)

## Como rodar

```bash
git clone https://github.com/VitorBernalRodrigues/api-tarefas.git
cd api-tarefas
npm install
cp .env.example .env
npm run dev
```

O `npm run dev` executa antes o `npm run db:up`, que inicia (ou cria) o container `api-tarefas` com o MongoDB 8 na porta `27017`. A API fica disponível em `http://localhost:3333`.

### Variáveis de ambiente (`.env`)

| Variável          | Exemplo                     | Descrição                 |
| ----------------- | --------------------------- | ------------------------- |
| `PORT`            | `3333`                      | Porta da API              |
| `MONGODB_URI`     | `mongodb://localhost:27017` | Endereço do MongoDB       |
| `MONGODB_DB_NAME` | `api_tarefas`               | Nome do banco de dados    |

### Scripts

| Script             | Descrição                                        |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Sobe o MongoDB e inicia a API com `--watch`      |
| `npm start`        | Inicia a API (o MongoDB já deve estar rodando)   |
| `npm run db:up`    | Inicia ou cria o container do MongoDB            |
| `npm run db:down`  | Para o container                                 |
| `npm run db:logs`  | Mostra os logs do container                      |
| `npm run db:reset` | Remove o container e o volume com os dados       |

## Estrutura

```
src/
├── config/        conexão com o MongoDB
├── rotas/         definição das rotas
├── controllers/   recebem a requisição e devolvem a resposta
├── services/      validações e regras de negócio
├── models/        acesso ao MongoDB (inserir, buscarTodas, buscarPorId, atualizar, remover)
├── views/         montagem das respostas compostas
├── utils/         erros, validações e formato dos documentos
├── app.js
└── server.js
```

Fluxo de uma requisição: `rotas -> controllers -> services -> models`.

Os ids são `ObjectId` do MongoDB, expostos na API como texto de 24 caracteres (ex.: `"65f1c2a9e4b0a1b2c3d4e5f6"`).

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
  "usuario_id": "65f1c2a9e4b0a1b2c3d4e5f6",
  "categoria_id": "65f1c2a9e4b0a1b2c3d4e5f7"
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
{ "tarefa_id": "65f1c2a9e4b0a1b2c3d4e5f8", "titulo": "Validar formato do e-mail", "concluida": false }
```
