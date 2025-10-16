const Minio = require('minio');
require('dotenv').config();

// Configuração do cliente S3 (compatível com MinIO, AWS S3, DigitalOcean Spaces, etc.)
const config = {
  endPoint: process.env.S3_ENDPOINT || 'localhost',
  useSSL: process.env.S3_USE_SSL === 'true',
  accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY || 'minioadmin'
};

// Adiciona porta apenas se não for 443 (padrão HTTPS) ou 80 (padrão HTTP)
const port = parseInt(process.env.S3_PORT) || 9000;
if (port !== 443 && port !== 80) {
  config.port = port;
}

// Adiciona região se especificada (útil para AWS S3)
if (process.env.S3_REGION) {
  config.region = process.env.S3_REGION;
}

const s3Client = new Minio.Client(config);

module.exports = s3Client;

