const io = require('socket.io')();

io.on('connection', (socket) => {
	console.log('User connected');
	console.log(socket.id);
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

module.exports = io;
