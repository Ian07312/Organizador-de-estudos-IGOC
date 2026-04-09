const { intro, outro, select, text, confirm, spinner } = require('@clack/prompts');
const chalk = require('chalk');
const Table = require('cli-table3');

let materias = [];

async function menu() {
    console.clear();
    intro(chalk.bgBlue.white.bold(' 📚 ORGANIZADOR DE ESTUDOS PRO '));

    const opcao = await select({
        message: 'O que deseja fazer?',
        options: [
            { value: 'add', label: '➕ Adicionar matéria' },
            { value: 'list', label: '📋 Listar cronograma' },
            { value: 'done', label: '✔ Concluir matéria' },
            { value: 'remove', label: '❌ Remover matéria' },
            { value: 'exit', label: '🚪 Sair' },
        ],
    });

    switch (opcao) {
        case 'add': await adicionar(); break;
        case 'list': listar(); break;
        case 'done': await concluir(); break;
        case 'remove': await remover(); break;
        case 'exit': 
            outro(chalk.blue('👋 Bons estudos e até logo!'));
            process.exit(0);
    }

    await text({ message: 'Pressione ENTER para voltar ao menu...' });
    menu();
}

async function adicionar() {
    const nome = await text({ message: '📌 Qual o nome da matéria?', placeholder: 'Ex: Node.js' });
    const data = await text({ message: '📅 Data da Prova (DD/MM):', placeholder: 'Ex: 15/10' });
    const hora = await text({ message: '⏰ Horário de estudos (HH:MM):', placeholder: 'Ex: 14:00' });
    const prioridade = await select({
        message: '🔥 Nível de Prioridade:',
        options: [
            { value: 'Alta', label: '🔴 Alta' },
            { value: 'Média', label: '🟡 Média' },
            { value: 'Baixa', label: '🟢 Baixa' },
        ]
    });

    const s = spinner();
    s.start('Salvando...');
    materias.push({ nome, data, hora, prioridade, done: false });
    s.stop(chalk.green('✅ Matéria agendada com sucesso!'));
}

function listar() {
    if (materias.length === 0) {
        console.log(chalk.yellow('\n  ⚠️ Nenhuma matéria agendada.\n'));
        return;
    }

    const table = new Table({
        head: [chalk.cyan('ID'), chalk.cyan('Matéria'), chalk.cyan('Data/Hora'), chalk.cyan('Prioridade'), chalk.cyan('Status')],
        colWidths: [5, 20, 15, 12, 10]
    });

    materias.forEach((m, i) => {
        const status = m.done ? chalk.green('✔ OK') : chalk.red('✖ PENDENTE');
        const corPrioridade = m.prioridade === 'Alta' ? chalk.red(m.prioridade) : 
                             (m.prioridade === 'Média' ? chalk.yellow(m.prioridade) : chalk.green(m.prioridade));
        
        table.push([i + 1, m.nome, `${m.data} às ${m.hora}`, corPrioridade, status]);
    });

    console.log('\n' + table.toString() + '\n');
}

async function concluir() {
    if (materias.length === 0) return console.log(chalk.yellow('Nada para concluir.'));

    const index = await select({
        message: 'Qual matéria você terminou?',
        options: materias.map((m, i) => ({ value: i, label: `${m.nome} (${m.data})` }))
    });

    materias[index].done = true;
    outro(chalk.green('🏆 Parabéns por concluir mais uma etapa!'));
}

async function remover() {
    if (materias.length === 0) return console.log(chalk.yellow('Nada para remover.'));

    const index = await select({
        message: 'Selecione a matéria para excluir:',
        options: materias.map((m, i) => ({ value: i, label: m.nome }))
    });

    const certeza = await confirm({ message: 'Tem certeza que deseja excluir?' });
    if (certeza) {
        materias.splice(index, 1);
        outro(chalk.red('❌ Matéria removida.'));
    }
}

menu();