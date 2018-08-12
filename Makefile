start-server:
	cd zbtodo-database && make start
	cd zbtodo-backend && make start


quick-release:
	git subtree push --prefix zbtodo-backend heroku master
