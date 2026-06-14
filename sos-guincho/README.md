# SOS Guincho

Sistema web para solicitação e gerenciamento de serviços de guincho, desenvolvido como Projeto Final da disciplina **PEX0162 - Engenharia de Software**.

## 1. Objetivo do Sistema

O objetivo do **SOS Guincho** é facilitar a solicitação de serviços de guincho por clientes, permitindo que pedidos sejam registrados, acompanhados e gerenciados de forma simples por meio de uma aplicação web.

O sistema também oferece funcionalidades para administradores e motoristas, possibilitando o controle dos atendimentos, atualização de status e visualização de relatórios básicos.

## 2. Descrição do Problema

Em situações de emergência veicular, muitos clientes enfrentam dificuldades para solicitar um guincho de forma rápida, acompanhar o andamento do atendimento e obter informações claras sobre o serviço solicitado.

Além disso, empresas ou prestadores de serviço de guincho podem ter dificuldade para organizar pedidos, distribuir atendimentos e acompanhar o status das solicitações.

O **SOS Guincho** busca resolver esse problema oferecendo uma plataforma simples, centralizada e navegável para cadastro de usuários, solicitação de guincho, acompanhamento de pedidos e gerenciamento administrativo.

## 3. Principais Funcionalidades

### Cliente

* Cadastro de cliente.
* Login no sistema.
* Solicitação de guincho.
* Informar dados pessoais, localização, veículo, problema e tipo de serviço.
* Visualização do valor antes da confirmação.
* Acompanhamento do status do pedido.
* Cancelamento permitido antes da confirmação do atendimento.

### Administrador

* Login administrativo.
* Visualização geral dos pedidos.
* Busca e filtragem de solicitações.
* Acompanhamento dos atendimentos.
* Acesso a relatório básico dos pedidos.
* Gerenciamento do fluxo de atendimento.

### Motorista

* Login de motorista.
* Visualização dos atendimentos disponíveis ou atribuídos.
* Atualização do status do atendimento.
* Acompanhamento das informações necessárias para realização do serviço.

## 4. Tecnologias Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Banco de Dados

* MySQL

### Outras Ferramentas

* Git e GitHub para versionamento
* Visual Studio Code como ambiente de desenvolvimento
* Dotenv para variáveis de ambiente
* Nodemon para ambiente de desenvolvimento

## 5. Arquitetura Mínima

O sistema foi organizado em uma arquitetura web simples, separando as responsabilidades entre frontend, backend e banco de dados.

### 5.1 Estrutura Geral

* O **frontend** é responsável pela interface com o usuário, telas de login, cadastro, solicitação de guincho, acompanhamento de pedidos e painéis.
* O **backend** é responsável por receber as requisições, validar dados, autenticar usuários e executar as regras básicas do sistema.
* O **banco de dados MySQL** armazena usuários, pedidos, informações dos veículos, status dos atendimentos e dados utilizados nos relatórios.

### 5.2 Fluxo Básico de Funcionamento

1. O usuário acessa o sistema pelo navegador.
2. O cliente realiza cadastro ou login.
3. O cliente solicita um serviço de guincho preenchendo os dados necessários.
4. O backend recebe a solicitação e registra as informações no banco de dados.
5. O administrador visualiza os pedidos no painel administrativo.
6. O motorista acessa sua área para acompanhar e atualizar atendimentos.
7. O cliente acompanha o status do pedido pelo sistema.

### 5.3 Responsabilidades dos Principais Componentes

