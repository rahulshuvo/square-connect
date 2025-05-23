const express = require('express')
const { Server } = require('socket.io')
const { v4: uuidV4 } = require('uuid')
const http = require('http')
const path = require('path')

const app = express() // initialize express

const server = http.createServer(app)

// set port to value received from environment variable or 5000 if null
const port = process.env.PORT || 5000

//setup middleware to serve static files
const staticPath = path.resolve(__dirname, 'dist')
app.use(express.static(staticPath))

// upgrade http server to websocket server
const io = new Server(server, {
  cors: '*', // allow connection from any origin
})

// io.connection

server.listen(port, () => {
  console.log(`listening on *:${port}`)
})

const rooms = new Map()

// io.connection
io.on('connection', (socket) => {
  console.log(socket.id, 'connected')

  // listen to username event
  socket.on('username', (username) => {
    socket.data.username = username
  })
  // listen to setOrientation event
  socket.on('setOrientation', (orientation) => {
    socket.data.orientation = orientation
  })

  // listen to setGameDuration event
  socket.on('setGameDuration', (gameDuration) => {
    socket.data.gameDuration = gameDuration
  })

  // createRoom
  socket.on('createRoom', async (callback) => {
    // callback here refers to the callback function from the client passed as data
    const roomId = uuidV4() // <- 1 create a new uuid
    await socket.join(roomId) // <- 2 make creating user join the room
    console.log('socket data', socket.data)
    // set roomId as a key and roomData including players as value in the map
    rooms.set(roomId, {
      // <- 3
      roomId,
      gameDuration: socket.data?.gameDuration,
      players: [
        {
          id: socket.id,
          username: socket.data?.username,
          orientation: socket.data?.orientation,
        },
      ],
    })

    callback(roomId) // <- 4 respond with roomId to client by calling the callback function from the client
  })

  socket.on('joinRoom', async (args, callback) => {
    // check if room exists and has a player waiting
    const room = rooms.get(args.roomId)
    let error, message

    if (!room) {
      // if room does not exist
      error = true
      message = 'room does not exist'
    } else if (room.length <= 0) {
      // if room is empty set appropriate message
      error = true
      message = 'room is empty'
    } else if (room.players.length == 2) {
      // if player is already in the room
      error = true
      message = 'room is full'
    }

    if (error) {
      if (callback) {
        callback({
          error,
          message,
        })
      }

      return
    }

    await socket.join(args.roomId) // make the joining client join the room

    // add the joining user's data to the list of players in the room
    const roomUpdate = {
      ...room,
      players: [
        ...room.players,
        { id: socket.id, username: socket.data?.username },
      ],
    }

    rooms.set(args.roomId, roomUpdate)

    callback(roomUpdate) // respond to the client with the room details.

    // emit an 'opponentJoined' event to the room to tell the other player that an opponent has joined
    socket.to(args.roomId).emit('opponentJoined', roomUpdate)
    socket.to(args.roomId).emit('gameStarted', roomUpdate)
  })

  socket.on('move', (data) => {
    // emit to all sockets in the room except the emitting socket.
    socket.to(data.room).emit('move', data.move)
  })

  socket.on('message', (data) => {
    socket.to(data.room).emit('message', data)
  })

  socket.on('disconnect', () => {
    const gameRooms = Array.from(rooms.values()) // <- 1

    gameRooms.forEach((room) => {
      // <- 2
      const userInRoom = room.players.find((player) => player.id === socket.id) // <- 3

      if (userInRoom) {
        if (room.players.length < 2) {
          // if there's only 1 player in the room, close it and exit.
          rooms.delete(room.roomId)
          return
        }

        socket.to(room.roomId).emit('playerDisconnected', userInRoom) // <- 4
      }
    })
  })

  socket.on('closeRoom', async (data) => {
    socket.to(data.roomId).emit('closeRoom', data) // <- 1 inform others in the room that the room is closing

    const clientSockets = await io.in(data.roomId).fetchSockets() // <- 2 get all sockets in a room

    // loop over each socket client
    clientSockets.forEach((s) => {
      s.leave(data.roomId) // <- 3 and make them leave the room on socket.io
    })

    rooms.delete(data.roomId) // <- 4 delete room from rooms map
  })

  socket.on('offer', (data) => {
    socket.to(data.room).emit('offer', data)
  })

  socket.on('answer', (data) => {
    console.log('Answer received:', data)
    socket.to(data.room).emit('answer', data)
  })

  socket.on('ice-candidate', (data) => {
    console.log('ICE candidate received:', data)
    socket.to(data.room).emit('ice-candidate', data)
  })
})

// production code
if (process.env.NODE_ENV == 'production') {
  // const publicPath = path.resolve(__dirname, ".", "build");

  app.get('*', (req, res) => {
    app.use(express.static(staticPath))
    const indexFile = path.join(__dirname, 'dist', 'index.html')
    return res.sendFile(indexFile)
  })
}
