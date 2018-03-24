FROM bitwarden/server

RUN groupadd -g 999 bitwarden && \
    useradd -r -u 999 -g bitwarden bitwarden
USER bitwarden

WORKDIR /app
COPY ./dist .

EXPOSE 80

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
