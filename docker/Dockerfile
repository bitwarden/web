FROM nginx:stable

LABEL com.bitwarden.product="bitwarden"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gosu \
        curl \
&& rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx
COPY nginx-web.conf /etc/nginx
COPY mime.types /etc/nginx
COPY security-headers.conf /etc/nginx

WORKDIR /app
EXPOSE 80
COPY ./build .
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

HEALTHCHECK CMD curl -f http://localhost:80 || exit 1

ENTRYPOINT ["/entrypoint.sh"]
