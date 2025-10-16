# 🔄 Guia de Atualização do .env

## ⚠️ AÇÃO NECESSÁRIA

As variáveis de ambiente foram renomeadas de `MINIO_*` para `S3_*` para refletir que o StorageKit funciona com qualquer serviço compatível com S3.

---

## 📝 Antes (ANTIGO):
```env
MINIO_ENDPOINT=mp.iacas.top
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=1013141255245882
MINIO_SECRET_KEY=5420658821784955
```

## ✅ Depois (NOVO):
```env
S3_ENDPOINT=mp.iacas.top
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=1013141255245882
S3_SECRET_KEY=5420658821784955
```

---

## 🚀 Como Atualizar

### 1. Abra seu arquivo `.env`

### 2. Substitua os nomes das variáveis:

| Antigo | Novo |
|--------|------|
| `MINIO_ENDPOINT` | `S3_ENDPOINT` |
| `MINIO_PORT` | `S3_PORT` |
| `MINIO_USE_SSL` | `S3_USE_SSL` |
| `MINIO_ACCESS_KEY` | `S3_ACCESS_KEY` |
| `MINIO_SECRET_KEY` | `S3_SECRET_KEY` |

### 3. (Opcional) Adicione região se usar AWS S3:
```env
S3_REGION=us-east-1
```

### 4. Salve o arquivo

### 5. Reinicie a aplicação:
```bash
npm run dev
```

---

## 📋 Exemplo Completo do .env

```env
# ========================================
# StorageKit - Configuração S3
# ========================================

# Seu MinIO em Produção
S3_ENDPOINT=mp.iacas.top
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=1013141255245882
S3_SECRET_KEY=5420658821784955

# ========================================
# Configuração da API
# ========================================
PORT=3000
NODE_ENV=production

# ========================================
# API Key para Autenticação
# ========================================
API_KEY=sua-chave-super-secreta-12345
```

---

## ✅ Pronto!

Sua aplicação agora está usando as novas variáveis e pode se conectar a qualquer provedor S3! 🎉

Para ver exemplos de outros provedores, consulte `S3_PROVIDERS.md`

