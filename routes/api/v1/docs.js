const express = require('express');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('../../../swagger/def');
const { isAdmin } = require('../../../middlewares/roles');

const router = express.Router();

const specs = swaggerJsdoc({
	swaggerDefinition: swaggerOptions,
	apis: swaggerOptions.apis,
	host: swaggerOptions.host
});

router.use('/api', swaggerUi.serve, swaggerUi.setup(specs));

router.use('/controller', isAdmin, express.static(path.join(__dirname, '../../../docs')));

module.exports = router;
