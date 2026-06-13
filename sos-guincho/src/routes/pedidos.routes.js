const express = require('express');
const { pool, query } = require('../config/db');
const { autenticar, permitirPerfis } = require('../middleware/auth');
const { calcularValorEstimado } = require('../utils/calcValor');

const router = express.Router();

async function buscarClientePorUsuario(idUsuario) {
  const clientes = await query(
    'SELECT id_cliente FROM clientes WHERE id_usuario = ?',
    [idUsuario]
  );
  return clientes[0];
}

router.post('/calcular-valor', autenticar, permitirPerfis('cliente'), (req, res) => {
  const { tipo_servico, tipo_problema } = req.body;

  if (!tipo_servico) {
    return res.status(400).json({ erro: 'Tipo de serviço é obrigatório para calcular o valor.' });
  }

  const valor_estimado = calcularValorEstimado(tipo_servico, tipo_problema);
  return res.json({ valor_estimado });
});

router.post('/', autenticar, permitirPerfis('cliente'), async (req, res, next) => {
  const {
    endereco_atendimento,
    localizacao,
    placa,
    modelo,
    tipo_problema,
    descricao_problema,
    tipo_servico,
    observacoes
  } = req.body;

  if (!endereco_atendimento || !localizacao || !placa || !modelo || !tipo_problema || !tipo_servico) {
    return res.status(400).json({
      erro: 'Endereço, localização, placa, modelo, tipo de problema e tipo de serviço são obrigatórios.'
    });
  }

  const cliente = await buscarClientePorUsuario(req.usuario.id_usuario);
  if (!cliente) {
    return res.status(404).json({ erro: 'Cliente não encontrado para este usuário.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [statusSolicitado] = await conn.execute(
      'SELECT id_status FROM status_pedido WHERE nome_status = ?',
      ['Solicitado']
    );

    if (!statusSolicitado.length) {
      throw new Error('Status inicial "Solicitado" não encontrado. Execute npm run seed.');
    }

    const placaNormalizada = String(placa).trim().toUpperCase();
    const [veiculos] = await conn.execute(
      'SELECT id_veiculo FROM veiculos WHERE id_cliente = ? AND placa = ?',
      [cliente.id_cliente, placaNormalizada]
    );

    let idVeiculo;
    if (veiculos.length) {
      idVeiculo = veiculos[0].id_veiculo;
      await conn.execute('UPDATE veiculos SET modelo = ? WHERE id_veiculo = ?', [modelo, idVeiculo]);
    } else {
      const [novoVeiculo] = await conn.execute(
        'INSERT INTO veiculos (id_cliente, placa, modelo) VALUES (?, ?, ?)',
        [cliente.id_cliente, placaNormalizada, modelo]
      );
      idVeiculo = novoVeiculo.insertId;
    }

    const valorEstimado = calcularValorEstimado(tipo_servico, tipo_problema);

    const [novoPedido] = await conn.execute(
      `INSERT INTO pedidos
       (id_cliente, id_veiculo, id_status, endereco_atendimento, localizacao,
        tipo_problema, descricao_problema, tipo_servico, valor_estimado,
        confirmado, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        cliente.id_cliente,
        idVeiculo,
        statusSolicitado[0].id_status,
        endereco_atendimento,
        localizacao,
        tipo_problema,
        descricao_problema || null,
        tipo_servico,
        valorEstimado,
        observacoes || null
      ]
    );

    await conn.commit();

    return res.status(201).json({
      mensagem: 'Pedido confirmado com sucesso.',
      id_pedido: novoPedido.insertId,
      valor_estimado: valorEstimado,
      status: 'Solicitado'
    });
  } catch (error) {
    await conn.rollback();
    return next(error);
  } finally {
    conn.release();
  }
});

router.get('/meus', autenticar, permitirPerfis('cliente'), async (req, res, next) => {
  try {
    const cliente = await buscarClientePorUsuario(req.usuario.id_usuario);
    if (!cliente) return res.json([]);

    const pedidos = await query(
      `SELECT
        p.id_pedido,
        p.endereco_atendimento,
        p.localizacao,
        p.tipo_problema,
        p.descricao_problema,
        p.tipo_servico,
        p.valor_estimado,
        p.data_hora_solicitacao,
        p.confirmado,
        p.observacoes,
        v.placa,
        v.modelo,
        s.nome_status,
        m.id_motorista,
        um.nome AS nome_motorista,
        um.telefone AS telefone_motorista
       FROM pedidos p
       JOIN veiculos v ON v.id_veiculo = p.id_veiculo
       JOIN status_pedido s ON s.id_status = p.id_status
       LEFT JOIN motoristas m ON m.id_motorista = p.id_motorista
       LEFT JOIN usuarios um ON um.id_usuario = m.id_usuario
       WHERE p.id_cliente = ?
       ORDER BY p.data_hora_solicitacao DESC`,
      [cliente.id_cliente]
    );

    return res.json(pedidos);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
