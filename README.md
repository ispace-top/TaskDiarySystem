# 日程备忘系统 (TaskDiarySystem)

这是一个使用 FastAPI (后端) 和 React (前端) 构建的全栈任务和日记管理系统。

## 技术栈

-   **后端**: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
-   **前端**: React, Vite, Tailwind CSS, Axios, React Router
-   **部署**: Docker, Docker Compose

## 如何运行项目

您可以选择使用 Docker (推荐，用于快速启动和环境一致性) 或在本地直接运行服务。

---

### 选项 1: 使用 Docker (推荐)

此方法可以一键启动所有服务，无需在本地安装 Python 或 Node.js 环境。

#### 先决条件

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

#### 步骤

1.  **克隆仓库**
    ```bash
    git clone <your-repo-url>
    cd TaskDiarySystem
    ```

2.  **创建 Docker 环境变量文件**
    在项目根目录创建一个 `.env` 文件，并复制以下内容。**请务必修改 `SECRET_KEY`**。

    ```env
    # .env (用于 docker-compose)
    # 后端配置
    SECRET_KEY=a_very_long_and_super_secret_random_string_for_jwt
    ACCESS_TOKEN_EXPIRE_MINUTES=60

    # 数据库配置
    POSTGRES_USER=taskdiary
    POSTGRES_PASSWORD=strongpassword
    POSTGRES_DB=taskdiary_db
    # DATABASE_URL 指向 docker-compose 网络中的 'db' 服务
    DATABASE_URL=postgresql://taskdiary:strongpassword@db:5432/taskdiary_db
    ```

3.  **构建并启动容器**
    在项目根目录下运行以下命令：
    ```bash
    docker-compose up --build -d
    ```

4.  **访问应用**
    -   **前端应用**: 打开浏览器访问 `http://localhost:5173`
    -   **后端 API 文档**: 访问 `http://localhost:8000/docs`

---

### 选项 2: 在本地运行 (不使用 Docker)

此方法让您直接在您的操作系统上运行前端和后端服务，便于调试。

#### 先决条件

-   **Node.js**: v18 或更高版本。
-   **Python**: v3.9 或更高版本。
-   **PostgreSQL**: 一个在本地或网络上可访问的正在运行的实例。

#### 步骤

1.  **准备数据库**
    -   确保您的 PostgreSQL 服务正在运行。
    -   创建一个新的数据库和用户供本项目使用。例如，数据库名 `taskdiary_local`。

2.  **设置并运行后端 (Terminal 1)**
    a. **导航到后端目录并创建 `.env` 文件**
       在 `backend` 目录下创建 `.env` 文件，并填入您的本地数据库连接信息。
       ```env
       # backend/.env
       SECRET_KEY=a_very_long_and_super_secret_random_string_for_jwt
       ACCESS_TOKEN_EXPIRE_MINUTES=60
       # 重要：将下面的URL替换为您的本地数据库连接信息
       DATABASE_URL=postgresql://<你的用户>:<你的密码>@localhost:5432/<你的数据库名>
       ```
    b. **创建虚拟环境并安装依赖**
       ```bash
       cd backend
       python -m venv venv
       source venv/bin/activate  # macOS/Linux
       # .\venv\Scripts\activate  # Windows
       pip install -r requirements.txt
       ```
    c. **启动后端服务**
       ```bash
       uvicorn app.main:app --reload
       ```
       后端将运行在 `http://127.0.0.1:8000`。

3.  **设置并运行前端 (Terminal 2)**
    a. **导航到前端目录并创建 `.env.local` 文件**
       在 `frontend` 目录下创建 `.env.local` 文件，指定本地后端的地址。
       ```env
       # frontend/.env.local
       VITE_API_BASE_URL=[http://127.0.0.1:8000/api/v1](http://127.0.0.1:8000/api/v1)
       ```
    b. **安装依赖并启动**
       ```bash
       cd frontend
       npm install
       npm run dev
       ```
       前端将运行在 `http://localhost:5173`。

4.  **访问应用**
    -   **前端应用**: `http://localhost:5173`
    -   **后端 API 文档**: `http://127.0.0.1:8000/docs`

---

### 停止应用

-   **Docker**: 在项目根目录运行 `docker-compose down`。
-   **本地运行**: 在每个终端中按 `Ctrl + C` 停止服务。
