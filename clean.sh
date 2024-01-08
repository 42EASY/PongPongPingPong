docker stop $(docker ps -q -a)
docker rm $(docker ps -q -a)
docker rmi -f $(docker images -q -a)
docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q) 2>/dev/null
sudo rm -rf /home/juelee/data/*