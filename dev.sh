#!/bin/bash


if [ "$EUID" -ne 0 ]
  then echo "Please run as root. This is due to some overriding in certificates and the hosts file"
  exit
fi


trap '' INT

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


init_containers () (
    trap - INT
    if [ -x "$(command -v podman-compose)" ]; then
        podman-compose up
    else
        docker-compose up
    fi
)

remove_containers () (
    if [ -x "$(command -v podman-compose)" ]; then
        podman-compose down -t 2
    fi
)

echo "127.0.0.1 ni.fe.up.pt" >> /etc/hosts
init_containers
sed -i '$d' /etc/hosts
remove_containers

