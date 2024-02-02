echo "wait db server"
dockerize -wait tcp://${POSTGRES_HOST}:3306 -timeout 20s

python /app/transcendence/manage.py makemigrations members
python /app/transcendence/manage.py makemigrations games
python /app/transcendence/manage.py makemigrations social
python /app/transcendence/manage.py makemigrations tournaments

python /app/transcendence/manage.py migrate

# python /app/transcendence/manage.py runserver 0.0.0.0:8000

daphne /app/transcendence/transcendence.asgi:application -b 127.0.0.1 -p 8000