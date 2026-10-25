const express = require('express');
const db = require('../db');
const router = express.Router();
const columns = 'id, nome, grupoMuscular, series, repeticoes, concluido, criadoEm';
const normalize = row => row ? ({ ...row, concluido: Boolean(row.concluido) }) : null;
function validate(body) {
  const { nome, grupoMuscular, series, repeticoes } = body || {};
  if (typeof nome !== 'string' || !nome.trim() || nome.length > 120 ||
      typeof grupoMuscular !== 'string' || !grupoMuscular.trim() || grupoMuscular.length > 120 ||
      !Number.isInteger(series) || series < 1 || series > 100 ||
      !Number.isInteger(repeticoes) || repeticoes < 1 || repeticoes > 1000) return null;
  return { nome: nome.trim(), grupoMuscular: grupoMuscular.trim(), series, repeticoes };
}
router.get('/', (_req, res) => {
  const rows = db.prepare(`SELECT ${columns} FROM treinos ORDER BY id DESC`).all();
  res.json(rows.map(normalize));
});
router.post('/', (req, res) => {
  const data = validate(req.body);
  if (!data) return res.status(400).json({ erro: 'Informe nome, grupoMuscular, series e repeticoes válidos.' });
  const result = db.prepare('INSERT INTO treinos (nome, grupoMuscular, series, repeticoes) VALUES (@nome, @grupoMuscular, @series, @repeticoes)').run(data);
  const row = db.prepare(`SELECT ${columns} FROM treinos WHERE id = ?`).get(result.lastInsertRowid);
  res.status(201).json(normalize(row));
});
router.put('/:id', (req, res) => {
  const data = validate(req.body);
  if (!data) return res.status(400).json({ erro: 'Dados inválidos.' });
  const result = db.prepare('UPDATE treinos SET nome=@nome, grupoMuscular=@grupoMuscular, series=@series, repeticoes=@repeticoes WHERE id=@id').run({ ...data, id: req.params.id });
  if (!result.changes) return res.status(404).json({ erro: 'Treino não encontrado.' });
  res.json(normalize(db.prepare(`SELECT ${columns} FROM treinos WHERE id = ?`).get(req.params.id)));
});
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM treinos WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ erro: 'Treino não encontrado.' });
  res.status(204).end();
});
router.patch('/:id/concluir', (req, res) => {
  const row = db.prepare('SELECT id FROM treinos WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ erro: 'Treino não encontrado.' });
  const concluido = typeof req.body?.concluido === 'boolean' ? Number(req.body.concluido) : 1;
  db.prepare('UPDATE treinos SET concluido = ? WHERE id = ?').run(concluido, req.params.id);
  res.json(normalize(db.prepare(`SELECT ${columns} FROM treinos WHERE id = ?`).get(req.params.id)));
});
module.exports = router;
