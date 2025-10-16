const express = require('express');
const router = express.Router();
const controller = require('../controllers/storage.controller');
const upload = require('../middleware/multer.config');
const apiKeyAuth = require('../middleware/auth.middleware');

// Aplicar autenticação em todas as rotas
router.use(apiKeyAuth);

// ============ BUCKETS ============
router.get('/buckets', controller.listBuckets);
router.post('/buckets', controller.createBucket);
router.delete('/buckets/:bucket', controller.deleteBucket);

// ============ LISTAR ============
router.get('/:bucket', controller.list);

// ============ FILES ============
router.post('/:bucket/upload', upload.single('file'), controller.upload);
router.get('/:bucket/download', controller.download);
router.get('/:bucket/info', controller.info);
router.put('/:bucket/update', upload.single('file'), controller.update);
router.delete('/:bucket/file', controller.delete);
router.delete('/:bucket/folder', controller.deleteFolder);
router.get('/:bucket/url', controller.getUrl);

module.exports = router;

