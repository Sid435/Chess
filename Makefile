build:
	docker-compose up -d
	./mnvw spring-boot : run

run : build
	.bin/Chess