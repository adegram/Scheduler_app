# TASKBOARD

A lightweight Kanban-style task management web app built with Node.js and Express. Designed to be containerized and deployed anywhere Docker runs — including locally and on AWS ECS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (Alpine) |
| Framework | Express 4 |
| Frontend | Vanilla HTML/CSS/JS |
| Storage | In-memory (no database) |
| Container | Docker (multi-stage build) |

---

## Project Structure

```
taskboard/
├── Dockerfile          # Multi-stage Docker build
├── .dockerignore       # Files excluded from Docker build context
├── .gitignore          # Files excluded from version control
├── package.json        # Node.js project manifest and dependencies
├── requirements.txt    # Runtime requirements reference
├── server.js           # Express server and REST API
├── LICENSE             # MIT License
├── README.md           # This file
└── public/
    └── index.html      # Frontend UI (single page)
```

---

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### Run Locally (without Docker)

```bash
npm install
npm start
```

Visit `http://localhost:4045`

---

### Run with Docker

```bash
# Build the image
docker build -t taskboard:1.0 .

# Run the container
docker run -p 4045:4045 taskboard:1.0

# Run in detached mode
docker run -d -p 4045:4045 --name taskboard taskboard:1.0
```

Visit `http://localhost:4045`

---

## API Reference

All endpoints return and accept `application/json`.

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "uptime": 142.3,
  "timestamp": "2026-04-02T20:00:00.000Z",
  "port": 4045
}
```

---

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

**Create a task:**
```bash
curl -X POST http://localhost:4045/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to production", "priority": "high"}'
```

**Update task status:**
```bash
curl -X PATCH http://localhost:4045/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

Valid `status` values: `todo` · `in-progress` · `done`  
Valid `priority` values: `low` · `medium` · `high`

---

## Docker

### Image details

- Base image: `node:20-alpine`
- Multi-stage build — final image contains no build tooling
- Runs as a **non-root user** (`appuser`) for security
- Built-in `HEALTHCHECK` hitting `GET /health` every 30 seconds
- Exposed port: `4045`

### Build with a version tag

```bash
docker build -t taskboard:1.0 .
```

### Push to Amazon ECR

```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag taskboard:1.0 <account_id>.dkr.ecr.us-east-1.amazonaws.com/taskboard:latest

# Push
docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/taskboard:latest
```

---

## Deploying to AWS ECS (Fargate)

1. Push image to ECR (see above)
2. Create a **Task Definition** with container port `4045`
3. Create a **Service** (not a standalone task) in your cluster
4. Under Networking — use a public subnet with **Auto-assign public IP: ENABLED**, or use a private subnet with a NAT Gateway
5. Attach an **Application Load Balancer** targeting port `4045` for a stable public URL

> The in-memory store resets on every container restart. For persistent tasks across deployments, swap the in-memory array in `server.js` for a database (DynamoDB, RDS, or Redis recommended for ECS workloads).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4045` | Port the server listens on |
| `NODE_ENV` | `production` | Node environment |

---

## License

MIT — see [LICENSE](./LICENSE)
