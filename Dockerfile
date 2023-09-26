FROM docker.io/node:20

 
RUN apt-get update
RUN apt-get install -y build-essential

RUN corepack enable

# stupid pnpm and docker and such
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

CMD pnpm i && pnpm run dev

EXPOSE 3000
# TODO (luisd): expose validator port (here we can run it in the same container)