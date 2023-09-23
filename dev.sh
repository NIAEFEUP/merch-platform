#!/bin/bash

if [ ! -x "$(command -v mkcert)" ];
then
    curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"
    chmod +x mkcert-v*-linux-amd64
    cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    rm mkcert-v*-linux-amd64
fi
if [[ ! -f localhost.cert ]]
then
    mkcert -install
    mkcert -cert-file localhost.cert -key-file localhost.key ni.fe.up.pt
fi


if [ -x "$(command -v podman-compose)" ]; then
    podman-compose up
else
    docker-compose up
fi
