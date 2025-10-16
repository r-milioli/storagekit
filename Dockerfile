# Imagem base
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia o código da aplicação
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Define variáveis de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]

