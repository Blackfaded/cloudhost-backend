const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('../../../swagger/def');
const { isAdmin } = require('../../../middlewares/roles');

const router = express.Router();

const specs = swaggerJsdoc({
	swaggerDefinition: swaggerOptions,
	apis: swaggerOptions.apis
});

router.use('/', isAdmin, swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;
