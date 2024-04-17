#!/bin/bash

until pg_isready -h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER}; do
  echo "Waiting for PostgreSQL to become ready..."
  sleep 2
done

python /app/transcendence/manage.py makemigrations

python /app/transcendence/manage.py migrate

python /app/transcendence/manage.py loaddata /app/transcendence/members/fixtures/members-data.json /app/transcendence/social/fixtures/Friend-data.json /app/transcendence/games/fixtures/game-data.json /app/transcendence/games/fixtures/tournament-data.json /app/transcendence/games/fixtures/tournament-game-data.json /app/transcendence/games/fixtures/participant-data.json 

cd /app/transcendence

# MEMO: 개발용
# python /app/transcendence/run_daphne.py

daphne -e ssl:8443:privateKey=/etc/ssl/private/localhost.key:certKey=/etc/ssl/certs/localhost.pem transcendence.asgi:application
