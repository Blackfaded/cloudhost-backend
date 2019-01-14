import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  // const response = await axios.get('https://git.hsrw.eu/api/v4/projects');
  res.json({ api: 'v1' }).status(200);
});

export default router;
