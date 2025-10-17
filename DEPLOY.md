# 🚀 Guia de Deploy - Docker Swarm

Guia completo para fazer deploy do StorageKit em Docker Swarm com Traefik.

---

## 📋 Pré-requisitos

- ✅ Docker Swarm inicializado
- ✅ Traefik rodando no Swarm
- ✅ Rede `network_public` criada
- ✅ DNS apontando para seu servidor (ex: `storage.iacas.top`)

---

## 🔧 Configuração

### 1. **Edite o domínio no `docker-compose.yml`**

Abra o arquivo `docker-compose.yml` e altere o domínio:

```yaml
# Linha ~51 e ~55
- traefik.http.routers.storagekit-http.rule=Host(`storage.iacas.top`)
- traefik.http.routers.storagekit.rule=Host(`storage.iacas.top`)
```

**Substitua `storage.iacas.top` pelo seu domínio desejado.**

---

### 2. **Configure as variáveis de ambiente**

Edite as variáveis no `docker-compose.yml`:

```yaml
environment:
  # Seu MinIO
  - S3_ENDPOINT=mp.iacas.top
  - S3_PORT=443
  - S3_USE_SSL=true
  - S3_ACCESS_KEY=seu_access_key
  - S3_SECRET_KEY=seu_secret_key
  
  # API Configuration
  - PORT=3000
  - NODE_ENV=production
  - PRODUCTION_URL=https://storage.iacas.top
  
  # API Key - IMPORTANTE: Altere!
  - API_KEY=gere-uma-chave-segura-aqui
```

**⚠️ IMPORTANTE:** Nunca commite credenciais reais no Git!

---

## 🏗️ Build da Imagem

### **Opção 1: Build Local**

```bash
# Build da imagem
docker build -t storagekit:latest .

# Verificar a imagem
docker images | grep storagekit
```

### **Opção 2: Build e Push para Registry (Recomendado)**

Se você tem um Docker Registry privado:

```bash
# Build com tag do registry
docker build -t seu-registry.com/storagekit:latest .

# Push para o registry
docker push seu-registry.com/storagekit:latest

# Atualize o docker-compose.yml
# image: seu-registry.com/storagekit:latest
```

---

## 🚢 Deploy no Swarm

### 1. **Deploy da Stack**

```bash
docker stack deploy -c docker-compose.yml storagekit
```

### 2. **Verificar o Deploy**

```bash
# Ver serviços
docker service ls | grep storagekit

# Ver logs
docker service logs -f storagekit_storagekit

# Ver status detalhado
docker service ps storagekit_storagekit
```

### 3. **Aguardar o SSL ser gerado**

O Traefik vai gerar o certificado SSL automaticamente. Isso pode levar alguns segundos.

---

## ✅ Testar a API

### 1. **Health Check**

```bash
curl https://storage.iacas.top/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "StorageKit API",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. **Testar Autenticação**

```bash
# Sem API Key (deve dar erro 401)
curl https://storage.iacas.top/api/buckets

# Com API Key (deve funcionar)
curl -H "x-api-key: sua-chave" https://storage.iacas.top/api/buckets
```

---

## 🔄 Atualizar a Aplicação

### 1. **Fazer alterações no código**

### 2. **Rebuild da imagem**

```bash
docker build -t storagekit:latest .
```

### 3. **Atualizar o serviço**

```bash
# Atualizar forçando nova imagem
docker service update --force storagekit_storagekit

# Ou fazer redeploy da stack
docker stack deploy -c docker-compose.yml storagekit
```

---

## 📊 Monitoramento

### **Ver logs em tempo real:**
```bash
docker service logs -f storagekit_storagekit
```

### **Ver status do serviço:**
```bash
docker service ps storagekit_storagekit
```

### **Inspecionar configuração:**
```bash
docker service inspect storagekit_storagekit
```

---

## 🎯 Escalar a Aplicação

Para aumentar o número de réplicas:

```bash
# Escalar para 3 réplicas
docker service scale storagekit_storagekit=3

# Ou edite o docker-compose.yml
# replicas: 3
# E faça redeploy
```

---

## 🔒 Segurança

### **1. Use Secrets do Docker (Recomendado)**

Crie um arquivo `docker-compose.secrets.yml`:

```yaml
version: "3.7"

services:
  storagekit:
    image: storagekit:latest
    networks:
      - network_public
    
    secrets:
      - api_key
      - s3_access_key
      - s3_secret_key
    
    environment:
      - S3_ENDPOINT=mp.iacas.top
      - S3_PORT=443
      - S3_USE_SSL=true
      - S3_ACCESS_KEY_FILE=/run/secrets/s3_access_key
      - S3_SECRET_KEY_FILE=/run/secrets/s3_secret_key
      - API_KEY_FILE=/run/secrets/api_key
      - PORT=3000
      - NODE_ENV=production
    
    deploy:
      # ... resto da config

secrets:
  api_key:
    external: true
  s3_access_key:
    external: true
  s3_secret_key:
    external: true

networks:
  network_public:
    external: true
```

**Criar os secrets:**
```bash
echo "sua-api-key-segura" | docker secret create api_key -
echo "seu_s3_access_key" | docker secret create s3_access_key -
echo "seu_s3_secret_key" | docker secret create s3_secret_key -
```

---

## 🐛 Troubleshooting

### **Erro: Serviço não inicia**
```bash
# Ver logs detalhados
docker service logs storagekit_storagekit

# Ver tasks com erro
docker service ps storagekit_storagekit --no-trunc
```

### **Erro: SSL não funciona**
```bash
# Verificar logs do Traefik
docker service logs traefik

# Verificar se o DNS está apontando corretamente
nslookup storage.iacas.top
```

### **Erro: Não consegue acessar o MinIO**
```bash
# Entrar no container
docker exec -it $(docker ps -q -f name=storagekit) sh

# Testar conexão
ping mp.iacas.top
```

---

## 🗑️ Remover a Stack

```bash
# Remover a stack
docker stack rm storagekit

# Remover a imagem (opcional)
docker rmi storagekit:latest
```

---

## 📝 Exemplo Completo de Deploy

```bash
# 1. Clonar ou ter o código
cd /caminho/para/Storage

# 2. Editar docker-compose.yml (domínio e credenciais)
nano docker-compose.yml

# 3. Build da imagem
docker build -t storagekit:latest .

# 4. Deploy
docker stack deploy -c docker-compose.yml storagekit

# 5. Verificar
docker service ls
docker service logs -f storagekit_storagekit

# 6. Testar
curl https://storage.iacas.top/health
```

---

## 🎉 Pronto!

Sua API StorageKit está rodando em:

**URL:** `https://storage.iacas.top`

**Endpoints:**
- Health: `https://storage.iacas.top/health`
- Buckets: `https://storage.iacas.top/api/buckets`
- Docs: Consulte `README.md` e `EXEMPLOS.md`

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs
2. Verifique o DNS
3. Verifique as credenciais
4. Verifique se o Traefik está funcionando

