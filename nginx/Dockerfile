FROM nginx:latest

RUN \
    apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y openssl && \

    apt-get install --reinstall ca-certificates

# 필요한 패키지 설치
RUN apt-get install -y wget

# mkcert 설치
RUN wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 -O mkcert && \
    chmod +x mkcert && \
    mv mkcert /usr/local/bin/

# mkcert 실행 및 인증서 생성
RUN mkcert -install && mkcert localhost

RUN mkcert localhost 127.0.0.1 ::1

RUN \
    mv localhost.pem /etc/ssl/certs/localhost.pem && \
    mv localhost-key.pem /etc/ssl/private/localhost.key

COPY ./default /etc/nginx/conf.d/default.conf
 
ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 443
