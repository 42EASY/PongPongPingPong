# run_daphne.py
from watchgod import watch
from subprocess import Popen
import os

def runserver():
    cmd = ['daphne', '-e', 'ssl:8443:privateKey=/app/keys/private/localhost-key.pem:certKey=/app/keys/certs/localhost.pem', 'transcendence.asgi:application']
    process = Popen(cmd)
    try:
        for changes in watch('/app/transcendence'):
            print('Changes detected, restarting Daphne server...')
            process.kill()
            process = Popen(cmd)
    except KeyboardInterrupt:
        process.kill()

if __name__ == '__main__':
    runserver()
