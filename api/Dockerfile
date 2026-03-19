FROM node:22.14.0-slim

RUN apt-get update && apt-get install -y openssl curl bash \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
    && apt-get install -y infisical \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn install --frozen-lockfile
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" yarn build

EXPOSE 3100
CMD ["sh", "-c", "infisical run --env=prod --projectId=2980a086-4367-4a1a-aafd-d1f5d4879253 -- sh -c 'export PORT=3100 && yarn db:migration:run && yarn start:prod'"]
