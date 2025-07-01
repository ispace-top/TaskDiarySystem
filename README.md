# 日程备忘系统 (TaskDiarySystem)

这是一个使用 FastAPI (后端) 和 React (前端) 构建的全栈任务和日记管理系统。该系统架构灵活，可通过配置文件轻松切换使用 **SQLite**, **MySQL** 或 **PostgreSQL** 数据库。

## 技术栈

-   **后端**: FastAPI, SQLAlchemy, Pydantic, Pydantic-Settings
-   **前端**: React, Vite, Tailwind CSS, Axios, React Router
-   **数据库支持**: SQLite, MySQL, PostgreSQL
-   **部署**: Docker, Docker Compose

## 如何运行项目

### 数据库配置

本项目的核心优势之一是其灵活的数据库支持。您可以通过在 `.env` 文件中设置 `DATABASE_URL` 环境变量来选择您的数据库。

1.  在项目根目录 (与 `docker-compose.yml` 同级) 创建一个 `.env` 文件。
2.  根据您的选择，复制以下其中一行到 `.env` 文件中：

    -   **使用 SQLite (默认, 无需额外服务):**
        ```env
        DATABASE_URL="sqlite:///./taskdiary.db"
        ```

    -   **使用 MySQL:** (请确保您有一个正在运行的 MySQL 服务器)
        ```env
        # 格式: mysql+mysqlclient://<用户>:<密码>@<主机>:<端口>/<数据库名>
        DATABASE_URL="mysql+mysqlclient://taskdiary_user:your_strong_password@mysql_host:3306/taskdiary_db"
        ```

    -   **使用 PostgreSQL (Docker Compose 默认配置):**
        ```env
        DATABASE_URL="postgresql://taskdiary:strongpassword@db:5432/taskdiary_db"
        ```

### 选项 1: 使用 Docker (推荐)

此方法可以一键启动所有服务，环境一致。

#### 先决条件

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

#### 步骤

1.  **克隆仓库**
    ```bash
    git clone <your-repo-url>
    cd TaskDiarySystem
    ```

2.  **创建并配置 `.env` 文件**
    在项目根目录创建一个 `.env` 文件。除了上面选择的 `DATABASE_URL`，还需添加以下内容。**请务必修改 `SECRET_KEY`**。

    ```env
    # .env (用于 docker-compose)
    #
    # --- 数据库配置 (从上面选择一个) ---
    DATABASE_URL="postgresql://taskdiary:strongpassword@db:5432/taskdiary_db"

    # --- 后端安全配置 ---
    SECRET_KEY=a_very_long_and_super_secret_random_string_for_jwt_CHANGE_ME
    ACCESS_TOKEN_EXPIRE_MINUTES=60

    # --- Docker Compose 专用数据库认证 ---
    POSTGRES_USER=taskdiary
    POSTGRES_PASSWORD=strongpassword
    POSTGRES_DB=taskdiary_db
    ```

3.  **构建并启动容器**
    ```bash
    docker-compose up --build -d
    ```

4.  **访问应用**
    -   **前端应用**: `http://localhost:5173`
    -   **后端 API 文档**: `http://localhost:8000/docs`

### 选项 2: 在本地运行 (不使用 Docker)

#### 先决条件

-   **Node.js**: v18+
-   **Python**: v3.9+
-   一个正在运行的数据库实例 (SQLite, MySQL, or PostgreSQL).

#### 步骤

1.  **设置并运行后端 (Terminal 1)**
    a. **导航到后端目录并创建 `.env` 文件**
       在 `backend` 目录下创建 `.env` 文件，并填入您的本地数据库连接信息和安全密钥。
       ```env
       # backend/.env
       DATABASE_URL="mysql+mysqlclient://<你的用户>:<你的密码>@localhost:3306/<你的数据库名>"
       SECRET_KEY=a_very_long_and_super_secret_random_string_for_jwt_CHANGE_ME
       ACCESS_TOKEN_EXPIRE_MINUTES=60
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

2.  **设置并运行前端 (Terminal 2)**
    a. **导航到前端目录并创建 `.env.local` 文件**
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

### 停止应用

-   **Docker**: 在项目根目录运行 `docker-compose down`。
-   **本地运行**: 在每个终端中按 `Ctrl + C` 停止服务。
