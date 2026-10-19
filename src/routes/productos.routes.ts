import { Router } from 'express';
import { ProductoService } from '../services/ProductoService';
import { ValidacionError } from '../services/errors';

export function productosRouter(service: ProductoService): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(service.listar());
  });

  router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ValidacionError('El id debe ser un número entero');
    res.json(service.obtener(id));
  });

  return router;
}