| Componente                        | Responsabilidade                                                            |
| --------------------------------- | --------------------------------------------------------------------------- |
| `public/index.html`               | Estrutura principal da interface web.                                       |
| `public/css/style.css`            | Estilização das telas e elementos visuais.                                  |
| `public/js/app.js`                | Controle das interações do frontend e comunicação com o backend.            |
| `src/server.js`                   | Inicialização do servidor Express e configuração das rotas principais.      |
| `src/config/db.js`                | Configuração da conexão com o banco de dados MySQL.                         |
| `src/middleware/auth.js`          | Middleware de autenticação e proteção de rotas.                             |
| `src/routes/auth.routes.js`       | Rotas de cadastro, login e autenticação de usuários.                        |
| `src/routes/pedidos.routes.js`    | Rotas relacionadas à criação, listagem e atualização de pedidos de guincho. |
| `src/routes/relatorios.routes.js` | Rotas para geração e consulta de relatórios básicos.                        |
| `database/schema.sql`             | Script de criação das tabelas do banco de dados.                            |
| `database/seed.js`                | Script para inserir dados iniciais e usuários de teste.                     |

## 6. Estrutura do Projeto

```text
sos-guincho/
  database/
    schema.sql
    seed.js

  public/
    index.html
    css/
      style.css
    js/
      app.js

  src/
    config/
      db.js
    middleware/
      auth.js
    routes/
      auth.routes.js
      pedidos.routes.js
      relatorios.routes.js
    server.js

  .env.example
  package.json
  README.md
```

## 7. Instruções de Execução

### 7.1 Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js 18 ou superior
* MySQL 8 ou superior
* Git
* VS Code ou outro editor de código

### 7.2 Clonar o Repositório

```bash
git clone LINK_DO_REPOSITORIO_AQUI
cd sos-guincho
```

### 7.3 Criar o Banco de Dados

Acesse o MySQL e crie o banco:

```sql
CREATE DATABASE sos_guincho CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7.4 Importar a Estrutura do Banco

```bash
mysql -u root -p sos_guincho < database/schema.sql
```

### 7.5 Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Depois, edite o arquivo `.env` com as informações do seu banco de dados:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sos_guincho
PORT=3000
JWT_SECRET=sua_chave_secreta
```

### 7.6 Instalar Dependências

```bash
npm install
```

### 7.7 Inserir Dados Iniciais

```bash
npm run seed
```

### 7.8 Iniciar o Servidor

```bash
npm start
```

### 7.9 Acessar o Sistema

Abra o navegador e acesse:

```text
http://localhost:3000
```

## 8. Usuários de Teste

| Perfil        | E-mail                                                      | Senha        |
| ------------- | ----------------------------------------------------------- | ------------ |
| Administrador | [admin@sosguincho.com](mailto:admin@sosguincho.com)         | admin123     |
| Motorista     | [motorista@sosguincho.com](mailto:motorista@sosguincho.com) | motorista123 |
| Cliente       | [cliente@sosguincho.com](mailto:cliente@sosguincho.com)     | cliente123   |

## 9. Link do Protótipo

O protótipo navegável do sistema pode ser acessado pela própria aplicação local após iniciar o servidor:

```text
http://localhost:3000
```

Caso a equipe utilize um protótipo externo no Figma, Canva ou outra ferramenta, inserir o link abaixo:

```text
Link do protótipo: INSERIR_LINK_DO_PROTOTIPO_AQUI
```

## 10. Backlog do Projeto

