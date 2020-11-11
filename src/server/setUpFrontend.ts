import express from 'express';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import * as swaggerUI from 'swagger-ui-express';
import { RegisterRoutes } from '../RESTApi/managementApi/tsOpenApi/routes';
import swaggerJson from '../RESTApi/managementApi/tsOpenApi/swagger.json';

export default function setUpFrontend(port: number): http.Server {
  const app = express();

  app.use(express.json());

  // Configure morgan module to log all requests.
  app.use(morgan('dev'));

  const staticFilesPath = path.normalize(`${__dirname}/../public`);
  app.use('/', express.static(staticFilesPath));

  // to add routes to the management api,
  // add them as a <route>.Controller.ts file in src/RESTApi/managementApi
  RegisterRoutes(app);

  const swaggerHtml = swaggerUI.generateHTML(swaggerJson);
  app.use('/api/docs', swaggerUI.serveFiles(swaggerJson));
  app.get('/api/docs', (req, res) => { res.send(swaggerHtml); });

  const server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Rest Api listening on at "http://localhost:${port}"`);
  });
  return server;
}
