import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import cors from 'cors';
import configPassport from './config/passport';
import { httpLogger } from './config/winston';
import routes from './routes';

const debug = require('debug')('cloudhost:app');

console.log(process.env.ES_RUNNING);
console.log(process.env.DEBUG);
debug('test');

const app = express();

app.use(cors());
configPassport(app);

app.use(httpLogger);
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(cookieParser());
app.use('/', routes);

// temp test route
app.get(
	'/protected',
	async (req, res, next) => {
		next();
	},
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		// Save the timesheet to the database...
		console.log('req.user', req.user);
		// send the response
		res.status(201).send('Hi from Backend');
	}
);

module.exports = app;
