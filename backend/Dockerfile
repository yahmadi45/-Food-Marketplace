FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node src ./src
COPY --chown=node:node scripts/init-app-user.js ./scripts/init-app-user.js
USER node
EXPOSE 4000
CMD ["node", "src/index.js"]
