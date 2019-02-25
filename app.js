const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const boom = require('express-boom');

const configPassport = require('./config/passport');

const { httpLogger } = require('./config/winston');

const routes = require('./routes');

// const debug = require('debug')('cloudhost:app');

console.log(process.env.ES_RUNNING);
console.log(process.env.DEBUG);

const app = express();

app.use(boom());
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

module.exports = app;
