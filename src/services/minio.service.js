const s3Client = require('../config/s3.config');
const { Readable } = require('stream');

class MinioService {
  /**
   * Gera URLs para um arquivo
   */
  async generateFileUrls(bucketName, filePath) {
    try {
      // URL da API StorageKit (requer autenticação)
      const apiUrl = process.env.PRODUCTION_URL || `https://storage.iacas.top`;
      const storageKitUrl = `${apiUrl}/api/${bucketName}/download?path=${encodeURIComponent(filePath)}`;
      
      // URL temporária direta do MinIO (sem autenticação, expira em 1 hora)
      const directUrl = await s3Client.presignedGetObject(bucketName, filePath, 3600);
      
      return {
        url: storageKitUrl,
        directUrl: directUrl,
        urlExpiresIn: 3600 // 1 hora em segundos
      };
    } catch (error) {
      // Se falhar ao gerar URL direta, retorna só a URL da API
      const apiUrl = process.env.PRODUCTION_URL || `https://storage.iacas.top`;
      return {
        url: `${apiUrl}/api/${bucketName}/download?path=${encodeURIComponent(filePath)}`,
        directUrl: null,
        urlExpiresIn: null
      };
    }
  }

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
      const filePromises = [];
      const stream = s3Client.listObjects(bucketName, prefix, false);

      await new Promise((resolve, reject) => {
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
              // Adiciona promise para gerar URLs
              filePromises.push(
                this.generateFileUrls(bucketName, obj.name).then(urls => ({
                  name,
                  path: obj.name,
                  size: obj.size,
                  modified: obj.lastModified,
                  type: 'file',
                  ...urls
                }))
              );
            }
          }
        });
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      // Aguarda todas as URLs serem geradas
      const files = await Promise.all(filePromises);

      return { folders, files };
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

      // Gera URLs para o arquivo recém-criado
      const urls = await this.generateFileUrls(bucketName, path);

      return {
        bucket: bucketName,
        path: path,
        size: fileBuffer.length,
        ...urls
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
      const urls = await this.generateFileUrls(bucketName, path);
      
      return {
        name: path.split('/').pop(),
        path: path,
        size: stat.size,
        modified: stat.lastModified,
        contentType: stat.metaData['content-type'],
        ...urls
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

