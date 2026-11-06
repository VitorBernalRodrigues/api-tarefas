import { Router } from 'express';
import * as controller from '../controllers/categoriaController.js';

const rotas = Router();

rotas.get('/', controller.listar);
rotas.get('/:id', controller.buscar);
rotas.post('/', controller.criar);
rotas.put('/:id', controller.atualizar);
rotas.delete('/:id', controller.remover);

export default rotas;
