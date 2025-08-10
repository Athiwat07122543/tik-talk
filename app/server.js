import { createServer } from 'node:http'
import next from 'next'
import { Server } from "socket.io"

const dev = process.env.NODE_ENV != 'production';
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const hanlder = app.getRequestHandler();

const connectedUsers = new Map()

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        hanlder(req, res);
    });


    const io = new Server(httpServer, {
        path: '/socket.io',
    });

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
            const username = connectedUsers.get(socket.id)
            if (username) {
                connectedUsers.delete(socket.id);
                io.emit('disconnected', username)
                io.emit('user list', Array.from(connectedUsers.values()));

            }
        });
    })

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
})