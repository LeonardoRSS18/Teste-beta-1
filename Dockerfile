FROM node:22-slim
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código
COPY . .

# Compila o frontend
RUN npm run build

# O Google Cloud define a porta via variável de ambiente PORT
ENV PORT=8080
EXPOSE 8080

# Comando para iniciar usando o suporte nativo a TS do Node 22+
# --experimental-strip-types remove a necessidade de compilar para JS
# --no-warnings esconde avisos de recursos experimentais
CMD ["node", "--experimental-strip-types", "--no-warnings", "server.ts"]
