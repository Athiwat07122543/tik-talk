import { createServer } from 'node:http'
import next from 'next'
import { Server } from "socket.io"

const dev = process.env.NODE_ENV != 'production';
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const hanlder = app.getRequestHandler();

const connectedUsers = new Map()

app.prepare().then(() => {
    const httpServer = createServer(hanlder);
    const io = new Server(httpServer)
    io.on('connection', (socket) => {
        socket.on('chat message', (text, username) => {
            io.emit('chat message', { text, username })
        })
        socket.on('enter username', (username) => {
            connectedUsers.set(socket.id, username);
            io.emit('enter username', { username })
            io.emit('user list', Array.from(connectedUsers.values()));
        })
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            io.emit('user list', Array.from(connectedUsers.values()));
        });
    })

    httpServer.once('error', (err) => {
        console.log(err)
        process.exit(1)
    })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
})