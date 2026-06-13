const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function permitirPerfis(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Acesso não permitido para este perfil.' });
    }
    return next();
  };
}

module.exports = { autenticar, permitirPerfis };
