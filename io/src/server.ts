import { Server } from "socket.io";
import config from 'config'
const port = config.get<number>('io.port')

const io = new Server({
    cors: {
        origin: '*'
    }
})


io.on('connection', socket => {

    console.log('got a new connection')

    socket.onAny((eventName, payload) => {
        console.log(`received event ${eventName} with payload`, payload)
        io.emit(eventName, payload)
    })

    socket.on('disconnect', () => {
        console.log('client disconnected...')
    })

})

io.listen(port)
console.log(`io server started on ${port}`)