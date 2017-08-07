FROM node

RUN npm install http-server -g

WORKDIR /app
EXPOSE 80
COPY ./dist .

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
