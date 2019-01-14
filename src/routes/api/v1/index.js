import express from 'express';
import axios from 'axios';
const router = express.Router();

router.get('/', async (req, res, next) => {
  const response = await axios.get('https://git.hsrw.eu/api/v4/projects');
  console.log(response.data);
  res.json({ api: 'v1' }).status(200);
});

export default router;
