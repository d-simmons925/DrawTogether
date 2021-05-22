const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require ('socket.io')

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true}))

app.get('/', (req, res) =>{
  res.render('index')
})

var username = ''
var room = ''

app.post('/hostRoom', (req, res, next) =>{
  res.redirect(req.body.hostRoom)

  username = req.body.hostUsername
  room = req.body.hostRoom
})

app.post('/joinRoom', (req, res)=>{
  res.redirect(req.body.joinRoom)

  username = req.body.joinUsername
  room = req.body.joinRoom
})

app.get('/:room', (req, res) => {
  res.render('draw', {roomName: req.params.room})
})

// USER CONNECTION
io.on('connect', socket =>{
  const user = userJoin(socket.id, username, room)
  socket.join(user.room)
  socket.to(room).broadcast.emit(username)

  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  })


  //USER STARTS PATH
  socket.on( 'startPath', (data, userId)=>{
    const user = getCurrentUser(userId)
      io.to(user.room).emit('startPath', data, userId);
  })

  //USER CONTINUES PATH
  socket.on( 'continuePath', (data, userId)=>{
    const user = getCurrentUser(userId)
      io.to(user.room).emit('continuePath', data, userId);
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))