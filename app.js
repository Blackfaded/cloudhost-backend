const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const boom = require('express-boom');
const configPassport = require('./config/passport');
const { httpLogger } = require('./config/winston');
const routes = require('./routes');
const io = require('./controllers/websocket');

const app = express();

// attach socket io object to request, to access it in routes
app.use((req, res, next) => {
	req.io = io;
	next();
});

// attach response handler lib to express
app.use(boom());

/*
 * credentials: true is needed for cookie auth
 * the origin needs to match the frontend domain
 * otherwise the requests fail because of cors
 */
app.use(cors({ credentials: true, origin: process.env.FRONTEND }));
configPassport(app);

// attach http logger to express
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
