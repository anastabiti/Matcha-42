#!/bin/bash

# Stop all running containers
docker stop $(docker ps -a -q)

# Remove all containers
docker rm $(docker ps -a -q)

# Remove all images
docker rmi $(docker images -q) --force

# Remove all volumes
docker volume rm $(docker volume ls -q)

# Remove all networks
docker network rm $(docker network ls -q)

# Remove build cache
docker builder prune -af

# Remove unused data (containers, networks, images, build cache)
docker system prune -af --volumes

# Verify cleanup
echo "Remaining containers:"
docker ps -a

echo "Remaining images:"
docker images -a

echo "Remaining volumes:"
docker volume ls

echo "Remaining networks:"
docker network ls
