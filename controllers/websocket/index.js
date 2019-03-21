const io = require('socket.io')();
const logController = require('./logs');

io.on('connection', (socket) => {
	console.log('User connected');
	console.log(socket.id);
	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
});

io.of('/logs').on('connection', (socket) => {
	console.log('id', socket.id);
	socket.on('getLogs', logController.sendLogs(socket));
});

io.of('/applicationCreate').on('connection', (socket) => {
	console.log('id', socket.id);
	//socket.on('getLogs', logController.sendLogs(socket));
});

module.exports = io;
