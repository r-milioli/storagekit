# 📚 Exemplos de Uso - StorageKit

API Gateway simplificada para MinIO.

## 🔧 Configuração Inicial

Antes de tudo, configure sua API Key em todas as requisições:

**Header obrigatório:**
```
x-api-key: sua-chave-secreta-aqui
```

---

## 🎯 Fluxo Completo de Uso

### 1. Verificar se a API está funcionando
```bash
curl http://localhost:3000/health
```

### 2. Criar um bucket
```bash
curl -X POST http://localhost:3000/api/buckets \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{"bucket": "meus-documentos"}'
```

### 3. Fazer upload de um arquivo
```bash
# Upload na raiz
curl -X POST http://localhost:3000/api/meus-documentos/upload \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -F "file=@documento.pdf"

# Upload em uma pasta
curl -X POST http://localhost:3000/api/meus-documentos/upload \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -F "file=@relatorio.pdf" \
  -F "path=relatorios/2024"
```

### 4. Listar o conteúdo
```bash
# Listar raiz
curl -H "x-api-key: sua-chave-secreta-aqui" \
  http://localhost:3000/api/meus-documentos

# Listar uma pasta específica
curl -H "x-api-key: sua-chave-secreta-aqui" \
  "http://localhost:3000/api/meus-documentos?path=relatorios"
```

### 5. Baixar um arquivo
```bash
curl -H "x-api-key: sua-chave-secreta-aqui" \
  "http://localhost:3000/api/meus-documentos/download?path=relatorios/2024/relatorio.pdf" \
  -o relatorio.pdf
```

### 6. Obter informações de um arquivo
```bash
curl -H "x-api-key: sua-chave-secreta-aqui" \
  "http://localhost:3000/api/meus-documentos/info?path=relatorios/2024/relatorio.pdf"
```

### 7. Atualizar um arquivo
```bash
curl -X PUT http://localhost:3000/api/meus-documentos/update \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -F "file=@novo-relatorio.pdf" \
  -F "path=relatorios/2024/relatorio.pdf"
```

### 8. Gerar URL temporária para compartilhar
```bash
curl -H "x-api-key: sua-chave-secreta-aqui" \
  "http://localhost:3000/api/meus-documentos/url?path=relatorios/2024/relatorio.pdf&expiry=3600"
```

### 9. Deletar um arquivo
```bash
curl -X DELETE http://localhost:3000/api/meus-documentos/file \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{"path": "relatorios/2024/relatorio.pdf"}'
```

### 10. Deletar uma pasta inteira
```bash
curl -X DELETE http://localhost:3000/api/meus-documentos/folder \
  -H "x-api-key: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{"path": "relatorios/2024"}'
```

---

## 🧪 Testes com JavaScript/Node.js

### Upload de arquivo
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const uploadFile = async () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('documento.pdf'));
  form.append('path', 'documentos/importantes');

  try {
    const response = await axios.post(
      'http://localhost:3000/api/meus-documentos/upload',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': 'sua-chave-secreta-aqui'
        }
      }
    );
    console.log('Upload sucesso:', response.data);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
};

uploadFile();
```

### Listar conteúdo
```javascript
const axios = require('axios');

const listarConteudo = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/api/meus-documentos',
      {
        params: { path: 'documentos' },
        headers: { 'x-api-key': 'sua-chave-secreta-aqui' }
      }
    );
    console.log('Pastas:', response.data.folders);
    console.log('Arquivos:', response.data.files);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
};

listarConteudo();
```

### Download de arquivo
```javascript
const axios = require('axios');
const fs = require('fs');

const downloadFile = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/api/meus-documentos/download',
      {
        params: { path: 'documentos/arquivo.pdf' },
        headers: { 'x-api-key': 'sua-chave-secreta-aqui' },
        responseType: 'arraybuffer'
      }
    );
    
    fs.writeFileSync('arquivo-baixado.pdf', response.data);
    console.log('Download completo!');
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
};

downloadFile();
```

---

## 🐍 Testes com Python

```python
import requests

API_KEY = 'sua-chave-secreta-aqui'
BASE_URL = 'http://localhost:3000/api'
HEADERS = {'x-api-key': API_KEY}

