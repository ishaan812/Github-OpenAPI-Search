FROM node:16-alpine

WORKDIR /usr

COPY ./package.json ./package-lock.json ./.prettierrc ./.eslintrc.json ./jest.config.js ./tsconfig.json ./tsconfig.release.json ./
RUN npm install

COPY ./src ./src

EXPOSE 8080

RUN npm run build
CMD ["npm", "run", "start"]