const { app, BrowserWindow, Menu } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
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
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        :root {
          --gold: #d4af37;
          --gold-bright: #f9d976;
          --black: #0a0a0a;
          --dark-gray: #1a1a1a;
          --alta: #eb4d4b;
          --media: #f0932b;
          --baixa: #6ab04c;
        }

        body {
          font-family: 'Segoe UI', sans-serif;
          background: var(--black);
          color: white; margin: 0; padding: 20px;
        }

        .container { max-width: 1000px; margin: auto; display: flex; flex-direction: column; gap: 20px; }

        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          padding: 20px; border-radius: 20px; text-align: center;
          border: 1px solid var(--gold); box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .section-card { background: var(--dark-gray); padding: 25px; border-radius: 20px; border: 1px solid #333; }
        
        label { color: var(--gold); font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 5px; }

        input, textarea, select {
          width: 100%; padding: 12px; background: #000 !important; 
          border: 1.5px solid var(--gold) !important;
          border-radius: 8px; color: var(--gold-bright) !important;
          font-size: 14px; margin-bottom: 10px; box-sizing: border-box;
          -webkit-user-select: text !important;
        }

        .btn-main {
          background: linear-gradient(135deg, var(--gold) 0%, #b8860b 100%);
          color: black; border: none; padding: 15px; border-radius: 10px;
          font-weight: 800; cursor: pointer; width: 100%; text-transform: uppercase;
        }

        .materia-item {
            background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222;
            margin-top: 10px; border-left: 6px solid var(--gold);
        }
        
        .rev-btn { background: #222; color: var(--gold); border: 1px solid var(--gold); padding: 5px 10px; border-radius: 4px; font-size: 10px; cursor: pointer; margin-top: 10px; }

        .status-select { width: auto; padding: 5px; margin: 0; font-size: 11px; height: 30px; }

        .dashboard {
            display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;
            padding: 20px; background: #050505; border-radius: 20px; border: 1px dashed var(--gold);
        }
        .chart-box { 
            background: #111; padding: 15px; border-radius: 15px; 
            display: flex; flex-direction: column; align-items: center;
            height: 380px; 
            position: relative;
        }
        canvas { max-width: 100% !important; max-height: 250px !important; }

        h2 { color: var(--gold); font-size: 16px; text-align: center; text-transform: uppercase; margin-bottom: 15px; }
        .time-badge { background: rgba(212, 175, 55, 0.2); color: var(--gold); padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .info-row { display: flex; gap: 15px; font-size: 13px; color: #ccc; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>CRONOGRAMA DE ESTUDOS IGOC</h1></div>

        <div class="section-card">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <div id="display" style="font-size: 40px; font-family: monospace; color: var(--gold-bright)">00:00:00</div>
            <div>
                <button onclick="startTimer()" class="rev-btn">Iniciar</button>
                <button onclick="stopTimer()" class="rev-btn">Pausar</button>
                <button onclick="resetTimer()" class="rev-btn">Zerar</button>
            </div>
          </div>
          <div style="margin-top:15px; display:flex; gap:10px">
            <select id="selMat" style="margin:0"><option value="">Vincular à matéria...</option></select>
            <button onclick="salvarTempo()" class="btn-main" style="width:120px; padding:10px">Salvar</button>
          </div>
        </div>

        <div class="section-card">
          <label>Matéria</label>
          <input type="text" id="inNome">
          
          <label>Conteúdo</label>
          <textarea id="inCont" rows="2"></textarea>

          <div style="display:flex; gap:10px">
            <div style="flex:1"><label>Data da Prova</label><input type="date" id="inData"></div>
            <div style="flex:1"><label>Hora da Prova</label><input type="time" id="inHora"></div>
          </div>

          <div style="display:flex; gap:10px">
            <div style="flex:1">
                <label>Prioridade / Dificuldade</label>
                <select id="inPrio">
                    <option value="Alta">Alta (Peso 3)</option>
                    <option value="Média" selected>Média (Peso 2)</option>
                    <option value="Baixa">Baixa (Peso 1)</option>
                </select>
            </div>
            <button onclick="addMateria()" class="btn-main" style="flex:1; margin-top:20px">Agendar</button>
          </div>
        </div>

        <div id="lista"></div>

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
      </div>

      <script>
        let materias = [];
        let startTime, elapsedTime = 0, timerInterval;
        let chartH, chartC;

        const eliteColors = [
            '#d4af37', '#f9d976', '#eb4d4b', '#f0932b', '#6ab04c', 
            '#1e3799', '#4834d4', '#be2edd', '#130f40', '#95afc0',
            '#22a6b3', '#7ed6df', '#e056fd', '#686de0', '#30336b'
        ];

        function timeToString(t) {
          let h = Math.floor(t / 3600000);
          let m = Math.floor((t % 3600000) / 60000);
          let s = Math.floor((t % 60000) / 1000);
          return \`\${h.toString().padStart(2,"0")}:\${m.toString().padStart(2,"0")}:\${s.toString().padStart(2,"0")}\`;
        }

        function startTimer() { 
            clearInterval(timerInterval); 
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(() => { 
                elapsedTime = Date.now() - startTime; 
                document.getElementById("display").innerText = timeToString(elapsedTime); 
            }, 1000);
        }
        function stopTimer() { clearInterval(timerInterval); }
        function resetTimer() { stopTimer(); elapsedTime = 0; document.getElementById("display").innerText = "00:00:00"; }

        function salvarTempo() {
            const id = document.getElementById("selMat").value;
            if(!id) return;
            const m = materias.find(x => x.id == id);
            if(m) { m.tempo += elapsedTime; resetTimer(); renderizar(); }
        }

        function getPeso(prio) {
            if(prio === 'Alta') return 3;
            if(prio === 'Média') return 2;
            return 1;
        }

        function addMateria() {
            const nomeInput = document.getElementById("inNome").value.trim();
            const contInput = document.getElementById("inCont").value.trim();
            const dataInput = document.getElementById("inData").value;
            const horaInput = document.getElementById("inHora").value;
            const prioInput = document.getElementById("inPrio").value;
            
            if(!nomeInput) return;

            materias.push({
                id: Date.now(),
                nome: nomeInput,
                conteudo: contInput,
                data: dataInput,
                hora: horaInput,
                prio: prioInput,
                peso: getPeso(prioInput),
                tempo: 0,
                revisao: "Pendente",
                status: "Pendente"
            });

            document.getElementById("inNome").value = "";
            document.getElementById("inCont").value = "";
            renderizar();
        }

        function alterarStatus(id, novoStatus) {
            const m = materias.find(x => x.id == id);
            if(m) m.status = novoStatus;
            renderizar();
        }

        function agendarRevisao(id, dias) {
            const m = materias.find(x => x.id == id);
            const data = new Date();
            data.setDate(data.getDate() + dias);
            m.revisao = data.toLocaleDateString();
            renderizar();
        }

        function remover(id) {
            materias = materias.filter(m => m.id !== id);
            renderizar();
        }

        function renderizar() {
            const lista = document.getElementById("lista");
            const sel = document.getElementById("selMat");
            lista.innerHTML = "";
            sel.innerHTML = '<option value="">Vincular à matéria...</option>';

            materias.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id; opt.innerText = \`\${m.nome} (\${m.data || 'S/D'})\`; sel.appendChild(opt);

                const div = document.createElement("div");
                div.className = "materia-item";
                div.style.borderLeftColor = m.prio === 'Alta' ? 'var(--alta)' : (m.prio === 'Média' ? 'var(--media)' : 'var(--baixa)');
                
                const dataFormatada = m.data ? m.data.split('-').reverse().join('/') : '--/--/----';

                div.innerHTML = \`
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <strong>\${m.nome}</strong>
                        <div style="display:flex; gap:10px; align-items:center">
                            <select class="status-select" onchange="alterarStatus(\${m.id}, this.value)">
                                <option value="Pendente" \${m.status === 'Pendente' ? 'selected' : ''}>⏳ Pendente</option>
                                <option value="Concluído" \${m.status === 'Concluído' ? 'selected' : ''}>✅ Concluído</option>
                            </select>
                            <span class="time-badge">ESTUDADO: \${timeToString(m.tempo)}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <span>📅 \${dataFormatada}</span>
                        <span>⏰ \${m.hora || '--:--'}</span>
                        <span>🔥 Prioridade: \${m.prio}</span>
                    </div>
                    <p style="color:#aaa; font-size:13px; margin: 10px 0;">📖 \${m.conteudo || 'Sem detalhes'}</p>
                    <div style="font-size:11px; color:var(--gold)">Revisão: \${m.revisao}</div>
                    <div style="display:flex; gap:5px">
                        <button class="rev-btn" onclick="agendarRevisao(\${m.id}, 1)">+24h</button>
                        <button class="rev-btn" onclick="agendarRevisao(\${m.id}, 7)">+7 Dias</button>
                        <button class="rev-btn" style="color:red; border-color:red" onclick="remover(\${m.id})">Remover</button>
                    </div>
                \`;
                lista.appendChild(div);
            });
            atualizarGraficos();
        }

        function atualizarGraficos() {
            if(materias.length === 0) {
                if(chartH) chartH.destroy();
                if(chartC) chartC.destroy();
                return;
            }

            const resumoHoras = {};
            const resumoPeso = {};
            materias.forEach(m => {
                resumoHoras[m.nome] = (resumoHoras[m.nome] || 0) + (m.tempo / 3600000);
                resumoPeso[m.nome] = (resumoPeso[m.nome] || 0) + m.peso;
            });

            const labels = Object.keys(resumoHoras);
            const dadosHoras = Object.values(resumoHoras).map(v => v.toFixed(2));
            const dadosPeso = Object.values(resumoPeso);

            if(chartH) chartH.destroy();
            if(chartC) chartC.destroy();

            chartH = new Chart(document.getElementById('chartHoras'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'Horas', data: dadosHoras, backgroundColor: eliteColors }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: {color: '#222'}, ticks: {color: '#fff'} }, x: { ticks: {color: '#fff'} } }
                }
            });

            chartC = new Chart(document.getElementById('chartConteudo'), {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{ 
                        data: dadosPeso, 
                        backgroundColor: eliteColors,
                        borderWidth: 2,
                        borderColor: '#0a0a0a'
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } }
                    }
                }
            });
        }
      </script>
    </body>
    </html>
  `;

  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
}

app.whenReady().then(createWindow);