import { Router } from 'express';
import * as controller from '../controllers/usuarioController.js';

const rotas = Router();

rotas.get('/', controller.listar);
rotas.get('/:id', controller.buscar);
rotas.post('/', controller.criar);
rotas.put('/:id', controller.atualizar);
rotas.delete('/:id', controller.remover);
rotas.get('/:id/historico', controller.historico);

export default rotas;
