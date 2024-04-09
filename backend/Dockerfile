FROM python:3.9

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY . .

RUN pip install --upgrade pip && \
    pip install Django && \
    pip install djangorestframework && \
    pip install psycopg2 && \
    pip install drf-yasg==1.20.0 && \
    pip install django-environ && \

    pip install drf-yasg --upgrade && \
    pip install djangorestframework --upgrade && \

    pip install djangorestframework-simplejwt && \

    pip install PyJWT && \
    pip install django_otp && \
    pip install django-qr-code && \
    pip install qrcode && \
    pip install pyotp && \
    pip install django-redis && \
    pip install channels && \
    pip install channels-redis && \
    pip install daphne && \

    pip install django-cors-headers && \
    pip install pytest-asyncio

# TODO: 개발용 추후 삭제
RUN pip install watchgod

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

ENV DOCKERIZE_VERSION v0.2.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

#RUN django-admin startproject transcendence

# RUN python /app/transcendence/manage.py makemigrations
# RUN python /app/transcendence/manage.py migrate


RUN chmod +x docker_entrypoint.sh
ENTRYPOINT ./docker_entrypoint.sh
