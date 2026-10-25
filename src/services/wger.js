const ENDPOINT = 'https://wger.de/api/v2/exerciseinfo/';

class WgerError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = 'WgerError';
    this.status = status;
  }
}

async function listarExercicios({ limit = 20, offset = 0 } = {}) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new WgerError('A API de exercícios está indisponível.');
    const data = await response.json();
    if (!Number.isInteger(data.count) || data.count < 0 || !Array.isArray(data.results) ||
        !data.results.every(item => Number.isInteger(item.id) && Array.isArray(item.translations))) {
      throw new WgerError('A API de exercícios retornou uma resposta inválida.');
    }
    // Mantém traduções, autoria e licenças fornecidas pela Wger.
    return { count: data.count, limit, offset, results: data.results };
  } catch (error) {
    if (error instanceof WgerError) throw error;
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new WgerError('Tempo limite ao consultar a API de exercícios.', 504);
    }
    throw new WgerError('Não foi possível consultar a API de exercícios.');
  }
}

module.exports = { listarExercicios, WgerError };
