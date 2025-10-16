const express = require('express');
const cors = require('cors');
require('dotenv').config();

const storageRoutes = require('./routes/storage.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'StorageKit API',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API (com autenticação)
app.use('/api', storageRoutes);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║         StorageKit - Running          ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Server:   http://localhost:${PORT}       ║`);
  console.log(`║  S3:       ${process.env.S3_ENDPOINT}                  ║`);
  console.log(`║  Auth:     API Key Required            ║`);
  console.log('╚════════════════════════════════════════╝');
});

module.exports = app;

