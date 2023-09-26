#!/bin/bash


init_containers () (
    trap - INT
    if [ -x "$(command -v podman-compose)" ]; then
        podman-compose up web-dev
    else
        docker-compose up web-dev
    fi
)

remove_containers () (
    if [ -x "$(command -v podman-compose)" ]; then
        podman-compose down -t 2
    fi
)

init_containers
remove_containers

