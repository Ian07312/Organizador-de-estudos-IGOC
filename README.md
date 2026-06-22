# Organizador de Estudos IGOC — Full Stack

## 📋 Descrição do Projeto
Uma aplicação Full Stack desenvolvida para auxiliar estudantes na organização de matérias, conteúdos e cronogramas de revisão. O sistema utiliza uma arquitetura baseada no modelo Cliente-Servidor.

## 🏗️ Arquitetura do Sistema
- **Frontend**: HTML5, CSS3 e JavaScript (ES6+) consumindo dados assincronamente através da API nativa `fetch()`.
- **Backend**: Servidor construído em Node.js utilizando o framework Express.
- **Persistência**: Dados manipulados em memória (Estruturas de dados voláteis/Mock) em conformidade com as diretrizes do projeto.

## 🌐 Rotas da API (CRUD)
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| **GET** | `/api/materias` | Lista todas as matérias cadastradas |
| **POST** | `/api/materias` | Cria uma nova matéria |
| **DELETE**| `/api/materias/:id`| Remove uma matéria pelo ID |
| **GET** | `/api/status` | Retorna o status de operação do servidor |

## 🤖 Declaração de Uso de IA
Em conformidade com as diretrizes do CEUB, declara-se que ferramentas de Inteligência Artificial (Google Gemini) foram utilizadas no desenvolvimento deste projeto para auxílio na depuração de erros de ambiente, estruturação técnica das rotas Express e refatoração da comunicação assíncrona (`fetch`) do frontend.