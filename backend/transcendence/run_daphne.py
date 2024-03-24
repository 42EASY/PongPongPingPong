# run_daphne.py
from watchgod import watch
from subprocess import Popen
import os

def runserver():
    cmd = ['daphne', 'transcendence.asgi:application', '-b', '0.0.0.0', '-p', '8000']
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
