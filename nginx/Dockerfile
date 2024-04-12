FROM nginx:latest

RUN \
    apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y openssl

COPY ./default /etc/nginx/conf.d/default.conf
 
ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 443
