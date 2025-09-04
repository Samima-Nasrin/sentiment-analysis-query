FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y libonnxruntime1.14

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --no-lint

EXPOSE 3000

CMD ["npm", "start"]
