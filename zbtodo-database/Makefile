start: stop build
	docker run -v $(PWD)/data:/data/db --rm -d --name database -p 3003:8080 database

stop:
	-docker stop database

build: 
	docker build -t database .
