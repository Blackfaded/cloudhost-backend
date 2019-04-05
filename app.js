const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const boom = require('express-boom');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const configPassport = require('./config/passport');
const { httpLogger } = require('./config/winston');
const routes = require('./routes');
const io = require('./controllers/websocket');
const swaggerconfig = require('./swagger/def');

const options = {
	swaggerDefinition: {
		...swaggerconfig
	},
	apis: swaggerconfig.apis
};

const specs = swaggerJsdoc(options);

const app = express();
app.use((req, res, next) => {
	req.io = io;
	next();
});
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(cookieParser());
app.use('/', routes);

module.exports = app;