| ID   | História de Usuário                                                                    | Prioridade | Status                    |
| ---- | -------------------------------------------------------------------------------------- | ---------- | ------------------------- |
| HU01 | Como cliente, quero me cadastrar no sistema para poder solicitar serviços de guincho.  | Alta       | Implementado              |
| HU02 | Como cliente, quero fazer login para acessar minhas solicitações.                      | Alta       | Implementado              |
| HU03 | Como cliente, quero solicitar um guincho informando localização, veículo e problema.   | Alta       | Implementado              |
| HU04 | Como cliente, quero visualizar o valor do serviço antes de confirmar o pedido.         | Média      | Implementado              |
| HU05 | Como cliente, quero acompanhar o status da minha solicitação.                          | Alta       | Implementado              |
| HU06 | Como administrador, quero visualizar todos os pedidos para acompanhar os atendimentos. | Alta       | Implementado              |
| HU07 | Como administrador, quero filtrar e buscar pedidos para facilitar o gerenciamento.     | Média      | Implementado              |
| HU08 | Como administrador, quero visualizar relatórios básicos dos pedidos.                   | Média      | Parcialmente implementado |
| HU09 | Como motorista, quero visualizar os atendimentos para saber quais serviços realizar.   | Alta       | Implementado              |
| HU10 | Como motorista, quero atualizar o status do atendimento.                               | Alta       | Implementado              |
| HU11 | Como usuário, quero receber notificações em tempo real sobre o atendimento.            | Baixa      | Não implementado          |
| HU12 | Como cliente, quero acompanhar o motorista em um mapa.                                 | Baixa      | Não implementado          |

## 11. Status Atual do Desenvolvimento

O projeto encontra-se em fase de **MVP inicial implementado**.

Nesta versão, o sistema já possui:

* Interface web navegável.
* Cadastro e login de usuários.
* Solicitação de guincho.
* Painel administrativo.
* Área do motorista.
* Atualização de status dos pedidos.
* Integração com banco de dados MySQL.
* Dados iniciais para teste.

Algumas funcionalidades futuras ainda podem ser melhoradas ou adicionadas, como integração com mapas, notificações em tempo real, envio de mensagens automáticas e melhorias na segurança para ambiente de produção.

## 12. Evolução do Projeto

O sistema evoluiu a partir dos requisitos levantados durante a disciplina, transformando as necessidades principais dos usuários em telas, funcionalidades e estrutura inicial de código.

A evolução ocorreu nas seguintes etapas:

1. Levantamento do problema e definição do público-alvo.
2. Definição das funcionalidades principais do MVP.
3. Criação da estrutura inicial do projeto.
4. Desenvolvimento das telas navegáveis.
5. Implementação do backend com Node.js e Express.
6. Integração com banco de dados MySQL.
7. Criação de perfis de usuário: cliente, administrador e motorista.
8. Organização da documentação para apresentação final.

## 13. Boas Práticas Utilizadas

* Separação entre frontend, backend e banco de dados.
* Organização de rotas por responsabilidade.
* Uso de variáveis de ambiente.
* Estrutura de pastas clara.
* Código modularizado.
* Banco de dados separado em script próprio.
* Usuários de teste para facilitar a apresentação.
* Documentação com instruções de execução.

## 14. Limitações da Versão Atual

Por se tratar de um MVP acadêmico, algumas funcionalidades ainda não foram implementadas completamente:

* Integração real com mapas.
* Rastreamento em tempo real.
* Notificações automáticas.
* Recuperação de senha.
* Hospedagem em ambiente de produção.
* Testes automatizados.
* Validações avançadas de segurança.

## 15. Possíveis Melhorias Futuras

* Integração com API de mapas.
* Notificações por WhatsApp, SMS ou e-mail.
* Sistema de avaliação do atendimento.
* Histórico completo de serviços por cliente.
* Dashboard administrativo mais detalhado.
* Aplicativo mobile para motoristas.
* Testes automatizados.
* Deploy em servidor ou serviço de nuvem.

## 16. Integrantes da Equipe

* LEVI FILGUEIRA CHAGAS
* HISLENO SOSTENES FIDELIS MEDEIROS
* FRANCISCO THIAGO DA SILVA PINHEIRO

## 17. Observação Final

Este projeto foi desenvolvido para fins acadêmicos, com foco na construção de um MVP funcional, organização do repositório, aplicação de conceitos de Engenharia de Software e apresentação técnica da solução.

Para uso em ambiente real de produção, recomenda-se aplicar melhorias de segurança, autenticação mais robusta, deploy em servidor seguro, uso de HTTPS, tratamento avançado de erros, logs, testes automatizados e integração com serviços externos.
