# SOS Guincho

Sistema web responsivo para solicitação, confirmação, acompanhamento e gestão de atendimentos de guincho.

O projeto foi montado com base na documentação enviada, contemplando: cadastro e login de usuários, perfis de Cliente, Administrador e Motorista, solicitação de guincho, dados do veículo, localização, problema, tipo de serviço, visualização do valor antes da confirmação, acompanhamento de status, painel administrativo, área do motorista, relatórios e banco de dados relacional MySQL.

## Tecnologias usadas

- HTML5
- CSS3 responsivo
- JavaScript
- Node.js
- Express.js
- MySQL
- JWT para autenticação
- bcryptjs para proteção de senhas
- Git/GitHub preparado com `.gitignore`

## Estrutura do projeto

```text
sos-guincho/
├── database/
│   ├── schema.sql
│   └── seed.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── motorista.routes.js
│   │   └── pedidos.routes.js
│   └── utils/calcValor.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## Como executar localmente

### 1. Instalar o Node.js

Instale o Node.js em sua máquina, caso ainda não tenha.

### 2. Criar o banco MySQL

Abra o MySQL Workbench, phpMyAdmin ou terminal MySQL e execute o arquivo:

```sql
database/schema.sql
```

Ele criará o banco `sos_guincho` e todas as tabelas necessárias.

### 3. Configurar o ambiente

Copie o arquivo `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

Depois edite o `.env` com o usuário e senha do seu MySQL.

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sos_guincho
JWT_SECRET=troque_esta_chave_em_producao
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Inserir dados iniciais

```bash
npm run seed
```

Esse comando cria os status do pedido, um administrador e um motorista de teste.

### 6. Rodar o sistema

```bash
npm start
```

Acesse no navegador:

```text
http://localhost:3000
```

## Usuários de teste

### Administrador

- Login: `admin@sos.com`
- Senha: `123456`

### Motorista

- Login: `motorista@sos.com`
- Senha: `123456`

### Cliente

O cliente pode ser criado diretamente na tela de cadastro do sistema.

## Funcionalidades implementadas

### Cliente

- Cadastro simples.
- Login com usuário e senha.
- Solicitação de guincho.
- Registro de endereço/localização.
- Registro de placa e modelo do veículo.
- Registro do problema e observações.
- Escolha do tipo de serviço.
- Visualização do valor estimado antes de confirmar.
- Confirmação do pedido.
- Acompanhamento do status do pedido.

### Administrador

- Login.
- Visualização dos pedidos.
- Busca/filtro por cliente, telefone, placa, serviço, status e período.
- Atribuição de motorista a pedidos.
- Geração de relatório com total de pedidos, total confirmado, valor total estimado e média.

### Motorista

- Login.
- Visualização dos atendimentos atribuídos.
- Consulta de dados do cliente, telefone, endereço, veículo, problema e status.
- Atualização do status do atendimento.

## Status disponíveis

- Solicitado
- Em análise
- Guincho a caminho
- Em atendimento
- Finalizado
- Cancelado

## Observações importantes

- O sistema foi feito para execução local, conforme o escopo da primeira versão.
- Não possui pagamento online.
- Não possui integração real com mapas.
- Não possui notificações automáticas por SMS, WhatsApp ou e-mail.
- O valor estimado é calculado de forma simples, por tipo de serviço e problema, para fins acadêmicos.

