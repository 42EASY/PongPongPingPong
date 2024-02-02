#!/bin/bash

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
