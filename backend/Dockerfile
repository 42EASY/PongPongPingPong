FROM python:3.8.10

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install Django
RUN pip install djangorestframework
RUN pip install psycopg2

#RUN django-admin startproject transcendence
