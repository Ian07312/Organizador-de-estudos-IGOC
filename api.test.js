// ============================================
// TESTE DE INTEGRAÇÃO — BrasilAPI Feriados
// IGOC — Cronograma de Estudos
//
// Como rodar:
//   npm install --save-dev jest node-fetch
//   npx jest
// ============================================

const fetch = require('node-fetch');

const BASE_URL = 'https://brasilapi.com.br/api/feriados/v1';
const ANO_TESTE = new Date().getFullYear();

// ---- Funções espelhadas do main.js ----

async function buscarFeriados(ano) {
  const res = await fetch(`${BASE_URL}/${ano}`);
  if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
  return await res.json();
}

async function verificarFeriado(dataStr) {
  if (!dataStr) return null;
  const ano = dataStr.split('-')[0];
  const feriados = await buscarFeriados(ano);
  return feriados.find(f => f.date === dataStr) || null;
}

// ============================================
// TESTES
// ============================================

describe('Integração com BrasilAPI — Feriados Nacionais', () => {

  // 1. API responde com status 200
  test('API retorna status 200 para o ano atual', async () => {
    const res = await fetch(`${BASE_URL}/${ANO_TESTE}`);
    expect(res.status).toBe(200);
  });

  // 2. Retorna uma lista (array) de feriados
  test('Resposta é um array com feriados', async () => {
    const feriados = await buscarFeriados(ANO_TESTE);
    expect(Array.isArray(feriados)).toBe(true);
    expect(feriados.length).toBeGreaterThan(0);
  });

  // 3. Cada feriado tem os campos necessários
  test('Cada feriado possui os campos "date" e "name"', async () => {
    const feriados = await buscarFeriados(ANO_TESTE);
    feriados.forEach(f => {
      expect(f).toHaveProperty('date');
      expect(f).toHaveProperty('name');
      expect(typeof f.date).toBe('string');
      expect(typeof f.name).toBe('string');
    });
  });

  // 4. Natal (25/12) é detectado como feriado
  test('25 de dezembro é identificado como feriado (Natal)', async () => {
    const data = `${ANO_TESTE}-12-25`;
    const feriado = await verificarFeriado(data);
    expect(feriado).not.toBeNull();
    expect(feriado.name.toLowerCase()).toContain('natal');
  });

  // 5. Data comum não é feriado
  test('Uma data comum não é identificada como feriado', async () => {
    const data = `${ANO_TESTE}-06-10`; // 10 de junho — não é feriado nacional
    const feriado = await verificarFeriado(data);
    expect(feriado).toBeNull();
  });

  // 6. Data vazia retorna null sem erro
  test('Data vazia retorna null sem quebrar', async () => {
    const feriado = await verificarFeriado('');
    expect(feriado).toBeNull();
  });

  // 7. API aceita anos diferentes
  test('API retorna feriados para anos diferentes', async () => {
    const feriados2024 = await buscarFeriados(2024);
    const feriados2025 = await buscarFeriados(2025);
    expect(feriados2024.length).toBeGreaterThan(0);
    expect(feriados2025.length).toBeGreaterThan(0);
  });

});
