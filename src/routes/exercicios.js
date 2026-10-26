const express = require('express');
const { listarExercicios, WgerError } = require('../services/wger');
const router = express.Router();

router.get('/', async (req, res, next) => {
  const { limit = '20', offset = '0' } = req.query;
  if (typeof limit !== 'string' || !/^\d+$/.test(limit) ||
      !Number.isSafeInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100 ||
      typeof offset !== 'string' || !/^\d+$/.test(offset) ||
      !Number.isSafeInteger(Number(offset))) {
    return res.status(400).json({ erro: 'Use limit entre 1 e 100 e offset inteiro não negativo.' });
  }
  try {
    res.json(await listarExercicios({ limit: Number(limit), offset: Number(offset) }));
  } catch (error) {
    if (error instanceof WgerError) return res.status(error.status).json({ erro: error.message });
    next(error);
  }
});

module.exports = router;
