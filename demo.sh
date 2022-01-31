#!/bin/bash
COMMAND=$1
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
USAGE="Usage: $(basename "$0") command
Run a test network of three webchat agents on Docker.

where:
  command Either 'start' to create and run all required Docker containers
          or 'stop' to stop and remove them"
DEMO_ENDPOINTS="Webchat endpoints:

|-------|----------|-----------------------|
| Alice | Frontend | http://localhost:4201 |
|       | Backend  | http://localhost:3001 |
|-------|----------|-----------------------|
| Bob   | Frontend | http://localhost:4202 |
|       | Backend  | http://localhost:3002 |
|-------|----------|-----------------------|
| Eve   | Frontend | http://localhost:4203 |
|       | Backend  | http://localhost:3003 |
|-------|----------|-----------------------|"

if [ "$COMMAND" = "start" ]; then
  echo "Creating webchat network" >&2
  docker network create webchat

  echo "Starting webchat user Alice" >&2
  COMPOSE_PROJECT_NAME=webchat-alice \
  USER_NAME=Alice \
  FRONTEND_PORT=4201 \
  BACKEND_PORT=3001 \
    docker-compose up -d --build --remove-orphans

  echo "Starting webchat user Bob" >&2
  COMPOSE_PROJECT_NAME=webchat-bob \
  USER_NAME=Bob \
  FRONTEND_PORT=4202 \
  BACKEND_PORT=3002 \
    docker-compose up -d --build --remove-orphans

  echo "Starting webchat user Eve" >&2
  COMPOSE_PROJECT_NAME=webchat-eve \
  USER_NAME=Eve \
  FRONTEND_PORT=4203 \
  BACKEND_PORT=3003 \
    docker-compose up -d --build --remove-orphans

  echo "$DEMO_ENDPOINTS" >&2
elif [ "$COMMAND" = "stop" ]; then
  echo "Removing webchat user Alice"
  COMPOSE_PROJECT_NAME=webchat-alice \
    docker-compose down

  echo "Removing webchat user Bob"
  COMPOSE_PROJECT_NAME=webchat-bob \
    docker-compose down

  echo "Removing webchat user Eve"
  COMPOSE_PROJECT_NAME=webchat-eve \
    docker-compose down

  echo "Removing webchat network"
  docker network rm webchat
else
  echo "Invalid argument" >&2
  echo "$USAGE" >&2
  exit 1
fi
