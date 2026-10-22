# 📚 Bookwise — University Library Management System

A modern, full-stack university library management system built with **Next.js 15, TypeScript, and PostgreSQL**. Bookwise combines a responsive web application with containerized deployment, automated CI workflows, and Kubernetes configuration to demonstrate modern full-stack development and DevOps practices.

## 🚀 Live Demo & Project Status

| Resource | Link |
|---|---|
| 🌐 Live Application | [Bookwise — Live Demo](https://uni-library.onrender.com) |
| 💻 Source Code | [GitHub Repository](https://github.com/elham-abdu/uni-library) |
| ⚙️ CI Pipeline | [GitHub Actions](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml) |

![CI Workflow](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml/badge.svg)

## ✨ Key Highlights

- **Full-Stack Architecture:** Built with Next.js 15, React, and TypeScript.
- **Database Integration:** PostgreSQL for structured and persistent data storage.
- **Image Management:** ImageKit integration for handling application assets.
- **Containerization:** Multi-stage Docker build for a streamlined production image.
- **Continuous Integration:** GitHub Actions for automated linting, type-checking, and Docker build verification.
- **Kubernetes Configuration:** Deployment and Service manifests for container orchestration.
- **Cloud Deployment:** Hosted on Render with Git-triggered deployments.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 15, React, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Asset Management | ImageKit |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Orchestration | Kubernetes |
| Hosting | Render |
| Version Control | Git, GitHub |

## 🏗️ Architecture & DevOps Workflow

Bookwise follows a container-based application workflow, integrating development, automated validation, and deployment configuration.

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions CI
    ├── Linting
    ├── Type Checking
    └── Docker Build Verification
    │
    ▼
Dockerized Application
    │
    ├── Local Development
    │   └── Docker Compose + PostgreSQL
    │
    ├── Cloud Deployment
    │   └── Render
    │
    └── Orchestration Configuration
        └── Kubernetes Manifests
```

**Deployment note:** Render is the configured hosting platform, while Kubernetes manifests provide a separate orchestration configuration. The presence of Kubernetes manifests does not imply that the live application is deployed to a Kubernetes cluster.

## 📋 Prerequisites

Before running Bookwise locally, make sure you have:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) and Docker Compose
- A configured environment file containing the required application and database settings

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/elham-abdu/uni-library.git
cd uni-library
```

### 2. Configure Environment Variables

Create a `.env` file using the variable names and configuration expected by the application.

```bash
# Example only — use the actual variables required by the project
DATABASE_URL=your_postgresql_connection_string
```

Configure any additional required variables for ImageKit and other integrations. Do not commit credentials, API keys, or production secrets to version control.

### 3. Start the Application with Docker Compose

```bash
docker compose up --build
```

This builds the application image and starts the services defined in your Docker Compose configuration.

### 4. Access the Application

Open the local URL configured by the project, typically:

```text
http://localhost:3000
```

If the application uses a different port, check the Docker Compose configuration.

### 5. Stop the Containers

```bash
docker compose down
```

To remove the Compose-managed database volume as well, use `docker compose down -v` only when you intend to delete its persisted data.

## 🐳 Docker

Bookwise uses a multi-stage Dockerfile to separate build-time dependencies from the production runtime. This approach helps keep the final image leaner and reduces unnecessary files in the runtime environment.

Build the image manually:

```bash
docker build -t bookwise .
```

Run the image using the environment variables and network configuration required by your application:

```bash
docker run --rm -p 3000:3000 bookwise
```

For a complete local environment, Docker Compose is recommended because it can manage the application and database services together.

## 🔄 Continuous Integration

The GitHub Actions workflow is configured to automate key validation steps:

- **Linting** — checks code quality and consistency.
- **Type checking** — identifies TypeScript errors.
- **Docker build verification** — checks whether the application image builds successfully.

View the workflow and its latest execution results:

[Bookwise CI Workflow](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml)

## ☸️ Kubernetes

The repository includes Kubernetes manifests for application deployment and service configuration:

```text
k8s/
├── deployment.yaml
└── service.yaml
```

These manifests provide a foundation for deploying and exposing the containerized application in a Kubernetes environment. Review the resource names, container image, ports, environment variables, and resource settings before deploying to a cluster.

## 📁 Project Structure

```text
uni-library/
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── ...
```

*The structure above highlights key infrastructure files. Additional directories and application files are omitted for readability.*

## 🔐 Configuration & Security

- Keep secrets and credentials in environment variables.
- Use a `.env.local` file to document required configuration without exposing real values.
- Avoid committing `.env` files containing sensitive information.
- Use appropriately scoped credentials for external services.
- Configure production database access and network permissions according to the deployment environment.

## 🎯 Project Goals

Bookwise demonstrates the integration of full-stack web development with practical deployment and automation techniques. It brings together application development, relational database integration, containerization, CI workflows, and Kubernetes configuration in a single project.

## 👩‍💻 Author

**Elham Abdu**

Software Engineering Student | Full-Stack Development | Cloud & DevOps

- GitHub: [@elham-abdu](https://github.com/elham-abdu)

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, PostgreSQL, and Docker.
</p>
