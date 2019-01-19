import express from 'express';
import cookieParser from 'cookie-parser';
import configPassport from './config/passport';
import { httpLogger } from './config/winston';
import indexRouter from './routes/index';

const debug = require('debug')('cloudhost:app');

console.log(process.env.ES_RUNNING);
console.log(process.env.DEBUG);
debug('test');

const app = express();

configPassport(app);
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);

module.exports = app;
