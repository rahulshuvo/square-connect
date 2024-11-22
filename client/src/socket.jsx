import { io } from "socket.io-client"; // import connection function

const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://square-connect.onrender.com/'); // initialize websocket connection

export default socket;