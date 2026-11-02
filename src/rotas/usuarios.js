const { Router } = require('express');
const controller = require('../controllers/usuarioController');

const rotas = Router();

rotas.get('/', controller.listar);
rotas.get('/:id', controller.buscar);
rotas.post('/', controller.criar);
rotas.put('/:id', controller.atualizar);
rotas.delete('/:id', controller.remover);
rotas.get('/:id/historico', controller.historico);

module.exports = rotas;
