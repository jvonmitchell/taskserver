
start:
	killall node
	nohup node todo.js &

stop:
	killall node

updatecode:
	cp ~/src/web/todo/* ./ -r

