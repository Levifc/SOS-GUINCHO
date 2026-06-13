const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, query } = require('../config/db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

function gerarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      perfil: usuario.perfil,
      login: usuario.login
    },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '8h' }
  );
}

router.post('/cadastro', async (req, res, next) => {
  const { nome, telefone, login, senha, endereco } = req.body;

  if (!nome || !telefone || !login || !senha) {
    return res.status(400).json({ erro: 'Nome, telefone, login e senha são obrigatórios.' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [usuarioExistente] = await conn.execute(
      'SELECT id_usuario FROM usuarios WHERE login = ?',
      [login]
    );

    if (usuarioExistente.length > 0) {
      await conn.rollback();
      return res.status(409).json({ erro: 'Este login já está cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultadoUsuario] = await conn.execute(
      `INSERT INTO usuarios (nome, telefone, login, senha, perfil, ativo)
       VALUES (?, ?, ?, ?, 'cliente', TRUE)`,
      [nome, telefone, login, senhaHash]
    );

    await conn.execute(
      `INSERT INTO clientes (id_usuario, endereco)
       VALUES (?, ?)`,
      [resultadoUsuario.insertId, endereco || null]
    );

    await conn.commit();

    return res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso.' });
  } catch (error) {
    await conn.rollback();
    return next(error);
  } finally {
    conn.release();
  }
});

router.post('/login', async (req, res, next) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: 'Login e senha são obrigatórios.' });
  }

  try {
    const usuarios = await query(
      `SELECT id_usuario, nome, telefone, login, senha, perfil, ativo
       FROM usuarios
       WHERE login = ?`,
      [login]
    );

    if (!usuarios.length || !usuarios[0].ativo) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = gerarToken(usuario);

    return res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        telefone: usuario.telefone,
        login: usuario.login,
        perfil: usuario.perfil
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', autenticar, async (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;
