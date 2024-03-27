
all :
	mkdir -p ./volume/postgres-data
	mkdir -p ./volume/nginx-data
	mkdir -p ./backend/transcendence/media
	docker-compose up -d --build

clean :
	docker-compose -f $(DOCKER_PATH) down

fclean : clean
	sh clean.sh

re : fclean
	$(MAKE) all

.PHONY : all clean fclean re
