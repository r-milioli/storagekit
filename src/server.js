const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger.config');
require('dotenv').config();

const storageRoutes = require('./routes/storage.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy (para detectar HTTPS corretamente atrás do Traefik)
app.set('trust proxy', true);

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'StorageKit API',
    timestamp: new Date().toISOString()
  });
});

// Documentação Swagger (sem autenticação)
app.use('/docs', swaggerUi.serve);
app.get('/docs', (req, res, next) => {
  // Detecta o protocolo correto (HTTPS quando atrás de proxy)
  let protocol = req.protocol;
  
  // Verifica se está atrás de um proxy HTTPS (Traefik, etc.)
  if (req.get('x-forwarded-proto') === 'https' || 
      req.get('x-forwarded-ssl') === 'on' ||
      req.secure) {
    protocol = 'https';
  }
  
  const host = req.get('host');
  const currentUrl = `${protocol}://${host}`;
  
  // Cria uma cópia do spec e adiciona o servidor atual no topo
  const dynamicSpecs = {
    ...swaggerSpecs,
    servers: [
      {
        url: currentUrl,
        description: '🌐 Servidor Atual (Detectado Automaticamente)'
      },
      ...swaggerSpecs.servers
    ]
  };
  
  swaggerUi.setup(dynamicSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'StorageKit API - Documentação',
    swaggerOptions: {
      persistAuthorization: true
    }
  })(req, res, next);
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
  console.log(`║  Docs:     http://localhost:${PORT}/docs  ║`);
  console.log(`║  S3:       ${process.env.S3_ENDPOINT}                  ║`);
  console.log(`║  Auth:     API Key Required            ║`);
  console.log('╚════════════════════════════════════════╝');
});

module.exports = app;