# Upload de arquivo
def upload_arquivo():
    with open('documento.pdf', 'rb') as f:
        files = {'file': f}
        data = {'path': 'documentos/2024'}
        response = requests.post(
            f'{BASE_URL}/meus-documentos/upload',
            headers=HEADERS,
            files=files,
            data=data
        )
        print(response.json())

# Listar conteúdo
def listar_conteudo():
    response = requests.get(
        f'{BASE_URL}/meus-documentos',
        headers=HEADERS,
        params={'path': 'documentos'}
    )
    print(response.json())

# Download de arquivo
def download_arquivo():
    response = requests.get(
        f'{BASE_URL}/meus-documentos/download',
        headers=HEADERS,
        params={'path': 'documentos/2024/arquivo.pdf'}
    )
    with open('download.pdf', 'wb') as f:
        f.write(response.content)
    print('Download completo!')

# Deletar arquivo
def deletar_arquivo():
    response = requests.delete(
        f'{BASE_URL}/meus-documentos/file',
        headers=HEADERS,
        json={'path': 'documentos/2024/arquivo.pdf'}
    )
    print(response.json())
```

---

## 📱 Collection Postman/Insomnia

### Variáveis de Ambiente
```json
{
  "base_url": "http://localhost:3000",
  "api_key": "sua-chave-secreta-aqui",
  "bucket": "meus-documentos"
}
```

### Headers Globais
```
x-api-key: {{api_key}}
```

---

## 🎨 Frontend (HTML + JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
    <title>MinIO Upload</title>
</head>
<body>
    <h1>Upload de Arquivo</h1>
    <input type="file" id="fileInput">
    <input type="text" id="pathInput" placeholder="Pasta (opcional)">
    <button onclick="uploadFile()">Enviar</button>

    <script>
        const API_KEY = 'sua-chave-secreta-aqui';
        const BASE_URL = 'http://localhost:3000/api';
        const BUCKET = 'meus-documentos';

        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const pathInput = document.getElementById('pathInput');
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            if (pathInput.value) {
                formData.append('path', pathInput.value);
            }

            try {
                const response = await fetch(`${BASE_URL}/${BUCKET}/upload`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': API_KEY
                    },
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    alert('Upload realizado com sucesso!');
                    console.log(result);
                } else {
                    alert('Erro: ' + result.error);
                }
            } catch (error) {
                alert('Erro: ' + error.message);
            }
        }
    </script>
</body>
</html>
```

---

## 🔄 Casos de Uso Comuns

### Organizar documentos por ano e mês
```bash
# Janeiro 2024
curl -X POST http://localhost:3000/api/documentos/upload \
  -H "x-api-key: sua-chave" \
  -F "file=@relatorio.pdf" \
  -F "path=2024/janeiro"

# Fevereiro 2024
curl -X POST http://localhost:3000/api/documentos/upload \
  -H "x-api-key: sua-chave" \
  -F "file=@relatorio.pdf" \
  -F "path=2024/fevereiro"
```

### Backup de arquivos importantes
```bash
# Upload
curl -X POST http://localhost:3000/api/backups/upload \
  -H "x-api-key: sua-chave" \
  -F "file=@banco-dados.sql" \
  -F "path=diario/$(date +%Y-%m-%d)"

# Gerar link temporário (válido por 24h)
curl -H "x-api-key: sua-chave" \
  "http://localhost:3000/api/backups/url?path=diario/2024-01-15/banco-dados.sql&expiry=86400"
```

### Migração de arquivos entre pastas
```bash
# 1. Download do arquivo original
curl -H "x-api-key: sua-chave" \
  "http://localhost:3000/api/documentos/download?path=antiga/arquivo.pdf" \
  -o temp-arquivo.pdf

# 2. Upload na nova pasta
curl -X POST http://localhost:3000/api/documentos/upload \
  -H "x-api-key: sua-chave" \
  -F "file=@temp-arquivo.pdf" \
  -F "path=nova-pasta"

# 3. Deletar arquivo antigo
curl -X DELETE http://localhost:3000/api/documentos/file \
  -H "x-api-key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{"path": "antiga/arquivo.pdf"}'
```

