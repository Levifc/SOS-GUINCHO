const express = require('express');
const { query } = require('../config/db');
const { autenticar, permitirPerfis } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar, permitirPerfis('administrador'));

function montarFiltros(reqQuery) {
  const { busca, status, inicio, fim } = reqQuery;
  const where = ['1 = 1'];
  const params = [];

  if (busca) {
    where.push(`(
      uc.nome LIKE ? OR uc.telefone LIKE ? OR v.placa LIKE ? OR v.modelo LIKE ? OR
      p.tipo_servico LIKE ? OR p.tipo_problema LIKE ? OR p.endereco_atendimento LIKE ?
    )`);
    const termo = `%${busca}%`;
    params.push(termo, termo, termo, termo, termo, termo, termo);
  }

  if (status) {
    where.push('s.nome_status = ?');
    params.push(status);
  }

  if (inicio) {
    where.push('DATE(p.data_hora_solicitacao) >= ?');
    params.push(inicio);
  }

  if (fim) {
    where.push('DATE(p.data_hora_solicitacao) <= ?');
    params.push(fim);
  }

  return { where: where.join(' AND '), params };
}

router.get('/pedidos', async (req, res, next) => {
  try {
    const { where, params } = montarFiltros(req.query);

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
        uc.nome AS nome_cliente,
        uc.telefone AS telefone_cliente,
        v.placa,
        v.modelo,
        s.nome_status,
        m.id_motorista,
        um.nome AS nome_motorista
       FROM pedidos p
       JOIN clientes c ON c.id_cliente = p.id_cliente
       JOIN usuarios uc ON uc.id_usuario = c.id_usuario
       JOIN veiculos v ON v.id_veiculo = p.id_veiculo
       JOIN status_pedido s ON s.id_status = p.id_status
       LEFT JOIN motoristas m ON m.id_motorista = p.id_motorista
       LEFT JOIN usuarios um ON um.id_usuario = m.id_usuario
       WHERE ${where}
       ORDER BY p.data_hora_solicitacao DESC`,
      params
    );

    return res.json(pedidos);
  } catch (error) {
    return next(error);
  }
});

router.get('/motoristas', async (req, res, next) => {
  try {
    const motoristas = await query(
      `SELECT
        m.id_motorista,
        u.nome,
        u.telefone,
        m.cnh,
        m.placa_guincho,
        m.disponibilidade
       FROM motoristas m
       JOIN usuarios u ON u.id_usuario = m.id_usuario
       WHERE u.ativo = TRUE
       ORDER BY u.nome`
    );

    return res.json(motoristas);
  } catch (error) {
    return next(error);
  }
});

router.patch('/pedidos/:id/atribuir', async (req, res, next) => {
  const { id } = req.params;
  const { id_motorista } = req.body;

  if (!id_motorista) {
    return res.status(400).json({ erro: 'Informe o motorista que será atribuído.' });
  }

  try {
    const resultado = await query(
      'UPDATE pedidos SET id_motorista = ? WHERE id_pedido = ?',
      [id_motorista, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    return res.json({ mensagem: 'Motorista atribuído ao pedido.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/relatorio', async (req, res, next) => {
  try {
    const { where, params } = montarFiltros(req.query);

    const pedidos = await query(
      `SELECT
        p.id_pedido,
        p.data_hora_solicitacao,
        p.tipo_servico,
        p.tipo_problema,
        p.valor_estimado,
        p.confirmado,
        uc.nome AS nome_cliente,
        v.placa,
        s.nome_status,
        um.nome AS nome_motorista
       FROM pedidos p
       JOIN clientes c ON c.id_cliente = p.id_cliente
       JOIN usuarios uc ON uc.id_usuario = c.id_usuario
       JOIN veiculos v ON v.id_veiculo = p.id_veiculo
       JOIN status_pedido s ON s.id_status = p.id_status
       LEFT JOIN motoristas m ON m.id_motorista = p.id_motorista
       LEFT JOIN usuarios um ON um.id_usuario = m.id_usuario
       WHERE ${where}
       ORDER BY p.data_hora_solicitacao DESC`,
      params
    );

    const totalPedidos = pedidos.length;
    const totalConfirmados = pedidos.filter((p) => Number(p.confirmado) === 1).length;
    const valorTotal = pedidos.reduce((acc, p) => acc + Number(p.valor_estimado || 0), 0);
    const mediaValor = totalPedidos ? valorTotal / totalPedidos : 0;

    return res.json({
      resumo: {
        total_pedidos: totalPedidos,
        total_confirmados: totalConfirmados,
        valor_total_estimado: Number(valorTotal.toFixed(2)),
        media_valor_estimado: Number(mediaValor.toFixed(2))
      },
      pedidos
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
