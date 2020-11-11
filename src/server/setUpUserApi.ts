import express from 'express';
import morgan from 'morgan';
import http from 'http';
import * as swaggerUI from 'swagger-ui-express';
import { RegisterRoutes } from '../RESTApi/userApi/tsOpenApi/routes';
import swaggerJson from '../RESTApi/userApi/tsOpenApi/swagger.json';

export default function setupUserApi(port: number): http.Server {
  const app = express();

  app.use(express.json());

  // Configure morgan module to log all requests.
  app.use(morgan('dev'));

  RegisterRoutes(app);

  const swaggerHtml = swaggerUI.generateHTML(swaggerJson);
  app.use('/api/docs', swaggerUI.serveFiles(swaggerJson));
  app.get('/api/docs', (req, res) => { res.send(swaggerHtml); });

  const server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Public Api listening on at "http://localhost:${port}"`);
  });

  return server;
}
