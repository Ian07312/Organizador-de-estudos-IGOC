// Função igual à do seu sistema
function getPeso(prio) {
  if (prio === 'Alta') return 3;
  if (prio === 'Média') return 2;
  return 1;
}

// Testes

test('prioridade Alta retorna 3', () => {
  expect(getPeso('Alta')).toBe(3);
});

test('prioridade Média retorna 2', () => {
  expect(getPeso('Média')).toBe(2);
});

test('prioridade Baixa retorna 1', () => {
  expect(getPeso('Baixa')).toBe(1);
});


// Teste de tempo (simulando soma de tempo)
function somaTempo(a, b) {
  return a + b;
}

test('soma de tempo funciona corretamente', () => {
  expect(somaTempo(1000, 2000)).toBe(3000);
});


// Teste de formatação de tempo (simulação)
function timeToString(t) {
  let h = Math.floor(t / 3600000);
  let m = Math.floor((t % 3600000) / 60000);
  let s = Math.floor((t % 60000) / 1000);

  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

test('formata tempo corretamente', () => {
  expect(timeToString(3661000)).toBe("01:01:01");
});

// ===== TESTE DE STATUS =====

function alterarStatus(materia, novoStatus) {
  materia.status = novoStatus;
  return materia;
}

test('altera status para concluído', () => {
  const m = { status: 'Pendente' };
  const atualizado = alterarStatus(m, 'Concluído');
  expect(atualizado.status).toBe('Concluído');
});
