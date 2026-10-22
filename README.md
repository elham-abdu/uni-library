# 📚 Bookwise — University Library Management System

A modern, full-stack university library management system built with **Next.js 15, React, TypeScript, and PostgreSQL**. Bookwise combines web application development with containerization, automated CI workflows, cloud hosting, and Kubernetes deployment configuration.

## 🚀 Live Demo & Project Status

| Resource | Link |
|---|---|
| 🌐 Live Application | [Bookwise Live Demo](https://uni-library.onrender.com) |
| 💻 Source Code | [GitHub Repository](https://github.com/elham-abdu/uni-library) |
| ⚙️ CI Workflow | [GitHub Actions](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml) |

![CI Workflow](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml/badge.svg)

## ✨ Key Highlights

- **Full-Stack Development:** Built with Next.js 15, React, and TypeScript.
- **Relational Database:** PostgreSQL integration for structured data storage.
- **Asset Management:** ImageKit integration for application assets.
- **Containerization:** Multi-stage Docker build designed for production.
- **Continuous Integration:** GitHub Actions for automated linting, type-checking, and Docker build verification.
- **Container Orchestration:** Kubernetes Deployment and Service manifests.
- **Cloud Hosting:** Render deployment with Git-triggered builds.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend & Application | Next.js 15, React, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Asset Management | ImageKit |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Orchestration | Kubernetes |
| Cloud Hosting | Render |
| Version Control | Git, GitHub |

## 🏗️ Architecture & DevOps Workflow

Bookwise combines application development, automated validation, containerization, and deployment configuration.

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    ├── Linting
    ├── Type Checking
    └── Docker Build Verification
    │
    ▼
Containerized Application
    ├── Local Development
    │   └── Docker Compose + PostgreSQL
    │
    ├── Cloud Hosting
    │   └── Render
    │
    └── Kubernetes Configuration
        ├── Deployment
        └── Service
```

**Deployment note:** Render is the configured hosting platform. Kubernetes manifests are provided for a separate cluster deployment; their presence does not imply that the live application runs on Kubernetes.

## 📋 Prerequisites

Before running Bookwise locally, ensure you have:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) with Docker Compose
- A configured environment file containing the required application and database settings

For Kubernetes deployment, you will also need:

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Minikube](https://minikube.sigs.k8s.io/) or [Kind](https://kind.sigs.k8s.io/), or another running Kubernetes cluster

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/elham-abdu/uni-library.git
cd uni-library
```

### 2. Configure Environment Variables

Create a `.env` file in the location expected by the application and configure the required environment variables.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
```

Configure any additional variables required by PostgreSQL, ImageKit, and the application.

> **Security:** Never commit production credentials, database passwords, API keys, or other secrets to GitHub. Use a `.env.example` file to document required variables without exposing sensitive values.

### 3. Start the Application with Docker Compose

Build the images and start the services:

```bash
docker compose up --build
```

Docker Compose starts the services defined in your Compose configuration.

### 4. Access the Application

Open the local address configured by the application, typically:

```text
http://localhost:3000
```

Check your Docker Compose configuration if the application uses a different port.

### 5. Stop the Application

```bash
docker compose down
```

To remove the Compose-managed volumes as well, use the following command only if you intend to delete persisted data:

```bash
docker compose down -v
```

## 🐳 Docker

Bookwise uses a multi-stage Dockerfile to separate build-time dependencies from the production runtime, helping reduce unnecessary files in the final image.

Build the application image:

```bash
docker build -t bookwise .
```

Run the container:

```bash
docker run --rm -p 3000:3000 bookwise
```

Ensure the required environment variables, database connectivity, and application configuration are provided when running the container.

For local development with a database, Docker Compose is recommended.

## 🔄 Continuous Integration

Bookwise uses GitHub Actions to automate important validation steps.

The CI workflow is configured to perform:

- **Linting:** Checks code quality and consistency.
- **Type checking:** Identifies TypeScript errors.
- **Docker build verification:** Checks whether the application image builds successfully.

View workflow configuration and execution results:

[View Bookwise CI Workflow](https://github.com/elham-abdu/uni-library/actions/workflows/ci.yml)

## ☸️ Kubernetes Deployment

Bookwise includes Kubernetes manifests for deploying the application and exposing it through a Kubernetes Service.

### Kubernetes Configuration

```text
k8s/
├── deployment.yaml
└── service.yaml
```

### 1. Start Your Kubernetes Cluster

Start a local cluster using Minikube:

```bash
minikube start
```

Alternatively, create a Kind cluster if Kind is installed:

```bash
kind create cluster --name bookwise
```

Use the option appropriate for your environment. You do not need to run both.

### 2. Make the Application Image Available

Kubernetes must be able to access the container image referenced by `k8s/deployment.yaml`.

If you build the image locally and use Minikube, you can load it into the cluster:

```bash
docker build -t bookwise:latest .
minikube image load bookwise:latest
```

For Kind, load the image using:

```bash
docker build -t bookwise:latest .
kind load docker-image bookwise:latest --name bookwise
```

Ensure that the image name and tag match the image referenced in your Kubernetes Deployment manifest. If you use a remote container registry instead, make sure the cluster can pull the image.

### 3. Apply the Kubernetes Manifests

Deploy the application:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

These commands create or update the Kubernetes resources defined in the manifests.

### 4. Verify the Deployment

Check the Deployment, Pods, and Services:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

Wait for the application Deployment to become ready:

```bash
kubectl rollout status deployment/<deployment-name>
```

Replace `<deployment-name>` with the actual Deployment name defined in `k8s/deployment.yaml`.

### 5. Troubleshoot Deployment Issues

Inspect the Pods:

```bash
kubectl describe pods
```

View application logs:

```bash
kubectl logs deployment/<deployment-name>
```

If the application fails to start, check the container image, Pod events, environment variables, database connectivity, and container port configuration.

### 6. Access the Application

The access method depends on the Service type configured in `k8s/service.yaml`.

For a NodePort Service on Minikube, you can try:

```bash
minikube service <service-name>
```

Replace `<service-name>` with the Service name defined in the manifest.

For a ClusterIP Service, use port forwarding:

```bash
kubectl port-forward service/<service-name> 8080:80
```

Then open:

```text
http://localhost:8080
```

In this example, `80` is the Service port. If your manifest defines a different port, adjust the command accordingly.

> **Important:** Before deploying, verify that the Kubernetes manifests reference the correct image, container port, environment variables, and database configuration. If PostgreSQL is hosted outside the cluster, ensure that the cluster can reach it. For a production deployment, use appropriate Secret resources or an external secrets manager for sensitive configuration.

## 📁 Project Structure

The following tree highlights the main infrastructure and configuration files:

```text
uni-library/
├── .github/
│   └── workflows/
│       └── ci.yml
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── Dockerfile
├── docker-compose.yml
└── ...
```

Additional application source files and directories are omitted for readability.

## 🔐 Security & Configuration

- Store sensitive credentials in environment variables or a secrets manager.
- Keep real `.env` files out of version control.
- Provide a `.env.example` file documenting the required configuration.
- Use appropriately scoped credentials for external services.
- Restrict production database access to authorized services.
- Review Kubernetes resource permissions and configuration before production deployment.

## 🎯 Project Goals

Bookwise demonstrates the integration of full-stack web development with modern software delivery practices. By combining a TypeScript-based application, PostgreSQL, Docker, GitHub Actions, cloud hosting, and Kubernetes configuration, the project provides practical experience across application development and deployment workflows.

## 👩‍💻 Author

**Elham Abdu**

Software Engineering Student | Full-Stack Development | Cloud & DevOps

- GitHub: [@elham-abdu](https://github.com/elham-abdu)
