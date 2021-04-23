# needed for Qovary deployment
FROM node:14-alpine as base

WORKDIR /
COPY package*.json /
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
RUN npm install
COPY . /
CMD ["node", "index.js"]

