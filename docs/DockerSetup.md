# Docker Local Development Setup

This guide explains how to run weconnect-client in a local Docker environment.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin on Linux)
- Git

## Quick Start

### 1. Create the shared Docker network

All WeVote services (WeVoteServer, WebApp, weconnect-server, weconnect-client) share a Docker network named `wevote`. Create it once:

```sh
docker network create wevote
```

If you see `Error response from daemon: network with name wevote already exists`, the network is already set up — proceed to the next step.

### 2. Configure settings

Copy the template and optionally modify any settings.

```sh
cp src/js/config-template.js src/js/config.js
```

The config template assumes you have weconnect-server running locally with SSL on port 4500 (see [weconnect-server/docs/DockerSetup.md](https://github.com/wevote/weconnect-server/blob/develop/docs/DockerSetup.md)). To point it to a different backend server, modify your `src/js/config.js`:

```json
// src/js/config.js
// Point to live production backend server:
STAFF_API_SERVER_ROOT_URL: 'https://teamapi.wevote.org/',
STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://teamapi.wevote.org/admin/',
STAFF_API_SERVER_API_ROOT_URL: 'https://teamapi.wevote.org/apis/v1/',
STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://teamapi.wevote.org/apis/v1/',
```

The Docker Compose file overrides `HOSTNAME`, `PORT`, `HTTPS_SSL_CERT`, and `HTTPS_SSL_KEY` automatically, so you do not need to set those in `config.js` for Docker.

### 3. Build and start the service

```sh
docker compose up --build
```

The client will be available at **https://localhost:4000**. In your browser, you can ignore/accept any SSL certificate warnings since we are using a test certificate/key created on container build.

To run in the background:

```sh
docker compose up --build -d
```

### 4. Stop the service

```sh
docker compose down
```

## Development Workflow

### Live code reloading

The source directory is mounted into the container at `/app`, so edits you make on the host are reflected immediately. The webpack dev server watches for changes and hot-reloads the browser automatically.

### Running npm commands inside the container

```sh
# Open a shell in the running container
docker compose exec weconnect-client sh

# Or run a command directly
docker compose exec weconnect-client npm run lint
docker compose exec weconnect-client npm test
```

### Viewing logs

```sh
docker compose logs -f weconnect-client
```

## Troubleshooting

**Port 4000 already in use**
Another process is using port 4000. Stop it, or change the host port in `compose.yaml`:
```yaml
ports:
  - "127.0.0.1:4001:4000"
```

**`node_modules` issues or missing packages**
Rebuild the image to reinstall dependencies:

```sh
docker compose build --no-cache
docker compose up
```

**Changes not reflected in the browser**
Ensure you are editing files under the mounted source directory. Changes to `node_modules` or build config may require a container restart:

```sh
docker compose restart weconnect-client
```
