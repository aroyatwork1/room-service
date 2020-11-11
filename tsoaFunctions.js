const tsoa = require('tsoa');
const fs = require('fs');

/**
 * To add to the management APi create a <route>.Controller.ts file in ./src/RESTApi/managementApi.
 * The file will automatically be converted at build time to the routes.ts and loaded by the server.
 * The swagger page at /api/docs will be updated as well.
 */
const managementApiOptions = {
  swagger: {
    name: "Calendar Service Management API",
    version: "0.5.0",
    basePath: '/api/v1.0',
    entryFile: './src/server.ts',
    schemes: ["http"],
    host: 'localhost:30662',
    specVersion: 3,
    outputDirectory: './src/RESTApi/managementApi/tsOpenApi',
    controllerPathGlobs: ['./src/RESTApi/managementApi/**/*Controller.ts'],
  },
  route: {
    basePath: '/api/v1.0',
    entryFile: './src/server.ts',
    routesDir: './src/RESTApi/managementApi/tsOpenApi',
    middleware: 'express',
  },
};

const userApiOptions = {
  swagger: {
    name: "Calendar Service User API",
    version: "0.5.0",
    basePath: '/api/v1.0',
    entryFile: './src/server.ts',
    schemes: ["http"],
    host: "localhost:5000",
    specVersion: 3,
    outputDirectory: './src/RESTApi/userApi/tsOpenApi',
    controllerPathGlobs: ['./src/RESTApi/userApi/**/*Controller.ts'],
    securityDefinitions: {
      basic: {
        type: "http",
        scheme: "bearer"
      }
    }
  },
  route: {
    basePath: '/api/v1.0',
    entryFile: './src/server.ts',
    routesDir: './src/RESTApi/userApi/tsOpenApi',
    middleware: 'express',
    authenticationModule: './src/RESTApi/expressAuthentication'
  },
};

const allApiOptions = [managementApiOptions, userApiOptions];

module.exports.generate = () => {
  allApiOptions.forEach(async (apiOptions) => {
    await tsoa.generateRoutes(apiOptions.route, apiOptions.swagger);
    await tsoa.generateSwaggerSpec(apiOptions.swagger, apiOptions.route);
  });
};

module.exports.copySwaggerJson = () => {
  allApiOptions.forEach(async (apiOptions) => {
    const srcPathSwaggerFile = `${apiOptions.swagger.outputDirectory}/swagger.json`;
    const targetPath = srcPathSwaggerFile.replace('/src/', '/build/');
    fs.copyFile(`${srcPathSwaggerFile}`, `${targetPath}`, () => { });
  });
};
