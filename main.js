const { app, BrowserWindow, Menu } = require('electron');

let win;

function createWindow() {

  win = new BrowserWindow({
    width: 1200,
    height: 950,
    title: "CRONOGRAMA DE ESTUDOS IGOC",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(null);

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-br">

<head>
<meta charset="UTF-8">
<title>IGOC</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
<style>

:root{
  --gold:#d4af37;
  --gold-bright:#f9d976;
  --black:#0a0a0a;
  --dark-gray:#1a1a1a;
  --alta:#eb4d4b;
  --media:#f0932b;
  --baixa:#6ab04c;
}

body{
  font-family:'Segoe UI',sans-serif;
  background:var(--black);
  color:white;
  margin:0;
  padding:20px;
}

.container{
  max-width:1100px;
  margin:auto;
  display:flex;
  flex-direction:column;
  gap:20px;
}

.header{
  background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);
  padding:20px;
  border-radius:20px;
  text-align:center;
  border:1px solid var(--gold);
}

.api-status{
  text-align:center;
  font-size:11px;
  color:#555;
  margin-top:8px;
}

.section-card{
  background:var(--dark-gray);
  padding:25px;
  border-radius:20px;
}

label{
  color:var(--gold);
  font-size:11px;
  font-weight:bold;
  text-transform:uppercase;
  display:block;
  margin-bottom:5px;
}

input,
textarea,
select{
  width:100%;
  padding:12px;
  background:#000;
  border:1px solid var(--gold);
  border-radius:8px;
  color:var(--gold-bright);
  margin-bottom:10px;
  box-sizing:border-box;
}

.btn-main{
  background:linear-gradient(135deg,var(--gold) 0%,#b8860b 100%);
  color:black;
  border:none;
  padding:15px;
  border-radius:10px;
  font-weight:800;
  cursor:pointer;
  width:100%;
}

.btn-main:hover{
  opacity:.9;
}

.materia-item{
  background:#111;
  padding:20px;
  border-radius:12px;
  margin-top:10px;
  border-left:6px solid var(--gold);
}

.rev-btn{
  background:#222;
  color:var(--gold);
  border:1px solid var(--gold);
  padding:6px 10px;
  border-radius:4px;
  cursor:pointer;
}

.rev-btn:hover{
  background:#333;
}

.status-select{
  width:auto;
  padding:5px;
  margin:0;
  height:30px;
}

.dashboard{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
}

.chart-box{
  background:#111;
  padding:15px;
  border-radius:15px;
  height:380px;
}

canvas{
  max-width:100%;
  max-height:250px;
}

h2{
  color:var(--gold);
  text-align:center;
}

.time-badge{
  background:rgba(212,175,55,0.2);
  color:var(--gold);
  padding:2px 8px;
  border-radius:4px;
  font-size:11px;
}

.info-row{
  display:flex;
  gap:15px;
  flex-wrap:wrap;
  color:#ccc;
  font-size:13px;
  margin-top:5px;
}

.finalizada{
  opacity:.6;
  border-left:6px solid #6ab04c !important;
}

.nota-card{
  margin-top:12px;
  padding:12px;
  background:#0d0d0d;
  border-radius:10px;
  border:1px solid #222;
}

.alerta-feriado{
  background:linear-gradient(135deg,#eb4d4b,#c0392b);
  color:white;
  padding:16px 20px;
  border-radius:12px;
  border-left:6px solid var(--gold-bright);
  display:flex;
  justify-content:space-between;
  align-items:center;
  animation:fadeIn .4s ease;
}

@keyframes fadeIn{
  from{opacity:0;transform:translateY(-8px);}
  to{opacity:1;transform:translateY(0);}
}

.alerta-feriado p{
  margin:4px 0 0;
  font-size:13px;
  opacity:.9;
}

.alerta-close{
  background:none;
  border:none;
  color:white;
  font-size:18px;
  cursor:pointer;
  padding:0 8px;
}

</style>
</head>

<body>

<div class="container">

  <!-- HEADER -->
  <div class="header">
    <h1>CRONOGRAMA DE ESTUDOS IGOC</h1>
    <div class="api-status" id="apiStatus">⏳ Verificando API de Feriados...</div>
  </div>

  <!-- ALERTA FERIADO (dinâmico) -->
  <div id="alertaFeriado" style="display:none;" class="alerta-feriado">
    <div>
      <strong>⚠️ Atenção: Data em Feriado Nacional!</strong>
      <p id="alertaFeriadoTexto"></p>
    </div>
    <button class="alerta-close" onclick="fecharAlerta()">✕</button>
  </div>

  <!-- CRONÔMETRO -->
  <div class="section-card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div id="display" style="font-size:40px;font-family:monospace;color:var(--gold-bright)">
        00:00:00
      </div>
      <div>
        <button onclick="startTimer()" class="rev-btn">Iniciar</button>
        <button onclick="stopTimer()" class="rev-btn">Pausar</button>
        <button onclick="resetTimer()" class="rev-btn">Zerar</button>
      </div>
    </div>
    <div style="margin-top:15px;display:flex;gap:10px">
      <select id="selMat" style="margin:0">
        <option value="">Vincular à matéria...</option>
      </select>
      <button onclick="salvarTempo()" class="btn-main" style="width:120px;padding:10px">
        Salvar
      </button>
    </div>
  </div>

  <!-- CADASTRO -->
  <div class="section-card">
    <label>Matéria</label>
    <input type="text" id="inNome">

    <label>Conteúdo</label>
    <textarea id="inCont" rows="2"></textarea>

    <div style="display:flex;gap:10px">
      <div style="flex:1">
        <label>Data da Prova</label>
        <input type="date" id="inData">
      </div>
      <div style="flex:1">
        <label>Hora da Prova</label>
        <input type="time" id="inHora">
      </div>
    </div>

    <div style="display:flex;gap:10px">
      <div style="flex:1">
        <label>Prioridade</label>
        <select id="inPrio">
          <option value="Alta">Alta</option>
          <option value="Média" selected>Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </div>
      <button onclick="addMateria()" class="btn-main" style="flex:1;margin-top:20px">
        Agendar
      </button>
    </div>
  </div>

  <!-- LISTA DE MATÉRIAS -->
  <div id="lista"></div>

  <!-- GRÁFICOS -->
  <div class="dashboard">
    <div class="chart-box">
      <h2>Horas Dedicadas</h2>
      <canvas id="chartHoras"></canvas>
    </div>
    <div class="chart-box">
      <h2>Carga por Dificuldade</h2>
      <canvas id="chartConteudo"></canvas>
    </div>
  </div>

  <!-- RELATÓRIOS -->
  <div class="section-card">
    <h2>RELATÓRIO DE DESEMPENHO</h2>
    <div style="display:flex;gap:15px;flex-wrap:wrap;">
      <div style="flex:1;min-width:250px;">
        <label>Selecionar Matéria</label>
        <select id="relMateria"></select>
      </div>
      <div style="width:180px;">
        <label>Total de Questões</label>
        <input type="number" id="relTotal" min="1">
      </div>
      <div style="width:180px;">
        <label>Questões Certas</label>
        <input type="number" id="relAcertos" min="0">
      </div>
      <div style="width:180px;">
        <label>Questões Erradas</label>
        <input type="number" id="relErros" min="0">
      </div>
    </div>
    <label>Revisão</label>
    <textarea id="relRevisao" rows="4"></textarea>
    <button onclick="salvarRelatorio()" class="btn-main">Salvar Relatório</button>
    <div id="listaRelatorios" style="margin-top:20px;"></div>
  </div>

  <!-- NOTAS -->
  <div class="section-card">
    <h2>NOTAS POR MATÉRIA</h2>
    <div style="display:flex;gap:15px;flex-wrap:wrap;">
      <div style="flex:1;min-width:250px;">
        <label>Matéria</label>
        <select id="notaMateria">
          <option value="">Selecionar matéria...</option>
        </select>
      </div>
      <div style="width:180px;">
        <label>Nota</label>
        <input type="number" id="notaValor" min="0" max="10" step="0.1">
      </div>
      <div style="width:180px;">
        <label>Tipo</label>
        <select id="notaTipo">
          <option value="Prova">Prova</option>
          <option value="Trabalho">Trabalho</option>
          <option value="Simulado">Simulado</option>
          <option value="Atividade">Atividade</option>
        </select>
      </div>
    </div>
    <label>Observação</label>
    <textarea id="notaObs" rows="3" placeholder="Ex: dificuldade em cálculo, revisar teoria"></textarea>
    <button onclick="salvarNota()" class="btn-main">Salvar Nota</button>
    <div id="listaNotas" style="margin-top:20px;"></div>
  </div>

</div>

<script>

// ============================================
// ESTADO
// ============================================
let materias   = [];
let relatorios = [];
let notas      = [];
let startTime;
let elapsedTime = 0;
let timerInterval;
let chartH;
let chartC;

// Cache de feriados por ano
let feriadosCache = {};

const eliteColors = [
  '#d4af37','#f9d976','#eb4d4b',
  '#f0932b','#6ab04c','#1e3799','#4834d4'
];

// ============================================
// INTEGRAÇÃO COM API — BrasilAPI Feriados
// ============================================

async function buscarFeriados(ano) {
  if (feriadosCache[ano]) return feriadosCache[ano];
  try {
    const res = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano);
    if (!res.ok) throw new Error('Erro na API');
    const dados = await res.json();
    feriadosCache[ano] = dados;
    return dados;
  } catch(e) {
    console.error('Erro ao buscar feriados:', e);
    return [];
  }
}

async function verificarFeriado(dataStr) {
  if (!dataStr) return null;
  const ano = dataStr.split('-')[0];
  const feriados = await buscarFeriados(ano);
  return feriados.find(f => f.date === dataStr) || null;
}

function exibirAlertaFeriado(nomeFeriado, nomeMateria) {
  const alerta = document.getElementById('alertaFeriado');
  const texto  = document.getElementById('alertaFeriadoTexto');
  texto.innerHTML =
    'A prova de <strong>' + nomeMateria + '</strong> está marcada para o feriado de <strong>' + nomeFeriado + '</strong>. Verifique com o professor.';
  alerta.style.display = 'flex';
  alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function fecharAlerta() {
  document.getElementById('alertaFeriado').style.display = 'none';
}

async function verificarStatusAPI() {
  const el = document.getElementById('apiStatus');
  try {
    const ano = new Date().getFullYear();
    const res = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano);
    if (res.ok) {
      el.innerHTML = '🟢 API de Feriados Nacionais conectada';
      el.style.color = '#6ab04c';
    } else {
      throw new Error();
    }
  } catch {
    el.innerHTML = '🔴 API de Feriados offline — verifique sua conexão';
    el.style.color = '#eb4d4b';
  }
}

// ============================================
// CRONÔMETRO
// ============================================

function timeToString(t) {
  let h = Math.floor(t / 3600000);
  let m = Math.floor((t % 3600000) / 60000);
  let s = Math.floor((t % 60000) / 1000);
  return String(h).padStart(2,"0") + ":" +
         String(m).padStart(2,"0") + ":" +
         String(s).padStart(2,"0");
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    document.getElementById("display").innerText = timeToString(elapsedTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  document.getElementById("display").innerText = "00:00:00";
}

function salvarTempo() {
  const id = document.getElementById("selMat").value;
  if (!id) return;
  const m = materias.find(x => x.id == id);
  if (m) {
    m.tempo += elapsedTime;
    resetTimer();
    renderizar();
  }
}

// ============================================
// MATÉRIAS
// ============================================

function getPeso(prio) {
  if (prio === 'Alta')  return 3;
  if (prio === 'Média') return 2;
  return 1;
}

async function addMateria() {
  const nome = document.getElementById("inNome").value.trim();
  if (!nome) { alert("Digite a matéria"); return; }

  const dataProva   = document.getElementById("inData").value;
  const prioridade  = document.getElementById("inPrio").value;

  materias.push({
    id:       Date.now(),
    nome:     nome,
    conteudo: document.getElementById("inCont").value,
    data:     dataProva,
    hora:     document.getElementById("inHora").value,
    prio:     prioridade,
    peso:     getPeso(prioridade),
    tempo:    0,
    revisao:  "Pendente",
    status:   "Pendente"
  });

  document.getElementById("inNome").value = "";
  document.getElementById("inCont").value = "";

  renderizar();

  // ---- CHAMADA À API ----
  if (dataProva) {
    const feriado = await verificarFeriado(dataProva);
    if (feriado) exibirAlertaFeriado(feriado.name, nome);
  }
}

function alterarStatus(id, status) {
  const m = materias.find(x => x.id == id);
  if (m) {
    m.status = status;
    if (status === "Concluído") m.finalizada = true;
  }
  renderizar();
}

function agendarRevisao(id, dias) {
  const m = materias.find(x => x.id == id);
  if (!m) return;
  const d = new Date();
  d.setDate(d.getDate() + dias);
  m.revisao = d.toLocaleDateString();
  renderizar();
}

function remover(id) {
  materias = materias.filter(m => m.id !== id);
  renderizar();
}

// ============================================
// RELATÓRIOS
// ============================================

function gerarDica(erros, nota) {
  if (nota >= 8)   return "Excelente desempenho.";
  if (erros >= 5)  return "Revise os tópicos com mais dificuldade.";
  return "Continue praticando.";
}

function salvarRelatorio() {
  const materiaId = document.getElementById("relMateria").value;
  const total     = Number(document.getElementById("relTotal").value);
  const acertos   = Number(document.getElementById("relAcertos").value);
  const erros     = Number(document.getElementById("relErros").value);
  const revisao   = document.getElementById("relRevisao").value;

  if (!materiaId || total <= 0) { alert("Informe o total!"); return; }

  const nota    = ((acertos / total) * 10).toFixed(1);
  const materia = materias.find(m => m.id == materiaId);

  relatorios.push({
    id:      Date.now(),
    materia: materia.nome,
    tempo:   materia.tempo,
    nota:    nota,
    total:   total,
    acertos: acertos,
    erros:   erros,
    revisao: revisao || "Nenhuma observação",
    dica:    gerarDica(erros, nota),
    fechado: false
  });

  renderizarRelatorios();
}

function fecharRelatorio(id) {
  const r = relatorios.find(x => x.id === id);
  if (r) r.fechado = true;
  renderizarRelatorios();
}

function renderizarRelatorios() {
  const lista = document.getElementById("listaRelatorios");
  lista.innerHTML = "";
  relatorios.forEach(r => {
    if (r.fechado) return;
    const horas = (r.tempo / 3600000).toFixed(2);
    const div   = document.createElement("div");
    div.className = "materia-item";
    div.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>\${r.materia}</strong>
        <span class="time-badge">NOTA: \${r.nota}/10</span>
      </div>
      <div class="info-row">
        <span>📚 Horas: \${horas}h</span>
        <span>✅ Acertos: \${r.acertos}</span>
        <span>❌ Erros: \${r.erros}</span>
        <span>📄 Total: \${r.total}</span>
      </div>
      <div style="margin-top:10px;">
        <strong style="color:var(--gold)">Revisões Necessárias:</strong>
        <p style="color:#ccc;font-size:13px;">\${r.revisao}</p>
      </div>
      <div style="margin-top:10px;">
        <strong style="color:#6ab04c;">Dica Automática:</strong>
        <p style="color:#7ed6df;font-size:13px;">\${r.dica}</p>
      </div>
      <button class="rev-btn" style="margin-top:15px;color:red;border-color:red"
        onclick="fecharRelatorio(\${r.id})">Fechar Relatório</button>
    \`;
    lista.appendChild(div);
  });
}

// ============================================
// NOTAS
// ============================================

function salvarNota() {
  const materiaId = document.getElementById("notaMateria").value;
  const valor     = Number(document.getElementById("notaValor").value);
  const tipo      = document.getElementById("notaTipo").value;
  const obs       = document.getElementById("notaObs").value;

  if (!materiaId) { alert("Selecione a matéria"); return; }

  const materia = materias.find(m => m.id == materiaId);
  notas.push({
    id:      Date.now(),
    materia: materia.nome,
    valor:   valor,
    tipo:    tipo,
    obs:     obs || "Sem observações",
    data:    new Date().toLocaleDateString()
  });

  renderizarNotas();
}

function renderizarNotas() {
  const lista = document.getElementById("listaNotas");
  lista.innerHTML = "";
  const agrupadas = {};
  notas.forEach(n => {
    if (!agrupadas[n.materia]) agrupadas[n.materia] = [];
    agrupadas[n.materia].push(n);
  });
  Object.keys(agrupadas).forEach(materia => {
    const notasMateria = agrupadas[materia];
    const media = (notasMateria.reduce((s,n) => s + n.valor, 0) / notasMateria.length).toFixed(1);
    const box   = document.createElement("div");
    box.className = "materia-item";
    let html = \`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>\${materia}</strong>
        <span class="time-badge">MÉDIA: \${media}</span>
      </div>
    \`;
    notasMateria.forEach(n => {
      html += \`
        <div class="nota-card">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:var(--gold)">\${n.tipo}</span>
            <strong style="color:\${n.valor >= 7 ? '#6ab04c' : '#eb4d4b'}">\${n.valor}</strong>
          </div>
          <div style="font-size:12px;color:#aaa;">📅 \${n.data}</div>
          <div style="margin-top:8px;color:#ccc;font-size:13px;">\${n.obs}</div>
        </div>
      \`;
    });
    box.innerHTML = html;
    lista.appendChild(box);
  });
}

// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================

function renderizar() {
  const lista    = document.getElementById("lista");
  const sel      = document.getElementById("selMat");
  const relSel   = document.getElementById("relMateria");
  const notaSel  = document.getElementById("notaMateria");

  lista.innerHTML   = "";
  sel.innerHTML     = '<option value="">Vincular à matéria...</option>';
  relSel.innerHTML  = '<option value="">Selecionar matéria...</option>';
  notaSel.innerHTML = '<option value="">Selecionar matéria...</option>';

  materias.forEach(m => {
    [sel, relSel, notaSel].forEach(s => {
      const opt = document.createElement("option");
      opt.value    = m.id;
      opt.innerText = m.nome;
      s.appendChild(opt);
    });

    const div = document.createElement("div");
    div.className = m.finalizada ? "materia-item finalizada" : "materia-item";
    div.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>\${m.nome}</strong>
        <div style="display:flex;gap:10px;align-items:center;">
          <select class="status-select" onchange="alterarStatus(\${m.id},this.value)">
            <option value="Pendente"  \${m.status==='Pendente'  ? 'selected':''}>⏳ Pendente</option>
            <option value="Concluído" \${m.status==='Concluído' ? 'selected':''}>✅ Concluído</option>
          </select>
          <span class="time-badge">\${timeToString(m.tempo)}</span>
        </div>
      </div>
      <div class="info-row">
        <span>📅 \${m.data || '--'}</span>
        <span>⏰ \${m.hora || '--'}</span>
        <span>🔥 \${m.prio}</span>
      </div>
      <p style="color:#aaa;">📖 \${m.conteudo || 'Sem detalhes'}</p>
      <div style="font-size:11px;color:var(--gold)">Revisão: \${m.revisao}</div>
      <div style="display:flex;gap:5px;margin-top:10px;">
        <button class="rev-btn" onclick="agendarRevisao(\${m.id},1)">+24h</button>
        <button class="rev-btn" onclick="agendarRevisao(\${m.id},7)">+7 dias</button>
        <button class="rev-btn" style="color:red;border-color:red" onclick="remover(\${m.id})">Remover</button>
      </div>
    \`;
    lista.appendChild(div);
  });

  atualizarGraficos();
}

// ============================================
// GRÁFICOS
// ============================================

function atualizarGraficos() {
  if (materias.length === 0) {
    if (chartH) chartH.destroy();
    if (chartC) chartC.destroy();
    return;
  }
  const resumoHoras = {};
  const resumoPeso  = {};
  materias.forEach(m => {
    resumoHoras[m.nome] = (resumoHoras[m.nome] || 0) + (m.tempo / 3600000);
    resumoPeso[m.nome]  = (resumoPeso[m.nome]  || 0) + m.peso;
  });
  const labels = Object.keys(resumoHoras);
  if (chartH) chartH.destroy();
  if (chartC) chartC.destroy();
  chartH = new Chart(document.getElementById('chartHoras'), {
    type: 'bar',
    data: { labels, datasets: [{ data: Object.values(resumoHoras), backgroundColor: eliteColors }] }
  });
  chartC = new Chart(document.getElementById('chartConteudo'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: Object.values(resumoPeso), backgroundColor: eliteColors }] }
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================
verificarStatusAPI();

<\/script>

</body>
</html>
  `;

  win.loadURL(
    'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)
  );
}

app.whenReady().then(createWindow);