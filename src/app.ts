import express, { NextFunction, Request, Response } from 'express';
import { ProductoRepository } from './repositories/ProductoRepository';
import { PedidoRepository } from './repositories/PedidoRepository';
import { ProductoService } from './services/ProductoService';
import { PedidoService } from './services/PedidoService';
import { ReporteService } from './services/ReporteService';
import { NoEncontradoError, ValidacionError } from './services/errors';
import { productosRouter } from './routes/productos.routes';
import { pedidosRouter } from './routes/pedidos.routes';
import { reportesRouter } from './routes/reportes.routes';

/** Fábrica de la app: cada llamada crea repos nuevos (útil para que los tests no se pisen). */
export function createApp() {
  const productoRepo = new ProductoRepository();
  const pedidoRepo = new PedidoRepository();

  const productoService = new ProductoService(productoRepo);
  const pedidoService = new PedidoService(pedidoRepo, productoRepo);
  const reporteService = new ReporteService(pedidoRepo, productoRepo, pedidoService);

  const app = express();
  app.use(express.json());

  app.use('/productos', productosRouter(productoService));
  app.use('/pedidos', pedidosRouter(pedidoService));
  app.use('/reportes', reportesRouter(reporteService));

  // Manejo centralizado de errores
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidacionError) return res.status(400).json({ error: err.message });
    if (err instanceof NoEncontradoError) return res.status(404).json({ error: err.message });
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'JSON inválido' });
    return res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
