const minioService = require('../services/minio.service');

class StorageController {
  // ============ BUCKETS ============
  
  async listBuckets(req, res, next) {
    try {
      const buckets = await minioService.listBuckets();
      res.json({ success: true, data: buckets });
    } catch (error) {
      next(error);
    }
  }

  async createBucket(req, res, next) {
    try {
      const { bucket } = req.body;
      if (!bucket) {
        return res.status(400).json({ success: false, error: 'Bucket é obrigatório' });
      }
      const result = await minioService.createBucket(bucket);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteBucket(req, res, next) {
    try {
      const { bucket } = req.params;
      const result = await minioService.deleteBucket(bucket);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ============ LISTAR ============

  async list(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.query;
      const result = await minioService.list(bucket, path || '');
      res.json({ success: true, bucket, path: path || '/', ...result });
    } catch (error) {
      next(error);
    }
  }

  // ============ FILES ============

  async upload(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'Arquivo é obrigatório' });
      }

      const filePath = path 
        ? `${path}/${file.originalname}`.replace(/\/+/g, '/')
        : file.originalname;

      const result = await minioService.upload(
        bucket,
        filePath,
        file.buffer,
        file.mimetype
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.query;

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const fileBuffer = await minioService.download(bucket, path);
      const fileInfo = await minioService.info(bucket, path);

      res.setHeader('Content-Type', fileInfo.contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }

  async info(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.query;

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const info = await minioService.info(bucket, path);
      res.json({ success: true, bucket, data: info });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'Arquivo é obrigatório' });
      }

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const result = await minioService.update(bucket, path, file.buffer, file.mimetype);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.body;

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const result = await minioService.delete(bucket, path);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteFolder(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path } = req.body;

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const result = await minioService.deleteFolder(bucket, path);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUrl(req, res, next) {
    try {
      const { bucket } = req.params;
      const { path, expiry } = req.query;

      if (!path) {
        return res.status(400).json({ success: false, error: 'Path é obrigatório' });
      }

      const result = await minioService.getUrl(bucket, path, parseInt(expiry) || 3600);
      res.json({ success: true, bucket, path, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StorageController();

