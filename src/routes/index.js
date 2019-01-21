import express from 'express';
import api from './api/v1';
import auth from './auth';

const router = express.Router();

router.use('/auth', auth);
router.use('/api/v1', api);

export default router;
