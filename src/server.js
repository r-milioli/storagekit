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
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info {
        margin: 50px 0 30px 0;
        padding: 25px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        border: 1px solid #e1e5e9;
      }
      .swagger-ui .info h1 {
        color: #2c3e50 !important;
        font-size: 32px;
        margin-bottom: 15px;
        text-align: center;
      }
      .swagger-ui .info .description {
        font-size: 16px;
        margin: 20px 0;
        line-height: 1.7;
        color: #34495e;
      }
      .swagger-ui .info .description h3 {
        color: #667eea;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
        margin: 25px 0 15px 0;
      }
      .swagger-ui .info .description strong {
        color: #667eea;
        font-weight: 600;
      }
      .swagger-ui .info .description code {
        background: #f8f9fa;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        color: #e74c3c;
        font-weight: bold;
        border: 1px solid #e1e5e9;
      }
      .swagger-ui .info .contact {
        text-align: center;
        margin-top: 20px;
        color: #7f8c8d;
      }
      .swagger-ui .info .license {
        text-align: center;
        margin-top: 10px;
        color: #7f8c8d;
      }
    `,
    customSiteTitle: 'StorageKit API - Documentação',
    customfavIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
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
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║       StorageKit - ABC-Automacao          ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  Server:   http://localhost:${PORT}          ║`);
  console.log(`║  Docs:     http://localhost:${PORT}/docs     ║`);
  console.log(`║  S3:       ${process.env.S3_ENDPOINT}                   ║`);
  console.log(`║  Auth:     API Key Required               ║`);
  console.log('╚═══════════════════════════════════════════╝');
});

module.exports = app;

