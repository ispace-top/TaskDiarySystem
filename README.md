# 日程备忘系统 (TaskDiarySystem)

这是一个使用 FastAPI (后端) 和 React (前端) 构建的全栈任务和日记管理系统。

## 技术栈

-   **后端**: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
-   **前端**: React, Vite, Tailwind CSS, Axios, React Router
-   **部署**: Docker, Docker Compose

## 如何运行项目 (开发环境)

本项目使用 Docker Compose 进行容器化部署，可以一键启动所有开发服务。

### 先决条件

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### 步骤

1.  **克隆仓库**
    ```bash
    git clone <your-repo-url>
    cd TaskDiarySystem
    ```

2.  **创建环境变量文件**
    在项目根目录创建一个 `.env` 文件，并将以下内容复制进去。**请务必修改 `SECRET_KEY`**。

    ```env
    # .env
    # 后端配置
    SECRET_KEY=a_very_long_and_super_secret_random_string_for_jwt
    ACCESS_TOKEN_EXPIRE_MINUTES=60

    # 数据库配置
    POSTGRES_USER=taskdiary
    POSTGRES_PASSWORD=strongpassword
    POSTGRES_DB=taskdiary_db
    DATABASE_URL=postgresql://taskdiary:strongpassword@db:5432/taskdiary_db
    ```

3.  **创建后端 `requirements.txt`**
    在 `backend` 目录下，根据您的项目依赖创建一个 `requirements.txt` 文件。例如：
    ```txt
    # backend/requirements.txt
    fastapi
    uvicorn[standard]
    sqlalchemy
    psycopg2-binary
    pydantic[email]
    python-jose[cryptography]
    passlib[bcrypt]
    python-multipart
    ```

4.  **构建并启动容器**
    在项目根目录下运行以下命令：

    ```bash
    docker-compose up --build -d
    ```

    该命令会并行启动后端、前端和数据库服务。

5.  **访问应用**
    -   **前端应用**: 打开浏览器访问 `http://localhost:5173`
    -   **后端 API 文档**: 访问 `http://localhost:8000/docs`

### 停止应用

要停止所有正在运行的容器，请运行：

```bash
docker-compose down
