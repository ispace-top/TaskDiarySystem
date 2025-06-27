FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# 启动Vite开发服务器, --host使其可以从容器外访问
CMD ["npm", "run", "dev", "--", "--host"]