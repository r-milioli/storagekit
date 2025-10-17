# 🐳 Docker Compose - StorageKit

Este documento explica como configurar e usar os arquivos Docker Compose do StorageKit.

## 📁 Arquivos Disponíveis

### `docker-compose-exemplo.yml` 📋
- **Arquivo público** com dados fictícios
- **Pode ser commitado** no repositório
- **Exemplos de configuração** para diferentes provedores S3
- **Base para configuração** personalizada

### `docker-compose.yml` 🔒
- **Arquivo privado** com dados reais
- **NÃO é commitado** (está no .gitignore)
- **Configuração de produção** com credenciais reais
- **Criado localmente** baseado no exemplo

## 🚀 Como Usar

### 1. **Configuração Inicial**
```bash
# Copie o arquivo de exemplo
cp docker-compose-exemplo.yml docker-compose.yml

# Edite com seus dados reais
nano docker-compose.yml
```

### 2. **Configurar Variáveis de Ambiente**
No `docker-compose.yml`, ajuste:

```yaml
environment:
  # Configuração S3/MinIO
  - S3_ENDPOINT=seu-endpoint.com
  - S3_PORT=443
  - S3_USE_SSL=true
  - S3_ACCESS_KEY=sua-access-key
  - S3_SECRET_KEY=sua-secret-key
  
  # Configuração da API
  - PRODUCTION_URL=https://sua-url.com
  
  # API Key segura
  - API_KEY=sua-chave-super-secreta
```

### 3. **Configurar Traefik**
Ajuste os labels do Traefik:

```yaml
labels:
  # Sua URL personalizada
  - traefik.http.routers.storagekit.rule=Host(`sua-url.com`)
  - traefik.http.routers.storagekit-http.rule=Host(`sua-url.com`)
```

### 4. **Deploy**
```bash
# Deploy da stack
docker stack deploy -c docker-compose.yml storagekit

# Verificar status
docker service ls

# Ver logs
docker service logs storagekit_storagekit
```

## 🌐 Exemplos de Configuração

### **MinIO Local**
```yaml
environment:
  - S3_ENDPOINT=localhost
  - S3_PORT=9000
  - S3_USE_SSL=false
  - S3_ACCESS_KEY=minioadmin
  - S3_SECRET_KEY=minioadmin
```

### **AWS S3**
```yaml
environment:
  - S3_ENDPOINT=s3.amazonaws.com
  - S3_PORT=443
  - S3_USE_SSL=true
  - S3_REGION=us-east-1
  - S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
  - S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### **DigitalOcean Spaces**
```yaml
environment:
  - S3_ENDPOINT=nyc3.digitaloceanspaces.com
  - S3_PORT=443
  - S3_USE_SSL=true
  - S3_REGION=nyc3
  - S3_ACCESS_KEY=DO00EXAMPLEKEY
  - S3_SECRET_KEY=EXAMPLE_SECRET_KEY_DO_NOT_USE_IN_PRODUCTION
```

### **Cloudflare R2**
```yaml
environment:
  - S3_ENDPOINT=your-account-id.r2.cloudflarestorage.com
  - S3_PORT=443
  - S3_USE_SSL=true
  - S3_REGION=auto
  - S3_ACCESS_KEY=your-access-key
  - S3_SECRET_KEY=your-secret-key
```

## 🔒 Segurança

### **Credenciais Sensíveis**
- ✅ **NUNCA** commite o `docker-compose.yml` com credenciais reais
- ✅ **SEMPRE** use o arquivo de exemplo como base
- ✅ **ALTERE** todas as chaves padrão
- ✅ **USE** API Keys fortes e únicas

### **Variáveis de Ambiente**
Para maior segurança, considere usar:
- **Docker Secrets** para credenciais
- **Variáveis de ambiente** do sistema
- **Arquivos .env** externos

## 📋 Checklist de Deploy

- [ ] Copiar `docker-compose-exemplo.yml` para `docker-compose.yml`
- [ ] Configurar `S3_ENDPOINT` correto
- [ ] Configurar `S3_ACCESS_KEY` e `S3_SECRET_KEY`
- [ ] Alterar `API_KEY` para uma chave segura
- [ ] Configurar `PRODUCTION_URL` corretamente
- [ ] Ajustar labels do Traefik com sua URL
- [ ] Verificar rede `network_public` existe
- [ ] Testar deploy em ambiente de desenvolvimento

## 🐛 Troubleshooting

### **Erro de Rede**
```bash
# Verificar se a rede existe
docker network ls | grep network_public

# Criar rede se não existir
docker network create --driver overlay network_public
```

### **Erro de Permissões**
```bash
# Verificar se está no Docker Swarm
docker node ls

# Inicializar Swarm se necessário
docker swarm init
```

### **Erro de Traefik**
- Verificar se o Traefik está rodando
- Confirmar se os labels estão corretos
- Verificar se a URL está configurada no DNS

## 📞 Suporte

Se precisar de ajuda:
- 📧 **Email:** automacaodebaixocusto@gmail.com
- ☕ **PIX:** automacaodebaixocusto@gmail.com

---

**Desenvolvido com ❤️ por ABC-Automação**
