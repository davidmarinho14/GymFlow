# GymFlow

Aplicação web responsiva para organizar treinos de academia, desenvolvida como projeto acadêmico de **Bootcamp II**.

## Funcionalidades

- Cadastrar treinos com nome, grupo muscular, número de séries e repetições.
- Listar, editar, excluir e marcar treinos como concluídos.
- Filtrar treinos por todos, pendentes ou concluídos.
- Consultar uma biblioteca de exercícios reais por meio da API pública [Wger](https://wger.de/), com preferência por nomes em português.
- Usar o nome de um exercício da biblioteca no formulário de cadastro.
- Persistir os treinos em banco de dados SQLite.

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript.
- **Backend:** Node.js e Express.
- **Banco de dados:** SQLite com `better-sqlite3`.
- **API externa:** Wger (`/api/exercicios`).
- **Testes:** `node:test` e `node:assert`.
- **Integração contínua:** GitHub Actions.
- **Contêiner:** Docker, com persistência de dados em volume.

## Integrantes e responsabilidades

| Integrante | Matrícula | Usuário GitHub | Funcionalidade / responsabilidade | Principal PR |
| --- | --- | --- | --- | --- |
| David Richard Marinho | 22610620 | [@davidmarinho14](https://github.com/davidmarinho14) | Backend de treinos, SQLite, estrutura inicial e documentação | [#1 — Backend](https://github.com/davidmarinho14/GymFlow/pull/1) |
| Luiz Vinícius Moraes dos Santos | 22609501 | [@luizvncsmds](https://github.com/luizvncsmds) | Integração da API Wger | [#4 — API externa](https://github.com/davidmarinho14/GymFlow/pull/4) |
| Eduardo Simari de Lourenço Rocha | 22610027 | [@EduardoSimari](https://github.com/EduardoSimari) | Interface responsiva e biblioteca de exercícios | [#3 — Frontend](https://github.com/davidmarinho14/GymFlow/pull/3) (complemento [#5](https://github.com/davidmarinho14/GymFlow/pull/5)) |
| Lukas Ferreira de Souza | 22609192 | [@lukasferreira00](https://github.com/lukasferreira00) | Testes automatizados, GitHub Actions e Docker | [#6 — Testes, CI e Docker](https://github.com/davidmarinho14/GymFlow/pull/6) |

## Como executar localmente

**Pré-requisitos:** Node.js 22 ou superior e npm.

```bash
git clone https://github.com/davidmarinho14/GymFlow.git
cd GymFlow
npm ci
npm start
```

Abra **http://localhost:3000** no navegador. Por padrão, o SQLite é criado em `data/gymflow.sqlite`.

## Testes automatizados

```bash
npm test
```

O projeto inclui **5 testes automatizados** em `test/api.test.js`, cobrindo:

1. Health check.
2. Cadastro e listagem de treinos.
3. Rejeição de dados inválidos.
4. Exclusão de treino e resposta 404 ao excluir novamente.
5. Marcação de treino como concluído.

Os testes usam SQLite em memória (`DB_PATH=:memory:`) para não alterar os dados locais.

## GitHub Actions

O workflow `.github/workflows/ci.yml` executa automaticamente `npm ci` e `npm test` em pushes e pull requests, usando Node.js 24.

**Execuções:** [GitHub Actions do GymFlow](https://github.com/davidmarinho14/GymFlow/actions).

## Docker e Docker Hub

Imagem publicada: **[lukaas22/gymflow](https://hub.docker.com/r/lukaas22/gymflow)**.

Para executar a imagem publicada:

```bash
docker run --rm -p 3000:3000 -v gymflow-data:/data lukaas22/gymflow:latest
```

Acesse **http://localhost:3000**. O volume nomeado `gymflow-data` mantém os dados SQLite mesmo quando o contêiner é recriado.

Para construir localmente, como alternativa:

```bash
docker build -t gymflow .
docker run --rm -p 3000:3000 -v gymflow-data:/data gymflow
```

## Rotas da API

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | `/api/health` | Verificar se o servidor está funcionando |
| GET | `/api/treinos` | Listar treinos |
| POST | `/api/treinos` | Cadastrar treino |
| PUT | `/api/treinos/:id` | Atualizar treino |
| DELETE | `/api/treinos/:id` | Excluir treino |
| PATCH | `/api/treinos/:id/concluir` | Marcar ou desmarcar conclusão |
| GET | `/api/exercicios?limit=20&offset=0` | Consultar exercícios da Wger |

A consulta à Wger depende de conexão com a internet e da disponibilidade do serviço externo.

## Evidências de integração contínua e colaboração

### Pull request bloqueada pelo CI

Foi criada a **[PR #7 — Demonstração acadêmica: CI bloqueando merge](https://github.com/davidmarinho14/GymFlow/pull/7)**, a partir da branch temporária `demo/ci-bloqueado`, para demonstrar o funcionamento das verificações obrigatórias da branch `main`.

Apenas nessa branch de demonstração, a expectativa do teste de health check foi alterada intencionalmente de HTTP `200` para `500`. Como a aplicação respondeu corretamente `200`, os jobs **CI / test (pull_request)** e **CI / test (push)** falharam. Ambos apareciam como **Required**, e o botão **Merge pull request** ficou desabilitado, comprovando que a Ruleset impedia a integração com testes reprovados.

A PR foi fechada **sem merge**, mantendo a branch `main` com o código funcional.

**Evidência visual:** [print do bloqueio da PR #7](docs/evidencias/pr-7-ci-bloqueado.png.png) — inserir a imagem nesse caminho antes de mesclar esta atualização.

**CI funcionando:** [execução bem-sucedida do GitHub Actions](https://github.com/davidmarinho14/GymFlow/actions/runs/40444787191).

### Conflitos de merge

Durante a integração das branches por pull requests, **não houve conflitos de merge que precisassem ser resolvidos manualmente**, conforme informado pelo grupo. As contribuições foram integradas à branch `main` por meio das PRs listadas acima.

## Colaboração

O desenvolvimento foi dividido entre os integrantes por branches e pull requests, com integração à `main`. O histórico das contribuições está disponível em [Pull Requests](https://github.com/davidmarinho14/GymFlow/pulls?q=is%3Apr+is%3Aclosed).

## Links

- [Código-fonte no GitHub](https://github.com/davidmarinho14/GymFlow)
- [GitHub Actions](https://github.com/davidmarinho14/GymFlow/actions)
- [Imagem no Docker Hub](https://hub.docker.com/r/lukaas22/gymflow)
