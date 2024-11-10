import { io } from "socket.io-client"; // import connection function

const socket = io(import.meta.env.VITE_SOCKET_URL || 'localhost:8080'); // initialize websocket connection

export default socket;