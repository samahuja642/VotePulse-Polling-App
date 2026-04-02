import { io } from 'socket.io-client';
import { env } from './env.js';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(env.socketUrl, {
      autoConnect: false,
    });
  }
  socket.connect();
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
