build:
	docker-compose up -d
	./mvnw spring-boot : run

run : build
	.bin/Chess