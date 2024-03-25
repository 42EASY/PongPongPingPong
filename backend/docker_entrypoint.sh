#!/bin/bash

until pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER}; do
  echo "Waiting for PostgreSQL to become ready..."
  sleep 2
done

python /app/transcendence/manage.py makemigrations

python /app/transcendence/manage.py migrate

python /app/transcendence/manage.py loaddata /app/transcendence/members/fixtures/members-data.json /app/transcendence/social/fixtures/Friend-data.json

cd /app/transcendence

# TODO: 개발용 추후 삭제
python /app/transcendence/run_daphne.py

# daphne transcendence.asgi:application -b 0.0.0.0 -p 8000
