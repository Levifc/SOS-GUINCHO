require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function inserirStatus(conn) {
  const status = [
    ['Solicitado', 'O cliente realizou o pedido de guincho.'],
    ['Em análise', 'O pedido está sendo verificado pela empresa.'],
    ['Guincho a caminho', 'O motorista foi acionado e está se deslocando até o cliente.'],
    ['Em atendimento', 'O serviço está sendo realizado.'],
    ['Finalizado', 'O atendimento foi concluído.'],
    ['Cancelado', 'O pedido foi cancelado antes da confirmação.']
  ];

  for (const item of status) {
    await conn.execute(
      `INSERT INTO status_pedido (nome_status, descricao)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE descricao = VALUES(descricao)`,
      item
    );
  }
}

async function inserirUsuario(conn, { nome, telefone, login, senha, perfil }) {
  const [existente] = await conn.execute('SELECT id_usuario FROM usuarios WHERE login = ?', [login]);
  if (existente.length) return existente[0].id_usuario;

  const senhaHash = await bcrypt.hash(senha, 10);
  const [resultado] = await conn.execute(
    `INSERT INTO usuarios (nome, telefone, login, senha, perfil, ativo)
     VALUES (?, ?, ?, ?, ?, TRUE)`,
    [nome, telefone, login, senhaHash, perfil]
  );

  return resultado.insertId;
}

async function main() {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    await inserirStatus(conn);

    const idAdmin = await inserirUsuario(conn, {
      nome: 'Administrador SOS',
      telefone: '(84) 99999-0000',
      login: 'admin@sos.com',
      senha: '123456',
      perfil: 'administrador'
    });

    const idMotorista = await inserirUsuario(conn, {
      nome: 'Motorista SOS',
      telefone: '(84) 98888-0000',
      login: 'motorista@sos.com',
      senha: '123456',
      perfil: 'motorista'
    });

    await conn.execute(
      `INSERT INTO motoristas (id_usuario, cnh, placa_guincho, disponibilidade)
       VALUES (?, '00000000000', 'SOS-2026', TRUE)
       ON DUPLICATE KEY UPDATE disponibilidade = TRUE`,
      [idMotorista]
    );

    await conn.commit();
    console.log('Dados iniciais cadastrados com sucesso.');
    console.log('Administrador: admin@sos.com / 123456');
    console.log('Motorista: motorista@sos.com / 123456');
  } catch (error) {
    await conn.rollback();
    console.error('Erro ao inserir dados iniciais:', error.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
