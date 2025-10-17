const swaggerJsdoc = require('swagger-jsdoc');

// Função para gerar os servers dinamicamente
const getServers = () => {
  const servers = [];
  
  // Servidor local (sempre disponível para desenvolvimento)
  servers.push({
    url: 'http://localhost:3000',
    description: 'Desenvolvimento Local'
  });
  
  // Servidor de produção (se configurado no .env)
  if (process.env.PRODUCTION_URL) {
    servers.push({
      url: process.env.PRODUCTION_URL,
      description: 'Produção'
    });
  } else {
    // URL padrão de produção
    servers.push({
      url: 'https://storage.iacas.top',
      description: 'Produção'
    });
  }
  
  return servers;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StorageKit API',
      version: '1.0.5',
      description: `🚀 **StorageKit API** - Gateway para S3-compatible storage (MinIO, AWS S3, DigitalOcean Spaces, etc.) com autenticação por API Key.

---

### ☕ Apoie este projeto!

Se esta API está sendo útil para você, considere apoiar com um café! ☕

**PIX:** automacaodebaixocusto@gmail.com

*Sua contribuição ajuda a manter este projeto ativo e em constante melhoria! 🙏*`,
      contact: {
        name: 'ABC-Automação',
        email: 'automacaodebaixocusto@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: getServers(),
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Sua API Key para autenticação'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Mensagem de erro'
            }
          }
        },
        Bucket: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'meu-bucket'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        Folder: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'documentos'
            },
            path: {
              type: 'string',
              example: 'documentos/'
            },
            type: {
              type: 'string',
              example: 'folder'
            }
          }
        },
        File: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'arquivo.pdf'
            },
            path: {
              type: 'string',
              example: 'documentos/arquivo.pdf'
            },
            size: {
              type: 'integer',
              example: 102400
            },
            modified: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            type: {
              type: 'string',
              example: 'file'
            },
            url: {
              type: 'string',
              description: 'URL via StorageKit API (requer autenticação)',
              example: 'https://storage.iacas.top/api/documentos/download?path=documentos/arquivo.pdf'
            },
            directUrl: {
              type: 'string',
              description: 'URL temporária direta do MinIO (sem autenticação)',
              example: 'https://mp.iacas.top/documentos/documentos/arquivo.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz...'
            },
            urlExpiresIn: {
              type: 'integer',
              description: 'Tempo em segundos até a URL direta expirar',
              example: 3600
            }
          }
        }
      }
    },
    security: [{ ApiKeyAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);

