// import { io } from "socket.io-client";
// import config from 'config'

// const socket = io(config.get<string>('io.url'))

// export default socket

// io.ts
import { Server } from "socket.io";
import config from "config";

const port = config.get<number>("io.port");

const io = new Server({
  cors: {
    origin: "*"
  }
});

io.listen(port);
console.log(`Socket.IO server started on port ${port}`);

export default io;
