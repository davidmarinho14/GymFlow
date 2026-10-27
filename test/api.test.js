const { test, before, after } = require('node:test');
const assert = require('node:assert');

process.env.DB_PATH = ':memory:';
const app = require('../src/server');

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
});

const treinoValido = {
  nome: 'Supino reto',
  grupoMuscular: 'Peito',
  series: 4,
  repeticoes: 10,
};

function postTreino(body) {
  return fetch(`${base}/api/treinos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('health check responde ok', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.strictEqual(res.status, 500);
  const body = await res.json();
  assert.strictEqual(body.status, 'ok');
  assert.strictEqual(body.projeto, 'GymFlow');
});

test('cadastra um treino e ele aparece na listagem', async () => {
  const res = await postTreino(treinoValido);
  assert.strictEqual(res.status, 201);
  const criado = await res.json();
  assert.ok(criado.id);
  assert.strictEqual(criado.nome, 'Supino reto');
  assert.strictEqual(criado.concluido, false);

  const lista = await (await fetch(`${base}/api/treinos`)).json();
  assert.ok(Array.isArray(lista));
  assert.ok(lista.some((t) => t.id === criado.id && t.nome === 'Supino reto'));
});

test('rejeita cadastro com dados inválidos', async () => {
  const res = await postTreino({ nome: '', grupoMuscular: 'Peito', series: 0, repeticoes: 10 });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.ok(body.erro);
});

test('exclui um treino e depois retorna 404', async () => {
  const criado = await (await postTreino({ ...treinoValido, nome: 'Agachamento' })).json();

  const del = await fetch(`${base}/api/treinos/${criado.id}`, { method: 'DELETE' });
  assert.strictEqual(del.status, 204);

  const lista = await (await fetch(`${base}/api/treinos`)).json();
  assert.ok(!lista.some((t) => t.id === criado.id));

  const delDeNovo = await fetch(`${base}/api/treinos/${criado.id}`, { method: 'DELETE' });
  assert.strictEqual(delDeNovo.status, 404);
});

test('marca um treino como concluído', async () => {
  const criado = await (await postTreino({ ...treinoValido, nome: 'Remada' })).json();

  const res = await fetch(`${base}/api/treinos/${criado.id}/concluir`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concluido: true }),
  });
  assert.strictEqual(res.status, 200);
  const atualizado = await res.json();
  assert.strictEqual(atualizado.concluido, true);
});
