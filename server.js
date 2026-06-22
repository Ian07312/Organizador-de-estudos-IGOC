// ============================================
// SERVIDOR BACK-END — ORGANIZADOR DE ESTUDOS IGOC
// Tecnologia: Node.js + Express
// Dados: Memória (mock) — sem banco de dados
// Porta: 3000
// ============================================

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Libera CORS para o frontend consumir a API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve os arquivos estáticos (index.html, etc.)
app.use(express.static(path.join(__dirname)));

// ============================================
// DADOS EM MEMÓRIA (mock — substitui o banco)
// ============================================

let materias   = [];
let relatorios = [];
let notas      = [];
let feedbacks  = []; // <-- NOVA ENTIDADE OBRIGATÓRIA (NPS/AVALIAÇÃO)

// ============================================
// ROTAS — MATÉRIAS
// ============================================

// READ — Listar todas as matérias
app.get('/api/materias', (req, res) => {
  res.json(materias);
});

// CREATE — Adicionar nova matéria
app.post('/api/materias', (req, res) => {
  const { nome, conteudo, data, hora, prio } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O campo "nome" é obrigatório.' });
  }

  function getPeso(p) {
    if (p === 'Alta')  return 3;
    if (p === 'Média') return 2;
    return 1;
  }

  const novaMateria = {
    id:       Date.now(),
    nome,
    conteudo: conteudo || '',
    data:     data     || '',
    hora:     hora     || '',
    prio:     prio     || 'Média',
    peso:     getPeso(prio),
    tempo:    0,
    revisao:  'Pendente',
    status:   'Pendente',
    finalizada: false
  };

  materias.push(novaMateria);
  res.status(201).json(novaMateria);
});

// DELETE — Remover matéria pelo ID
app.delete('/api/materias/:id', (req, res) => {
  const id = Number(req.params.id);
  const antes = materias.length;
  materias = materias.filter(m => m.id !== id);

  if (materias.length === antes) {
    return res.status(404).json({ erro: 'Matéria não encontrada.' });
  }

  res.json({ mensagem: 'Matéria removida com sucesso.' });
});

// ============================================
// ROTAS — RELATÓRIOS
// ============================================

// READ — Listar relatórios
app.get('/api/relatorios', (req, res) => {
  res.json(relatorios);
});

// CREATE — Salvar relatório
app.post('/api/relatorios', (req, res) => {
  const { materiaId, materiaNome, total, acertos, erros, revisao, tempo } = req.body;

  if (!materiaId || !total) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
  }

  function gerarDica(e, nota) {
    if (nota >= 8)  return 'Excelente desempenho!';
    if (e    >= 5)  return 'Revise os tópicos com mais dificuldade.';
    return 'Continue praticando.';
  }

  const nota = ((acertos / total) * 10).toFixed(1);

  const novoRelatorio = {
    id:      Date.now(),
    materia: materiaNome,
    tempo:   tempo || 0,
    nota,
    total,
    acertos,
    erros,
    revisao: revisao || 'Nenhuma observação',
    dica:    gerarDica(erros, nota),
    fechado: false
  };

  relatorios.push(novoRelatorio);
  res.status(201).json(novoRelatorio);
});

// DELETE — Fechar/remover relatório
app.delete('/api/relatorios/:id', (req, res) => {
  const id = Number(req.params.id);
  const rel = relatorios.find(r => r.id === id);
  if (!rel) return res.status(404).json({ erro: 'Relatório não encontrado.' });
  rel.fechado = true;
  res.json({ mensagem: 'Relatório fechado.' });
});

// ============================================
// ROTAS — NOTAS
// ============================================

// READ — Listar notas
app.get('/api/notas', (req, res) => {
  res.json(notas);
});

// CREATE — Salvar nota
app.post('/api/notas', (req, res) => {
  const { materiaId, materiaNome, valor, tipo, obs } = req.body;

  if (!materiaId) {
    return res.status(400).json({ erro: 'Selecione uma matéria.' });
  }

  const novaNota = {
    id:      Date.now(),
    materia: materiaNome,
    valor:   Number(valor),
    tipo:    tipo  || 'Prova',
    obs:     obs   || 'Sem observações',
    data:    new Date().toLocaleDateString('pt-BR')
  };

  notas.push(novaNota);
  res.status(201).json(novaNota);
});

// DELETE — Remover nota
app.delete('/api/notas/:id', (req, res) => {
  const id = Number(req.params.id);
  const antes = notas.length;
  notas = notas.filter(n => n.id !== id);

  if (notas.length === antes) {
    return res.status(404).json({ erro: 'Nota não encontrada.' });
  }

  res.json({ mensagem: 'Nota removida.' });
});

// ============================================
// ROTAS — FEEDBACKS (EXIGÊNCIA OBRIGATÓRIA ABP / NPS)
// ============================================

// READ — Listar todos os feedbacks enviados
app.get('/api/feedbacks', (req, res) => {
  res.json(feedbacks);
});

// CREATE — Salvar um novo feedback/nota NPS sobre o sistema
app.post('/api/feedbacks', (req, res) => {
  const { texto, notaNps } = req.body;

  if (!texto) {
    return res.status(400).json({ erro: 'O texto do feedback é obrigatório.' });
  }

  const novoFeedback = {
    id: Date.now(),
    texto,
    notaNps: Number(notaNps) || 10,
    data: new Date().toLocaleDateString('pt-BR')
  };

  feedbacks.push(novoFeedback);
  res.status(201).json(novoFeedback);
});

// DELETE — Remover feedback pelo ID
app.delete('/api/feedbacks/:id', (req, res) => {
  const id = Number(req.params.id);
  const antes = feedbacks.length;
  feedbacks = feedbacks.filter(f => f.id !== id);

  if (feedbacks.length === antes) {
    return res.status(404).json({ erro: 'Feedback não encontrado.' });
  }

  res.json({ mensagem: 'Feedback removido com sucesso.' });
});

// ============================================
// ROTA DE STATUS — verifica se o servidor está no ar
// ============================================
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', mensagem: 'Servidor IGOC operando com sucesso!' });
});

// ============================================
// INICIALIZAÇÃO
// ============================================
app.listen(PORT, () => {
  console.log(`✅ Servidor IGOC rodando em http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}/index.html`);
  console.log(`   Status:   http://localhost:${PORT}/api/status`);
  console.log(`   Feedbacks: http://localhost:${PORT}/api/feedbacks`);
});