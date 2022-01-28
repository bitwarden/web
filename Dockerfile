FROM nginx:stable

LABEL com.bitwarden.product="bitwarden"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gosu \
        curl \
&& rm -rf /var/lib/apt/lists/*

COPY docker/nginx.conf /etc/nginx
COPY docker/nginx-web.conf /etc/nginx
COPY docker/mime.types /etc/nginx
COPY docker/security-headers.conf /etc/nginx

WORKDIR /app
COPY ./build .
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

RUN bash /entrypoint.sh
RUN chown -R bitwarden:bitwarden /app && chmod -R 755 /app && \
    chown -R bitwarden:bitwarden /var/cache/nginx && \
    chown -R bitwarden:bitwarden /var/log/nginx && \
    chown -R bitwarden:bitwarden /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R bitwarden:bitwarden /var/run/nginx.pid

USER bitwarden

EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080 || exit 1

#ENTRYPOINT ["/entrypoint.sh"]
#CMD ["tail", "-f", "/dev/null"]
CMD nginx -g 'daemon off;'
