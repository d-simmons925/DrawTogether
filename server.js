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

app.post('/hostRoom', (req, res) =>{
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
    
    if(username == ''){
      res.redirect('/')
    } else{
      res.render('draw', {roomName: req.params.room})
    }
})

// user connection
io.on('connect', socket =>{
  const user = userJoin(socket.id, username, room)
  socket.join(user.room)
  socket.to(room).broadcast.emit(username)
  username  = ''
  room = ''

  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  })

  //user starts path
  socket.on( 'startPath', (data, userId)=>{
    const user = getCurrentUser(userId)
      socket.broadcast.to(user.room).emit('startPath', data, userId);
  })

  //user continues path
  socket.on( 'continuePath', (data, userId)=>{
    const user = getCurrentUser(userId)
      socket.broadcast.to(user.room).emit('continuePath', data, userId);
  })

  // user ends path
  socket.on( 'endPath', (data, userId)=>{
    const user = getCurrentUser(userId)
      socket.broadcast.to(user.room).emit('endPath', data, userId);
  })

  socket.on('disconnect', ()=>{
    const user = userLeave(socket.id)

    if(user){
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))