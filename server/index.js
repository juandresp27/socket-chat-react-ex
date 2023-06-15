import express from 'express'
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import cors from 'cors'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { PORT } from './config.js'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))
const server = http.createServer(app)

const io = new SocketServer(server, {
  cors: {
    origin: '*'
  }
})

io.on('connection', socket => {
  console.log(socket.id, 'connected')

  socket.on('send:message', data => {
    console.log(socket.id, 'envia', data)
    const date = new Date()
    const date1 = date.toUTCString()
    socket.broadcast.emit('receive:message', {
      user: socket.id,
      message: data,
      date1
    })
  })

  socket.on('istyping', state => {
    if (state) {
      console.log(socket.id, 'está escribiendo')
      socket.broadcast.emit('ext:typing', socket.id)
    } else {
      console.log(socket.id, 'dejo de escribir')
      socket.broadcast.emit('ext:notTyping', socket.id)
    }
  })
})

app.use(cors())

app.use(express.static(join(__dirname, '../client/dist')))

server.listen(PORT)

console.log('Escuchando en el puerto', PORT)
