install:
	npm install

build:
	docker build -t backend .

start: stop install build
	docker run --network=zbt --rm --name backend -d -p 5000:5000 backend

start-dev: stop build
	docker run --network=zbt -e OIDC_ID -e OIDC_SECRET --rm --name backend -d -p 5000:5000 backend

stop:
	-docker stop backend

