FROM node:22-slim
WORKDIR /app

# Instala dependências de build
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Compila o frontend para produção
RUN npm run build

# Define a porta padrão (o Cloud Run sobrescreve isso)
ENV PORT=8080
EXPOSE 8080

# Comando de inicialização
# Usamos --experimental-strip-types para rodar o server.ts diretamente
# Adicionamos --no-warnings para evitar logs sujos que podem confundir o health check
CMD ["node", "--experimental-strip-types", "--no-warnings", "server.ts"]
