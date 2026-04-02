export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:poll', (pollId) => {
      socket.join(`poll:${pollId}`);
      console.log(`Socket ${socket.id} joined poll:${pollId}`);
    });

    socket.on('leave:poll', (pollId) => {
      socket.leave(`poll:${pollId}`);
      console.log(`Socket ${socket.id} left poll:${pollId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
