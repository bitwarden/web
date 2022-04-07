###############################################
#                 Build stage                 #
###############################################
FROM node:16-slim AS node-build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /source
COPY . .

RUN npm ci
RUN npm run dist:oss:selfhost

###############################################
#                 Build stage                 #
###############################################
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS dotnet-build

# Add packages
RUN apk add --update-cache \
    npm \
    && rm -rf /var/cache/apk/*

# Copy csproj files as distinct layers
WORKDIR /source
COPY dotnet-src/Web/*.csproj ./src/Web/
#COPY Directory.Build.props .

# Restore project dependencies and tools
WORKDIR /source/src/Web
RUN dotnet restore

# Copy required project files
WORKDIR /source
COPY dotnet-src/Web/. ./src/Web/

# Build app
WORKDIR /source/src/Web
RUN dotnet publish -c release -o /app --no-restore

###############################################
#                  App stage                  #
###############################################
FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine
LABEL com.bitwarden.product="bitwarden"
LABEL com.bitwarden.project="web"
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS http://+:5000
EXPOSE 5000

# Add packages
RUN apk add --update-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create required directories
RUN mkdir -p /etc/bitwarden/web

COPY docker/confd/app-id.toml /etc/confd/conf.d/
COPY docker/confd/app-id.conf.tmpl /etc/confd/templates/

RUN wget -O /usr/local/bin/confd https://github.com/kelseyhightower/confd/releases/download/v0.16.0/confd-0.16.0-linux-amd64
RUN chmod +x /usr/local/bin/confd

# Copy Web server from dotnet-build stage
COPY --from=dotnet-build /app /server

# Copy app from build stage
WORKDIR /app
COPY --from=node-build /source/build ./

# Copy entrypoint script and make it executable
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

# Create non-root user to run app
RUN adduser -s /bin/false -D bitwarden && chown -R bitwarden:bitwarden /app /server /etc/bitwarden

USER bitwarden:bitwarden
HEALTHCHECK CMD curl -f http://localhost:5000 || exit 1
ENTRYPOINT ["/entrypoint.sh"]
