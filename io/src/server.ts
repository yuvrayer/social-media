import { Server } from "socket.io";
import config from 'config'
const port = config.get<number>('io.port')

const io = new Server({
    cors: {
        origin: '*'
    }
})

const userSocketMap = new Map<string, string>(); // userId -> socketId

io.on('connection', socket => {

    console.log('got a new connection')

    socket.on('friendRequest:new', (data) => {
        io.to(data.to).emit('friendRequest:new', data)
        console.log(`Sent friend request to user room: ${data.to}`)
    })

    socket.on('join', (userId: string) => {
        userSocketMap.set(userId, userId)
        socket.join(userId)
        console.log(`User ${userId} joined successfully with socket ID ${userId}`)
    })

    // socket.onAny((eventName, payload) => {
    //     console.log(`received event ${eventName} with payload`, payload)
    //     io.emit(eventName, payload)
    // })

    socket.on('disconnect', () => {
        // Remove user by socket id
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`User ${userId} disconnected and removed`);
                break;
            }
        }
    });

})

io.listen(port)
console.log(`io server started on ${port}`)