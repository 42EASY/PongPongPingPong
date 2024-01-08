FROM debian:bullseye

RUN \
    apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y nginx && \
    apt-get install -y openssl

COPY ./default /etc/nginx/sites-available/default
 
RUN \
    openssl genrsa -out transcendence.localhost.key 4096 && \
    openssl req -x509 -nodes -days 365 \
    -key transcendence.localhost.key \
    -out transcendence.localhost.crt \
    -subj "/C=KR/ST=SEOUL/L=SEOUL/O=42Seoul/OU=transcendence/CN=localhost" && \
    chmod 644 transcendence.localhost.* && \
    mv transcendence.localhost.crt /etc/ssl/certs/ && \
    mv transcendence.localhost.key /etc/ssl/private

ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 443