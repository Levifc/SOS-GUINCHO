require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const pedidosRoutes = require('./src/routes/pedidos.routes');
const adminRoutes = require('./src/routes/admin.routes');
const motoristaRoutes = require('./src/routes/motorista.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/motorista', motoristaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'SOS Guincho', ambiente: 'local' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`SOS Guincho rodando em http://localhost:${PORT}`);
});
