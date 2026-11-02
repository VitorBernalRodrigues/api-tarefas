const { Router } = require('express');
const controller = require('../controllers/tarefaController');

const rotas = Router();

rotas.get('/', controller.listar);
rotas.get('/:id', controller.buscar);
rotas.post('/', controller.criar);
rotas.put('/:id', controller.atualizar);
rotas.delete('/:id', controller.remover);
rotas.patch('/:id/atribuir', controller.atribuir);
rotas.patch('/:id/iniciar', controller.iniciar);
rotas.patch('/:id/concluir', controller.concluir);

module.exports = rotas;
