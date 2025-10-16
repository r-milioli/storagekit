const s3Client = require('../config/s3.config');
const { Readable } = require('stream');

class MinioService {
  /**
   * Verifica se um bucket existe, se não, cria
   */
  async ensureBucket(bucketName) {
    try {
      const exists = await s3Client.bucketExists(bucketName);
      if (!exists) {
        await s3Client.makeBucket(bucketName, 'us-east-1');
      }
      return true;
    } catch (error) {
      throw new Error(`Erro ao verificar/criar bucket: ${error.message}`);
    }
  }

  /**
   * Listar todos os buckets
   */
  async listBuckets() {
    try {
      const buckets = await s3Client.listBuckets();
      return buckets.map(bucket => ({
        name: bucket.name,
        createdAt: bucket.creationDate
      }));
    } catch (error) {
      throw new Error(`Erro ao listar buckets: ${error.message}`);
    }
  }

  /**
   * Criar bucket
   */
  async createBucket(bucketName) {
    try {
      await s3Client.makeBucket(bucketName, 'us-east-1');
      return { bucket: bucketName };
    } catch (error) {
      throw new Error(`Erro ao criar bucket: ${error.message}`);
    }
  }

  /**
   * Deletar bucket
   */
  async deleteBucket(bucketName) {
    try {
      await s3Client.removeBucket(bucketName);
      return { bucket: bucketName };
    } catch (error) {
      throw new Error(`Erro ao deletar bucket: ${error.message}`);
    }
  }

  /**
   * Listar conteúdo (folders e files)
   */
  async list(bucketName, path = '') {
    try {
      const prefix = path && !path.endsWith('/') && path !== '' ? `${path}/` : path;
      const folders = [];
      const files = [];
      const stream = s3Client.listObjects(bucketName, prefix, false);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.prefix) {
            // É uma pasta
            const name = obj.prefix.replace(prefix, '').replace(/\/$/, '');
            if (name) {
              folders.push({
                name,
                path: obj.prefix,
                type: 'folder'
              });
            }
          } else {
            // É um arquivo
            const name = obj.name.replace(prefix, '');
            if (name) {
              files.push({
                name,
                path: obj.name,
                size: obj.size,
                modified: obj.lastModified,
                type: 'file'
              });
            }
          }
        });
        stream.on('end', () => resolve({ folders, files }));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Erro ao listar: ${error.message}`);
    }
  }

  /**
   * Upload de arquivo
   */
  async upload(bucketName, path, fileBuffer, contentType) {
    try {
      await this.ensureBucket(bucketName);
      
      const stream = Readable.from(fileBuffer);
      const metaData = { 'Content-Type': contentType || 'application/octet-stream' };

      await s3Client.putObject(bucketName, path, stream, fileBuffer.length, metaData);

      return {
        bucket: bucketName,
        path: path,
        size: fileBuffer.length
      };
    } catch (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }
  }

  /**
   * Download de arquivo
   */
  async download(bucketName, path) {
    try {
      const stream = await s3Client.getObject(bucketName, path);
      const chunks = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Erro ao fazer download: ${error.message}`);
    }
  }

  /**
   * Obter informações do arquivo
   */
  async info(bucketName, path) {
    try {
      const stat = await s3Client.statObject(bucketName, path);
      return {
        name: path.split('/').pop(),
        path: path,
        size: stat.size,
        modified: stat.lastModified,
        contentType: stat.metaData['content-type']
      };
    } catch (error) {
      throw new Error(`Erro ao obter informações: ${error.message}`);
    }
  }

  /**
   * Atualizar arquivo
   */
  async update(bucketName, path, fileBuffer, contentType) {
    try {
      // Verifica se existe
      await s3Client.statObject(bucketName, path);
      // Sobrescreve
      return await this.upload(bucketName, path, fileBuffer, contentType);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new Error('Arquivo não encontrado');
      }
      throw new Error(`Erro ao atualizar: ${error.message}`);
    }
  }

  /**
   * Deletar arquivo
   */
  async delete(bucketName, path) {
    try {
      await s3Client.removeObject(bucketName, path);
      return { bucket: bucketName, path: path };
    } catch (error) {
      throw new Error(`Erro ao deletar: ${error.message}`);
    }
  }

  /**
   * Deletar pasta e conteúdo
   */
  async deleteFolder(bucketName, path) {
    try {
      const prefix = path.endsWith('/') ? path : `${path}/`;
      const objectsList = [];
      const stream = s3Client.listObjects(bucketName, prefix, true);

      await new Promise((resolve, reject) => {
        stream.on('data', (obj) => objectsList.push(obj.name));
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      if (objectsList.length > 0) {
        await s3Client.removeObjects(bucketName, objectsList);
      }

      return {
        bucket: bucketName,
        path: prefix,
        deleted: objectsList.length
      };
    } catch (error) {
      throw new Error(`Erro ao deletar pasta: ${error.message}`);
    }
  }

  /**
   * URL temporária
   */
  async getUrl(bucketName, path, expiry = 3600) {
    try {
      const url = await s3Client.presignedGetObject(bucketName, path, expiry);
      return { url, expiresIn: expiry };
    } catch (error) {
      throw new Error(`Erro ao gerar URL: ${error.message}`);
    }
  }
}

module.exports = new MinioService();

