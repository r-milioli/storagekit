const multer = require('multer');

// Configuração para armazenar arquivo em memória
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

module.exports = upload;

