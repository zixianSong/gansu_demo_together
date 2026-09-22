FROM docker.m.daocloud.io/library/node:22-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Slim 镜像缺 OpenSSL 时 Prisma 探测会失败；引擎走国内镜像，避免 binaries.prisma.sh 被重置。
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_SKIP_POSTINSTALL_GENERATE=true \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --registry=https://registry.npmmirror.com

COPY . .
RUN npx prisma generate && npm run build \
  && sed -i 's/\r$//' /app/docker-entrypoint.sh \
  && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
CMD ["/app/docker-entrypoint.sh"]
