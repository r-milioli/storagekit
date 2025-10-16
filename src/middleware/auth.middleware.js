/**
 * Middleware de autenticação por API Key
 * Verifica se o header 'x-api-key' contém a chave correta
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key não fornecida. Use o header x-api-key'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: 'API Key inválida'
    });
  }

  next();
};

module.exports = apiKeyAuth;

