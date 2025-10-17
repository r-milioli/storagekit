const express = require('express');
const router = express.Router();
const controller = require('../controllers/storage.controller');
const upload = require('../middleware/multer.config');
const apiKeyAuth = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   - name: Buckets
 *     description: Gerenciamento de buckets
 *   - name: Listagem
 *     description: Listar conteúdo (pastas e arquivos)
 *   - name: Arquivos
 *     description: Operações com arquivos
 */

// Aplicar autenticação em todas as rotas
router.use(apiKeyAuth);

// ============ BUCKETS ============

/**
 * @swagger
 * /api/buckets:
 *   get:
 *     summary: Listar todos os buckets
 *     description: Retorna uma lista de todos os buckets disponíveis no storage
 *     tags: [Buckets]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de buckets retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bucket'
 *       401:
 *         description: API Key não fornecida ou inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/buckets', controller.listBuckets);

/**
 * @swagger
 * /api/buckets:
 *   post:
 *     summary: Criar um novo bucket
 *     description: Cria um novo bucket no storage
 *     tags: [Buckets]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bucket
 *             properties:
 *               bucket:
 *                 type: string
 *                 description: Nome do bucket a ser criado
 *                 example: meu-bucket
 *     responses:
 *       201:
 *         description: Bucket criado com sucesso
 *       400:
 *         description: Nome do bucket não fornecido ou inválido
 */
router.post('/buckets', controller.createBucket);

/**
 * @swagger
 * /api/buckets/{bucket}:
 *   delete:
 *     summary: Deletar um bucket
 *     description: Remove um bucket do storage (deve estar vazio)
 *     tags: [Buckets]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket a ser deletado
 *         example: meu-bucket
 *     responses:
 *       200:
 *         description: Bucket deletado com sucesso
 *       404:
 *         description: Bucket não encontrado
 */
router.delete('/buckets/:bucket', controller.deleteBucket);

// ============ LISTAR ============

/**
 * @swagger
 * /api/{bucket}:
 *   get:
 *     summary: 📂 Listar conteúdo de um bucket (navegação hierárquica)
 *     description: |
 *       Lista pastas e arquivos dentro de um bucket ou pasta específica.
 *       
 *       ### Como Navegar:
 *       
 *       **1. Listar raiz do bucket:**
 *       - Deixe o parâmetro `path` vazio
 *       - Exemplo: `GET /api/documentos`
 *       - Retorna: Todas as pastas e arquivos na raiz
 *       
 *       **2. Listar conteúdo de uma pasta:**
 *       - Use o parâmetro `path` com o nome da pasta
 *       - Exemplo: `GET /api/documentos?path=relatorios`
 *       - Retorna: Pastas e arquivos dentro de "relatorios"
 *       
 *       **3. Navegar em subpastas:**
 *       - Use o path completo separado por `/`
 *       - Exemplo: `GET /api/documentos?path=relatorios/2024`
 *       - Retorna: Conteúdo de "relatorios/2024"
 *       
 *       ### Resposta:
 *       - `folders`: Array com as subpastas encontradas
 *       - `files`: Array com os arquivos encontrados
 *       
 *       **💡 Dica:** Use o campo `path` de cada pasta para navegar para dentro dela!
 *     tags: [Listagem]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: |
 *           Caminho da pasta a listar (opcional)
 *           - Vazio ou não informado = raiz do bucket
 *           - "relatorios" = lista conteúdo da pasta relatorios
 *           - "relatorios/2024" = lista conteúdo da subpasta 2024
 *         example: relatorios/2024
 *     responses:
 *       200:
 *         description: Conteúdo listado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bucket:
 *                   type: string
 *                   example: documentos
 *                 path:
 *                   type: string
 *                   example: relatorios/2024/
 *                 folders:
 *                   type: array
 *                   description: Lista de subpastas encontradas
 *                   items:
 *                     $ref: '#/components/schemas/Folder'
 *                 files:
 *                   type: array
 *                   description: Lista de arquivos encontrados
 *                   items:
 *                     $ref: '#/components/schemas/File'
 */
router.get('/:bucket', controller.list);

// ============ FILES ============

