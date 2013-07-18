
start:
	killall -q node
	nohup node todo.js &

stop:
	killall -q node

updatecode:
	cp ~/src/web/todo/* ./ -r

