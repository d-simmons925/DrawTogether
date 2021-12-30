var path = require('path')
var http = require('http')
var express = require('express')
var socketio = require('socket.io')
var config = require('config')
var flash = require('connect-flash')
var session = require('express-session')
var { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

var app = express()
var server = http.createServer(app)
var io = socketio(server)

app.use(
  session({
    secret: config.get('secret') || process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
)
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(flash())

app.use((req, res, next) => {
  res.locals.error = req.flash('error')
  next()
})

app.get('/', (req, res) => {
  res.render('index')
})

var username = ''
var room = ''

app.post('/hostRoom', (req, res) => {
  username = req.body.hostUsername
  room = req.body.hostRoom
  res.redirect(req.body.hostRoom)
})

app.post('/joinRoom', (req, res) => {
  username = req.body.joinUsername
  room = req.body.joinRoom
  if (username == '' || room.length != 6) {
    req.flash('error', 'error: invalid room name')
    res.redirect('/')
  } else {
    res.redirect(req.body.joinRoom)
  }
})

app.get('/:room', (req, res) => {
  if (username == '') {
    req.flash('error', 'error: no username')
    res.redirect('/')
  } else if (room.length != 6) {
    req.flash('error', 'error: invalid room name')
    res.redirect('/')
  } else {
    res.render('draw', { roomName: req.params.room })
  }
})

// user connection
io.on('connect', socket => {
  var user = userJoin(socket.id, username, room)
  socket.join(user.room)
  socket.to(room).broadcast.emit(username)
  username = ''
  room = ''

  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room),
  })

  //user starts path
  socket.on('startPath', (data, userId) => {
    var user = getCurrentUser(userId)
    socket.broadcast.to(user.room).emit('startPath', data, userId)
  })

  //user continues path
  socket.on('continuePath', (data, userId) => {
    var user = getCurrentUser(userId)
    socket.broadcast.to(user.room).emit('continuePath', data, userId)
  })

  // user ends path
  socket.on('endPath', (data, userId) => {
    var user = getCurrentUser(userId)
    socket.broadcast.to(user.room).emit('endPath', data, userId)
  })

  socket.on('disconnect', () => {
    var user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Server running on port ${port}`))
