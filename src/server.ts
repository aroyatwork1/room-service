import dotenv from 'dotenv';
import setUpFrontend from './server/setUpFrontend';
import setUpTerminus from './server/setUpTerminus';
import setUpUserApi from './server/setUpUserApi';

dotenv.config();
const server = setUpFrontend(Number(process.env.LOCAL_BROWSER_PORT));
setUpTerminus(server);

const serverUser = setUpUserApi(Number(process.env.USER_BROWSER_PORT));
setUpTerminus(serverUser);