/**
 * @swagger
 * /api/{bucket}/upload:
 *   post:
 *     summary: 📤 Upload de arquivo (cria pastas automaticamente)
 *     description: |
 *       Faz upload de um arquivo para o bucket. As pastas são criadas automaticamente!
 *       
 *       ### Como Funciona:
 *       
 *       **1. Upload na raiz do bucket:**
 *       - Deixe o campo `path` vazio
 *       - O arquivo será salvo diretamente na raiz
 *       - Exemplo: `arquivo.pdf` → salvo como `arquivo.pdf`
 *       
 *       **2. Upload em uma pasta:**
 *       - Preencha o campo `path` com o nome da pasta
 *       - A pasta será criada automaticamente se não existir
 *       - Exemplo: `path=relatorios` → arquivo salvo em `relatorios/arquivo.pdf`
 *       
 *       **3. Upload em subpastas (criar hierarquia):**
 *       - Use `/` para separar as pastas no path
 *       - Todas as pastas no caminho serão criadas automaticamente
 *       - Exemplo: `path=documentos/2024/janeiro` → arquivo salvo em `documentos/2024/janeiro/arquivo.pdf`
 *       
 *       ### 💡 Dicas:
 *       - Não precisa criar pastas antes! Elas são criadas no upload.
 *       - Use nomes descritivos para organizar seus arquivos
 *       - Evite espaços nos nomes de pastas (use `-` ou `_`)
 *       
 *       ### Exemplos Práticos:
 *       
 *       | path | Arquivo | Resultado |
 *       |------|---------|-----------|
 *       | (vazio) | relatorio.pdf | `relatorio.pdf` |
 *       | `documentos` | relatorio.pdf | `documentos/relatorio.pdf` |
 *       | `documentos/2024` | relatorio.pdf | `documentos/2024/relatorio.pdf` |
 *       | `fotos/ferias/praia` | foto.jpg | `fotos/ferias/praia/foto.jpg` |
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket onde fazer upload
 *         example: documentos
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para upload (obrigatório)
 *               path:
 *                 type: string
 *                 description: |
 *                   Caminho da pasta onde salvar o arquivo (opcional)
 *                   - Vazio = raiz do bucket
 *                   - "relatorios" = salva em relatorios/
 *                   - "relatorios/2024" = salva em relatorios/2024/
 *                   - "docs/importantes/urgente" = cria toda hierarquia
 *                 example: relatorios/2024
 *     responses:
 *       201:
 *         description: Arquivo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bucket:
 *                       type: string
 *                       example: documentos
 *                     path:
 *                       type: string
 *                       example: relatorios/2024/relatorio.pdf
 *                     size:
 *                       type: integer
 *                       example: 102400
 *       400:
 *         description: Arquivo não fornecido
 */
router.post('/:bucket/upload', upload.single('file'), controller.upload);

/**
 * @swagger
 * /api/{bucket}/download:
 *   get:
 *     summary: Download de arquivo
 *     description: Baixa um arquivo do storage
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Caminho completo do arquivo
 *         example: relatorios/2024/janeiro.pdf
 *     responses:
 *       200:
 *         description: Arquivo para download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Arquivo não encontrado
 */
router.get('/:bucket/download', controller.download);

/**
 * @swagger
 * /api/{bucket}/info:
 *   get:
 *     summary: Obter informações de um arquivo
 *     description: Retorna metadados de um arquivo (tamanho, data modificação, etc)
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Caminho completo do arquivo
 *         example: relatorios/janeiro.pdf
 *     responses:
 *       200:
 *         description: Informações do arquivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bucket:
 *                   type: string
 *                   example: documentos
 *                 data:
 *                   $ref: '#/components/schemas/File'
 */
router.get('/:bucket/info', controller.info);

/**
 * @swagger
 * /api/{bucket}/update:
 *   put:
 *     summary: Atualizar um arquivo existente
 *     description: Substitui o conteúdo de um arquivo existente
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - path
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Novo arquivo
 *               path:
 *                 type: string
 *                 description: Caminho completo do arquivo existente
 *                 example: relatorios/janeiro.pdf
 *     responses:
 *       200:
 *         description: Arquivo atualizado com sucesso
 *       404:
 *         description: Arquivo não encontrado
 */
router.put('/:bucket/update', upload.single('file'), controller.update);

/**
 * @swagger
 * /api/{bucket}/file:
 *   delete:
 *     summary: Deletar um arquivo
 *     description: Remove um arquivo do storage
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *                 description: Caminho completo do arquivo
 *                 example: relatorios/janeiro.pdf
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 *       404:
 *         description: Arquivo não encontrado
 */
router.delete('/:bucket/file', controller.delete);

/**
 * @swagger
 * /api/{bucket}/folder:
 *   delete:
 *     summary: Deletar uma pasta e todo seu conteúdo
 *     description: Remove uma pasta e todos os arquivos dentro dela recursivamente
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *                 description: Caminho da pasta
 *                 example: relatorios/antigos
 *     responses:
 *       200:
 *         description: Pasta deletada com sucesso
 */
router.delete('/:bucket/folder', controller.deleteFolder);

/**
 * @swagger
 * /api/{bucket}/url:
 *   get:
 *     summary: Gerar URL temporária para download
 *     description: Gera uma URL pré-assinada que permite download sem autenticação por tempo limitado
 *     tags: [Arquivos]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do bucket
 *         example: documentos
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Caminho completo do arquivo
 *         example: relatorios/janeiro.pdf
 *       - in: query
 *         name: expiry
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: Tempo de expiração em segundos (padrão 1 hora)
 *         example: 7200
 *     responses:
 *       200:
 *         description: URL gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bucket:
 *                   type: string
 *                   example: documentos
 *                 path:
 *                   type: string
 *                   example: relatorios/janeiro.pdf
 *                 url:
 *                   type: string
 *                   example: https://mp.iacas.top/documentos/relatorios/janeiro.pdf?X-Amz-Algorithm=...
 *                 expiresIn:
 *                   type: integer
 *                   example: 3600
 */
router.get('/:bucket/url', controller.getUrl);

module.exports = router;

