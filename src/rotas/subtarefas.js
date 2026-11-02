const { Router } = require('express');
const controller = require('../controllers/subtarefaController');

const rotas = Router();

rotas.get('/', controller.listar);
rotas.get('/:id', controller.buscar);
rotas.post('/', controller.criar);
rotas.put('/:id', controller.atualizar);
rotas.patch('/:id/concluir', controller.concluir);
rotas.delete('/:id', controller.remover);

module.exports = rotas;
