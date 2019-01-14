import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import DebugModule from 'debug';

import indexRouter from './routes/index';

const debug = DebugModule('cloudhost:app');
debug('test');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', indexRouter);

module.exports = app;
