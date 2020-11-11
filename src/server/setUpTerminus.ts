import { createTerminus } from '@godaddy/terminus';
import http from 'http';
import BoxLinkCollection from '../services/mongoDb/BoxLinkCollection';

async function onSignal() {
  // start cleanup of resource, like databases or file descriptors
  await BoxLinkCollection.closeMongoDbConnection();
}
async function onHealthCheck() {
  // checks if the system is healthy, like the db connection is live
  // resolves, if health, rejects if not
}

export default function setUpTerminus(server: http.Server) {
  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: { '/healthcheck': onHealthCheck },
    onSignal,
  });
}
