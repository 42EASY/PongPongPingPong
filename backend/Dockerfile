FROM python:3.9

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install Django
RUN pip install djangorestframework
RUN pip install psycopg2
RUN pip install drf-yasg==1.20.0
RUN pip install django-environ

RUN pip install drf-yasg --upgrade && \
    pip install djangorestframework --upgrade

RUN pip install djangorestframework-simplejwt

RUN pip install PyJWT
RUN pip install django_otp
RUN pip install django-qr-code
RUN pip install qrcode
RUN pip install pyotp
RUN pip install django-redis
RUN pip install channels
RUN pip install channels-redis
RUN pip install daphne

RUN pip install django-cors-headers
RUN pip install pytest-asyncio


RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

ENV DOCKERIZE_VERSION v0.2.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

#RUN django-admin startproject transcendence

# RUN python /app/transcendence/manage.py makemigrations 
# RUN python /app/transcendence/manage.py migrate


RUN chmod +x docker_entrypoint.sh
ENTRYPOINT ./docker_entrypoint.sh
