const express = require('express');
const { query } = require('../config/db');
const { autenticar, permitirPerfis } = require('../middleware/auth');

const router = express.Router();
router.use(autenticar, permitirPerfis('motorista'));

async function buscarMotoristaPorUsuario(idUsuario) {
  const motoristas = await query(
    'SELECT id_motorista FROM motoristas WHERE id_usuario = ?',
    [idUsuario]
  );
  return motoristas[0];
}

router.get('/atendimentos', async (req, res, next) => {
  try {
    const motorista = await buscarMotoristaPorUsuario(req.usuario.id_usuario);
    if (!motorista) return res.json([]);

    const atendimentos = await query(
      `SELECT
        p.id_pedido,
        p.endereco_atendimento,
        p.localizacao,
        p.tipo_problema,
        p.descricao_problema,
        p.tipo_servico,
        p.valor_estimado,
        p.data_hora_solicitacao,
        p.observacoes,
        uc.nome AS nome_cliente,
        uc.telefone AS telefone_cliente,
        v.placa,
        v.modelo,
        s.nome_status
       FROM pedidos p
       JOIN clientes c ON c.id_cliente = p.id_cliente
       JOIN usuarios uc ON uc.id_usuario = c.id_usuario
       JOIN veiculos v ON v.id_veiculo = p.id_veiculo
       JOIN status_pedido s ON s.id_status = p.id_status
       WHERE p.id_motorista = ?
       ORDER BY p.data_hora_solicitacao DESC`,
      [motorista.id_motorista]
    );

    return res.json(atendimentos);
  } catch (error) {
    return next(error);
  }
});

router.patch('/atendimentos/:id/status', async (req, res, next) => {
  const { id } = req.params;
  const { nome_status } = req.body;

  if (!nome_status) {
    return res.status(400).json({ erro: 'Informe o novo status do pedido.' });
  }

  try {
    const motorista = await buscarMotoristaPorUsuario(req.usuario.id_usuario);
    if (!motorista) {
      return res.status(404).json({ erro: 'Motorista não encontrado.' });
    }

    const status = await query(
      'SELECT id_status FROM status_pedido WHERE nome_status = ?',
      [nome_status]
    );

    if (!status.length) {
      return res.status(400).json({ erro: 'Status inválido.' });
    }

    const resultado = await query(
      `UPDATE pedidos
       SET id_status = ?
       WHERE id_pedido = ? AND id_motorista = ?`,
      [status[0].id_status, id, motorista.id_motorista]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Atendimento não encontrado para este motorista.' });
    }

    return res.json({ mensagem: 'Status atualizado com sucesso.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
