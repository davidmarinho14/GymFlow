const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', projeto: 'GymFlow' }));
app.use('/api/treinos', require('./routes/treinos'));
// Luiz: importar e registrar aqui o router de exercícios em /api/exercicios.
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ erro: 'JSON inválido.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno.' });
});
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`GymFlow em http://localhost:${port}`));
}
module.exports = app;
