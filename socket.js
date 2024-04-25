import { io } from "socket.io-client";
const backendUrl = "/";
const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
};

const socket = io(backendUrl, options);


export default socket;


