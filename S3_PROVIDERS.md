# 🌐 Guia de Configuração para Provedores S3

StorageKit é compatível com qualquer serviço que implemente o protocolo S3. Abaixo estão exemplos de configuração para os principais provedores.

---

## 🏠 MinIO (Self-hosted)

### Configuração `.env`:
```env
S3_ENDPOINT=mp.iacas.top
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=seu_access_key
S3_SECRET_KEY=seu_secret_key
```

### Características:
- ✅ Self-hosted (você controla)
- ✅ Open source
- ✅ Totalmente compatível com S3
- ✅ Pode rodar em Docker

---

## ☁️ Amazon S3 (AWS)

### Configuração `.env`:
```env
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
S3_USE_SSL=true
S3_REGION=us-east-1
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Regiões Disponíveis:
- `us-east-1` (Norte da Virgínia)
- `us-west-1` (Norte da Califórnia)
- `us-west-2` (Oregon)
- `eu-west-1` (Irlanda)
- `eu-central-1` (Frankfurt)
- `ap-southeast-1` (Cingapura)
- `sa-east-1` (São Paulo)

### Como Obter Credenciais:
1. Acesse o AWS Console
2. Vá em IAM > Users
3. Crie um novo usuário com acesso programático
4. Anexe a política `AmazonS3FullAccess`
5. Copie Access Key e Secret Key

---

## 🌊 DigitalOcean Spaces

### Configuração `.env`:
```env
S3_ENDPOINT=nyc3.digitaloceanspaces.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=DO00ABCDEFGHIJKLMNOP
S3_SECRET_KEY=your_secret_key_here
```

### Regiões (Datacenters):
- `nyc3.digitaloceanspaces.com` (Nova York 3)
- `ams3.digitaloceanspaces.com` (Amsterdã 3)
- `sgp1.digitaloceanspaces.com` (Cingapura 1)
- `sfo3.digitaloceanspaces.com` (San Francisco 3)

### Como Obter Credenciais:
1. Acesse DigitalOcean Dashboard
2. API > Spaces Keys
3. Generate New Key

---

## 🔥 Cloudflare R2

### Configuração `.env`:
```env
S3_ENDPOINT=your-account-id.r2.cloudflarestorage.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=your_access_key_id
S3_SECRET_KEY=your_secret_access_key
```

### Como Obter Credenciais:
1. Acesse Cloudflare Dashboard
2. R2 > Manage R2 API Tokens
3. Create API Token

### Vantagens:
- ✅ Sem taxas de egress (saída de dados)
- ✅ Preço competitivo
- ✅ Rede global

---

## 🗄️ Wasabi

### Configuração `.env`:
```env
S3_ENDPOINT=s3.wasabisys.com
S3_PORT=443
S3_USE_SSL=true
S3_REGION=us-east-1
S3_ACCESS_KEY=WASABI_ACCESS_KEY
S3_SECRET_KEY=WASABI_SECRET_KEY
```

### Regiões:
- `s3.wasabisys.com` (US East 1)
- `s3.us-west-1.wasabisys.com` (US West 1)
- `s3.eu-central-1.wasabisys.com` (EU Central 1)
- `s3.ap-northeast-1.wasabisys.com` (Asia Pacific)

### Como Obter Credenciais:
1. Acesse Wasabi Console
2. Access Keys > Create New Access Key

---

## 🔷 Backblaze B2

### Configuração `.env`:
```env
S3_ENDPOINT=s3.us-west-000.backblazeb2.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=your_key_id
S3_SECRET_KEY=your_application_key
```

### Regiões:
- `s3.us-west-000.backblazeb2.com` (US West)
- `s3.us-west-001.backblazeb2.com` (US West)
- `s3.us-west-002.backblazeb2.com` (US West)
- `s3.eu-central-003.backblazeb2.com` (EU)

### Como Obter Credenciais:
1. Acesse Backblaze Console
2. App Keys > Add a New Application Key
3. Copie keyID e applicationKey

---

## 🦅 Linode Object Storage

### Configuração `.env`:
```env
S3_ENDPOINT=us-east-1.linodeobjects.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
```

### Regiões:
- `us-east-1.linodeobjects.com` (Newark)
- `eu-central-1.linodeobjects.com` (Frankfurt)
- `ap-south-1.linodeobjects.com` (Singapura)

---

## 📊 Comparação de Preços (estimativa)

| Provedor | Armazenamento/TB | Transferência | Observações |
|----------|------------------|---------------|-------------|
| **MinIO** | Custo do servidor | - | Self-hosted |
| **AWS S3** | $23/mês | $90/TB saída | Escalável |
| **DigitalOcean** | $5/mês (250GB) | $10/TB saída | Simples |
| **Cloudflare R2** | $15/mês | **GRÁTIS** | Sem egress |
| **Wasabi** | $6.99/mês | **GRÁTIS** | Mínimo 1TB |
| **Backblaze B2** | $6/mês | $10/TB saída | Econômico |

---

## 🔐 Segurança

### Boas Práticas:
1. **Nunca compartilhe** suas credenciais
2. **Use IAM roles** quando possível (AWS)
3. **Limite permissões** ao mínimo necessário
4. **Rotacione chaves** regularmente
5. **Ative versionamento** para backups
6. **Configure CORS** adequadamente
7. **Use HTTPS** sempre (S3_USE_SSL=true)

---

## 🧪 Testando a Conexão

Depois de configurar o `.env`, teste:

```bash
# 1. Verificar saúde da API
curl http://localhost:3000/health

# 2. Listar buckets
curl -H "x-api-key: sua-chave" http://localhost:3000/api/buckets
```

Se receber erro de conexão:
- ✅ Verifique endpoint
- ✅ Verifique credenciais
- ✅ Verifique SSL (true/false)
- ✅ Verifique porta
- ✅ Verifique região (se necessário)

---

## 💡 Dicas

### Para AWS S3:
- Use regiões mais próximas dos seus usuários
- Configure Lifecycle policies para reduzir custos
- Use CloudFront para CDN

### Para Cloudflare R2:
- Aproveite o egress gratuito
- Integre com Workers para lógica adicional

### Para MinIO:
- Configure replicação para alta disponibilidade
- Use erasure coding para durabilidade
- Monitor com Prometheus/Grafana

---

**Precisa de ajuda com algum provedor específico?** Abra uma issue! 🚀

