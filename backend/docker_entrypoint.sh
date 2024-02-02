#!/bin/bash

until pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER}; do
  echo "Waiting for PostgreSQL to become ready..."
  sleep 2
done

python /app/transcendence/manage.py makemigrations members
python /app/transcendence/manage.py makemigrations games
python /app/transcendence/manage.py makemigrations social
python /app/transcendence/manage.py makemigrations tournaments

python /app/transcendence/manage.py migrate

cd /app/transcendence

daphne transcendence.asgi:application