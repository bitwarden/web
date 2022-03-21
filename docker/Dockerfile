###############################################
#                 Build stage                 #
###############################################
FROM node:16-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /source
COPY . .

RUN npm ci
RUN npm run dist:oss:selfhost

###############################################
#                  App stage                  #
###############################################
FROM bitwarden/server:latest

LABEL com.bitwarden.product="bitwarden"
LABEL com.bitwarden.project="web"
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS http://+:5000
EXPOSE 5000

RUN mkdir -p /etc/bitwarden/web
RUN chown -R bitwarden:bitwarden /etc/bitwarden

COPY docker/confd/app-id.toml /etc/confd/conf.d/
COPY docker/confd/app-id.conf.tmpl /etc/confd/templates/

RUN wget -O /usr/local/bin/confd https://github.com/kelseyhightower/confd/releases/download/v0.16.0/confd-0.16.0-linux-amd64
RUN chmod +x /usr/local/bin/confd

# Copy app from build stage
WORKDIR /app
COPY --from=build /source/build ./
RUN chown -R bitwarden:bitwarden /app

# Copy entrypoint script and make it executable
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

USER bitwarden:bitwarden
HEALTHCHECK CMD curl -f http://localhost:5000 || exit 1
ENTRYPOINT ["/entrypoint.sh"]
